import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { handleVitals, validPayload } from "../worker/index.ts";

const valid = {
  browser: {
    deviceMemory: 8,
    language: "en-GB",
    viewportHeight: 844,
    viewportWidth: 390,
  },
  metrics: [
    { name: "CLS", rating: "good", value: 0 },
    { name: "INP", rating: "good", value: 48 },
    { name: "LCP", rating: "good", value: 912 },
  ],
  navigationType: "navigate",
  route: "/docs/mcp/",
};

function clone(): Record<string, unknown> {
  return structuredClone(valid) as unknown as Record<string, unknown>;
}

test("the RUM boundary accepts only its owned fields", () => {
  assert.equal(validPayload(valid), true);

  const browserContent = clone();
  (browserContent.browser as Record<string, unknown>).userAgent = "captured content";
  assert.equal(validPayload(browserContent), false);

  const metricContent = clone();
  ((metricContent.metrics as Array<Record<string, unknown>>)[0]).id = "foreign identifier";
  assert.equal(validPayload(metricContent), false);

  const topLevelContent = clone();
  topLevelContent.headers = { "Mcp-Param-Region": "secret" };
  assert.equal(validPayload(topLevelContent), false);
});

test("the RUM boundary accepts only its own metric names, not inherited ones", () => {
  // `metric.name in vitalEvents` walked Object.prototype, so these names passed
  // validation and — being keyed off the name — skipped every numeric bound too.
  for (const inherited of ["toString", "constructor", "valueOf", "__proto__", "hasOwnProperty"]) {
    const payload = clone();
    payload.metrics = [{ name: inherited, rating: "good", value: 1e308 }];
    assert.equal(validPayload(payload), false, `${inherited} must not be accepted as a metric name`);
  }

  const nonString = clone();
  nonString.metrics = [{ name: 5, rating: "good", value: 1 }];
  assert.equal(validPayload(nonString), false);
});

test("the RUM boundary rejects non-string fields instead of throwing on them", () => {
  // Optional chaining only guards null/undefined, so `route.startsWith` used to
  // throw a TypeError for every other type — outside the handler's try/catch,
  // which turned a malformed body into a Worker exception rather than a 400.
  for (const route of [5, true, ["/a"], {}, null]) {
    const payload = clone();
    payload.route = route;
    assert.doesNotThrow(() => validPayload(payload));
    assert.equal(validPayload(payload), false, `route ${JSON.stringify(route)} must be rejected`);
  }

  // RegExp.test stringifies, so these all coerced into strings that matched the
  // bounded-language pattern and were exported verbatim as an OTLP attribute.
  for (const language of [undefined, null, 12_345, true, ["abcdef"]]) {
    const payload = clone();
    const browser = payload.browser as Record<string, unknown>;
    if (language === undefined) delete browser.language;
    else browser.language = language;
    assert.equal(validPayload(payload), false, `language ${JSON.stringify(language)} must be rejected`);
  }

  const stringValue = clone();
  (stringValue.metrics as Array<Record<string, unknown>>)[0].value = "900";
  assert.equal(validPayload(stringValue), false);
});

test("the RUM boundary rejects ambiguous or unbounded dimensions", () => {
  const queryRoute = clone();
  queryRoute.route = "/docs/mcp/?token=secret";
  assert.equal(validPayload(queryRoute), false);

  const duplicateMetric = clone();
  duplicateMetric.metrics = [valid.metrics[0], valid.metrics[0]];
  assert.equal(validPayload(duplicateMetric), false);

  const excessiveViewport = clone();
  (excessiveViewport.browser as Record<string, unknown>).viewportWidth = 10_001;
  assert.equal(validPayload(excessiveViewport), false);
});

