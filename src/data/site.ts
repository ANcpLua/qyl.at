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
  { href: "/docs/api-sdk/", label: "API SDK" },
] as const;

export const productNavigation = [
  { href: "/product/tracing/", label: "Tracing" },
  { href: "/product/logs/", label: "Logs" },
  { href: "/product/metrics/", label: "Metrics" },
  { href: "/product/mcp-evidence/", label: "MCP evidence" },
  { href: "/product/ci/", label: "CI telemetry" },
] as const;

export const externalLinks = {
  github: "https://github.com/ANcpLua/qyl",
  mcpGithub: "https://github.com/ANcpLua/qyl.mcp",
  npm: "https://www.npmjs.com/package/qyl-mcp-server",
  nuget: "https://www.nuget.org/packages/qyl",
} as const;

// One release wave, one place. Every version the site states comes from here:
// the footer release bar renders `headline`, the getting-started table renders
// `release`, and prose asks `versionOf` below. A wave that bumps a package edits
// this array and nothing else, so a page cannot fall behind the feeds while
// another page is current. The three literals no expression can replace are
// held here by `scripts/check-versions.mjs`, which runs in `npm run check`.
export const releaseWave = "2026-09-12" as const;

export const release = [
  {
    name: "qyl",
    version: "6.0.0",
    registry: "https://www.nuget.org/packages/qyl",
    summary: "The dotnet tool: native collector, embedded dashboard, product API.",
  },
  {
    name: "Qyl.Api.Sdk",
    version: "6.0.0",
    registry: "https://www.nuget.org/packages/Qyl.Api.Sdk",
    summary: "MSBuild SDK for a Native AOT ASP.NET Core API behind one AddQylApi call.",
  },
  {
    name: "Qyl.Telemetry.AutoInstrumentation",
    version: "21.1.0",
    registry: "https://www.nuget.org/packages/Qyl.Telemetry.AutoInstrumentation",
    summary: "Compile-time .NET instrumentation; writes generated constants only.",
  },
  {
    name: "Qyl.Telemetry.Hosting",
    version: "21.1.0",
    registry: "https://www.nuget.org/packages/Qyl.Telemetry.Hosting",
    summary: "The AddQyl() activation line and the attribute-stamping processor.",
  },
  {
    name: "Qyl.Telemetry.SemanticConventions",
    version: "9.4.0",
    registry: "https://www.nuget.org/packages/Qyl.Telemetry.SemanticConventions",
    summary: "Weaver-generated attribute and metric constants, committed to the repository.",
  },
  {
    name: "Qyl.Telemetry.SemanticConventions.Incubating",
    version: "9.4.0",
    registry: "https://www.nuget.org/packages/Qyl.Telemetry.SemanticConventions.Incubating",
    summary: "The same generation for conventions upstream has not stabilised.",
  },
  {
    name: "Qyl.Telemetry.SemanticConventions.Analyzers",
    version: "9.4.0",
    registry: "https://www.nuget.org/packages/Qyl.Telemetry.SemanticConventions.Analyzers",
    summary: "Compile-time diagnostics against the generated vocabulary.",
  },
  {
    name: "Qyl.Api.Contracts",
    version: "10.0.1",
    registry: "https://www.nuget.org/packages/Qyl.Api.Contracts",
    summary: "The generated .NET read contract for every Qyl request and response.",
  },
  {
    name: "@ancplua/qyl-api-schema",
    version: "10.0.1",
    registry: "https://www.npmjs.com/package/@ancplua/qyl-api-schema",
    summary: "The same contract for TypeScript consumers, with its Zod export.",
  },
  {
    name: "qyl-mcp-server",
    version: "5.2.0",
    registry: "https://www.npmjs.com/package/qyl-mcp-server",
    summary: "The MCP server: stdio locally, Streamable HTTP hosted.",
  },
] as const;

// The footer states the wave on every page, so a reader never has to find the
// documentation table to know which release the page describes. Six entries,
// not ten: the three semantic-conventions ids share a version, and Hosting
// ships in lockstep with AutoInstrumentation.
export const headline = [
  "qyl 6.0.0",
  "Qyl.Api.Sdk 6.0.0",
  "Qyl.Telemetry.AutoInstrumentation 21.1.0",
  "Qyl.Telemetry.SemanticConventions 9.4.0",
  "Qyl.Api.Contracts 10.0.1",
  "qyl-mcp-server 5.2.0",
] as const;

// Prose states a version by asking for it here instead of repeating it. Before
// this, `release` was imported by exactly two components and every other version
// on the site was a hand-kept literal, so a wave moved the table and the footer
// and left the sentences behind. The three places that still hold a literal --
// an MDX frontmatter `description`, and the two `<Project Sdk="…">` code
// examples, none of which can hold an expression -- are held to this array by
// `scripts/check-versions.mjs` instead.
export function versionOf(name: (typeof release)[number]["name"]): string {
  const entry = release.find((candidate) => candidate.name === name);
  if (entry === undefined) throw new Error(`site.ts: no release entry named ${name}`);
  return entry.version;
}
