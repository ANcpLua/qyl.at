import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";

interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: AssetsBinding;
  QYL_API_KEY?: string;
  QYL_OTLP_LOGS_ENDPOINT: string;
}

interface WorkerContext {
  waitUntil(promise: Promise<unknown>): void;
}

interface VitalMetric {
  name: "CLS" | "INP" | "LCP";
  rating: "good" | "needs-improvement" | "poor";
  value: number;
}

interface VitalPayload {
  browser: {
    deviceMemory?: number;
    language: string;
    viewportHeight: number;
    viewportWidth: number;
  };
  metrics: VitalMetric[];
  navigationType: string;
  route: string;
}

const vitalEvents = {
  CLS: { name: "web.vitals.cls", unit: "1" },
  INP: { name: "web.vitals.inp", unit: "ms" },
  LCP: { name: "web.vitals.lcp", unit: "ms" },
} as const;

function hasOnlyKeys(value: object, allowed: readonly string[]): boolean {
  const names = new Set(allowed);
  return Object.keys(value).every((key) => names.has(key));
}

export function validPayload(value: unknown): value is VitalPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<VitalPayload>;
  if (!hasOnlyKeys(value, ["browser", "metrics", "navigationType", "route"])) return false;
  if (!payload.route?.startsWith("/") || payload.route.length > 256 || /[?#\u0000-\u001f\u007f]/u.test(payload.route)) return false;
  if (payload.navigationType !== "navigate" && payload.navigationType !== "reload" && payload.navigationType !== "back_forward") return false;
  if (!payload.browser || typeof payload.browser !== "object") return false;
  if (!hasOnlyKeys(payload.browser, ["deviceMemory", "language", "viewportHeight", "viewportWidth"])) return false;
  if (!/^[A-Za-z0-9-]{1,32}$/u.test(payload.browser.language)) return false;
  if (!Number.isInteger(payload.browser.viewportHeight) || payload.browser.viewportHeight < 1 || payload.browser.viewportHeight > 10_000) return false;
  if (!Number.isInteger(payload.browser.viewportWidth) || payload.browser.viewportWidth < 1 || payload.browser.viewportWidth > 10_000) return false;
  if (payload.browser.deviceMemory !== undefined && (!Number.isFinite(payload.browser.deviceMemory) || payload.browser.deviceMemory < 0 || payload.browser.deviceMemory > 64)) return false;
  if (!Array.isArray(payload.metrics) || payload.metrics.length === 0 || payload.metrics.length > 3) return false;
  const metricNames = new Set<string>();
  return payload.metrics.every((metric) => {
    if (!metric || typeof metric !== "object") return false;
    if (!hasOnlyKeys(metric, ["name", "rating", "value"])) return false;
    if (!(metric.name in vitalEvents) || !Number.isFinite(metric.value) || metric.value < 0) return false;
    if (metricNames.has(metric.name)) return false;
    metricNames.add(metric.name);
    if (metric.name === "CLS" && metric.value > 10) return false;
    if ((metric.name === "INP" || metric.name === "LCP") && metric.value > 120_000) return false;
    return metric.rating === "good" || metric.rating === "needs-improvement" || metric.rating === "poor";
  });
}

async function exportVitals(payload: VitalPayload, env: Env): Promise<void> {
  const exporter = new OTLPLogExporter({
    url: env.QYL_OTLP_LOGS_ENDPOINT,
    headers: { "x-otlp-api-key": env.QYL_API_KEY! },
  });
  const processor = new BatchLogRecordProcessor({
    exporter,
    exportTimeoutMillis: 8_000,
    maxExportBatchSize: 3,
    maxQueueSize: 3,
    scheduledDelayMillis: 60_000,
  });
  const provider = new LoggerProvider({
    processors: [processor],
    resource: resourceFromAttributes({
      "service.name": "qyl.at",
      "service.version": "1.0.0",
    }),
  });
  const logger = provider.getLogger("qyl.web-vitals", "1.0.0");
  for (const metric of payload.metrics) {
    const definition = vitalEvents[metric.name];
    logger.emit({
      body: {
        ...(payload.browser.deviceMemory === undefined ? {} : { "browser.device_memory": payload.browser.deviceMemory }),
        "browser.language": payload.browser.language,
        "browser.viewport.height": payload.browser.viewportHeight,
        "browser.viewport.width": payload.browser.viewportWidth,
        "navigation.type": payload.navigationType,
        "page.route": payload.route,
        "web.vital.name": metric.name,
        "web.vital.rating": metric.rating,
        "web.vital.unit": definition.unit,
        "web.vital.value": metric.value,
      },
      eventName: definition.name,
      severityText: "INFO",
    });
  }
  try {
    await provider.forceFlush({ timeoutMillis: 8_000 });
  } finally {
    await provider.shutdown();
  }
}

export async function handleVitals(request: Request, env: Env, context: WorkerContext): Promise<Response> {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
  if (!env.QYL_API_KEY) return new Response(null, { status: 503 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return new Response(null, { status: 403 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return new Response(null, { status: 415 });
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null && !/^\d+$/u.test(declaredLength)) return new Response(null, { status: 400 });
  if (declaredLength !== null && Number(declaredLength) > 8_192) return new Response(null, { status: 413 });

  let payload: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 8_192) return new Response(null, { status: 413 });
    payload = JSON.parse(body);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!validPayload(payload)) return new Response(null, { status: 400 });

  context.waitUntil(exportVitals(payload, env));
  return new Response(null, { status: 202 });
}

export default {
  async fetch(request: Request, env: Env, context: WorkerContext): Promise<Response> {
    if (new URL(request.url).pathname === "/_qyl/vitals") return handleVitals(request, env, context);
    return env.ASSETS.fetch(request);
  },
};
