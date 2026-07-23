import fs from "node:fs";

const lock = JSON.parse(fs.readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
const packages = Object.keys(lock.packages ?? {});
const banned = ["gsap", "lenis", "matter-js", "smooothy", "d3", "three"];
const violations = banned.flatMap((name) => packages.filter((entry) => entry === `node_modules/${name}` || entry.includes(`/node_modules/${name}`)));

if (violations.length > 0) {
  throw new Error(`Banned runtime dependencies found:\n${violations.join("\n")}`);
}

const manifest = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const direct = { ...manifest.dependencies, ...manifest.devDependencies };
for (const name of ["motion", "framer-motion", "@react-three/fiber", "@react-three/drei"]) {
  if (name in direct) throw new Error(`Unapproved animation dependency: ${name}`);
}

console.log(`dependency guard: ${packages.length} package nodes checked; no banned animation or WebGL runtime`);
