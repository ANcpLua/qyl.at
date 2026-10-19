// Version gate: src/data/site.ts is the only place a published version is written.
//
// Pages state a version by calling `versionOf`, so a version change is one edit
// in site.ts. This gate fails when any other file in src/, scripts/ or the root
// documents writes a version: a literal equal to one site.ts lists, or a
// `<package> <version>` pair that names a package with a version site.ts does
// not list (a stale one). It checks the source, not dist: in built HTML an
// interpolated version and a hand-typed one are the same bytes.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const siteFile = path.join(root, "src", "data", "site.ts");
const { packages, versionOf } = await import(new URL("../src/data/site.ts", import.meta.url).href);

// A semver that is not part of a longer dotted run, so `127.0.0.1` is an address.
const SEMVER = /(?<![\w.])\d+\.\d+\.\d+(?![\w.])/gu;
const versions = new Set(packages.map((entry) => entry.version));

// Longest name first so `qyl` cannot claim a match inside a longer id; the
// separators exclude `-` and `.` for the same reason.
const names = packages.map((entry) => entry.name).sort((a, b) => b.length - a.length);
const pairing = new RegExp(
  `(?<![\\w./@-])(${names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")).join("|")})[ /@]v?(\\d+\\.\\d+\\.\\d+)(?![\\w.])`,
  "gu",
);

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolute);
    return /\.(?:astro|mdx|md|ts|tsx|js|mjs)$/u.test(entry.name) ? [absolute] : [];
  });
}

const swept = [
  ...sourceFiles(path.join(root, "src")),
  ...sourceFiles(path.join(root, "scripts")),
  ...["README.md", "SKILL.md", "AGENTS.md"].map((file) => path.join(root, file)).filter((file) => fs.existsSync(file)),
];

const failures = [];
for (const file of swept) {
  if (file === siteFile) continue;
  const relative = path.relative(root, file).split(path.sep).join("/");
  const text = fs.readFileSync(file, "utf8");
  const line = (index) => text.slice(0, index).split("\n").length;
  for (const match of text.matchAll(SEMVER)) {
    if (versions.has(match[0])) {
      failures.push(`${relative}:${line(match.index)}: writes the published version ${match[0]}; state it with versionOf() from src/data/site.ts`);
    }
  }
  for (const match of text.matchAll(pairing)) {
    if (match[2] !== versionOf(match[1])) {
      failures.push(`${relative}:${line(match.index)}: states "${match[1]} ${match[2]}", site.ts says ${versionOf(match[1])}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`version gate: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`version gate: ${packages.length} published versions, written only in src/data/site.ts`);
