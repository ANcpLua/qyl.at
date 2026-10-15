# qyl.at: deploy, served schemas and listed versions

One agent per qyl-dev repo (qyl, qyl.mcp, qyl-api-schema, Qyl.Telemetry.AutoInstrumentation, Qyl.Telemetry.SemanticConventions, qyl.at), each on its own `main`; agent, user and owner are one word. No PR and no deploy workflow; CI only reports.

## This repository

- Publishes nothing to a registry. A release is `./release.sh`: a deploy of `main` to the `qyl-at` Worker (its header lists what it runs). The Playwright suite (`mise run test-gates`) runs on demand and in CI after every push, not before every deploy.
- Carries for the other repos: `public/schemas/<version>`, served before a SemanticConventions release, and `src/data/site.ts`, the only place a product version is written; `scripts/check-versions.mjs` holds every literal to it and requires `public/schemas/<version>` for the SemanticConventions version it names; and `published-versions.yaml`, the release record every agent reads first, which `scripts/refresh-published-versions.sh` rewrites from the registries, commits alone and pushes (every producer's release.sh runs it after release verification).
- Credentials: a `bunx wrangler login` session, or the Cloudflare API token in Vitals at `~/.config/vitals/cloudflare-qyl-at-token`, exported by the script as `CLOUDFLARE_API_TOKEN`. Never print, paste, commit or log it. Neither present: stop and tell the owner.
- Upstream pins: every version in `src/data/site.ts` (`qyl`, `Qyl.Api.Sdk`, `Qyl.Telemetry.AutoInstrumentation`, `Qyl.Telemetry.SemanticConventions`, `@ancplua/qyl-api-schema`, `@ancplua/qyl-semantic-conventions`, `Qyl.Api.Contracts`, `qyl-mcp-server`). Consumers: none.

## Stale-version guard, before any work

1. Pull before starting when the tree is clean and no other writer owns it; install missing tool versions and restore when lockfile/package inputs change.
2. Compare every `site.ts` version with the index once per release wave and reuse that result until pins change: `npm view <package> version`; NuGet `curl -fsSL https://api.nuget.org/v3-flatcontainer/<id, lowercase>/index.json` (last entry). If the index is ahead, re-pin first.

## Deploy

1. `./release.sh` (`--dry-run` first only when unsure; fix whatever it refuses).
2. The changed page shows the change (the script already checks that https://qyl.at/ answers 200).
3. Run `scripts/refresh-published-versions.sh` so the snapshot records the served schema and the site state.

## When a release lands

Re-pin indexed versions when this clone's next change lands:

- SemanticConventions schema: its `release.sh` creates `public/schemas/<version>` in this clone, commits `chore: serve schema <version>`, pushes `main` and runs `./release.sh` here; pull before you touch `main`.
- `RELEASE <package> <version>`, listed only once the index confirms it: set it in `src/data/site.ts` and any literal `scripts/check-versions.mjs` names; `bun install` only if a `package.json` pin changed (not frozen, it rewrites `bun.lock`); `bun run check`; commit `chore: list <package> <version>`; push `main`; `./release.sh`.
