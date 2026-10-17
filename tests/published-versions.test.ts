import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const mock = `#!/usr/bin/env python3
import json, os, pathlib, sys
root = pathlib.Path(os.environ['SNAPSHOT_TEST_ROOT'])
tool, args = pathlib.Path(sys.argv[0]).name, sys.argv[1:]
events_file = root / 'events.jsonl'
events = [json.loads(line) for line in events_file.read_text().splitlines()] if events_file.exists() else []
with events_file.open('a') as stream: stream.write(json.dumps(dict(tool=tool, args=args)) + '\\n')
if tool == 'node':
    url, mode = args[1:]
    if mode == 'status': print('200')
    elif url.endswith('/health'): print(json.dumps(dict(contract_revision='sha256:fixture')))
    else:
        package = url.split('/')[-2]
        if package == 'qyl.orchestration' and os.environ['SNAPSHOT_TEST_MODE'] == 'missing': sys.exit(1)
        version = '13.1.0'
        if package == 'qyl' and any(e['tool'] == 'node' and e['args'][1] == url for e in events): version = '13.2.0'
        if package == 'qyl.telemetry.testing': version = '3.0.3'
        elif package.startswith('qyl.telemetry.semanticconventions'): version = '10.0.1'
        elif package.startswith('qyl.telemetry.'): version = '25.0.2'
        elif package == 'qyl.api.contracts': version = '12.1.2'
        print(json.dumps(dict(versions=[version])))
elif tool == 'npm':
    print({'@ancplua/qyl-api-schema': '12.1.2', '@ancplua/qyl-semantic-conventions': '10.0.1', 'qyl-mcp-server': '8.0.0'}[args[1]])
elif tool == 'git':
    if args[:2] == ['branch', '--show-current']: print('main')
    elif args[0] == 'status': print(' M published-versions.yaml')
    elif args[0] in ('rev-list', 'rev-parse'): print('fixture-commit')
`;

function fixture(mode: "complete" | "missing") {
  const root = mkdtempSync(join(tmpdir(), "qyl published snapshot "));
  const commands = join(root, "commands");
  mkdirSync(commands);
  mkdirSync(join(root, "scripts"));
  mkdirSync(join(root, "tmp"));
  copyFileSync(fileURLToPath(new URL("../scripts/refresh-published-versions.sh", import.meta.url)),
    join(root, "scripts/refresh-published-versions.sh"));
  for (const name of ["node", "npm", "git"]) {
    const path = join(commands, name);
    writeFileSync(path, mock);
    chmodSync(path, 0o755);
  }
  return {
    root,
    run: (...args: string[]) => spawnSync("bash", ["scripts/refresh-published-versions.sh", ...args], {
      cwd: root,
      encoding: "utf8",
      timeout: 15_000,
      env: { ...process.env, PATH: `${commands}:${process.env.PATH}`, TMPDIR: join(root, "tmp"),
        SNAPSHOT_TEST_ROOT: root, SNAPSHOT_TEST_MODE: mode },
    }),
    events: () => readFileSync(join(root, "events.jsonl"), "utf8").trim().split("\n")
      .map((line) => JSON.parse(line) as { tool: string; args: string[] }),
    dispose: () => rmSync(root, { recursive: true, force: true }),
  };
}

test("published snapshot reads each registry entry once and includes orchestration and testing", () => {
  const run = fixture("complete");
  try {
    const result = run.run("--expect-nuget", "13.1.0", "qyl", "Qyl.Orchestration");
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const snapshot = readFileSync(join(run.root, "published-versions.yaml"), "utf8");
    assert.match(snapshot, /Qyl\.Orchestration: 13\.1\.0/);
    assert.match(snapshot, /  Qyl\.Telemetry\.Testing:\n    nuget: \{Qyl\.Telemetry\.Testing: 3\.0\.3\}\n    latest: 3\.0\.3/);
    assert.doesNotMatch(snapshot, /13\.2\.0/);
    const registryCalls = run.events().filter((event) => event.tool === "node" && event.args[1]?.includes("flatcontainer"));
    assert.equal(new Set(registryCalls.map((event) => event.args[1])).size, registryCalls.length);
    const npmCalls = run.events().filter((event) => event.tool === "npm");
    assert.equal(new Set(npmCalls.map((event) => event.args[1])).size, npmCalls.length);
    assert.ok(run.events().some((event) => event.tool === "git" && event.args[0] === "push"));
    assert.deepEqual(readdirSync(join(run.root, "tmp")), []);
  } finally {
    run.dispose();
  }
});

test("a missing package preserves the previous snapshot and publishes nothing", () => {
  const run = fixture("missing");
  try {
    writeFileSync(join(run.root, "published-versions.yaml"), "previous complete snapshot\n");
    const result = run.run();
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.equal(readFileSync(join(run.root, "published-versions.yaml"), "utf8"), "previous complete snapshot\n");
    assert.ok(!run.events().some((event) => event.tool === "git" && ["commit", "push"].includes(event.args[0]!)));
    const failure = run.events().findIndex((event) => event.tool === "node" && event.args[1]?.includes("/qyl.orchestration/"));
    assert.ok(failure >= 0);
    assert.ok(!run.events().slice(failure + 1).some((event) => ["node", "npm"].includes(event.tool)));
    assert.deepEqual(readdirSync(join(run.root, "tmp")), []);
  } finally {
    run.dispose();
  }
});

test("a stale release version cannot replace the snapshot or report success", () => {
  const run = fixture("complete");
  try {
    writeFileSync(join(run.root, "published-versions.yaml"), "previous complete snapshot\n");
    const result = run.run("--expect-nuget", "14.0.0", "qyl", "Qyl.Orchestration");
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /Expected qyl 14\.0\.0, registry returned 13\.1\.0/);
    assert.equal(readFileSync(join(run.root, "published-versions.yaml"), "utf8"), "previous complete snapshot\n");
    assert.ok(!run.events().some((event) => event.tool === "git" && ["commit", "push"].includes(event.args[0]!)));
  } finally {
    run.dispose();
  }
});
