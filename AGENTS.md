# qyl.at repository contract

Owns the public static Astro site and Cloudflare Worker. Product behavior and
telemetry storage remain in their owning repositories. Publish only claims and
routes backed by shipped behavior.

Pages must remain usable without JavaScript. Keep dependencies, fonts, CSP,
cache policy, and browser telemetry same-origin and minimal. Browser telemetry
may contain bounded Web Vitals and route paths, never content, queries,
credentials, arbitrary headers, or MCP parameters.

Load the relevant Cloudflare skill before Cloudflare operations. Validate with
`npm ci`, `npx playwright install chromium`, `npm test`, and
`npx wrangler deploy --dry-run`. Local results are not deployed performance
evidence.
