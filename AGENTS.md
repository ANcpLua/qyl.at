# qyl.at

Deploy and re-pin: follow [`SKILL.md`](SKILL.md) at this repo root (canonical clone `/Users/alexandernachtmann/RiderProjects/qyl.at/SKILL.md`); the one command is `./release.sh`. Published versions come from the registries (npm, NuGet) and `src/data/site.ts` lists them.

## Publishing across the qyl-dev repos

Push to `main` directly; no pull request, review, approval or CI exists. The only gate is the repo's local command named in SKILL.md, run before the push.

A release is done from the developer's machine with the registry API keys registered in Vitals (`vitals keys`): bump the version source, pack, push the packages to the registry, then tag `v<version>` on the released commit and create the GitHub release. No workflow publishes.

| Repo | Version source | Publishes |
|---|---|---|
| qyl-api-schema | release tag `vX.Y.Z` (one version for npm and NuGet; `package.json` stays `0.0.0-development` on `main`) | `@ancplua/qyl-api-schema` (npm), `Qyl.Api.Contracts` (NuGet) |
| SemanticConventions | `Directory.Build.props` `VersionPrefix`, `registry/manifest.yaml` `schema_url` and a `CHANGELOG.md` entry; `scripts/generate.sh` must agree; `qyl.at/schemas/<version>` is served first | the three `Qyl.Telemetry.SemanticConventions*` packages (NuGet) and `@ancplua/qyl-semantic-conventions` (npm) |
| AutoInstrumentation | `Directory.Build.props` `Version` | the six `Qyl.Telemetry.*` packages (NuGet) |
| qyl | `Version.props` `QylVersion` | `qyl`, `qyl.<rid>` ×6, `Qyl.Api.Sdk` (NuGet) |
| qyl.mcp | `server/package.json` `version` plus a `server/README.md` release-notes entry | `qyl-mcp-server` (npm) |
| qyl.at | none | nothing to a registry; `./release.sh` deploys `main` to the `qyl-at` Worker |

Downstream pins move in the change that consumes the publish: qyl-api-schema → qyl (`Version.props` `QylApiContractsVersion`, `services/qyl.dashboard/package.json`, `bun.lock`, the README table) → qyl.mcp (`server`, `workbench` and `dashboard` `package.json`, `bun.lock`); SemanticConventions → AutoInstrumentation (`Directory.Packages.props`, `SEMCONV_REF`) and qyl (`QylSemanticConventionsVersion`), with qyl.at serving `public/schemas/<version>`; AutoInstrumentation → qyl (`QylTelemetryVersion`); every producer → qyl.at `src/data/site.ts`. One production rule stays: when the contract revision changes, push the Collector (qyl `main`) first, wait until `api.qyl.at/health` serves the new revision, then push qyl.mcp; `mcp.qyl.at` refuses a Collector on another revision.

Pushing `main` also deploys: qyl → `qyl-collector` (`api.qyl.at`, Railway), qyl.mcp → `qyl-mcp` (`mcp.qyl.at`, Railway). qyl.at deploys nothing on push: `./release.sh` is the release entry and, on a clean `main` equal to `origin/main`, builds, runs the artifact gate and unit tests, runs `wrangler deploy` to the `qyl-at` Worker and checks that https://qyl.at/ answers 200; `bun run deploy` runs the same `wrangler deploy` after the full `bun run test` (Playwright included), without the branch and HTTP checks.
