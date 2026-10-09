import pixelmatch from "pixelmatch";
import type { PNG } from "pngjs";

type SurfaceImage = Pick<PNG, "data" | "width" | "height">;

export const maxSurfaceDifferenceRatio = 0.005;

export function surfaceDifferenceRatio(before: SurfaceImage, after: SurfaceImage): number {
  // Calibrated for pixelmatch 8's OKLab/HyAB metric. With 0.12 (and 0.115),
  // #f7f7f2 -> #d7d7d2 is invisible even over most of the reading surface;
  // v7 at 0.12 rejected it. 0.11 restores that guard and the preview-overlay
  // regressions while still ignoring single-channel rounding noise.
  const different = pixelmatch(before.data, after.data, undefined, before.width, before.height, {
    includeAA: false,
    threshold: 0.11,
  });
  return different / (before.width * before.height);
}
