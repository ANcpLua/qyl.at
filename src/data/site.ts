export const primaryNavigation = [
  { href: "/product/tracing/", label: "Product" },
  { href: "/docs/", label: "Docs" },
  { href: "/pricing/", label: "Pricing" },
  { href: "/faq/", label: "FAQ" },
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
