# qyl.at

Astro site served by the qyl-at Cloudflare Worker. A git push does not deploy it; release.sh does. src/data/site.ts is the only place a version is written; src/data/mcp-tools.ts is generated (bun run sync:tools). SKILL.md covers deploy, served schemas, versions and tools.
