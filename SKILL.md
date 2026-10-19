# qyl.at: deploy, served schemas, versions and tools

## This repository

- Publishes nothing to a registry. A release is `./release.sh`: a deploy of `main` to the `qyl-at` Worker; nothing deploys on push. CI runs `mise run check` and `mise run test-gates` (Playwright) on every push.
- `src/data/site.ts` is the only place a version is written. Pages call `versionOf`, and `scripts/check-versions.mjs` (in `bun run check`) fails on a version written anywhere else. Change a version there once its registry serves it.
- `src/data/mcp-tools.ts` is generated from qyl's MCP tool snapshot by `bun run sync:tools [path/to/tool-manifest.snapshot.json]` (default `../qyl/services/qyl.mcp/tool-manifest.snapshot.json`). Every tool and skill the site names comes from it.
- `https://qyl.at/schemas/<version>` follows the `@ancplua/qyl-semantic-conventions` dependency (`scripts/schema.mjs`). The build writes `public/schemas/<version>` from the newest committed schema when it is missing and fails unless `dist` serves it and every committed schema unchanged; `release.sh` commits a newly written one before it deploys. Bumping the dependency is all a new semantic-conventions version needs here.
- Credentials: a `bunx wrangler login` session, or the Cloudflare API token in Vitals at `~/.config/vitals/cloudflare-qyl-at-token`, exported by the script as `CLOUDFLARE_API_TOKEN`. Never print, paste, commit or log it. Neither present: stop and tell the owner.

## Deploy

1. `./release.sh` (`--dry-run` builds and runs `wrangler deploy --dry-run`; nothing is deployed).
2. The script checks that https://qyl.at/ answers 200; open the changed page.
