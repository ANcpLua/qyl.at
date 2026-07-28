import { gzipSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const dist = path.join(root, "dist");
const routes = [
  "/",
  "/pricing/",
  "/faq/",
  "/auth/",
  "/privacy/",
  "/docs/",
  "/docs/getting-started/",
  "/docs/workbench/",
  "/docs/mcp/",
  "/docs/protocol-2026-07-28/",
  "/docs/telemetry/",
  "/product/tracing/",
  "/product/logs/",
  "/product/metrics/",
  "/product/ci/",
  "/404.html",
];

function fail(message) {
  throw new Error(message);
}

function htmlPath(route) {
  return route === "/404.html" ? path.join(dist, "404.html") : path.join(dist, route.slice(1), "index.html");
}

function gzipBytes(value) {
  return gzipSync(value, { level: 9 }).byteLength;
}

function localAsset(url) {
  if (!url.startsWith("/") || url.startsWith("//")) return undefined;
  const clean = url.split(/[?#]/, 1)[0];
  const candidate = path.join(dist, clean.slice(1));
  return fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : undefined;
}

function referencedAssets(html, expression) {
  return [...html.matchAll(expression)].map((match) => localAsset(match[1])).filter(Boolean);
}

function allFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? allFiles(absolute) : [absolute];
  });
}

if (!fs.existsSync(dist)) fail("dist does not exist; run the build first");
const evidence = [];

for (const route of routes) {
  const file = htmlPath(route);
  if (!fs.existsSync(file)) fail(`${route}: missing ${path.relative(root, file)}`);
  const html = fs.readFileSync(file, "utf8");
  if (!/<h1(?:\s|>)/i.test(html)) fail(`${route}: missing h1`);
  if (!/<nav(?:\s|>)[\s\S]*?<a\s[^>]*href=/i.test(html)) fail(`${route}: navigation lacks real links`);
  if (route.startsWith("/docs/") && !/data-pagefind-body/.test(html)) fail(`${route}: missing docs body index marker`);

  // `<[a-z][^!/?][^>]*>` consumed a second character after the tag's first
  // letter, so `<p>alpha <b>` matched as one element and every inline tag nested
  // in a paragraph went uncounted — the budget was measured against a number
  // below the truth. A tag name is one letter followed by name characters only,
  // and `[^>]` already stops the match at the first `>`.
  const domElements = (html.match(/<[a-z][a-z0-9-]*(?:\s[^>]*?)?\/?>/gi) ?? []).length;
  if (domElements >= 1_500) fail(`${route}: DOM contains ${domElements} elements`);

  const scripts = referencedAssets(html, /<script[^>]+src="([^"]+)"/gi);
  const styles = referencedAssets(html, /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/gi);
  const fonts = referencedAssets(html, /<link[^>]+href="([^"]+)"[^>]+as="font"/gi);
  const inlineScripts = [...html.matchAll(/<script(?![^>]+src=)[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
  const inlineStyles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]);
  const js = scripts.reduce((sum, asset) => sum + gzipBytes(fs.readFileSync(asset)), 0) + inlineScripts.reduce((sum, source) => sum + gzipBytes(source), 0);
  const css = styles.reduce((sum, asset) => sum + gzipBytes(fs.readFileSync(asset)), 0) + inlineStyles.reduce((sum, source) => sum + gzipBytes(source), 0);
  const initialFiles = [...new Set([...scripts, ...styles, ...fonts])];
  const total = gzipBytes(html) + initialFiles.reduce((sum, asset) => sum + gzipBytes(fs.readFileSync(asset)), 0);
  const docs = route.startsWith("/docs/");
  const budget = docs ? { js: 30_000, css: 15_000, total: 350_000 } : { js: 120_000, css: 20_000, total: 600_000 };
  if (js > budget.js) fail(`${route}: initial JS ${js} > ${budget.js}`);
  if (css > budget.css) fail(`${route}: CSS ${css} > ${budget.css}`);
  if (total > budget.total) fail(`${route}: initial total ${total} > ${budget.total}`);

  evidence.push({ route, js, css, total, domElements });
}

