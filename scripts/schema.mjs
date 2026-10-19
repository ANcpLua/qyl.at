// Serves https://qyl.at/schemas/<version>, the OpenTelemetry schema URL that
// @ancplua/qyl-semantic-conventions <version> and its NuGet siblings carry. qyl.at pulls
// it from that dependency: the package names the URL (SCHEMA_URL) but ships no schema
// document, and the qyl registry has no transformations, so the document for a new
// version is the newest committed one with the new version added.
//
//   node scripts/schema.mjs          before astro build: write public/schemas/<version> when missing
//   node scripts/schema.mjs verify   after the build: dist serves <version>, and every
//                                    committed schema byte for byte
//
// Committed files under public/schemas are never rewritten; release.sh commits a new one
// before it deploys, so a schema URL that was served once keeps resolving.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SEMVER = /^\d+\.\d+\.\d+$/u;

function compareVersions(a, b) {
  const [left, right] = [a, b].map((version) => version.split(".").map(Number));
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

export function schemaUrl(version) {
  return `https://qyl.at/schemas/${version}`;
}

/** The version the installed dependency names, checked against the URL it carries. */
export async function dependencyVersion(root) {
  const directory = path.join(root, "node_modules", "@ancplua", "qyl-semantic-conventions");
  const { version } = JSON.parse(fs.readFileSync(path.join(directory, "package.json"), "utf8"));
  const { SCHEMA_URL } = await import(pathToFileURL(path.join(directory, "dist", "index.js")).href);
  if (SCHEMA_URL !== schemaUrl(version)) {
    throw new Error(`@ancplua/qyl-semantic-conventions ${version} carries SCHEMA_URL ${SCHEMA_URL}, not ${schemaUrl(version)}`);
  }
  return version;
}

/** Writes `<schemas>/<version>` from the newest committed schema when it does not exist yet. */
export function serveSchema({ schemas, version }) {
  const target = path.join(schemas, version);
  if (fs.existsSync(target)) return { version, written: false };
  const committed = fs.readdirSync(schemas).filter((name) => SEMVER.test(name)).sort(compareVersions);
  const newest = committed.at(-1);
  if (newest === undefined) throw new Error(`${schemas}: no committed schema to extend`);
  if (compareVersions(newest, version) > 0) {
    throw new Error(`@ancplua/qyl-semantic-conventions ${version} is older than the newest served schema ${newest}`);
  }
  const previous = fs.readFileSync(path.join(schemas, newest), "utf8");
  const next = previous
    .replace(/^schema_url: .*$/mu, `schema_url: ${schemaUrl(version)}`)
    .replace(/^versions:$/mu, `versions:\n  ${version}:`);
  if (!next.includes(`schema_url: ${schemaUrl(version)}\n`) || !next.includes(`versions:\n  ${version}:\n`)) {
    throw new Error(`${path.join(schemas, newest)}: no schema_url or versions line to extend`);
  }
  fs.writeFileSync(target, next);
  return { version, written: true };
}

/** Failures when `dist` does not serve `version` or changed a committed schema. */
export function servedSchemaFailures({ schemas, dist, version }) {
  const failures = [];
  const served = path.join(dist, "schemas", version);
  if (!fs.existsSync(served)) return [`${served}: missing; the build serves no schema for @ancplua/qyl-semantic-conventions ${version}`];
  const text = fs.readFileSync(served, "utf8");
  if (!text.includes(`schema_url: ${schemaUrl(version)}\n`)) failures.push(`${served}: schema_url is not ${schemaUrl(version)}`);
  if (!new RegExp(`^  ${version.replace(/\./gu, "\\.")}:$`, "mu").test(text)) failures.push(`${served}: versions does not list ${version}`);
  for (const name of fs.readdirSync(schemas).filter((entry) => SEMVER.test(entry))) {
    const copy = path.join(dist, "schemas", name);
    if (!fs.existsSync(copy) || !fs.readFileSync(copy).equals(fs.readFileSync(path.join(schemas, name)))) {
      failures.push(`${copy}: does not serve the committed public/schemas/${name} unchanged`);
    }
  }
  return failures;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const schemas = path.join(root, "public", "schemas");
  const version = await dependencyVersion(root);
  if (process.argv[2] === "verify") {
    const failures = servedSchemaFailures({ schemas, dist: path.join(root, "dist"), version });
    if (failures.length > 0) {
      console.error(`schema gate: ${failures.length} failure(s)`);
      for (const failure of failures) console.error(`  - ${failure}`);
      process.exit(1);
    }
    console.log(`schema gate: dist serves ${schemaUrl(version)} and every committed schema unchanged`);
  } else {
    const { written } = serveSchema({ schemas, version });
    console.log(written ? `schema: wrote public/schemas/${version} for @ancplua/qyl-semantic-conventions ${version}; commit it` : `schema: public/schemas/${version} is committed`);
  }
}
