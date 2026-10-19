// Version-drift gate.
//
// `src/data/site.ts` is the only place a product version is written, and pages
// state versions by calling `versionOf`. A few places cannot: an MDX frontmatter
// `description` is YAML, and a fenced code example showing
// `<Project Sdk="Qyl.Api.Sdk/16.0.1">` has to show the literal a reader will
// copy. Those stay literals, and this gate holds each of them to `site.ts` at
// its exact location, so a wave that bumps the array turns red instead of
// leaving a stale number in a copy-paste example. (The example in this comment
// is one of them, so it cannot go stale either.)
//
// It is a *source* gate, not a `dist` gate, on purpose: in the built HTML an
// interpolated version and a hand-typed one are the same bytes, so the built
// site cannot tell drift from correctness. The source can.
//
// Four independent checks, any of which can go red on its own:
//   1. The two lockstep claims site.ts documents hold. The footer `headline` is
//      derived from `release`, so it cannot disagree with it, but it states seven
//      entries for thirteen packages on the strength of these two facts, and so does
//      the FAQ.
//   2. Every literal that must exist, exists verbatim where it is anchored,
//      built from `release`.
//   3. Nothing else in src/, scripts/ or README.md hand-writes a product
//      version: every published version found outside an anchor is a failure,
//      and every `<package><sep><version>` pair has to agree with `release`.
//   4. The site serves the OpenTelemetry schema for the SemanticConventions
//      version it names: `public/schemas/<version>` exists and points at itself.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const siteFile = path.join(root, "src", "data", "site.ts");

const { release, releaseWave, versionOf } = await import(
  new URL("../src/data/site.ts", import.meta.url).href
);

const failures = [];
function check(condition, message) {
  if (!condition) failures.push(message);
}

function relativePath(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

// A semver that is not part of a longer dotted run, so `127.0.0.1` is an
// address rather than three quarters of a version.
const SEMVER = /(?<![\w.])\d+\.\d+\.\d+(?![\w.])/gu;

const versions = new Set(release.map((entry) => entry.version));

// ------------------------------------------------- 1. lockstep claims hold

check(/^\d{4}-\d{2}-\d{2}$/u.test(releaseWave), `releaseWave is not a date: ${releaseWave}`);

check(
  versionOf("Qyl.Telemetry.Hosting") === versionOf("Qyl.Telemetry.AutoInstrumentation"),
  `Hosting ${versionOf("Qyl.Telemetry.Hosting")} no longer ships in lockstep with AutoInstrumentation ${versionOf("Qyl.Telemetry.AutoInstrumentation")}; the footer headline and the FAQ answer both state one version for the pair`,
);
const semconv = release.filter(
  (entry) => entry.name.startsWith("Qyl.Telemetry.SemanticConventions") || entry.name === "@ancplua/qyl-semantic-conventions",
);
check(semconv.length === 4, `expected four SemanticConventions packages, found ${semconv.length}`);
check(
  new Set(semconv.map((entry) => entry.version)).size === 1,
  `the four SemanticConventions packages no longer share a version: ${semconv.map((entry) => `${entry.name} ${entry.version}`).join(", ")}`,
);

// ------------------------------------------------- 2. literals that must hold

const apiSdk = versionOf("Qyl.Api.Sdk");
const semconvVersion = versionOf("Qyl.Telemetry.SemanticConventions");

// Each entry: a file, the exact text that must appear in it, and why it cannot
// simply be an expression. A published version is allowed in a file only
// inside one of these texts; the sweep below treats every other one as drift.
const anchors = [
  {
    file: "src/content/docs/api-sdk.mdx",
    text: `Qyl.Api.Sdk ${apiSdk} `,
    reason: "YAML frontmatter description; frontmatter is not MDX and cannot interpolate",
  },
  {
    file: "src/content/docs/api-sdk.mdx",
    text: `<Project Sdk="Qyl.Api.Sdk/${apiSdk}">`,
    reason: "fenced code example; a reader copies these bytes verbatim",
  },
  {
    file: "src/content/docs/getting-started.mdx",
    text: `<Project Sdk="Qyl.Api.Sdk/${apiSdk}">`,
    reason: "fenced code example; a reader copies these bytes verbatim",
  },
  {
    file: "scripts/check-versions.mjs",
    text: `<Project Sdk="Qyl.Api.Sdk/${apiSdk}">`,
    reason: "the example in this file's header comment shows a real, current literal",
  },
];

// file -> [start, end) ranges that an anchor accounts for.
const anchored = new Map();

for (const anchor of anchors) {
  const absolute = path.join(root, anchor.file);
  check(fs.existsSync(absolute), `${anchor.file}: missing, but the version gate anchors on it`);
  if (!fs.existsSync(absolute)) continue;
  const text = fs.readFileSync(absolute, "utf8");
  const ranges = anchored.get(anchor.file) ?? [];
  anchored.set(anchor.file, ranges);
  let found = 0;
  for (let index = text.indexOf(anchor.text); index !== -1; index = text.indexOf(anchor.text, index + 1)) {
    ranges.push([index, index + anchor.text.length]);
    found += 1;
  }
  check(
    found > 0,
    `${anchor.file}: does not contain "${anchor.text}" (${anchor.reason}). site.ts says Qyl.Api.Sdk ${apiSdk}; update the literal to match, or the anchor in scripts/check-versions.mjs if the example moved.`,
  );
}

// ------------------------------------------------ 3. nothing else holds one

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolute);
    return /\.(?:astro|mdx|md|ts|tsx|js|mjs)$/u.test(entry.name) ? [absolute] : [];
  });
}

