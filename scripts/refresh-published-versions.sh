#!/usr/bin/env bash
# Rewrites published-versions.yaml at the qyl.at repo root from the registries (npm, nuget.org),
# api.qyl.at/health and qyl.at, commits it alone and pushes main when it changed. Every producer's
# release.sh runs it after its release verification and smoke pass
# (qyl.at's SKILL.md runs it after a deploy); the registries are the truth.
set -euo pipefail
cd "$(dirname "$0")/.."
expected_nuget_version=
expected_nuget_ids=()
if (($#)); then
  [[ $1 == --expect-nuget && $# -ge 3 ]] || {
    echo "usage: $0 [--expect-nuget <version> <package-id> ...]" >&2; exit 2;
  }
  expected_nuget_version=$2
  shift 2
  expected_nuget_ids=("$@")
fi
# Use Node's HTTPS implementation: npm already requires Node, and this avoids
# the system curl TLS/HTTP2 failures observed during release recovery.
fetch_public() {
  [[ ! -f $query_cache/failed ]] || return 1
  if node - "$1" "$2" <<'NODE'
const https = require('node:https');
const [url, mode] = process.argv.slice(2);
function get(address, redirects = 0) {
  return new Promise((resolve, reject) => {
    const requestUrl = new URL(address);
    if (requestUrl.hostname === 'api.nuget.org') requestUrl.searchParams.set('qyl-refresh', `${Date.now()}-${process.pid}`);
    const request = https.get(requestUrl, { agent: false, headers: { 'Cache-Control': 'no-cache' } }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirects < 5) {
        response.resume();
        resolve(get(new URL(response.headers.location, address), redirects + 1));
        return;
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('error', reject);
      response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    request.setTimeout(30000, () => request.destroy(new Error('HTTPS timeout')));
    request.on('error', reject);
  });
}
(async () => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await get(url);
      if (mode === 'status') { console.log(response.status); return; }
      if (response.status !== 200) throw new Error('HTTP ' + response.status);
      process.stdout.write(response.body);
      return;
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise(resolve => setTimeout(resolve, 15000 * 2 ** attempt));
    }
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
NODE
  then
    return 0
  else
    : >"$query_cache/failed"
    return 1
  fi
}
# Read each registry entry once per refresh, including a failed query. Repeated fields then
# describe the same registry response instead of racing another publisher between requests.
nu() {
  local id cache_file
  id=$(tr '[:upper:]' '[:lower:]' <<<"$1")
  cache_file="$query_cache/nuget-$id"
  if [[ ! -f $cache_file ]]; then
    fetch_public "https://api.nuget.org/v3-flatcontainer/$id/index.json" body 2>/dev/null |
      python3 -I -c 'import json,sys; print(json.load(sys.stdin)["versions"][-1])' >"$cache_file" 2>/dev/null ||
      echo "QUERY_FAILED" >"$cache_file"
  fi
  cat "$cache_file"
}
np() {
  local cache_file="$query_cache/npm-${1//\//_}"
  [[ ! -f $query_cache/failed ]] || { echo "QUERY_FAILED"; return; }
  if [[ ! -f $cache_file ]]; then
    npm view "$1" version --fetch-timeout=30000 --fetch-retries=2 >"$cache_file" 2>/dev/null || {
      echo "QUERY_FAILED" >"$cache_file"
      : >"$query_cache/failed"
    }
  fi
  cat "$cache_file"
}
code() { fetch_public "$1" status || echo 000; }
query_cache=$(mktemp -d "${TMPDIR:-/tmp}/qyl-published-queries.XXXXXX")
version_snapshot=$(mktemp "./.published-versions.XXXXXX")
trap 'rm -rf "$query_cache"; rm -f "$version_snapshot"' EXIT
rev=$(fetch_public https://api.qyl.at/health body | python3 -I -c 'import json,sys; print(json.load(sys.stdin).get("contract_revision"))' 2>/dev/null || echo QUERY_FAILED)
sc=$(nu Qyl.Telemetry.SemanticConventions)
{
echo "# Published and indexed versions of the qyl-dev repos, read from the registries."
echo "# The registries are the truth; each producer's release.sh runs"
echo "# qyl.at/scripts/refresh-published-versions.sh once its release is indexed and verified,"
echo "# which rewrites, commits and pushes this file; git log dates each refresh."
echo "repos:"
echo "  qyl:"
echo "    nuget: {qyl: $(nu qyl), qyl.osx-arm64: $(nu qyl.osx-arm64), qyl.osx-x64: $(nu qyl.osx-x64), qyl.linux-arm64: $(nu qyl.linux-arm64), qyl.linux-x64: $(nu qyl.linux-x64), qyl.win-x64: $(nu qyl.win-x64), qyl.win-arm64: $(nu qyl.win-arm64), Qyl.Api.Sdk: $(nu Qyl.Api.Sdk), Qyl.Orchestration: $(nu Qyl.Orchestration)}"
echo "    latest: $(nu qyl)"
echo "    deploys: https://api.qyl.at (qyl-collector, Railway) on push to main; serving contract revision $rev"
echo "  qyl-api-schema:"
echo "    nuget: {Qyl.Api.Contracts: $(nu Qyl.Api.Contracts)}"
echo "    npm: {\"@ancplua/qyl-api-schema\": $(np @ancplua/qyl-api-schema)}"
echo "    latest: $(np @ancplua/qyl-api-schema)"
echo "    contract_revision_served: $rev"
echo "  qyl.mcp:"
echo "    npm: {qyl-mcp-server: $(np qyl-mcp-server)}"
echo "    latest: $(np qyl-mcp-server)"
echo "    deploys: https://mcp.qyl.at (qyl-mcp, Railway) on push to main; healthz $(code https://mcp.qyl.at/healthz)"
echo "  Qyl.Telemetry.AutoInstrumentation:   # renamed from Qyl.OpenTelemetry.AutoInstrumentation on 2026-10-11; the old URL redirects"
echo "    nuget: {Qyl.Telemetry.AutoInstrumentation: $(nu Qyl.Telemetry.AutoInstrumentation), Qyl.Telemetry.AutoInstrumentation.Hosting: $(nu Qyl.Telemetry.AutoInstrumentation.Hosting), Qyl.Telemetry.AutoInstrumentation.SqlClient: $(nu Qyl.Telemetry.AutoInstrumentation.SqlClient), Qyl.Telemetry.AutoInstrumentation.DiagnosticListeners: $(nu Qyl.Telemetry.AutoInstrumentation.DiagnosticListeners), Qyl.Telemetry.AutoInstrumentation.EntityFrameworkCore: $(nu Qyl.Telemetry.AutoInstrumentation.EntityFrameworkCore), Qyl.Telemetry.Hosting: $(nu Qyl.Telemetry.Hosting)}"
echo "    latest: $(nu Qyl.Telemetry.AutoInstrumentation)"
echo "  Qyl.Telemetry.SemanticConventions:   # renamed from Qyl.OpenTelemetry.SemanticConventions on 2026-10-11; the old URL redirects"
echo "    nuget: {Qyl.Telemetry.SemanticConventions: $sc, Qyl.Telemetry.SemanticConventions.Incubating: $(nu Qyl.Telemetry.SemanticConventions.Incubating), Qyl.Telemetry.SemanticConventions.Analyzers: $(nu Qyl.Telemetry.SemanticConventions.Analyzers)}"
echo "    npm: {\"@ancplua/qyl-semantic-conventions\": $(np @ancplua/qyl-semantic-conventions)}"
echo "    latest: $sc"
echo "    schema_served: https://qyl.at/schemas/$sc ($(code "https://qyl.at/schemas/$sc"))"
echo "  qyl.at:"
echo "    publishes: nothing; ./release.sh deploys https://qyl.at from main (nothing deploys on push); https://qyl.at/ $(code https://qyl.at/)"
} > "$version_snapshot"
if grep -Eq 'QUERY_FAILED|not published|\(000\)' "$version_snapshot"; then
  echo "Registry refresh failed; previous complete snapshot was preserved." >&2
  exit 1
fi
for package in ${expected_nuget_ids[@]+"${expected_nuget_ids[@]}"}; do
  actual=$(nu "$package")
  if [[ $actual != "$expected_nuget_version" ]]; then
    echo "Expected $package $expected_nuget_version, registry returned $actual; previous snapshot preserved." >&2
    exit 1
  fi
done
mv -f "$version_snapshot" published-versions.yaml
cat published-versions.yaml

# Record it: commit only this file and push main, unless that would carry another lane's work.
note() { echo "refresh-published-versions: $*" >&2; }
[[ $(git branch --show-current) == main ]] || { note "qyl.at is not on main; published-versions.yaml is rewritten but not committed"; exit 1; }
if [[ -n $(git status --porcelain -- published-versions.yaml) ]]; then
  git add -- published-versions.yaml
  git commit -q -m "chore: refresh published versions" -- published-versions.yaml
fi
git fetch -q origin main
ahead=$(git rev-list origin/main..HEAD)
[[ -n $ahead ]] || { echo "published-versions.yaml unchanged"; exit 0; }
if [[ $ahead != "$(git rev-parse HEAD)" ]]; then
  note "qyl.at main holds other unpushed commits; the refresh commit travels with their push"; exit 0
fi
if ! git merge-base --is-ancestor origin/main HEAD; then
  if [[ -n $(git status --porcelain --untracked-files=no) ]]; then
    note "origin/main moved and qyl.at has other changes in its tree; the refresh commit stays local until the next pull --rebase and push"; exit 0
  fi
  git pull -q --rebase origin main || { git rebase --abort 2>/dev/null || true; note "rebase onto origin/main failed; the refresh commit stays local"; exit 1; }
fi
git push -q origin HEAD:main
echo "published-versions.yaml committed and pushed ($(git rev-parse --short HEAD))"
