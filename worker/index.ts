import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION, ATTR_URL_PATH } from "@ancplua/qyl-semantic-conventions";
import {
  ATTR_BROWSER_LANGUAGE,
  ATTR_BROWSER_WEB_VITAL_DELTA,
  ATTR_BROWSER_WEB_VITAL_ID,
  ATTR_BROWSER_WEB_VITAL_NAME,
  ATTR_BROWSER_WEB_VITAL_NAVIGATION_TYPE,
  ATTR_BROWSER_WEB_VITAL_RATING,
  ATTR_BROWSER_WEB_VITAL_VALUE,
  EVENT_BROWSER_WEB_VITAL,
} from "@ancplua/qyl-semantic-conventions/incubating";
import { vitalNames, vitalNavigationTypes, vitalRatings, type LegacyVitalPayload, type VitalPayload, type VitalName } from "../src/lib/vitals-payload.ts";
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

// Only cached pre-migration pages use this wire vocabulary. Do not fabricate
// canonical event id/delta fields that those pages never sent.
const legacyVitalEvents = {
  CLS: { name: "web.vitals.cls", unit: "1" },
  INP: { name: "web.vitals.inp", unit: "ms" },
  LCP: { name: "web.vitals.lcp", unit: "ms" },
} as const;
type AcceptedVitalPayload = VitalPayload | LegacyVitalPayload;

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
function isVitalName(name: unknown): name is VitalName {
  return typeof name === "string" && Object.hasOwn(vitalNames, name);
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

export function validPayload(value: unknown): value is AcceptedVitalPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const payload = value as Record<string, unknown>;
  const canonical = payload.version === 2;
  if (!hasOnlyKeys(value, canonical ? ["version", "browser", "metrics", "route"] : ["browser", "metrics", "navigationType", "route"])) return false;
  // oxlint-disable-next-line no-control-regex
  if (typeof payload.route !== "string" || !payload.route.startsWith("/") || payload.route.length > 256 || /[?#\u0000-\u001f\u007f]/u.test(payload.route)) return false;
  if (!payload.browser || typeof payload.browser !== "object" || Array.isArray(payload.browser)) return false;
  const browser = payload.browser as Record<string, unknown>;
  if (!hasOnlyKeys(browser, canonical ? ["language"] : ["deviceMemory", "language", "viewportHeight", "viewportWidth"])) return false;
  if (typeof browser.language !== "string" || !/^[A-Za-z0-9-]{1,32}$/u.test(browser.language)) return false;
  if (!canonical) {
    if (payload.navigationType !== "navigate" && payload.navigationType !== "reload" && payload.navigationType !== "back_forward") return false;
    if (typeof browser.viewportHeight !== "number" || !Number.isInteger(browser.viewportHeight) || browser.viewportHeight < 1 || browser.viewportHeight > 10_000) return false;
    if (typeof browser.viewportWidth !== "number" || !Number.isInteger(browser.viewportWidth) || browser.viewportWidth < 1 || browser.viewportWidth > 10_000) return false;
    if (browser.deviceMemory !== undefined && (typeof browser.deviceMemory !== "number" || !Number.isFinite(browser.deviceMemory) || browser.deviceMemory < 0 || browser.deviceMemory > 64)) return false;
  }
  if (!Array.isArray(payload.metrics) || payload.metrics.length === 0 || payload.metrics.length > 3) return false;
  const metricNames = new Set<string>();
  return payload.metrics.every((metric: unknown) => {
    if (!metric || typeof metric !== "object" || Array.isArray(metric)) return false;
    if (!hasOnlyKeys(metric, canonical ? ["name", "rating", "value", "id", "delta", "navigationType"] : ["name", "rating", "value"])) return false;
    const reading = metric as Record<string, unknown>;
    if (!isVitalName(reading.name)) return false;
    const limit = reading.name === "CLS" ? 10 : 120_000;
    if (typeof reading.value !== "number" || !Number.isFinite(reading.value) || reading.value < 0 || reading.value > limit) return false;
    if (metricNames.has(reading.name)) return false;
    metricNames.add(reading.name);
    if (typeof reading.rating !== "string" || !vitalRatings.has(reading.rating)) return false;
    if (canonical) {
      if (typeof reading.id !== "string" || !/^[A-Za-z0-9._:-]{1,128}$/u.test(reading.id)) return false;
      if (typeof reading.delta !== "number" || !Number.isFinite(reading.delta) || Math.abs(reading.delta) > limit) return false;
      if (typeof reading.navigationType !== "string" || !vitalNavigationTypes.has(reading.navigationType)) return false;
    }
    return true;
  });
}

async function exportVitals(payload: AcceptedVitalPayload, env: Env): Promise<void> {
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
      [ATTR_SERVICE_NAME]: "qyl.at",
      [ATTR_SERVICE_VERSION]: env.QYL_SERVICE_VERSION ?? "dev",
    }),
  });
  const logger = provider.getLogger("qyl.web-vitals", "1.0.0");
  if ("version" in payload) {
    for (const metric of payload.metrics) {
      logger.emit({
        attributes: {
          [ATTR_BROWSER_LANGUAGE]: payload.browser.language,
          [ATTR_URL_PATH]: payload.route,
          [ATTR_BROWSER_WEB_VITAL_NAME]: vitalNames[metric.name],
          [ATTR_BROWSER_WEB_VITAL_VALUE]: metric.value,
          [ATTR_BROWSER_WEB_VITAL_DELTA]: metric.delta,
          [ATTR_BROWSER_WEB_VITAL_ID]: metric.id,
          [ATTR_BROWSER_WEB_VITAL_RATING]: metric.rating,
          [ATTR_BROWSER_WEB_VITAL_NAVIGATION_TYPE]: metric.navigationType,
        },
        body: "Core Web Vital observed",
        eventName: EVENT_BROWSER_WEB_VITAL,
        severityText: "INFO",
      });
    }
  } else {
    for (const metric of payload.metrics) {
      const definition = legacyVitalEvents[metric.name];
      logger.emit({
        attributes: {
          [ATTR_BROWSER_LANGUAGE]: payload.browser.language,
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

  let payload: AcceptedVitalPayload;
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