test("the Worker rejects invalid requests before scheduling an export", async () => {
  const env = {
    ASSETS: { fetch: async () => new Response(null, { status: 404 }) },
    QYL_API_KEY: "test-only",
    QYL_OTLP_LOGS_ENDPOINT: "https://collector.invalid/v1/logs",
  };
  const context = {
    waitUntil: () => assert.fail("invalid input must not schedule an export"),
  };

  const crossOrigin = new Request("https://qyl.at/_qyl/vitals", {
    body: JSON.stringify(valid),
    headers: { "content-type": "application/json", origin: "https://example.test" },
    method: "POST",
  });
  assert.equal((await handleVitals(crossOrigin, env, context)).status, 403);

  const unknownContent = clone();
  unknownContent.headers = { "Mcp-Param-Region": "secret" };
  const invalidPayload = new Request("https://qyl.at/_qyl/vitals", {
    body: JSON.stringify(unknownContent),
    headers: { "content-type": "application/json", origin: "https://qyl.at" },
    method: "POST",
  });
  assert.equal((await handleVitals(invalidPayload, env, context)).status, 400);

  const oversized = new Request("https://qyl.at/_qyl/vitals", {
    body: JSON.stringify({ padding: "x".repeat(8_193) }),
    headers: { "content-type": "application/json", origin: "https://qyl.at" },
    method: "POST",
  });
  assert.equal((await handleVitals(oversized, env, context)).status, 413);

  // A non-string route used to throw a TypeError out of the fetch handler, so
  // Cloudflare served 500 / Error 1101 instead of this 400.
  const wrongTypes = new Request("https://qyl.at/_qyl/vitals", {
    body: JSON.stringify({ ...valid, route: 5 }),
    headers: { "content-type": "application/json", origin: "https://qyl.at" },
    method: "POST",
  });
  assert.equal((await handleVitals(wrongTypes, env, context)).status, 400);

  const inheritedMetricName = new Request("https://qyl.at/_qyl/vitals", {
    body: JSON.stringify({ ...valid, metrics: [{ name: "toString", rating: "good", value: 1e308 }] }),
    headers: { "content-type": "application/json", origin: "https://qyl.at" },
    method: "POST",
  });
  assert.equal((await handleVitals(inheritedMetricName, env, context)).status, 400);
});

test("the Worker stops reading an oversized body instead of buffering it", async () => {
  const env = {
    ASSETS: { fetch: async () => new Response(null, { status: 404 }) },
    QYL_API_KEY: "test-only",
    QYL_OTLP_LOGS_ENDPOINT: "https://collector.invalid/v1/logs",
  };
  const context = {
    waitUntil: () => assert.fail("an oversized body must not schedule an export"),
  };

  // A chunked body has no Content-Length, so the cheap precheck is skipped and
  // the byte cap is the only thing standing between an anonymous caller and the
  // isolate's memory ceiling. The stream must be abandoned partway, not drained:
  // this one would be 64 MB if it were ever read to completion.
  const chunk = new Uint8Array(64 * 1024).fill(120);
  let produced = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (produced >= 1_024) {
        controller.close();
        return;
      }
      produced += 1;
      controller.enqueue(chunk);
    },
  });

  const streamed = new Request("https://qyl.at/_qyl/vitals", {
    body,
    duplex: "half",
    headers: { "content-type": "application/json", origin: "https://qyl.at" },
    method: "POST",
  } as RequestInit);

  assert.equal((await handleVitals(streamed, env, context)).status, 413);
  // 8 KiB cap, 64 KiB chunks: the very first chunk is already over, so exactly
  // one is pulled and the remaining 1023 are never produced.
  assert.equal(produced, 1, `expected the read to abort after one chunk, pulled ${produced}`);
});

