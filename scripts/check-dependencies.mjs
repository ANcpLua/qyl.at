import fs from "node:fs";

// bun.lock is JSONC -- it carries trailing commas, which JSON.parse rejects and
// which Bun.file().json() rejects too (measured on bun 1.4.2). Strip them here
// rather than take a JSONC dependency for a single gate: the lockfile holds only
// package names, semver ranges and base64 hashes, none of which can contain a
// comma sitting before a closing brace.
const raw = fs.readFileSync(new URL("../bun.lock", import.meta.url), "utf8");
const lock = JSON.parse(raw.replace(/,(\s*[}\]])/g, "$1"));

// bun.lock keys a package by bare name and nests a duplicate as "parent/name";
// npm's lock keyed the same nodes as "node_modules/name". Match both shapes so
// a banned package cannot hide one level down.
const packages = Object.keys(lock.packages ?? {});
const banned = ["gsap", "lenis", "matter-js", "smooothy", "d3", "three"];
const violations = banned.flatMap((name) => packages.filter((entry) => entry === name || entry.endsWith(`/${name}`)));

if (violations.length > 0) {
  throw new Error(`Banned runtime dependencies found:\n${violations.join("\n")}`);
}

const manifest = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const direct = { ...manifest.dependencies, ...manifest.devDependencies };
for (const name of ["motion", "framer-motion", "@react-three/fiber", "@react-three/drei"]) {
  if (name in direct) throw new Error(`Unapproved animation dependency: ${name}`);
}

console.log(`dependency guard: ${packages.length} package nodes checked; no banned animation or WebGL runtime`);
