import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { variants } from "../src/data/variants";

for (const variant of variants) {
  test(`${variant.name} is light, accessible, responsive and works without React hydration`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`/lab/${variant.slug}/`, { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("astro-island")).toHaveCount(0);
    const audit = await new AxeBuilder({ page }).analyze();
    expect(audit.violations.filter(item => item.impact === "serious" || item.impact === "critical"), JSON.stringify(audit.violations)).toEqual([]);
    const copy = page.locator("[data-copy-command], [data-copy], [data-qyl-copy], [data-copy-setup]").first();
    await copy.click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("dotnet tool install --global qyl");
    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      const layout = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        overflow: [...document.querySelectorAll("body *")].filter(element => { const range = document.createRange(); range.selectNodeContents(element); return range.getBoundingClientRect().right > innerWidth + 1; }).map(element => ({ tag: element.tagName, text: element.textContent?.slice(0, 80), class: element.className })),
      }));
      expect(layout.width, `overflow at ${width}: ${JSON.stringify(layout.overflow)}`).toBeLessThanOrEqual(width);
    }
    await page.goto(`/lab/${variant.slug}/`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `public/lab-previews/${variant.slug}.png`, animations: "disabled" });
    await page.screenshot({ path: `evidence/designs/${variant.slug}-desktop.png`, fullPage: true, animations: "disabled" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `evidence/designs/${variant.slug}-mobile.png`, fullPage: true, animations: "disabled" });
    expect(errors).toEqual([]);
  });
}

test("design gallery filters all variants and changes comparison previews", async ({ page }) => {
  await page.goto("/lab/", { waitUntil: "networkidle" });
  const galleryAudit = await new AxeBuilder({ page }).analyze();
  expect(galleryAudit.violations.filter(item => item.impact === "serious" || item.impact === "critical"), JSON.stringify(galleryAudit.violations)).toEqual([]);
  await expect(page.locator("[data-category]:visible")).toHaveCount(variants.length);
  for (const card of await page.locator("[data-category]").all()) {
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => card.locator("img").evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.locator("h1").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "evidence/designs/gallery.png", fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "Minimal", exact: true }).click();
  await expect(page.locator("[data-category]:visible")).toHaveCount(variants.filter(variant => variant.tag === "Minimal").length);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.locator("[data-category]:visible")).toHaveCount(variants.length);
  await page.locator("#compare-left").selectOption("terminal-light");
  await expect(page.locator("#compare-link-left")).toHaveAttribute("href", "/lab/terminal-light/");
  await expect(page.locator("#compare-image-left")).toHaveAttribute("src", "/lab-previews/terminal-light.png");
});
