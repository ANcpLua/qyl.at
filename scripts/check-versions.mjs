// Version-drift gate.
//
// `src/data/site.ts` is the only place a product version is written, and pages
// state versions by calling `versionOf`. Three places cannot: an MDX
// frontmatter `description` is YAML, and a fenced code example showing
// `<Project Sdk="Qyl.Api.Sdk/4.0.0">` has to show the literal a reader will
// copy. Those three stay literals, and this gate holds them to `site.ts` so a
// wave that bumps the array turns red instead of leaving a stale number in a
// copy-paste example.
//
// It is a *source* gate, not a `dist` gate, on purpose: in the built HTML an
// interpolated version and a hand-typed one are the same bytes, so the built
// site cannot tell drift from correctness. The source can.
//
// Three independent checks, any of which can go red on its own:
//   1. site.ts is internally consistent -- `headline` agrees with `release`,
//      and the two lockstep claims the file documents actually hold.
//   2. Every literal that must exist, exists verbatim, built from `release`.
//   3. Nothing else in src/ hand-writes a product version: an inventory of the
//      exact locations allowed to hold one, and a sweep for any
//      `<package><sep><version>` pair that disagrees with `release`.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const source = path.join(root, "src");
const siteFile = path.join(source, "data", "site.ts");

const { headline, release, releaseWave, versionOf } = await import(
  new URL("../src/data/site.ts", import.meta.url).href
);

const failures = [];
function check(condition, message) {
  if (!condition) failures.push(message);
}

// A semver that is not part of a longer dotted run, so `127.0.0.1` is an
// address rather than three quarters of a version.
const SEMVER = /(?<![\w.])\d+\.\d+\.\d+(?![\w.])/gu;

const versions = new Set(release.map((entry) => entry.version));

// ---------------------------------------------------------------- 1. site.ts

check(/^\d{4}-\d{2}-\d{2}$/u.test(releaseWave), `releaseWave is not a date: ${releaseWave}`);

for (const entry of headline) {
  const separator = entry.lastIndexOf(" ");
  const name = entry.slice(0, separator);
  const stated = entry.slice(separator + 1);
  const actual = release.find((candidate) => candidate.name === name)?.version;
  check(actual !== undefined, `headline names "${name}", which is not in release`);
  check(
    actual === undefined || actual === stated,
    `headline says ${name} ${stated}, release says ${name} ${actual}`,
  );
}

// The `headline` comment states six entries rather than ten because of these
// two facts. They are deliberate, so they are asserted rather than assumed: if
// a wave ever breaks one, the six-entry footer is silently wrong and the FAQ
// sentence that names two packages against one version is silently wrong too.
check(
  versionOf("Qyl.Telemetry.Hosting") === versionOf("Qyl.Telemetry.AutoInstrumentation"),
  `Hosting ${versionOf("Qyl.Telemetry.Hosting")} no longer ships in lockstep with AutoInstrumentation ${versionOf("Qyl.Telemetry.AutoInstrumentation")}; the footer headline and the FAQ answer both state one version for the pair`,
);
const semconv = release.filter((entry) => entry.name.startsWith("Qyl.Telemetry.SemanticConventions"));
check(semconv.length === 3, `expected three SemanticConventions ids, found ${semconv.length}`);
check(
  new Set(semconv.map((entry) => entry.version)).size === 1,
  `the three SemanticConventions ids no longer share a version: ${semconv.map((entry) => `${entry.name} ${entry.version}`).join(", ")}`,
);

// ------------------------------------------------- 2. literals that must hold

const apiSdk = versionOf("Qyl.Api.Sdk");

// Each entry: a file, the exact text that must appear in it, and why it cannot
// simply be an expression.
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
];

for (const anchor of anchors) {
  const absolute = path.join(root, anchor.file);
  check(fs.existsSync(absolute), `${anchor.file}: missing, but the version gate anchors on it`);
  if (!fs.existsSync(absolute)) continue;
  check(
    fs.readFileSync(absolute, "utf8").includes(anchor.text),
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

// The only lines in src/ allowed to hand-write a published version, and how
// many each may hold. Everything else states versions through `versionOf`.
const allowance = new Map([
  ["src/content/docs/api-sdk.mdx", 2],
  ["src/content/docs/getting-started.mdx", 1],
]);

// Longest name first so `qyl` cannot claim a match inside a longer id; the
// separator set excludes `-` and `.` for the same reason, so `qyl-mcp-server`
// and `qyl.mcp` are never read as `qyl`.
const names = release.map((entry) => entry.name).sort((a, b) => b.length - a.length);
const pairing = new RegExp(
  `(?<![\\w./@-])(${names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")).join("|")})[ /@]v?(\\d+\\.\\d+\\.\\d+)(?![\\w.])`,
  "gu",
);

for (const file of sourceFiles(source)) {
  if (file === siteFile) continue;
  const relative = path.relative(root, file).split(path.sep).join("/");
  const text = fs.readFileSync(file, "utf8");

  const literals = [...text.matchAll(SEMVER)].filter((match) => versions.has(match[0]));
  const allowed = allowance.get(relative) ?? 0;
  check(
    literals.length <= allowed,
    `${relative}: holds ${literals.length} hand-written published version(s) (${literals.map((match) => match[0]).join(", ")}), only ${allowed} allowed. State the version with versionOf() from src/data/site.ts; if it genuinely cannot interpolate, add it to the anchors and the allowance in scripts/check-versions.mjs.`,
  );
  check(
    literals.length >= allowed,
    `${relative}: holds ${literals.length} hand-written published version(s), expected ${allowed}. An anchored literal was removed or the version behind it is stale -- the allowance in scripts/check-versions.mjs is now wrong.`,
  );

  for (const match of text.matchAll(pairing)) {
    const expected = versionOf(match[1]);
    check(
      match[2] === expected,
      `${relative}: states "${match[1]} ${match[2]}", site.ts says ${expected}`,
    );
  }
}

if (failures.length > 0) {
  console.error(`version gate: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `version gate: wave ${releaseWave}, ${release.length} published versions; ${anchors.length} un-interpolatable literal(s) match site.ts, no other source file hand-writes one`,
);
