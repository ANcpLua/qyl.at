import type { Metric } from "web-vitals";
import {
  BROWSER_WEB_VITAL_NAME_VALUE_CLS,
  BROWSER_WEB_VITAL_NAME_VALUE_INP,
  BROWSER_WEB_VITAL_NAME_VALUE_LCP,
  BROWSER_WEB_VITAL_NAVIGATION_TYPE_VALUE_BACK_FORWARD,
  BROWSER_WEB_VITAL_NAVIGATION_TYPE_VALUE_BACK_FORWARD_CACHE,
  BROWSER_WEB_VITAL_NAVIGATION_TYPE_VALUE_NAVIGATE,
  BROWSER_WEB_VITAL_NAVIGATION_TYPE_VALUE_PRERENDER,
  BROWSER_WEB_VITAL_NAVIGATION_TYPE_VALUE_RELOAD,
  BROWSER_WEB_VITAL_NAVIGATION_TYPE_VALUE_RESTORE,
  BROWSER_WEB_VITAL_RATING_VALUE_GOOD,
  BROWSER_WEB_VITAL_RATING_VALUE_NEEDS_IMPROVEMENT,
  BROWSER_WEB_VITAL_RATING_VALUE_POOR,
} from "@ancplua/qyl-semantic-conventions/incubating";

export const vitalNames = {
  CLS: BROWSER_WEB_VITAL_NAME_VALUE_CLS,
  INP: BROWSER_WEB_VITAL_NAME_VALUE_INP,
  LCP: BROWSER_WEB_VITAL_NAME_VALUE_LCP,
} as const;
export const vitalNavigationTypes = new Set<string>([
  BROWSER_WEB_VITAL_NAVIGATION_TYPE_VALUE_BACK_FORWARD,
  BROWSER_WEB_VITAL_NAVIGATION_TYPE_VALUE_BACK_FORWARD_CACHE,
  BROWSER_WEB_VITAL_NAVIGATION_TYPE_VALUE_NAVIGATE,
  BROWSER_WEB_VITAL_NAVIGATION_TYPE_VALUE_PRERENDER,
  BROWSER_WEB_VITAL_NAVIGATION_TYPE_VALUE_RELOAD,
  BROWSER_WEB_VITAL_NAVIGATION_TYPE_VALUE_RESTORE,
]);
export const vitalRatings = new Set<string>([
  BROWSER_WEB_VITAL_RATING_VALUE_GOOD,
  BROWSER_WEB_VITAL_RATING_VALUE_NEEDS_IMPROVEMENT,
  BROWSER_WEB_VITAL_RATING_VALUE_POOR,
]);

export type VitalName = keyof typeof vitalNames;
export interface VitalReading {
  name: VitalName;
  rating: Metric["rating"];
  value: number;
  delta: number;
  id: string;
  navigationType: Metric["navigationType"];
}
export interface VitalPayload {
  version: 2;
  browser: { language: string };
  metrics: VitalReading[];
  route: string;
}
export interface LegacyVitalPayload {
  browser: {
    deviceMemory?: number;
    language: string;
    viewportHeight: number;
    viewportWidth: number;
  };
  metrics: Pick<VitalReading, "name" | "rating" | "value">[];
  navigationType: string;
  route: string;
}

// Keep only the last value per metric while retaining all deltas since the
// last beacon. A bfcache restore supplies a new metric id and starts a new sum.
export function readingFromMetric(metric: Metric, previous?: VitalReading): VitalReading | undefined {
  if (!Object.hasOwn(vitalNames, metric.name) || !vitalNavigationTypes.has(metric.navigationType)) return undefined;
  return {
    name: metric.name as VitalName,
    rating: metric.rating,
    value: metric.value,
    delta: metric.delta + (previous?.id === metric.id ? previous.delta : 0),
    id: metric.id,
    navigationType: metric.navigationType,
  };
}