test("a failing export is contained instead of surfacing as a Worker exception", async () => {
  // An unusable QYL_OTLP_LOGS_ENDPOINT — the var is committed in wrangler.jsonc,
  // so a typo or an unset value is a live misconfiguration, and it is the export
  // failure that rejects fastest. A collector timeout takes the same path.
  for (const endpoint of ["", "not-a-url"]) {
    // The browser must still get its 202, and the rejection must be contained.
    // Reaching waitUntil unhandled makes Cloudflare record the invocation as an
    // exception, so during an outage essentially every page view on qyl.at would
    // log a Worker error and any alarm on the error rate would report the
    // marketing site as broken while it serves 202s and assets perfectly.
    let exportTask: Promise<unknown> | undefined;
    const response = await handleVitals(
      new Request("https://qyl.at/_qyl/vitals", {
        body: JSON.stringify(valid),
        headers: { "content-type": "application/json", origin: "https://qyl.at" },
        method: "POST",
      }),
      {
        ASSETS: { fetch: async () => new Response(null, { status: 404 }) },
        QYL_API_KEY: "collector-test-key",
        QYL_OTLP_LOGS_ENDPOINT: endpoint,
      },
      { waitUntil: (promise) => { exportTask = promise; } },
    );

    assert.equal(response.status, 202);
    assert.ok(exportTask, `endpoint ${JSON.stringify(endpoint)} must still schedule the export`);
    await assert.doesNotReject(async () => exportTask, `endpoint ${JSON.stringify(endpoint)} must not reject into waitUntil`);
  }
});

test("the Worker emits bounded OTLP log records through the owned collector boundary", async () => {
  let resolveCapture!: (capture: { body: string; key: string | undefined }) => void;
  const captured = new Promise<{ body: string; key: string | undefined }>((resolve) => {
    resolveCapture = resolve;
  });
  const receiver = createServer((request, response) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => {
      resolveCapture({
        body: Buffer.concat(chunks).toString("utf8"),
        key: request.headers["x-otlp-api-key"] as string | undefined,
      });
      response.writeHead(200, { "content-type": "application/json" });
      response.end("{}");
    });
  });
  await new Promise<void>((resolve) => receiver.listen(0, "127.0.0.1", resolve));

  try {
    const address = receiver.address();
    assert.ok(address && typeof address === "object");
    let exportTask: Promise<unknown> | undefined;
    const response = await handleVitals(
      new Request("https://qyl.at/_qyl/vitals", {
        body: JSON.stringify(valid),
        headers: { "content-type": "application/json", origin: "https://qyl.at" },
        method: "POST",
      }),
      {
        ASSETS: { fetch: async () => new Response(null, { status: 404 }) },
        QYL_API_KEY: "collector-test-key",
        QYL_OTLP_LOGS_ENDPOINT: `http://127.0.0.1:${address.port}/v1/logs`,
        QYL_SERVICE_VERSION: "deadbee",
      },
      { waitUntil: (promise) => { exportTask = promise; } },
    );
    assert.equal(response.status, 202);
    assert.ok(exportTask);
    await exportTask;

    const capture = await captured;
    assert.equal(capture.key, "collector-test-key");
    const envelope = JSON.parse(capture.body) as {
      resourceLogs: Array<{
        resource: { attributes: Array<{ key: string; value: { stringValue?: string } }> };
        scopeLogs: Array<{
          logRecords: Array<{
            attributes: Array<{ key: string }>;
            body: { stringValue: string };
            eventName: string;
          }>;
        }>;
      }>;
    };
    const resource = envelope.resourceLogs[0];
    assert.deepEqual(resource.scopeLogs[0].logRecords.map((record) => record.eventName).sort(), [
      "web.vitals.cls",
      "web.vitals.inp",
      "web.vitals.lcp",
    ]);
    assert.equal(resource.resource.attributes.some((attribute) => attribute.key === "browser.user_agent"), false);
    // service.version must carry the deployed commit, not a hardcoded constant —
    // otherwise a vitals regression cannot be attributed to a deploy.
    assert.equal(
      resource.resource.attributes.find((attribute) => attribute.key === "service.version")?.value.stringValue,
      "deadbee",
    );
    assert.equal(resource.scopeLogs[0].logRecords.every((record) => record.body.stringValue === "Core Web Vital observed"), true);
    assert.equal(resource.scopeLogs[0].logRecords.every((record) => record.attributes.some((attribute) => attribute.key === "web.vital.value")), true);
    assert.equal(capture.body.includes("userAgent"), false);
    assert.equal(capture.body.includes("Mcp-Param"), false);
  } finally {
    await new Promise<void>((resolve, reject) => receiver.close((error) => error ? reject(error) : resolve()));
  }
});
