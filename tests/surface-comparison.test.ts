import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PNG } from "pngjs";
import { maxSurfaceDifferenceRatio, surfaceDifferenceRatio } from "./surface-comparison.ts";

const width = 1280;
const height = 900;
const pixels = width * height;
const landingBackground = [247, 247, 242, 255]; // SpatialLanding.astro: #f7f7f2

function paletteFixture(changedPixels = 0, color = landingBackground) {
  const data = Buffer.alloc(pixels * 4);
  for (let i = 0; i < pixels; i++) data.set(i < changedPixels ? color : landingBackground, i * 4);
  return { data, width, height };
}

test("the surface comparator catches a light background regression with the v8 metric", () => {
  // A theme/overlay error, with geometry and content unchanged. At 0.12, v7
  // counted 640,000 pixels; v8 counted zero, so tightening only the area limit
  // could never recover it. At 0.11 v8 counts all 640,000 again.
  const before = paletteFixture();
  const after = paletteFixture(640_000, [215, 215, 210, 255]);
  assert.ok(surfaceDifferenceRatio(before, after) > maxSurfaceDifferenceRatio);
});

for (const name of ["apple-minimal", "terminal-light"]) {
  test(`${name}: a visible overlay fails but identity and rounding noise pass`, () => {
    // Existing browser-rendered previews exercise text, artwork and AA edges.
    // These calibrate the comparator; the Playwright gate separately checks
    // actual JS-on/JS-off full-page captures of the reading routes.
    const before = PNG.sync.read(readFileSync(new URL(`../public/lab-previews/${name}.png`, import.meta.url)));
    const shaded = { width: before.width, height: before.height, data: Buffer.from(before.data) };
    const noise = { width: before.width, height: before.height, data: Buffer.from(before.data) };
    for (let p = 0; p < before.data.length; p += 4) {
      for (let c = 0; c < 3; c++) {
        shaded.data[p + c] = Math.round(before.data[p + c] * 0.87);
        noise.data[p + c] = Math.max(0, Math.min(255, before.data[p + c] + ((p / 4 + c) % 3) - 1));
      }
    }
    assert.ok(surfaceDifferenceRatio(before, shaded) > maxSurfaceDifferenceRatio, "a 13% black overlay must fail");
    assert.equal(surfaceDifferenceRatio(before, before), 0);
    assert.equal(surfaceDifferenceRatio(before, noise), 0);
  });
}

test("the surface budget accepts at most 0.5% changed pixels", () => {
  const before = paletteFixture();
  for (const [ratio, passes] of [[0.004, true], [0.005, true], [0.006, false]] as const) {
    const after = paletteFixture(Math.round(pixels * ratio), [32, 33, 30, 255]);
    assert.equal(surfaceDifferenceRatio(before, after) <= maxSurfaceDifferenceRatio, passes, `${ratio * 100}% changed area`);
  }
});
