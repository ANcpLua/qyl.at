# qyl.at

The public qyl site (Astro), served by the `qyl-at` Cloudflare Worker at qyl.at.

Push to `main` directly; a push deploys nothing. Gate before every push: `mise run check`; gates print a summary, `QYL_VERBOSE=1` prints everything. CI (`.github/workflows/check.yml`, push and pull request) runs `check` and `test-gates` and only reports. Deploys, listed versions and served schemas: [`SKILL.md`](SKILL.md). Cloudflare credentials: Vitals `~/.config/vitals/cloudflare-qyl-at-token`, or a `bunx wrangler login` session.
