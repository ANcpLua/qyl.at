import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { effects } from '../src/data/effects';
import { journey } from '../src/data/journey';

for (const effect of effects) {
  test(`${effect.name} renders its real engine, pauses and resumes`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && /shader error|error creating webgl|webglprogram|failed to load resource/i.test(message.text())) errors.push(message.text());
    });
    await page.goto(`/lab/effects/${effect.slug}/`);
    const stage = page.locator(`[data-effect="${effect.slug}"]`);
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-effect-state', 'playing', { timeout: 30_000 });
    if (['eclipse', 'ascii-ripple', 'depth-image', 'glass-reveal'].includes(effect.slug)) {
      await expect(stage.locator('canvas')).toHaveCount(1);
      expect(await stage.locator('canvas').evaluate(canvas => (canvas as HTMLCanvasElement).width)).toBeGreaterThan(100);
      expect(await stage.locator('canvas').evaluate(canvas => canvas.getBoundingClientRect().height)).toBeGreaterThan(100);
    }
    if (['scroll-portal', 'tile-reveal'].includes(effect.slug)) {
      await expect(stage).toHaveAttribute('data-runway', 'true');
      const before = await stage.locator('[data-effect-mount]').innerHTML();
      await page.evaluate(() => window.scrollBy(0, 450));
      await expect.poll(() => stage.locator('[data-effect-mount]').innerHTML()).not.toBe(before);
    }
    if (['eclipse', 'depth-image', 'glass-reveal', 'ascii-ripple'].includes(effect.slug)) {
      const bounds = await stage.boundingBox();
      if (bounds) await page.mouse.move(bounds.x + bounds.width * 0.62, Math.min(700, bounds.y + bounds.height * 0.45));
    }
    await page.screenshot({ path: `evidence/effects/${effect.slug}.png`, animations: 'disabled' });
    await stage.locator('[data-effect-toggle]').click();
    await expect(stage).toHaveAttribute('data-effect-state', 'static');
    await expect(stage.locator('canvas')).toHaveCount(0);
    await stage.locator('[data-effect-toggle]').click();
    await expect(stage).toHaveAttribute('data-effect-state', 'playing');
    expect(errors).toEqual([]);
  });
}

test('reduced motion keeps complete static content and does not fetch the 3D engine', async ({ page }) => {
  const scripts: string[] = [];
  page.on('request', request => { if (request.resourceType() === 'script') scripts.push(request.url()); });
  await page.goto('/');
  await page.waitForTimeout(1_000);
  await expect(page.locator('[data-effect]')).toHaveCount(7);
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(scripts.filter(url => /render-effect|eclipse\.|three|fiber/.test(url))).toEqual([]);
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  const audit = await new AxeBuilder({ page }).analyze();
  expect(audit.violations.filter(item => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
});

test('sixteen chapters form one navigable journey and every effect releases offscreen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const chapters = page.locator('[data-journey-chapter]');
  await expect(chapters).toHaveCount(16);
  expect(await chapters.evaluateAll(nodes => nodes.map(node => node.id))).toEqual(journey.map(chapter => chapter.id));
  expect(await chapters.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-direction')))).toEqual(journey.map(chapter => chapter.direction));
  await page.locator('#chapters summary').click();
  await page.getByRole('navigation', { name: 'Journey chapters' }).getByRole('link', { name: 'Make it yours' }).click();
  await expect(page).toHaveURL(/#start$/);
  await expect(page.locator('#spatial-start-title')).toBeInViewport();
  for (const slug of ['eclipse', 'scroll-portal', 'ascii-ripple', 'depth-image', 'bend-gallery', 'glass-reveal', 'tile-reveal']) {
    const stage = page.locator(`[data-effect="${slug}"]`);
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-effect-state', 'playing', { timeout: 30_000 });
    await expect(page.locator('[data-effect-state="playing"]')).toHaveCount(1);
    if (slug === 'depth-image' || slug === 'tile-reveal') await page.screenshot({ path: `evidence/effects/journey-${slug}.png`, animations: 'disabled' });
  }
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('homepage releases the offscreen WebGL scene and supports explicit reduced-motion opt-in', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('[data-effect="eclipse"]');
  await hero.locator('[data-effect-toggle]').click();
  await expect(hero).toHaveAttribute('data-effect-state', 'playing', { timeout: 30_000 });
  await expect(hero.locator('canvas')).toHaveCount(1);
  expect(await hero.locator('canvas').evaluate(canvas => canvas.getBoundingClientRect().height)).toBeGreaterThan(100);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'evidence/effects/home-desktop.png', animations: 'disabled' });
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(hero.locator('canvas')).toHaveCount(0);
  await expect(hero).toHaveAttribute('data-effect-state', 'static');
});

test('all seven effect routes stay accessible on mobile without scroll capture', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.screenshot({ path: 'evidence/effects/home-mobile.png', fullPage: true, animations: 'disabled' });
  for (const effect of effects) {
    await page.goto(`/lab/effects/${effect.slug}/`);
    await expect(page.locator('h1')).toHaveText(effect.name);
    await expect(page.locator('canvas')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    const audit = await new AxeBuilder({ page }).analyze();
    expect(audit.violations.filter(item => item.impact === 'serious' || item.impact === 'critical'), effect.slug).toEqual([]);
  }
});
