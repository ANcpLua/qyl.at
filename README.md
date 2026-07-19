# 🜁 qyl.at

Marketing site for [qyl](https://github.com/ANcpLua/qyl) — live at
**https://qyl.at/** (GitHub Pages, `gh-pages` branch; source on `main`).
Related surfaces: [mcp.qyl.at](https://mcp.qyl.at/healthz) ·
[api.qyl.at](https://api.qyl.at/health) ·
[npm qyl-mcp-server](https://www.npmjs.com/package/qyl-mcp-server) ·
[NuGet qyl](https://www.nuget.org/packages/qyl).

Vite + React + Tailwind v4. `components/react-bits/` is licensed React Bits Pro
source — gitignored, never committed; reinstall with
`npx shadcn@latest add @reactbits-starter/synaptic-shift-tw`
(`REACTBITS_LICENSE_KEY` from the macOS keychain). Product pages are static
HTML in `public/`.

Deploy: `npm run build`, push `dist/` to `gh-pages` (`public/CNAME` rides
along). Rules: no vaporware — a `/product/*` page exists only for shipped
tools; URL structure mirrors sentry.io; subdomains are services, not pages.
