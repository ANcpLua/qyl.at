import { onCLS, onINP, onLCP, type Metric } from "web-vitals";

type VitalName = "CLS" | "INP" | "LCP";

interface VitalReading {
  name: VitalName;
  rating: Metric["rating"];
  value: number;
}

const readings = new Map<VitalName, VitalReading>();
let flushHandle = 0;

function flush(): void {
  window.clearTimeout(flushHandle);
  if (readings.size === 0) return;

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const deviceNavigator = navigator as Navigator & { deviceMemory?: number };
  const body = JSON.stringify({
    metrics: [...readings.values()],
    route: window.location.pathname,
    navigationType: navigation?.type ?? "navigate",
    browser: {
      deviceMemory: deviceNavigator.deviceMemory,
      language: navigator.language,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    },
  });
  readings.clear();
  navigator.sendBeacon("/_qyl/vitals", new Blob([body], { type: "application/json" }));
}

function record(metric: Metric): void {
  if (metric.name !== "CLS" && metric.name !== "INP" && metric.name !== "LCP") return;
  readings.set(metric.name, {
    name: metric.name,
    rating: metric.rating,
    value: metric.value,
  });
  window.clearTimeout(flushHandle);
  flushHandle = window.setTimeout(flush, 1_000);
}

export function startVitals(): void {
  onCLS(record);
  onINP(record);
  onLCP(record);
  window.addEventListener("pagehide", flush, { once: true });
}
