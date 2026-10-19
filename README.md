# qyl.at

The public documentation site for [qyl](https://github.com/ANcpLua/qyl), an analytical
engine for agents, live at [qyl.at](https://qyl.at/). It describes the Collector, the MCP
server and how an agent connects to them. Built over ten months by one developer, starting
with Claude Opus 4.5, using Anthropic and OpenAI models to the fullest. This is production: a
moved page keeps its old URL as a redirect in `public/_redirects`; the page of a removed feature is deleted.

The site is Astro 7 with static output, MDX documentation, build-time Shiki syntax
highlighting, Tailwind CSS 4, and on-demand Pagefind search. Cloudflare Workers Static
Assets serves the generated files and handles the same-origin Core Web Vitals endpoint.
`/` is a sixteen-chapter landing page that renders its reading surface as static HTML; a
native chapter navigator links to every part and the setup. A small visibility controller
loads React and the selected React Bits effect when a scene enters the viewport. All visual
styling uses Tailwind utilities; the original effects retain their animation-time transforms.
The documentation is static MDX with its own reading styles.

`/lab/effects/` holds isolated working examples of the seven React Bits Pro effects the
landing page uses: Eclipse, Scroll Portal, ASCII Ripple, Depth Image, Bend Gallery, Glass
Reveal and Tile Reveal. Its routes are marked noindex.

Motion starts after the static reading surface paints. Pause, an offscreen scene, and a
hidden tab unmount the effect and release its resources. Reduced-motion and data-saving
preferences start with the static illustration; users may explicitly play a scene. Scroll
effects do not start automatically on narrow screens. All textures and posters are local.
`check-artifacts.mjs` measures initial and deferred JavaScript separately, retains the
initial byte limits, and caps the complete deferred graph. `tests/effects.spec.ts` exercises
the actual renderers, pause/resume, viewport cleanup, chapter navigation and the static/mobile paths.
The landing page has its own Tailwind entry, `src/styles/spatial.css`, and the effects lab
its own, `src/styles/effects-lab.css` (through `EffectsLayout.astro`); both layouts share
`PageFrame.astro`.


## Local development

`mise.toml` pins Node.js 24 and Bun; `mise install` installs both. Bun is the package manager.

```bash
bun install --frozen-lockfile
bun run dev
```

## Verify

Install Chromium once, then run the complete release-equivalent local gate:

```bash
bunx playwright install chromium
bun run test
bunx wrangler deploy --dry-run
```

`bun run test` checks TypeScript and Astro, dependency policy, the version gate, static
artifacts and payload budgets, the served schemas, all routes with and without JavaScript,
same-origin requests, deployed header behavior, accessibility, and documentation search.

The fixed 4G/4× CPU performance harness is not part of that gate. It measures wall-clock
LCP, INP and long tasks against hard thresholds, which a busy machine can fail without the site having changed, so it stays out of
the push gate and runs on demand, where a failure is worth reading rather than re-running. Locally it is one command:

```bash
bun run build:site && bun run test:perf
```

Lighthouse, PageSpeed Insights, Catchpoint, edge-cache TTFB, and field Core Web Vitals
remain out-of-band deployed release evidence.

## Deploy

Nothing deploys on push: `./release.sh` is the release entry and, on a clean `main` equal to
`origin/main`, builds, runs the artifact gate and unit tests, commits and pushes a schema the
build had to write (see below), runs `wrangler deploy` to the `qyl-at` Worker and checks that
https://qyl.at/ answers 200; `bun run deploy` runs the same
`wrangler deploy` after the full `bun run test` (Playwright included), without the branch and
HTTP checks. `./release.sh` refuses without Cloudflare
credentials (`bunx wrangler login` once, or a token registered in Vitals) rather than
skipping, because a silently skipped deploy leaves the live site on whatever was last deployed.

The Cloudflare configuration rule `qyl API clients` matches
`http.host in {"api.qyl.at" "mcp.qyl.at"}` and disables Browser Integrity Check
for those hosts. API-key and OAuth checks remain in the services. This lets telemetry
and MCP clients use their actual user agents without Cloudflare error 1010;
the zone's browser protection remains enabled elsewhere.

The manual path below is for first provisioning and recovery. The Worker secret carries
the collector credential used to forward bounded OTLP log records:

```bash
bunx wrangler secret put QYL_API_KEY
./release.sh
```

The browser never receives the collector credential. Core Web Vitals initialize only
on the `qyl.at` hostname and post to the same-origin `/_qyl/vitals` Worker route.
The Worker uses the shared generated browser Web Vitals event and attributes, with
real metric-instance IDs, deltas and navigation types. Cached older pages remain
accepted through a legacy payload path; it does not invent missing fields or
forward viewport dimensions and device memory.

## The versions the site states

Every version the site states comes from `src/data/site.ts`. The qyl release (the qyl tool,
qyl-mcp-server, Qyl.Api.Sdk and Qyl.Orchestration share one version) is not written down:
`site.ts` reads it from npm, qyl-mcp-server's `latest` tag, whenever the site is checked or
built, and the build fails when npm cannot answer. The other packages' versions are written
in `site.ts`. The footer of every page lists the published versions, the getting-started
table links each one to its registry, and prose calls `versionOf`; copyable lines such as
the `Qyl.Api.Sdk` project line are rendered by components that call it too. `scripts/check-versions.mjs` (in `bun run check`) fails on a
published version written anywhere else in `src/`, `scripts/` or the root documents, and on
a `<package> <version>` pair whose version `site.ts` does not list. `bun run test` fails on
an internal link that does not resolve and on a `public/sitemap.xml` that disagrees with
the built routes.

## MCP tools and skills

`src/data/mcp-tools.ts` is generated from qyl's MCP tool snapshot, the file the MCP server's
tests hold its registered tools to: `bun run sync:tools [path]`, by default
`../qyl/services/qyl.mcp/tool-manifest.snapshot.json`. The connection guide's tool tables,
the product pages' tool entries and the skill list render from it.

## Served schemas

`https://qyl.at/schemas/<version>` is the OpenTelemetry schema URL that
`@ancplua/qyl-semantic-conventions` and its NuGet siblings carry. The site follows its own
dependency on that package: `scripts/schema.mjs` runs before `astro build` and writes
`public/schemas/<version>` from the newest committed schema when the installed version has
none (the package names the URL but ships no schema document, and the registry has no
transformations), and runs again after the build to fail unless `dist` serves that version
and every committed schema unchanged. `release.sh` commits a newly written schema before it
deploys, so a URL that was served once stays in the repository.

## Dependency pins

`astro`, `@astrojs/mdx` and `vite` are pinned to exact versions: they decide the emitted
HTML and asset graph that the byte budgets in `scripts/check-artifacts.mjs` measure, so
each upgrade arrives as its own Renovate update and is applied after `bun run test` passes
locally, rather than riding along inside a lockfile-maintenance bump. Everything else floats on a
caret range.

## React Bits Pro and MCP

`components.json` configures the official starter and Pro registries. Put the account's
license in the ignored `.env.local` as `REACTBITS_LICENSE_KEY=...`; never commit it.
The installed `shadcn` CLI reads that file. Verify the real MCP initialize/tool flow with:

```bash
bun run check:mcp
```

Registry search and installation require network access.
Licensed design instructions under `src/skills`, `src/prompts`, and `src/recipes` are
local-only; the adapted effect components under `src/components/react-bits` are source.
The byte gate also counts hydrated islands if a future component introduces one. `finalize-site.mjs`
externalizes Astro's inline island bootstrap into content-hashed local scripts so hydration
works under the existing deployed Content-Security-Policy.

## Effects lab

Run the browser checks with `mise run test-gates` (or, after `bun run build:site`,
`bunx playwright test --project=surface`). Screenshots go to `evidence/effects/`, outside the
published site. `tests/fixtures/` holds the two page captures that calibrate the pixel
comparator in `tests/surface-comparison.ts`. Vite caches are scoped to each checkout so
parallel worktree builds do not share optimizer state.
