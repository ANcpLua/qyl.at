# qyl.at

The public marketing and documentation site for [qyl](https://github.com/ANcpLua/qyl),
live at [qyl.at](https://qyl.at/). This is production: qyl is released, and the
URL structure is a standing redirect obligation rather than a draft.

The site is Astro 7 with static output, MDX documentation, build-time Shiki syntax
highlighting, Tailwind CSS 4, and on-demand Pagefind search. Cloudflare Workers Static
Assets serves the generated files and handles the same-origin Core Web Vitals endpoint.
The spatial landing page renders its reading surface as static HTML. A small visibility
controller loads React and the selected React Bits effect when a scene enters the viewport.
The design variants remain static React output without hydration. All new visual styling
uses Tailwind utilities; the original effects retain their animation-time transforms.
Existing documentation remains static MDX with its established reading styles.

`/lab/` compares the light design directions, including the eight original React Bits Pro styles:
Apple Minimal, Swiss Grid, Editorial, Corporate Trust, Luxury Serif, Neobrutalism,
Playful Motion, and Terminal Light (the terminal skill adapted to the requested light palette).
The gallery supports filtering, full-page previews, and paired comparisons. Preview routes
are marked noindex. `/` uses a continuous sixteen-chapter spatial landing page, with one
composition inspired by each direction and all seven original React Bits effects placed
throughout the story. A native chapter navigator links directly to every part and the setup.
`/lab/effects/` contains isolated working examples of all seven requested effects: Eclipse,
Scroll Portal, ASCII Ripple, Depth Image, Bend Gallery, Glass Reveal and Tile Reveal.
The original Apple Minimal page remains at `/lab/apple-minimal/`.

Motion starts after the static reading surface paints. Pause, an offscreen scene, and a
hidden tab unmount the effect and release its resources. Reduced-motion and data-saving
preferences start with the static illustration; users may explicitly play a scene. Scroll
effects do not start automatically on narrow screens. All textures and posters are local.
`check-artifacts.mjs` measures initial and deferred JavaScript separately, retains the
initial byte limits, and caps the complete deferred graph. `tests/effects.spec.ts` exercises
the actual renderers, pause/resume, viewport cleanup, chapter navigation and the static/mobile paths.
The main page has its own Tailwind entry, `src/styles/spatial.css`, so it does not load
the stylesheet for the sixteen standalone design previews. Both layouts share `PageFrame.astro`.


## Local development

`mise.toml` pins Node.js 24 and Bun; `mise install` installs both, and CI installs them through jdx/mise-action. Bun is the package manager.

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

`bun run test` checks TypeScript and Astro, dependency policy, static artifacts and payload
budgets, all routes with and without JavaScript, same-origin requests, deployed header
behavior, accessibility, and documentation search.

The fixed 4G/4× CPU performance harness is not part of that gate. It measures wall-clock
LCP, INP and long tasks against hard thresholds, which a shared CI runner's noisy
neighbour can fail without the site having changed, so it runs weekly and on demand
(`.github/workflows/performance.yml`) where a failure is worth reading rather than
re-running. Locally it is one command:

```bash
bun run build:site && bun run test:perf
```

Lighthouse, PageSpeed Insights, Catchpoint, edge-cache TTFB, and field Core Web Vitals
remain out-of-band deployed release evidence.

## Deploy

CI owns the deploy. A push to `main` runs the verify job and, only if it passes, deploys
the Worker from that commit; `workflow_dispatch` redeploys without an empty commit. A
missing Cloudflare token fails the job rather than skipping it, because a silently
skipped deploy leaves the live site on whatever was last pushed by hand.

The manual path below is for first provisioning and recovery. The Worker secret carries
the collector credential used to forward bounded OTLP log records:

```bash
bunx wrangler secret put QYL_API_KEY
bun run deploy
```

The browser never receives the collector credential. Core Web Vitals initialize only
on the `qyl.at` hostname and post to the same-origin `/_qyl/vitals` Worker route.

## The versions the site states

`src/data/site.ts` holds the release wave and every published version the site
shows: the footer release bar renders the headline list on every page, and the
getting-started table renders the full one with a registry link per row. A
release wave edits that file; no page carries a version of its own, so no page
can fall behind the feeds while another is current. `bun run test` fails on an
internal link that does not resolve and on a `public/sitemap.xml` that disagrees
with the built routes.

## Dependency pins

`astro`, `@astrojs/mdx` and `vite` are pinned to exact versions: they decide the emitted
HTML and asset graph that the byte budgets in `scripts/check-artifacts.mjs` measure, so
each upgrade has to arrive as its own reviewable Renovate PR that re-clears the gate
rather than riding along inside a lockfile-maintenance bump. Everything else floats on a
caret range.

## React Bits Pro and MCP

`components.json` configures the official starter and Pro registries. Put the account's
license in the ignored `.env.local` as `REACTBITS_LICENSE_KEY=...`; never commit it.
The installed `shadcn` CLI reads that file. Verify the real MCP initialize/tool flow with:

```bash
bun run check:mcp
```

The local Codex MCP server uses `shadcn mcp --cwd <this checkout>`. Restart Codex after
changing its MCP configuration. Registry search and installation require network access.
Licensed design instructions under `src/skills`, `src/prompts`, and `src/recipes` are
local-only; the adapted application components under `src/components/variants` are source.
The byte gate also counts hydrated islands if a future component introduces one. `finalize-site.mjs`
externalizes Astro's inline island bootstrap into content-hashed local scripts so hydration
works under the existing deployed Content-Security-Policy.

## Design study

The variant sources live in `src/components/variants`; `src/data/variants.ts` controls
labels and ordering. `src/styles/variants.css` contains only Tailwind import/source directives.
`VariantLayout.astro` handles metadata and shared behavior. Each variant has a separate
Git worktree under `/private/tmp/qyl-ui-lab/worktrees/` on this workstation, including the
original setup skill and all 19 remaining Agent Kit documents under `upstream/`.
Those instructions and licensed unmodified source references are local-only.

Run the design checks and refresh real preview screenshots with:

```bash
bun run build:site
bunx playwright test --project=surface tests/lab.spec.ts
bun run build:site
```

The last build includes the screenshots created in `public/lab-previews/`. Full desktop
and mobile evidence stays outside the published site in `evidence/designs/`. Vite caches
are scoped to each checkout so parallel worktree builds do not share optimizer state.
