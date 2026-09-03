import AxeBuilder from "@axe-core/playwright";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { routes } from "./routes";

test.describe.configure({ mode: "serial" });

// `wrangler dev` exits on its own if its ProxyWorker ever fails to reach the
// UserWorker, and Playwright stops watching the process once it has answered
// on `url` (see playwright.config.ts). A suite that keeps loading pages from
// the dead port then fails on whatever it happens to be asserting: a run that
// lost the server *between* tests reports `page.goto: net::ERR_CONNECTION_REFUSED`,
// and a run that lost it *during* the no-JS comparison reports a 2.8% pixel
// difference, because the stylesheet and the font of one context never
// arrived. Neither names the fault. These are the transport errors that mean
// the server is gone rather than that a load was superseded -- ERR_ABORTED is
// deliberately absent, since the browser aborts prefetches and speculation
// candidates as a matter of course.
const SERVER_GONE = /ERR_CONNECTION_REFUSED|ERR_CONNECTION_RESET|ERR_CONNECTION_CLOSED|ERR_EMPTY_RESPONSE|ERR_SOCKET_NOT_CONNECTED/u;

/**
 * Collects requests the preview server dropped, so a dead server is asserted
 * as a dead server. Failing on the collected list -- rather than retrying the
 * navigation -- keeps the real fault in the report next to wrangler's own
 * output instead of hiding it behind a second attempt.
 */
function recordDroppedRequests(page: Page, label: string, into: string[]): void {
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText ?? "";
    if (SERVER_GONE.test(error)) into.push(`${label}: ${request.method()} ${request.url()} — ${error}`);
  });
}