// `public/` is deliberately not swept: `public/schemas/<version>` files hold the
// registry's whole version history by design, and check 4 holds the current one.
const swept = [
  ...sourceFiles(path.join(root, "src")),
  ...sourceFiles(path.join(root, "scripts")),
  path.join(root, "README.md"),
];

// Longest name first so `qyl` cannot claim a match inside a longer id; the
// separator set excludes `-` and `.` for the same reason, so `qyl-mcp-server`
// and `qyl.mcp` are never read as `qyl`.
const names = release.map((entry) => entry.name).sort((a, b) => b.length - a.length);
const pairing = new RegExp(
  `(?<![\\w./@-])(${names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")).join("|")})[ /@]v?(\\d+\\.\\d+\\.\\d+)(?![\\w.])`,
  "gu",
);

for (const file of swept) {
  if (file === siteFile) continue;
  const relative = relativePath(file);
  const text = fs.readFileSync(file, "utf8");
  const ranges = anchored.get(relative) ?? [];

  for (const match of text.matchAll(SEMVER)) {
    if (!versions.has(match[0])) continue;
    const covered = ranges.some(([start, end]) => match.index >= start && match.index + match[0].length <= end);
    check(
      covered,
      `${relative}:${lineOf(text, match.index)}: hand-writes published version ${match[0]} outside any anchor. State it with versionOf() from src/data/site.ts; if it genuinely cannot interpolate, add an anchor for it in scripts/check-versions.mjs.`,
    );
  }

  for (const match of text.matchAll(pairing)) {
    const expected = versionOf(match[1]);
    check(
      match[2] === expected,
      `${relative}:${lineOf(text, match.index)}: states "${match[1]} ${match[2]}", site.ts says ${expected}`,
    );
  }
}

// ------------------------------------------------ 4. the served schema exists

const schemaFile = path.join(root, "public", "schemas", semconvVersion);
const schemaRelative = relativePath(schemaFile);
check(
  fs.existsSync(schemaFile) && fs.statSync(schemaFile).isFile(),
  `${schemaRelative}: missing. site.ts says Qyl.Telemetry.SemanticConventions ${semconvVersion}, and https://qyl.at/schemas/${semconvVersion} is the schema_url that version's packages carry; serve the file before the version is listed (SKILL.md).`,
);
if (fs.existsSync(schemaFile) && fs.statSync(schemaFile).isFile()) {
  const schema = fs.readFileSync(schemaFile, "utf8");
  check(
    schema.includes(`schema_url: https://qyl.at/schemas/${semconvVersion}`),
    `${schemaRelative}: schema_url does not point at https://qyl.at/schemas/${semconvVersion}`,
  );
  check(
    new RegExp(`^  ${semconvVersion.replace(/\./gu, "\\.")}:$`, "mu").test(schema),
    `${schemaRelative}: the versions list does not contain ${semconvVersion}`,
  );
}

if (failures.length > 0) {
  console.error(`version gate: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `version gate: wave ${releaseWave}, ${release.length} published versions; ${anchors.length} anchored literal(s) match site.ts, no other file in src/, scripts/ or README.md hand-writes one; public/schemas/${semconvVersion} is served`,
);
