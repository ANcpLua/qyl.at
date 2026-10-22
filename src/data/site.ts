// `section` is the URL prefix the entry represents, which is not always its own
// href: "Product" links into /product/investigation/ but owns all of /product/, so
// every product page marks it current.
export const primaryNavigation = [
  { href: "/product/investigation/", label: "Product", section: "/product/" },
  { href: "/docs/", label: "Docs", section: "/docs/" },
  { href: "/pricing/", label: "Pricing", section: "/pricing/" },
  { href: "/faq/", label: "FAQ", section: "/faq/" },
] as const;

export const docsNavigation = [
  {
    href: "/docs/getting-started/",
    label: "Getting started",
    description: "Run the Collector, send it OpenTelemetry from any SDK and connect an agent.",
  },
  {
    href: "/docs/mcp/",
    label: "Connect an agent",
    description: "Claude, Claude Code, ChatGPT, Codex, the Claude and OpenAI APIs and local stdio; sign-in, scopes, tools and skills.",
  },
  {
    href: "/docs/protocol-2026-07-28/",
    label: "Protocol 2026-07-28",
    description: "How the MCP server uses TypeScript SDK v2: discovery, extensions and the protocol revisions it answers.",
  },
  {
    href: "/docs/telemetry/",
    label: "Telemetry",
    description: "What the Collector ingests, how it normalizes and redacts attributes, and which captured headers it keeps.",
  },
  {
    href: "/docs/api-sdk/",
    label: "API SDK",
    description: "Build a Native AOT ASP.NET Core API that reports to qyl behind one AddQylApi call.",
  },
] as const;

export const productNavigation = [
  { href: "/product/investigation/", label: "Investigation" },
  { href: "/product/tracing/", label: "Traces" },
  { href: "/product/logs/", label: "Logs" },
  { href: "/product/metrics/", label: "Metrics" },
  { href: "/product/mcp-evidence/", label: "Agent runs and MCP" },
  { href: "/product/ci/", label: "CI runs" },
] as const;

// The one sentence of how qyl came to be, as the owner states it. The landing page, the
// header bar of the site's pages, the FAQ and pricing say it in these words.
export const story = "Built over ten months by one developer, starting with Claude Opus 4.5, using Anthropic and OpenAI models to the fullest.";

export const externalLinks = {
  github: "https://github.com/ANcpLua/qyl",
  npm: "https://www.npmjs.com/package/qyl-mcp-server",
  nuget: "https://www.nuget.org/packages/qyl",
} as const;

// Every version the site states comes from here: pages, tables and the footer call
// `versionOf`, and scripts/check-versions.mjs fails on a version written anywhere else.
// Each entry states what its registry serves.
//
// The qyl repository releases the tool, Qyl.Api.Sdk, Qyl.Orchestration and qyl-mcp-server
// from one revision at one version (Version.props QylVersion), and patch releases are
// frequent, so that version is not written here: the build reads the release npm serves
// as qyl-mcp-server's latest tag. A build that cannot read it fails rather than state an
// old one.
const qylVersion = await latestQylRelease();

async function latestQylRelease(): Promise<string> {
  const url = "https://registry.npmjs.org/qyl-mcp-server/latest";
  let failure: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const { version } = (await response.json()) as { version?: unknown };
      if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/u.test(version)) throw new Error(`no release version in ${JSON.stringify(version)}`);
      return version;
    } catch (error) {
      failure = error;
    }
  }
  throw new Error(`site.ts: cannot read the qyl release from ${url}: ${String(failure)}`);
}

export const packages = [
  {
    name: "qyl",
    version: qylVersion,
    registry: "https://www.nuget.org/packages/qyl",
    summary: "The .NET tool: the qyl CLI and the Collector (OTLP ingest, storage, analysis) that qyl up runs on .NET 10.",
  },
  {
    name: "qyl-mcp-server",
    version: qylVersion,
    registry: "https://www.npmjs.com/package/qyl-mcp-server",
    summary: "The MCP server for local stdio. mcp.qyl.at runs the same server.",
  },
  {
    name: "Qyl.Api.Sdk",
    version: qylVersion,
    registry: "https://www.nuget.org/packages/Qyl.Api.Sdk",
    summary: "MSBuild SDK for a Native AOT ASP.NET Core API behind one AddQylApi call.",
  },
  {
    name: "Qyl.Orchestration",
    version: qylVersion,
    registry: "https://www.nuget.org/packages/Qyl.Orchestration",
    summary: "Process host with service references, readiness checks and application cleanup.",
  },
  {
    name: "Qyl.Api.Contracts",
    version: qylVersion,
    registry: "https://www.nuget.org/packages/Qyl.Api.Contracts",
    summary: "The qyl API contract as C# types, generated from the TypeSpec in contracts/ and shared with the MCP server.",
  },
  {
    name: "Qyl.Telemetry.Hosting",
    version: "28.2.3",
    registry: "https://www.nuget.org/packages/Qyl.Telemetry.Hosting",
    summary: "The AddQyl() activation line for a .NET application.",
  },
  {
    name: "Qyl.Telemetry.AutoInstrumentation",
    version: "28.2.3",
    registry: "https://www.nuget.org/packages/Qyl.Telemetry.AutoInstrumentation",
    summary: "Compile-time .NET instrumentation that records with the generated convention constants.",
  },
  {
    name: "Qyl.Telemetry.SemanticConventions",
    version: "15.0.4",
    registry: "https://www.nuget.org/packages/Qyl.Telemetry.SemanticConventions",
    summary: "Generated C# attribute, event and metric constants; .Incubating and .Analyzers share its version.",
  },
  {
    name: "@ancplua/qyl-semantic-conventions",
    version: "15.0.4",
    registry: "https://www.npmjs.com/package/@ancplua/qyl-semantic-conventions",
    summary: "The same constants for TypeScript, from the same resolved registry.",
  },
] as const;

export type PackageName = (typeof packages)[number]["name"];

export function versionOf(name: PackageName): string {
  const entry = packages.find((candidate) => candidate.name === name);
  if (entry === undefined) throw new Error(`site.ts: no package named ${name}`);
  return entry.version;
}
