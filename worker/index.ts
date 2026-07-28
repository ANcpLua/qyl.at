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
  // Commit SHA of the deployed build, injected by `wrangler deploy --var`.
  // Falls back to "dev" so a local `wrangler dev` never reports a real version.
  QYL_SERVICE_VERSION?: string;
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

// The unauthenticated request body is the only untrusted input this Worker has,
// so every field is type-checked before it is read. `validPayload` must be
// total: a throw escapes into the Workers runtime and turns a rejected payload
// into a Worker exception on the production error rate.
const MAX_BODY_BYTES = 8_192;

function hasOnlyKeys(value: object, allowed: readonly string[]): boolean {
  const names = new Set(allowed);
  return Object.keys(value).every((key) => names.has(key));
}

// `metric.name in vitalEvents` walks Object.prototype, so `toString`,
// `constructor`, `valueOf` and `__proto__` pass as metric names — and then skip
// every name-keyed numeric bound below, because none of them match "CLS", "INP"
// or "LCP". Own enumerable keys only.
function isVitalName(name: unknown): name is VitalMetric["name"] {
  return typeof name === "string" && Object.hasOwn(vitalEvents, name);
}

/**
 * Reads the request body while counting bytes and aborts as soon as the cap is
 * passed. `request.text()` buffers first and measures second, so a chunked body
 * with no Content-Length could drive the isolate past its memory ceiling before
 * the size check ran. Returns null when the body exceeds `limit`.
 */
async function readBoundedBody(request: Request, limit: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(body);
}

export function validPayload(value: unknown): value is VitalPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<VitalPayload>;
  if (!hasOnlyKeys(value, ["browser", "metrics", "navigationType", "route"])) return false;
  if (typeof payload.route !== "string" || !payload.route.startsWith("/") || payload.route.length > 256 || /[?#\u0000-\u001f\u007f]/u.test(payload.route)) return false;
  if (payload.navigationType !== "navigate" && payload.navigationType !== "reload" && payload.navigationType !== "back_forward") return false;
  if (!payload.browser || typeof payload.browser !== "object") return false;
  if (!hasOnlyKeys(payload.browser, ["deviceMemory", "language", "viewportHeight", "viewportWidth"])) return false;
  // RegExp.test stringifies its argument, so an absent, null, boolean, numeric or
  // single-element-array language coerces into a string that matches. Require a
  // real string before the shape check.
  if (typeof payload.browser.language !== "string" || !/^[A-Za-z0-9-]{1,32}$/u.test(payload.browser.language)) return false;
  if (!Number.isInteger(payload.browser.viewportHeight) || payload.browser.viewportHeight < 1 || payload.browser.viewportHeight > 10_000) return false;
  if (!Number.isInteger(payload.browser.viewportWidth) || payload.browser.viewportWidth < 1 || payload.browser.viewportWidth > 10_000) return false;
  if (payload.browser.deviceMemory !== undefined && (typeof payload.browser.deviceMemory !== "number" || !Number.isFinite(payload.browser.deviceMemory) || payload.browser.deviceMemory < 0 || payload.browser.deviceMemory > 64)) return false;
  if (!Array.isArray(payload.metrics) || payload.metrics.length === 0 || payload.metrics.length > 3) return false;
  const metricNames = new Set<string>();
  return payload.metrics.every((metric) => {
    if (!metric || typeof metric !== "object") return false;
    if (!hasOnlyKeys(metric, ["name", "rating", "value"])) return false;
    if (!isVitalName(metric.name)) return false;
    if (typeof metric.value !== "number" || !Number.isFinite(metric.value) || metric.value < 0) return false;
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
      "service.version": env.QYL_SERVICE_VERSION ?? "dev",
    }),
  });
  const logger = provider.getLogger("qyl.web-vitals", "1.0.0");
  for (const metric of payload.metrics) {
    const definition = vitalEvents[metric.name];
    logger.emit({
      attributes: {
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
      body: "Core Web Vital observed",
      eventName: definition.name,
      severityText: "INFO",
    });
  }
  // Shut the provider down whatever the flush did, but never let a shutdown
  // failure replace the collector failure that caused it — the original error is
  // the one that names the right subsystem.
  let failure: unknown;
  try {
    await provider.forceFlush({ timeoutMillis: 8_000 });
  } catch (error) {
    failure = error;
  }
  try {
    await provider.shutdown();
  } catch (error) {
    failure ??= error;
  }
  if (failure !== undefined) throw failure;
}

export async function handleVitals(request: Request, env: Env, context: WorkerContext): Promise<Response> {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
  if (!env.QYL_API_KEY) return new Response(null, { status: 503 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return new Response(null, { status: 403 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return new Response(null, { status: 415 });
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null && !/^\d+$/u.test(declaredLength)) return new Response(null, { status: 400 });
  if (declaredLength !== null && Number(declaredLength) > MAX_BODY_BYTES) return new Response(null, { status: 413 });

  let payload: VitalPayload;
  try {
    // Streamed and capped, so a `Transfer-Encoding: chunked` body with no
    // Content-Length cannot be buffered in full before it is rejected.
    const body = await readBoundedBody(request, MAX_BODY_BYTES);
    if (body === null) return new Response(null, { status: 413 });
    const parsed: unknown = JSON.parse(body);
    // validPayload runs inside the try as well: it is written to be total, and
    // if that is ever broken the failure must still be this path's 400 rather
    // than an unhandled rejection escaping the fetch handler.
    if (!validPayload(parsed)) return new Response(null, { status: 400 });
    payload = parsed;
  } catch {
    return new Response(null, { status: 400 });
  }

  // A collector outage must not read as a broken marketing site. Without this
  // catch the rejection reaches waitUntil unhandled and every page view during
  // the outage is recorded as a Worker exception.
  context.waitUntil(exportVitals(payload, env).catch((error: unknown) => {
    console.error("web-vitals export to the qyl collector failed", error);
  }));
  return new Response(null, { status: 202 });
}

export default {
  async fetch(request: Request, env: Env, context: WorkerContext): Promise<Response> {
    if (new URL(request.url).pathname === "/_qyl/vitals") return handleVitals(request, env, context);
    return env.ASSETS.fetch(request);
  },
};
