// `section` is the URL prefix the entry represents, which is not always its own
// href: "Product" links into /product/tracing/ but owns all of /product/. Marking
// the current item by prefix-matching the href left /product/logs/, /metrics/ and
// /ci/ with no aria-current and no active underline anywhere in the header.
export const primaryNavigation = [
  { href: "/product/tracing/", label: "Product", section: "/product/" },
  { href: "/docs/", label: "Docs", section: "/docs/" },
  { href: "/pricing/", label: "Pricing", section: "/pricing/" },
  { href: "/faq/", label: "FAQ", section: "/faq/" },
] as const;

export const docsNavigation = [
  { href: "/docs/getting-started/", label: "Getting started" },
  { href: "/docs/workbench/", label: "MCP workbench" },
  { href: "/docs/mcp/", label: "Hosted MCP" },
  { href: "/docs/protocol-2026-07-28/", label: "Protocol 2026-07-28" },
  { href: "/docs/telemetry/", label: "Telemetry" },
] as const;

export const productNavigation = [
  { href: "/product/tracing/", label: "Tracing" },
  { href: "/product/logs/", label: "Logs" },
  { href: "/product/metrics/", label: "MCP evidence" },
  { href: "/product/ci/", label: "CI telemetry" },
] as const;

export const externalLinks = {
  github: "https://github.com/ANcpLua/qyl",
  mcpGithub: "https://github.com/ANcpLua/qyl.mcp",
  npm: "https://www.npmjs.com/package/qyl-mcp-server",
  nuget: "https://www.nuget.org/packages/qyl",
} as const;
