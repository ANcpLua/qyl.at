# qyl.at: deploy, served schemas and listed versions

Who reads this: the one agent working on this repository's `main`. Agent, user and owner are
the same word. There is one agent per repository, six in all (qyl, qyl.mcp, qyl-api-schema,
Qyl.Telemetry.AutoInstrumentation, Qyl.Telemetry.SemanticConventions, qyl.at), each on its own
`main`. Commit and push to `main` directly: no pull requests, no CI, no branch rules. bun is the
package manager (`bun.lock`); the gates are `bun run check`, `bun run lint` and
`bun run test:gates`.

## This repository

- Publishes nothing to a registry. A "release" is a deploy of `main` to the `qyl-at` Cloudflare
  Worker at qyl.at. Nothing deploys on push: run the command.
- What it carries for the other repos: `public/schemas/<version>`, the telemetry schema a
  SemanticConventions release must have served before its NuGet push; and `src/data/site.ts`,
  the only place a product version is written (`scripts/check-versions.mjs` holds every literal
  on the site to it, and requires `public/schemas/<version>` for the SemanticConventions
  version it names).
- Deploy command: `./release.sh --dry-run` (build and `wrangler deploy --dry-run`), then
  `./release.sh` (`bun run deploy`: build, gates, deploy, then an HTTP 200 check).
- Credentials: a wrangler login session on this Mac (`bunx wrangler login`, once), or a
  Cloudflare API token registered in Vitals at `~/.config/vitals/cloudflare-qyl-at-token`,
  which the command exports as `CLOUDFLARE_API_TOKEN`. Never print, paste, commit or log a
  token. If neither exists, stop and tell the owner.
- Upstream pins this repo must keep fresh: every version in `src/data/site.ts` (`qyl`,
  `Qyl.Api.Sdk`, `Qyl.Telemetry.AutoInstrumentation`, `Qyl.Telemetry.SemanticConventions`,
  `@ancplua/qyl-api-schema`, `Qyl.Api.Contracts`, `qyl-mcp-server`), and
  `public/schemas/<version>` for the SemanticConventions version listed.
- Consumers to notify: none.

## Before any work: the stale-version guard

1. `git pull --ff-only origin main`.
2. `mise install`, then `bun install --frozen-lockfile`.
3. Read `/Users/alexandernachtmann/Downloads/qyl-codex-claude/qyl-published-versions.yaml`, then compare every version in `src/data/site.ts` with the index: npm `npm view <package> version`;
   NuGet `curl -fsSL https://api.nuget.org/v3-flatcontainer/<id, lowercase>/index.json` (last
   entry). List a version only when the index confirms it; if the index is ahead, re-pin first
   (section "When a release lands"), then start the actual work.

## Deploying

1. `./release.sh --dry-run`; fix whatever it refuses.
2. `./release.sh`.
3. Verify by reading: `curl -sI https://qyl.at/ | head -1` is 200, and the page that changed
   shows the change.

## When a message lands and you are the consumer

Act at once, before continuing your own work, so both agents keep moving:

- `SCHEMA <version>` from SemanticConventions: create `public/schemas/<version>` from the
  previous version's file, with `schema_url: https://qyl.at/schemas/<version>` and the new
  version entry; set the SemanticConventions version in `src/data/site.ts` only after that
  release is indexed (so the schema can be served while `site.ts` still lists the previous
  version); run `bun run check`; commit `chore: serve schema <version>`; push `main`;
  `./release.sh`; reply to SemanticConventions' agent when `https://qyl.at/schemas/<version>`
  returns 200.
- `RELEASE <package> <version>` from any producer: set the version in `src/data/site.ts` and
  any literal `scripts/check-versions.mjs` names; `bun install` only if a `package.json` pin
  changed (not frozen: it rewrites `bun.lock`); `bun run check`; commit
  `chore: list <package> <version>`; push `main`; `./release.sh`.

## Notify

Only replies: tell the SemanticConventions agent when a schema is served, through the
session's agent-messaging tool when there is one (Claude Code: `ListAgents`, then
`SendMessage`), otherwise by a line in
`/Users/alexandernachtmann/Downloads/qyl-codex-claude/qyl-handoff-for-codex.md` that the owner
relays.

## Order rules that never change

- Serve the schema before SemanticConventions pushes; list the version after the index
  confirms it.
- Pushing `main` here deploys nothing; `./release.sh` does.
