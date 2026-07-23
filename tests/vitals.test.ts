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
        resource: { attributes: Array<{ key: string }> };
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
    assert.equal(resource.scopeLogs[0].logRecords.every((record) => record.body.stringValue === "Core Web Vital observed"), true);
    assert.equal(resource.scopeLogs[0].logRecords.every((record) => record.attributes.some((attribute) => attribute.key === "web.vital.value")), true);
    assert.equal(capture.body.includes("userAgent"), false);
    assert.equal(capture.body.includes("Mcp-Param"), false);
  } finally {
    await new Promise<void>((resolve, reject) => receiver.close((error) => error ? reject(error) : resolve()));
  }
});
