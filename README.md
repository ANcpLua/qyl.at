# qyl.at

The qyl marketing site — https://qyl.at/. Static HTML on GitHub Pages, apex DNS
via Cloudflare.

Vite + React + Tailwind v4. The landing page uses a React Bits Pro component
(`components/react-bits/`, **gitignored** — premium source is licensed, never
committed to this public repo; reinstall via
`npx shadcn@latest add @reactbits-starter/synaptic-shift-tw` with
`REACTBITS_LICENSE_KEY` from the macOS keychain). Product pages stay plain
static HTML in `public/`.

Deploy: `npm run build`, then push `dist/` to the `gh-pages` branch (Pages
serves that branch; `public/CNAME` rides into every build).

Rules:
- Every capability claim on a page must be backed by a shipped, executable
  product path (see the workspace router's infrastructure canon). No vaporware
  pages: a `/product/*` page exists only when the tools it names exist.
- URL structure mirrors sentry.io deliberately: `/` (welcome), `/product/<x>/`.
  Subdomains (`mcp.`, `api.`, reserved `cli.`) are separate services, not pages.
