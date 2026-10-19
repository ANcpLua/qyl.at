#!/usr/bin/env bash
# Deploy qyl.at (the qyl-at Cloudflare Worker) from this machine. No workflow deploys.
#
#   ./release.sh            build, artifact gate, unit tests, deploy main to qyl.at
#   ./release.sh --dry-run  build, artifact gate and `wrangler deploy --dry-run`; nothing is deployed
# The Playwright suite (`mise run test-gates`) is on demand, not a deploy precondition.
#
# qyl.at has no package version of its own: a release is a deploy of main. The build serves
# https://qyl.at/schemas/<version> for the @ancplua/qyl-semantic-conventions it installs
# (scripts/schema.mjs). A schema the build had to write is committed and pushed before the
# deploy, so a schema URL that was served once stays in the repository.
set -euo pipefail
cd "$(dirname "$0")"

CF_TOKEN_FILE=$HOME/.config/vitals/cloudflare-qyl-at-token  # optional; otherwise `bunx wrangler login` once on this Mac

dry=0; [[ ${1:-} == --dry-run ]] && dry=1
say() { printf '\n== %s\n' "$*"; }
die() { echo "release: $*" >&2; exit 1; }

say "checks"
[[ $(git branch --show-current) == main ]] || die "not on main"
[[ -z $(git status --porcelain --untracked-files=no) ]] || die "working tree not clean"
git fetch -q origin main
[[ $(git rev-parse HEAD) == $(git rev-parse origin/main) ]] || die "main differs from origin/main"
if [[ -r $CF_TOKEN_FILE ]]; then
  export CLOUDFLARE_API_TOKEN; CLOUDFLARE_API_TOKEN=$(<"$CF_TOKEN_FILE")
  echo "Cloudflare: API token from Vitals"
elif bunx wrangler whoami 2>&1 | grep -q 'logged in'; then
  echo "Cloudflare: wrangler login session"
else
  (( dry )) || die "no Cloudflare credentials: run 'bunx wrangler login' once, or register a token at $CF_TOKEN_FILE (vitals keys)"
  echo "warning: no Cloudflare credentials; the real run refuses until 'bunx wrangler login' or a Vitals token exists"
fi
bun install --frozen-lockfile

say "build and artifact gate"
bun run build
node scripts/check-artifacts.mjs
schema=$(git status --porcelain --untracked-files=all -- public/schemas)
if (( dry )); then
  [[ -z $schema ]] || echo "the real run commits and pushes the new schema: $schema"
  bunx wrangler deploy --dry-run
  say "dry run finished: nothing deployed"
  exit 0
fi

say "unit tests and deploy"
bun run test:unit
if [[ -n $schema ]]; then
  version=$(node -p "require('./node_modules/@ancplua/qyl-semantic-conventions/package.json').version")
  git add -- public/schemas
  git commit -q -m "chore: serve schema $version" -- public/schemas
  git push -q origin HEAD:main || die "push of the schema commit failed; nothing deployed"
  echo "committed and pushed public/schemas/$version"
fi
bunx wrangler deploy --var QYL_SERVICE_VERSION:"$(git rev-parse --short HEAD)"

say "verify"
code=$(curl -s -o /dev/null -w '%{http_code}' https://qyl.at/)
[[ $code == 200 ]] || die "https://qyl.at/ returned $code"
echo "https://qyl.at/ 200, deployed $(git rev-parse --short HEAD)"
