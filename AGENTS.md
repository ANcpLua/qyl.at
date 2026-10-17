# qyl.at

The public qyl site (Astro), served by the `qyl-at` Cloudflare Worker at qyl.at.

Push to `main` directly; a push deploys nothing. Verify changed pages, version pins and affected checks; reuse passing results while their inputs remain unchanged. Prose-only instruction changes need no execution check. `mise run check` is the full source gate when needed; CI runs `check` and `test-gates` for reporting. Keep the actual native deployment checks, without adding unrelated browser or full-suite reruns. Deploys, listed versions and served schemas: [`SKILL.md`](SKILL.md). Cloudflare credentials: Vitals `~/.config/vitals/cloudflare-qyl-at-token`, or a `bunx wrangler login` session.