for (const route of routes) {
  test(`${route} has no serious accessibility or cross-origin runtime defect`, async ({ page, baseURL }) => {
    const externalRequests: string[] = [];
    const dropped: string[] = [];
    recordDroppedRequests(page, "page", dropped);
    page.on("request", (request) => {
      if (new URL(request.url()).origin !== new URL(baseURL!).origin) externalRequests.push(request.url());
    });
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status()).toBeLessThan(400);
    await page.waitForTimeout(2_200);
    expect(dropped, "the preview server dropped requests: it exited mid-test, so this run proves nothing about the site").toEqual([]);
    expect(externalRequests).toEqual([]);
    expect(await page.locator("h1").count()).toBe(1);
    expect(await page.locator("nav a[href]").count()).toBeGreaterThan(4);
    expect(await page.locator("*").count()).toBeLessThan(1_500);

    const audit = await new AxeBuilder({ page }).analyze();
    const severe = audit.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
    const contrastIncomplete = audit.incomplete.filter((result) => result.id === "color-contrast");
    expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
    expect(contrastIncomplete, JSON.stringify(contrastIncomplete, null, 2)).toEqual([]);
  });

  test(`${route} keeps its complete reading surface without JavaScript`, async ({ browser, baseURL }) => {
    const enabledContext = await browser.newContext({
      baseURL,
      colorScheme: "dark",
      locale: "en-GB",
      reducedMotion: "reduce",
      viewport: { width: 1280, height: 900 },
    });
    const disabledContext = await browser.newContext({
      baseURL,
      colorScheme: "dark",
      javaScriptEnabled: false,
      locale: "en-GB",
      reducedMotion: "reduce",
      viewport: { width: 1280, height: 900 },
    });
    const dropped: string[] = [];
    try {
      const enabled = await enabledContext.newPage();
      const disabled = await disabledContext.newPage();
      recordDroppedRequests(enabled, "javascript enabled", dropped);
      recordDroppedRequests(disabled, "javascript disabled", dropped);
      const [enabledResponse, disabledResponse] = await Promise.all([
        enabled.goto(route, { waitUntil: "networkidle" }),
        disabled.goto(route, { waitUntil: "networkidle" }),
      ]);
      expect(enabledResponse?.status()).toBeLessThan(400);
      expect(disabledResponse?.status()).toBeLessThan(400);

      const enabledHeading = await enabled.locator("h1").innerText();
      const disabledHeading = await disabled.locator("h1").innerText();
      expect(disabledHeading).toBe(enabledHeading);
      const enabledLinks = await enabled.locator("nav a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
      const disabledLinks = await disabled.locator("nav a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
      expect(disabledLinks).toEqual(enabledLinks);
      if (route.startsWith("/docs/")) {
        expect((await disabled.locator("[data-pagefind-body]").innerText()).length).toBeGreaterThan(200);
      }

      const [enabledImage, disabledImage] = await Promise.all([
        enabled.screenshot({ fullPage: true, animations: "disabled" }),
        disabled.screenshot({ fullPage: true, animations: "disabled" }),
      ]);
      // Before the pixel comparison, so a run that lost its stylesheet or font
      // to a dead server reports that instead of a visual regression.
      expect(dropped, "the preview server dropped requests: it exited mid-test, so this comparison is not a visual regression").toEqual([]);
      const enabledPng = PNG.sync.read(enabledImage);
      const disabledPng = PNG.sync.read(disabledImage);
      expect({ width: disabledPng.width, height: disabledPng.height }).toEqual({ width: enabledPng.width, height: enabledPng.height });
      const different = pixelmatch(enabledPng.data, disabledPng.data, undefined, enabledPng.width, enabledPng.height, {
        includeAA: false,
        threshold: 0.12,
      });
      expect(different / (enabledPng.width * enabledPng.height)).toBeLessThanOrEqual(0.005);
    } finally {
      await enabledContext.close();
      await disabledContext.close();
    }
  });
}

test("deployed headers are represented by the local Workers asset server", async ({ request }) => {
  const response = await request.get("/");
  expect(response.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(response.headers()["content-security-policy"]).toContain("'wasm-unsafe-eval'");
  expect(response.headers()["speculation-rules"]).toBe('"/speculation-rules.json"');
  const speculationRules = await request.get("/speculation-rules.json");
  expect(speculationRules.headers()["content-type"]).toContain("application/speculationrules+json");

  // Exact equality, never `toContain`. The asset header engine appends rather
  // than replaces when a later rule sets a header an earlier rule already set,
  // so the broken merge is `public, max-age=0, s-maxage=600,
  // stale-while-revalidate=86400, public, max-age=31536000, immutable` — which
  // contains "immutable" and "stale-while-revalidate=86400" and passes any
  // substring assertion, while RFC 9111 §5.2 makes the browser honour the first
  // max-age it sees and revalidate a year-cacheable asset on every navigation.
  expect(response.headers()["cache-control"]).toBe("public, max-age=0, s-maxage=600, stale-while-revalidate=86400");

  const longCache = "public, max-age=31536000, immutable";
  const font = await request.get("/fonts/geist-sans-variable.woff2");
  expect(font.headers()["cache-control"]).toBe(longCache);
  const search = await request.get("/pagefind/pagefind.js");
  expect(search.headers()["cache-control"]).toBe(longCache);

  const bundle = await page_bundle_href(request);
  const asset = await request.get(bundle);
  expect(asset.headers()["cache-control"]).toBe(longCache);
});

async function page_bundle_href(request: APIRequestContext): Promise<string> {
  const html = await (await request.get("/")).text();
  const href = /<link\b[^>]*href="(\/_astro\/[^"]+\.css)"/i.exec(html)?.[1];
  expect(href, "the homepage must reference a hashed /_astro stylesheet").toBeTruthy();
  return href!;
}

test("a URL the rebuild removed still resolves instead of 404ing", async ({ request }) => {
  // /welcome/ was launched and indexed; the URL structure is a redirect
  // obligation from launch onward.
  const redirect = await request.get("/welcome/", { maxRedirects: 0 });
  expect(redirect.status()).toBe(301);
  expect(new URL(redirect.headers()["location"], "http://127.0.0.1:4173/").pathname).toBe("/");

  const followed = await request.get("/welcome/");
  expect(followed.status()).toBe(200);
  expect(await followed.text()).toContain("<h1");
});

test("internal build evidence and local metadata are not published", async ({ request }) => {
  for (const stray of ["/evidence/artifacts.json", "/.DS_Store", "/.assetsignore"]) {
    const response = await request.get(stray);
    expect(response.status(), `${stray} must not be served`).toBe(404);
  }
});

