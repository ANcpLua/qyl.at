# qyl.at

Astro site served by the qyl-at Cloudflare Worker. A git push does not deploy it; release.sh does. src/data/site.ts is the only source of a stated version (it reads the qyl release from npm at build time); src/data/mcp-tools.ts is generated (bun run sync:tools). SKILL.md covers deploy, served schemas, versions and tools.
