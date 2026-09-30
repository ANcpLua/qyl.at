import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? files(filename) : [filename];
  });
}
// Finder can leave metadata in an otherwise clean build directory. It is not
// website content; remove it before the strict upload gate inspects the output.
for (const file of files(dist)) {
  if ([".DS_Store", "Thumbs.db"].includes(path.basename(file))) fs.unlinkSync(file);
}
const scripts = new Set();
for (const file of files(dist).filter(file => file.endsWith(".html"))) {
  const source = fs.readFileSync(file, "utf8");
  const output = source.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attributes, body) => {
    if (/\bsrc\s*=/i.test(attributes) || !body.trim()) return tag;
    const type = /\btype=["']([^"']+)["']/i.exec(attributes)?.[1];
    if (type && !["module", "text/javascript", "application/javascript"].includes(type)) return tag;
    // Astro's island bootstrap must run under our script-src 'self' policy.
    // Deferred classic scripts retain their source order and see the parsed DOM.
    const name = `island-${createHash("sha256").update(body).digest("hex").slice(0, 16)}.js`;
    fs.writeFileSync(path.join(dist, "_astro", name), body);
    scripts.add(name);
    const defer = type !== "module" && !/\bdefer\b/i.test(attributes) ? " defer" : "";
    return `<script${attributes} src="/_astro/${name}"${defer}></script>`;
  });
  if (source !== output) fs.writeFileSync(file, output);
}
console.log(`island bootstrap: ${scripts.size} content-hashed local scripts; no inline execution required`);
