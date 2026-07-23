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

  const domElements = (html.match(/<[a-z][^!/?][^>]*>/gi) ?? []).length;
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

for (const file of inspectable) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(dist, file);
  const remoteSubresources = [
    ...source.matchAll(/<(?:script|img|source)[^>]+(?:src|srcset)=["'](https?:\/\/[^"']+)/gi),
    ...source.matchAll(/<link[^>]+href=["'](https?:\/\/[^"']+)["'][^>]+rel=["'](?:stylesheet|preload|modulepreload|icon)/gi),
    ...source.matchAll(/url\(["']?(https?:\/\/[^)'"\s]+)/gi),
  ].map((match) => match[1]).filter((url) => new URL(url).origin !== "https://qyl.at");
  if (remoteSubresources.length > 0) fail(`${relative}: cross-origin subresource ${remoteSubresources[0]}`);
}

const headers = fs.readFileSync(path.join(dist, "_headers"), "utf8");
for (const required of [
  "public, max-age=31536000, immutable",
  "stale-while-revalidate=86400",
  "default-src 'self'",
  "connect-src 'self'",
  "'wasm-unsafe-eval'",
  "frame-ancestors 'none'",
  "Speculation-Rules",
]) {
  if (!headers.includes(required)) fail(`header gate: missing ${required}`);
}

fs.mkdirSync(path.join(dist, "evidence"), { recursive: true });
fs.writeFileSync(path.join(dist, "evidence/artifacts.json"), `${JSON.stringify(evidence, null, 2)}\n`);
for (const row of evidence) {
  console.log(`${row.route} js=${(row.js / 1024).toFixed(1)}KB css=${(row.css / 1024).toFixed(1)}KB total=${(row.total / 1024).toFixed(1)}KB dom=${row.domElements}`);
}