for (const [route, expected] of [
  ["/product/tracing/", "Product"],
  ["/product/logs/", "Product"],
  ["/product/metrics/", "Product"],
  ["/product/ci/", "Product"],
  ["/docs/getting-started/", "Docs"],
  ["/pricing/", "Pricing"],
  ["/faq/", "FAQ"],
] as const) {
  test(`${route} marks its section current in the primary navigation`, async ({ page }) => {
    // The "Product" entry links to /product/tracing/ but owns all of /product/,
    // so prefix-matching its own href left three of the four product pages with
    // no aria-current and no active underline at all.
    await page.goto(route);
    for (const nav of [".desktop-nav", ".mobile-nav nav"]) {
      const current = page.locator(`${nav} a[aria-current="page"]`);
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText(expected);
    }
  });
}

test("documentation search works through the strict CSP and local Pagefind index", async ({ page, baseURL }) => {
  const errors: string[] = [];
  const externalRequests: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL!).origin) externalRequests.push(request.url());
  });

  await page.goto("/docs/", { waitUntil: "networkidle" });
  await page.locator("[data-search-open]").click();
  await expect(page.locator("[data-search-dialog]")).toBeVisible();
  await page.locator("[data-search-input]").fill("protocol");
  await expect(page.locator(".search-result").first()).toContainText("Protocol 2026-07-28");

  expect(externalRequests).toEqual([]);
  expect(errors).toEqual([]);
});

// A Pagefind stand-in whose completion order is the opposite of its call order:
// the shorter the term, the later it answers. That is the shape of the real
// engine on a real connection — one index fragment per term, resolving whenever
// each arrives — made deterministic. `debouncedSearch` matches Pagefind's own
// contract: it resolves null when a later call supersedes it during the debounce
// window, and results otherwise. Note that it does *not* supersede after the
// window closes, so an in-flight answer still lands late and the component's own
// sequence guard is what has to reject it.
const orderedPagefindStub = `
  const RESULT = {
    data: async () => ({ url: "/docs/protocol-2026-07-28/", meta: { title: "Protocol 2026-07-28" }, excerpt: "pinned revision" }),
  };
  let newestTerm = "";
  export async function init() {}
  export async function search(term) {
    newestTerm = term;
    await new Promise((resolve) => setTimeout(resolve, 200 + (12 - term.length) * 150));
    return { results: [RESULT] };
  }
  export async function debouncedSearch(term, options, debounceTimeoutMs) {
    newestTerm = term;
    await new Promise((resolve) => setTimeout(resolve, debounceTimeoutMs));
    if (newestTerm !== term) return null;
    await new Promise((resolve) => setTimeout(resolve, 200 + (12 - term.length) * 150));
    return { results: [RESULT] };
  }
`;

test("a superseded search cannot overwrite what the input is currently asking for", async ({ page }) => {
  const input = page.locator("[data-search-input]");
  const results = page.locator("[data-search-results]");

  await page.route("**/pagefind/pagefind.js", (route) => route.fulfill({
    body: orderedPagefindStub,
    contentType: "text/javascript",
  }));

  await page.goto("/docs/", { waitUntil: "networkidle" });
  await page.locator("[data-search-open]").click();
  await expect(results).toHaveText("Start typing to search the static documentation index.");

  // fill() dispatches one input event, which is the only path the other search
  // gate covers. Typing dispatches one per keystroke, so several searches are in
  // flight at once — and a real Pagefind index answers over the network, where
  // completion order is not call order. The six-page local index answers in a
  // millisecond, which is exactly why this hazard could never show up in a gate.
  await input.pressSequentially("protocol", { delay: 20 });

  // Clearing renders the short-term message synchronously. Every search still
  // running for an earlier term must now be discarded: without that the slowest
  // resolves last and repopulates the panel with results for a query that is no
  // longer in the box, which the reader cannot dismiss without closing the
  // dialog.
  await input.press("ControlOrMeta+a");
  await input.press("Delete");
  await expect(results).toHaveText("Enter at least two characters.");
  await page.waitForTimeout(4_000);
  await expect(results).toHaveText("Enter at least two characters.");
  await expect(page.locator(".search-result")).toHaveCount(0);

  // The engine still answers the term that is actually in the input.
  await input.pressSequentially("protocol", { delay: 20 });
  await expect(page.locator(".search-result").first()).toContainText("Protocol 2026-07-28");
});
