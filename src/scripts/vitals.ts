import { onCLS, onINP, onLCP, type Metric } from "web-vitals";

import { readingFromMetric, type VitalName, type VitalPayload, type VitalReading } from "../lib/vitals-payload";

const readings = new Map<VitalName, VitalReading>();
let flushHandle = 0;

function flush(): void {
  window.clearTimeout(flushHandle);
  if (readings.size === 0) return;

  const payload: VitalPayload = {
    version: 2,
    metrics: [...readings.values()],
    route: window.location.pathname,
    browser: { language: navigator.language },
  };
  const body = JSON.stringify(payload);
  readings.clear();
  navigator.sendBeacon("/_qyl/vitals", new Blob([body], { type: "application/json" }));
}

function record(metric: Metric): void {
  if (metric.name !== "CLS" && metric.name !== "INP" && metric.name !== "LCP") return;
  const reading = readingFromMetric(metric, readings.get(metric.name));
  if (!reading) return;
  readings.set(reading.name, reading);
  window.clearTimeout(flushHandle);
  flushHandle = window.setTimeout(flush, 1_000);
}

export function startVitals(): void {
  onCLS(record);
  onINP(record);
  onLCP(record);
  // Not `{ once: true }`. CLS and INP are finalized by web-vitals only at hide
  // time, and a bfcache restore makes it report a fresh set for the restored
  // visit — with a one-shot listener every back/forward visit would contribute
  // an LCP-only record and bias the CLS and INP distributions towards
  // first-visit traffic.
  window.addEventListener("pagehide", flush);
}
