# qyl.at

The qyl marketing site — https://qyl.at/. Static HTML on GitHub Pages, apex DNS
via Cloudflare.

Rules:
- Static files only. No build step, no framework, no CMS — every change is a
  plain commit an agent can make and review in one diff.
- Every capability claim on a page must be backed by a shipped, executable
  product path (see the workspace router's infrastructure canon). No vaporware
  pages: a `/product/*` page exists only when the tools it names exist.
- URL structure mirrors sentry.io deliberately: `/` (welcome), `/product/<x>/`.
  Subdomains (`mcp.`, `api.`, reserved `cli.`) are separate services, not pages.
