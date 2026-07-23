import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { routes } from "./routes";

test.describe.configure({ mode: "serial" });

for (const route of routes) {
  test(`${route} has no serious accessibility or cross-origin runtime defect`, async ({ page, baseURL }) => {
    const externalRequests: string[] = [];
    page.on("request", (request) => {
      if (new URL(request.url()).origin !== new URL(baseURL!).origin) externalRequests.push(request.url());
    });
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status()).toBeLessThan(400);
    await page.waitForTimeout(2_200);
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
    try {
      const enabled = await enabledContext.newPage();
      const disabled = await disabledContext.newPage();
      await Promise.all([
        enabled.goto(route, { waitUntil: "networkidle" }),
        disabled.goto(route, { waitUntil: "networkidle" }),
      ]);

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
  expect(response.headers()["cache-control"]).toContain("stale-while-revalidate=86400");
  expect(response.headers()["speculation-rules"]).toBe('"/speculation-rules.json"');
  const asset = await request.get("/fonts/geist-sans-variable.woff2");
  expect(asset.headers()["cache-control"]).toContain("immutable");
  const speculationRules = await request.get("/speculation-rules.json");
  expect(speculationRules.headers()["content-type"]).toContain("application/speculationrules+json");
});

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
