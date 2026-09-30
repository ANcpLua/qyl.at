import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("../", import.meta.url));
const cli = fileURLToPath(
  new URL("../node_modules/shadcn/dist/index.js", import.meta.url),
);
const server = spawn(process.execPath, [cli, "mcp", "--cwd", root], {
  cwd: root,
  stdio: ["pipe", "pipe", "pipe"],
});
let buffer = "";
let nextId = 0;
const pending = new Map();
server.stdout.setEncoding("utf8");
server.stdout.on("data", (chunk) => {
  buffer += chunk;
  let end;
  while ((end = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, end);
    buffer = buffer.slice(end + 1);
    if (!line.trim()) continue;
    try {
      const message = JSON.parse(line);
      const request = pending.get(message.id);
      if (request) {
        pending.delete(message.id);
        clearTimeout(request.timer);
        if (message.error) request.reject(new Error(message.error.message));
        else request.resolve(message.result);
      }
    } catch {
      /* Ignore non-protocol startup lines. Never echo environment or credentials. */
    }
  }
});
server.stderr.resume();
server.on("error", (error) => {
  for (const request of pending.values()) request.reject(error);
});
server.on("exit", (code) => {
  for (const request of pending.values())
    request.reject(new Error(`MCP exited before responding (${code})`));
});
function request(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`MCP timed out: ${method}`));
    }, 45_000);
    pending.set(id, { resolve, reject, timer });
    server.stdin.write(
      JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n",
    );
  });
}
try {
  const init = await request("initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "qyl-mcp-check", version: "1.0.0" },
  });
  assert.ok(init.serverInfo?.name, "Server must identify itself");
  server.stdin.write(
    JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) +
      "\n",
  );
  const { tools } = await request("tools/list");
  assert.ok(
    tools.some((tool) => tool.name === "search_items_in_registries"),
    "Registry search tool must exist",
  );
  if (process.argv.includes("--describe")) console.log(JSON.stringify(tools.map(({name,inputSchema}) => ({name,inputSchema})),null,2));
  const registries = await request("tools/call", {
    name: "get_project_registries",
    arguments: {},
  });
  assert.ok(!registries.isError, "Registry configuration must load");
  assert.match(
    JSON.stringify(registries),
    /@reactbits-pro/,
    "Pro registry must be configured",
  );
  const exportIndex = process.argv.indexOf("--export-pro");
  if (exportIndex !== -1) {
    const { mkdirSync, writeFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const directory = process.argv[exportIndex + 1];
    const names = process.argv.slice(exportIndex + 2);
    assert.ok(directory && names.length, "--export-pro requires directory and registry names");
    mkdirSync(directory, { recursive: true });
    for (const name of names) {
      assert.match(name, /^[a-z][a-z0-9-]+$/, "Registry name must be a slug");
      const item = await request("tools/call", { name: "view_items_in_registries", arguments: { items: [`@reactbits-pro/${name}`] } });
      assert.ok(!item.isError, `Cannot load Pro item ${name}`);
      writeFileSync(join(directory, `${name}.md`), item.content.filter(block => block.type === "text").map(block => block.text).join("\n"));
      console.log(`MCP source exported: ${name}`);
    }
  }
  const result = await request("tools/call", {
    name: "search_items_in_registries",
    arguments: {
      registries: ["@reactbits-pro"],
      query: "hero",
      limit: 3,
      offset: 0,
    },
  });
  assert.ok(!result.isError, "Authenticated Pro search must succeed");
  assert.match(
    JSON.stringify(result),
    /hero-/,
    "Pro search must return actual components",
  );
  console.log(
    `MCP verified: ${init.serverInfo.name}; ${tools.length} tools; Pro registry authenticated; hero components returned.`,
  );
} finally {
  for (const request of pending.values()) clearTimeout(request.timer);
  server.stdin.end();
  server.kill();
}
