# qyl.at

The public marketing and documentation site for [qyl](https://github.com/ANcpLua/qyl),
live at [qyl.at](https://qyl.at/). This is production: qyl is released, and the
URL structure is a standing redirect obligation rather than a draft.

The site is Astro 7 with static output, MDX documentation, build-time Shiki syntax
highlighting, Tailwind CSS 4, and on-demand Pagefind search. Cloudflare Workers Static
Assets serves the generated files and handles the same-origin Core Web Vitals endpoint.
There is no React runtime or client router in the production bundle.

## Local development

Use Node.js 24 LTS.

```bash
npm ci
npm run dev
```

## Verify

Install Chromium once, then run the complete release-equivalent local gate:

```bash
npx playwright install chromium
npm test
npx wrangler deploy --dry-run
```

`npm test` checks TypeScript and Astro, dependency policy, static artifacts and payload
budgets, all routes with and without JavaScript, same-origin requests, deployed header
behavior, accessibility, documentation search, and the fixed 4G/4× CPU performance
harness. Lighthouse, PageSpeed Insights, Catchpoint, edge-cache TTFB, and field Core Web
Vitals remain out-of-band deployed release evidence.

## Deploy

CI owns the deploy. A push to `main` runs the verify job and, only if it passes, deploys
the Worker from that commit; `workflow_dispatch` redeploys without an empty commit. A
missing Cloudflare token fails the job rather than skipping it, because a silently
skipped deploy leaves the live site on whatever was last pushed by hand.

The manual path below is for first provisioning and recovery. The Worker secret carries
the collector credential used to forward bounded OTLP log records:

```bash
npx wrangler secret put QYL_API_KEY
npm run deploy
```

The browser never receives the collector credential. Core Web Vitals initialize only
on the `qyl.at` hostname and post to the same-origin `/_qyl/vitals` Worker route.

Licensed React Bits Pro source is design reference only and remains gitignored. The
committed site contains the resulting Astro presentation, not licensed source or its
runtime dependencies.
