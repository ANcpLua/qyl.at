# qyl.at engineering contract

qyl.at is qyl's public marketing and documentation surface. It is a static Astro
site deployed through Cloudflare Workers Static Assets. `README.md` is the build,
verification, and deployment runbook. Infrastructure ownership remains in the
workspace-level `../AGENTS.md`.

## Verified concern status

| Concern | Status | Evidence / concrete remainder |
| --- | --- | --- |
| [`QYL-PUBLIC-SITE`](https://github.com/ANcpLua/dedupe-28th-july/blob/main/concerns/07-public-site-production-evidence.md) | `IN_PROGRESS` | Vitals/bfcache lifecycle code, Worker/unit/Playwright gates, and CI deployment are tracked; a real-browser persisted-bfcache regression and post-deploy Cloudflare observability/readback gate remain. |

## Place in the 1.0.0 taxonomy

qyl.at is not one of the nine runtime components — it is the public surface
that *describes* them. That makes it the one place where wrong names are
visible to the outside, so it uses the canonical 1.0.0 names and no others:
`Qyl.Telemetry.SemanticConventions`, `Qyl.Telemetry(.AutoInstrumentation
/.Hosting)`, `Qyl.Collector.*`, `Qyl.Cli`, `Qyl.Run.Workload`, `qyl.dashboard`,
`qyl.mcp/server`, `qyl.mcp/workbench`, `qyl.mcp/dashboard`. `Qyl.Sdk` is
retired and must not appear.

The full ledger lives in `qyl/ARCHITECTURE-1.0.0.md` — that document is normative.

Two consequences specific to a public site: the URL structure becomes a
redirect obligation the moment it is launched (including the dated
`/docs/protocol-2026-07-28/`), and a `/product/*` page may only exist for a
shipped capability.

## Scope

- Public routes are the landing page, pricing, FAQ, authentication, privacy,
  documentation, shipped product pages, and 404.
- The qyl dashboard, collector UI, MCP workbench, and protocol implementations live
  in their owning repositories and are not duplicated here.
- Product claims must describe executable behavior in `qyl` or `qyl.mcp`. Delete a
  route or claim when the product path does not exist.

## Delivery invariants

- Astro renders every route to static HTML. Ordinary links and the complete reading
  surface must work with JavaScript disabled.
- Client JavaScript is reserved for behavior that cannot exist in HTML or CSS. Do not
  add a React runtime, client router, animation runtime, WebGL, smooth scrolling, or
  third-party browser SDK without replacing this architecture and its measured gates.
- React Bits Pro is licensed design reference only. Licensed source stays ignored and
  is never published; port retained presentation into Astro and delete its runtime.
- All fonts and subresources are same-origin. Keep exactly one self-hosted Geist Sans
  variable WOFF2 and its SIL Open Font License.
- The CSP and cache policy in `public/_headers` are release behavior, not examples.
  Pagefind's WebAssembly requires the narrow `wasm-unsafe-eval` CSP token.

## Telemetry boundary

Browser telemetry is an explicit Core Web Vitals path owned by this site. It may send
only LCP, INP, CLS, route pathname, navigation type, and the bounded browser attributes
validated in `worker/index.ts`. It must not capture URL queries, DOM content, request or
response bodies, arbitrary headers, credentials, or MCP `Mcp-Param-*` values. Broader
HTTP or MCP content capture belongs to the instrumentation or protocol owner and needs
its own explicit policy.

## Cloudflare skills

This site is the one repo that deploys a Worker and owns a browser surface, so
all three Cloudflare skills apply here — they retrieve from current Cloudflare
docs instead of answering from pre-trained memory, which is the whole reason to
load one before acting.

- `/cloudflare:wrangler` — **before running any `wrangler` command.** Deploys,
  secrets, and the `vars` block in `wrangler.jsonc` go through this CLI, and
  its flags change between versions.
- `/cloudflare:web-perf` — for LCP/INP/CLS work. The vitals this site forwards
  to `api.qyl.at` are a product claim; measure with the skill rather than
  asserting an improvement.
- `/cloudflare:cloudflare` — for the platform around the Worker: zone settings,
  DNS, custom domains, cache and header behavior, WAF.

## Verification

```bash
npm ci
npx playwright install chromium
npm test
npx wrangler deploy --dry-run
```

The deterministic artifact, no-JavaScript, CSP, same-origin, font, accessibility, and
fixed-network browser gates are mandatory. PageSpeed Insights, Catchpoint, edge TTFB,
and 28-day field percentiles are deployed release evidence and must never be reported
from local or CI results.