const files = allFiles(dist);
const woff2 = files.filter((file) => file.endsWith(".woff2"));
if (woff2.length !== 1 || path.relative(dist, woff2[0]) !== "fonts/geist-sans-variable.woff2") {
  fail(`font gate: expected one Geist WOFF2, found ${woff2.map((file) => path.relative(dist, file)).join(", ")}`);
}
if (!fs.existsSync(path.join(dist, "licenses/GEIST-OFL.txt"))) fail("font gate: missing Geist SIL OFL");

const inspectable = files.filter((file) => /\.(?:html|css|js)$/.test(file));
const combined = inspectable.map((file) => fs.readFileSync(file, "utf8")).join("\n");
if (!/font-family:\s*["']?Geist["']?/.test(combined)) fail("font gate: Geist @font-face missing");
if (!/font-family:\s*["']?Geist override["']?/.test(combined)) fail("font gate: Fontaine Geist override missing");
if (/Aeonik|Geist Mono|SynapticShift/i.test(combined)) fail("font/runtime gate: obsolete or unlicensed surface found");
if (/regeneratorRuntime|_asyncToGenerator/.test(combined)) fail("build target gate: legacy transpilation helper found");

// Any rel that makes the browser open a connection or fetch bytes. `rel` is a
// space-separated token list, so it is parsed rather than pattern-matched.
const subresourceRel = new Set([
  "stylesheet",
  "preload",
  "modulepreload",
  "prefetch",
  "prerender",
  "preconnect",
  "dns-prefetch",
  "icon",
  "apple-touch-icon",
  "mask-icon",
  "manifest",
]);

function linkRelTokens(tag) {
  const rel = /\brel=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag);
  if (!rel) return [];
  return (rel[1] ?? rel[2] ?? rel[3]).toLowerCase().split(/\s+/u).filter(Boolean);
}

// The previous pattern required href before rel, which is the opposite of the
// order Astro and BaseLayout.astro emit, so it matched no <link> at all and the
// same-origin invariant was unenforced. Match the whole tag, then read its
// attributes in whatever order they appear.
function remoteLinkHrefs(source) {
  return [...source.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => linkRelTokens(tag).some((token) => subresourceRel.has(token)))
    .map((tag) => /\bhref=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag))
    .map((href) => href?.[1] ?? href?.[2] ?? href?.[3])
    .filter((href) => href !== undefined && /^https?:\/\//i.test(href));
}

for (const file of inspectable) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(dist, file);
  const remoteSubresources = [
    ...[...source.matchAll(/<(?:script|img|source)[^>]+(?:src|srcset)=["'](https?:\/\/[^"']+)/gi)].map((match) => match[1]),
    ...remoteLinkHrefs(source),
    ...[...source.matchAll(/url\(["']?(https?:\/\/[^)'"\s]+)/gi)].map((match) => match[1]),
  ].filter((url) => new URL(url).origin !== "https://qyl.at");
  if (remoteSubresources.length > 0) fail(`${relative}: cross-origin subresource ${remoteSubresources[0]}`);
}

// The 1.0.0 taxonomy retires Qyl.Sdk, and this site is the one place a wrong
// package name is visible to the outside — a reader who copies it gets NU1101.
if (/\bQyl\.Sdk\b/.test(combined)) fail("taxonomy gate: retired package name Qyl.Sdk is present in the built site");

const headers = fs.readFileSync(path.join(dist, "_headers"), "utf8");

/**
 * Parses `_headers` into ordered rules. Mirrors the asset worker's model: each
 * block has a path pattern, a `set` map, and an `unset` list from `! Header`
 * lines.
 */
function parseHeaderRules(source) {
  const rules = [];
  for (const raw of source.split("\n")) {
    const line = raw.trimEnd();
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    if (!/^\s/u.test(line)) {
      rules.push({ pattern: line.trim(), set: [], unset: [] });
      continue;
    }
    const current = rules.at(-1);
    if (!current) fail(`header gate: header line before any path rule: ${line.trim()}`);
    const body = line.trim();
    if (body.startsWith("!")) {
      current.unset.push(body.slice(1).trim().toLowerCase());
      continue;
    }
    const separator = body.indexOf(":");
    if (separator < 1) fail(`header gate: unparsable header line: ${body}`);
    current.set.push([body.slice(0, separator).trim(), body.slice(separator + 1).trim()]);
  }
  return rules;
}

function matchesPattern(pattern, pathname) {
  const expression = new RegExp(`^${pattern.split("*").map((part) => part.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")).join(".*")}$`, "u");
  return expression.test(pathname);
}

/**
 * Replays the asset worker's merge for one path. `attachCustomHeaders` applies a
 * rule's `unset` first, then its `set` — and a `set` for a header some earlier
 * rule already set is an *append*, not a replace. That is precisely why the
 * long-cache rules must detach Cache-Control before setting it, and why this
 * gate compares the whole merged value instead of searching it for a substring:
 * the broken form contains `public, max-age=31536000, immutable` too.
 */
function mergedHeaders(rules, pathname) {
  const merged = new Map();
  const set = new Set();
  for (const rule of rules) {
    if (!matchesPattern(rule.pattern, pathname)) continue;
    for (const name of rule.unset) merged.delete(name);
    for (const [name, value] of rule.set) {
      const key = name.toLowerCase();
      const existing = merged.get(key);
      merged.set(key, set.has(key) && existing !== undefined ? `${existing}, ${value}` : value);
      set.add(key);
    }
  }
  return merged;
}

const headerRules = parseHeaderRules(headers);
const longCache = "public, max-age=31536000, immutable";
const documentCache = "public, max-age=0, s-maxage=600, stale-while-revalidate=86400";
const astroAsset = allFiles(path.join(dist, "_astro"))[0];
if (!astroAsset) fail("header gate: no /_astro asset to check the merged cache policy against");

for (const [pathname, expected] of [
  ["/fonts/geist-sans-variable.woff2", longCache],
  [`/_astro/${path.basename(astroAsset)}`, longCache],
  ["/pagefind/pagefind.js", longCache],
  ["/", documentCache],
  ["/docs/getting-started/", documentCache],
]) {
  const actual = mergedHeaders(headerRules, pathname).get("cache-control");
  if (actual !== expected) fail(`header gate: ${pathname} serves Cache-Control "${actual}", expected exactly "${expected}"`);
}

const rootHeaders = mergedHeaders(headerRules, "/");
for (const [name, required] of [
  ["content-security-policy", "default-src 'self'"],
  ["content-security-policy", "connect-src 'self'"],
  ["content-security-policy", "'wasm-unsafe-eval'"],
  ["content-security-policy", "frame-ancestors 'none'"],
]) {
  if (!rootHeaders.get(name)?.includes(required)) fail(`header gate: / is missing ${name}: ${required}`);
}
if (rootHeaders.get("speculation-rules") !== '"/speculation-rules.json"') fail("header gate: / is missing the Speculation-Rules header");
if (mergedHeaders(headerRules, "/speculation-rules.json").get("content-type") !== "application/speculationrules+json") {
  fail("header gate: /speculation-rules.json does not serve the speculation rules content type");
}

// dist is uploaded verbatim, dotfiles included, so anything here that is not
// site content is published at qyl.at. `public/.assetsignore` is the deploy-time
// guard; this is the build-time one.
const publishable = allFiles(dist).map((file) => path.relative(dist, file));
const strays = publishable.filter((file) => path.basename(file) === ".DS_Store" || path.basename(file) === "Thumbs.db" || file === "evidence" || file.startsWith(`evidence${path.sep}`));
if (strays.length > 0) fail(`upload gate: dist contains non-content files that would be published: ${strays.join(", ")}`);

// Written outside dist deliberately: this is internal budget evidence, and in
// dist it was uploaded and served at https://qyl.at/evidence/artifacts.json.
const evidenceDirectory = path.join(root, "evidence");
fs.mkdirSync(evidenceDirectory, { recursive: true });
fs.writeFileSync(path.join(evidenceDirectory, "artifacts.json"), `${JSON.stringify(evidence, null, 2)}\n`);
for (const row of evidence) {
  console.log(`${row.route} js=${(row.js / 1024).toFixed(1)}KB css=${(row.css / 1024).toFixed(1)}KB total=${(row.total / 1024).toFixed(1)}KB dom=${row.domElements}`);
}
