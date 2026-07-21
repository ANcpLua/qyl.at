# qyl.at — agent notes

Marketing site for qyl, live at https://qyl.at/ (GitHub Pages: source on
`main`, built `dist/` on `gh-pages`, `public/CNAME` rides along). Vite +
React + Tailwind v4. `README.md` is the authoritative build/deploy runbook.

Working contract:

- `components/react-bits/` is licensed React Bits Pro source — gitignored,
  never committed to this public repo. Reinstall via the `react-bits-pro`
  skill / shadcn CLI with `REACTBITS_LICENSE_KEY` from the macOS keychain.
- No vaporware: a `/product/*` page exists only for a shipped capability.
- URL structure mirrors sentry.io; subdomains are services, not pages.
- Infrastructure canon (DNS, hosts, deploy targets) lives in
  `../AGENTS.md` (qyl-workspace router) — don't restate or contradict it here.
