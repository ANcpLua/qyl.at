import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { serveSchema, servedSchemaFailures } from "../scripts/schema.mjs";

const committed = (version: string, older: string[]) => [
  "# OpenTelemetry telemetry schema for the qyl semantic-convention registry.",
  "file_format: 1.1.0",
  `schema_url: https://qyl.at/schemas/${version}`,
  "versions:",
  ...[version, ...older].map((entry) => `  ${entry}:`),
  "",
].join("\n");

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "qyl schema "));
  const schemas = join(root, "public", "schemas");
  mkdirSync(schemas, { recursive: true });
  writeFileSync(join(schemas, "1.9.0"), committed("1.9.0", []));
  writeFileSync(join(schemas, "1.10.0"), committed("1.10.0", ["1.9.0"]));
  return { root, schemas, dispose: () => rmSync(root, { recursive: true, force: true }) };
}

test("a new dependency version extends the newest committed schema and leaves the others alone", () => {
  const { schemas, dispose } = fixture();
  try {
    assert.deepEqual(serveSchema({ schemas, version: "1.11.0" }), { version: "1.11.0", written: true });
    assert.equal(readFileSync(join(schemas, "1.11.0"), "utf8"), committed("1.11.0", ["1.10.0", "1.9.0"]));
    assert.equal(readFileSync(join(schemas, "1.10.0"), "utf8"), committed("1.10.0", ["1.9.0"]));
    assert.deepEqual(serveSchema({ schemas, version: "1.11.0" }), { version: "1.11.0", written: false });
  } finally {
    dispose();
  }
});

test("a dependency older than the newest served schema is refused", () => {
  const { schemas, dispose } = fixture();
  try {
    assert.throws(() => serveSchema({ schemas, version: "1.9.5" }), /older than the newest served schema 1\.10\.0/);
  } finally {
    dispose();
  }
});

test("the build gate fails without the dependency's schema or with a changed committed one", () => {
  const { root, schemas, dispose } = fixture();
  try {
    const dist = join(root, "dist");
    mkdirSync(dist);
    assert.match(servedSchemaFailures({ schemas, dist, version: "1.10.0" })[0]!, /serves no schema for @ancplua\/qyl-semantic-conventions 1\.10\.0/);
    cpSync(schemas, join(dist, "schemas"), { recursive: true });
    assert.deepEqual(servedSchemaFailures({ schemas, dist, version: "1.10.0" }), []);
    writeFileSync(join(dist, "schemas", "1.9.0"), committed("1.9.0", ["1.8.0"]));
    assert.deepEqual(servedSchemaFailures({ schemas, dist, version: "1.10.0" }), [
      `${join(dist, "schemas", "1.9.0")}: does not serve the committed public/schemas/1.9.0 unchanged`,
    ]);
  } finally {
    dispose();
  }
});
