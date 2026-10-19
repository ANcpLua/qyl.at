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
    description: "The qyl plugin for Claude Code and Codex, the ChatGPT connector and local stdio; scopes, tools, skills and Events.",
  },
  {
    href: "/docs/protocol-2026-07-28/",
    label: "Protocol 2026-07-28",
    description: "How the MCP server uses TypeScript SDK v2: discovery, extensions and the protocol revisions it answers.",
  },
  {
    href: "/docs/telemetry/",
    label: "Telemetry",
    description: "What the Collector ingests, how it normalizes attributes, and what it never retains.",
  },
  {
    href: "/docs/testing/",
    label: "Telemetry testing",
    description: "Test exported traces, logs and metrics against a real OTLP receiver.",
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

export const externalLinks = {
  github: "https://github.com/ANcpLua/qyl",
  npm: "https://www.npmjs.com/package/qyl-mcp-server",
  nuget: "https://www.nuget.org/packages/qyl",
} as const;

// Every version the site states is written here and nowhere else: pages, tables and
// the footer call `versionOf`, and scripts/check-versions.mjs fails on a version
// written anywhere else. Each entry states what its registry serves.
//
// The qyl repository releases the tool, Qyl.Api.Sdk and Qyl.Orchestration at one
// version. qyl-mcp-server joins that version with its first release from the qyl
// repository; set its entry to `qylVersion` then.
const qylVersion = "16.0.1";

export const packages = [
  {
    name: "qyl",
    version: qylVersion,
    registry: "https://www.nuget.org/packages/qyl",
    summary: "The .NET tool: the NativeAOT Collector (OTLP ingest, storage, analysis) and the qyl CLI.",
  },
  {
    name: "qyl-mcp-server",
    version: "11.1.4",
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
    name: "Qyl.Telemetry.Hosting",
    version: "28.2.3",
    registry: "https://www.nuget.org/packages/Qyl.Telemetry.Hosting",
    summary: "The AddQyl() activation line for a .NET application.",
  },
  {
    name: "Qyl.Telemetry.AutoInstrumentation",
    version: "28.2.3",
    registry: "https://www.nuget.org/packages/Qyl.Telemetry.AutoInstrumentation",
    summary: "Compile-time .NET instrumentation; writes generated constants only.",
  },
  {
    name: "Qyl.Telemetry.SemanticConventions",
    version: "15.0.2",
    registry: "https://www.nuget.org/packages/Qyl.Telemetry.SemanticConventions",
    summary: "Generated C# attribute, event and metric constants; .Incubating and .Analyzers share its version.",
  },
  {
    name: "@ancplua/qyl-semantic-conventions",
    version: "15.0.2",
    registry: "https://www.npmjs.com/package/@ancplua/qyl-semantic-conventions",
    summary: "The same constants for TypeScript, from the same resolved registry.",
  },
  {
    name: "Qyl.Telemetry.Testing",
    version: "3.0.3",
    registry: "https://www.nuget.org/packages/Qyl.Telemetry.Testing",
    summary: "OTLP receiver package for existing test consumers; development continues in Qyl.Telemetry.Tests.",
  },
] as const;

export type PackageName = (typeof packages)[number]["name"];

export function versionOf(name: PackageName): string {
  const entry = packages.find((candidate) => candidate.name === name);
  if (entry === undefined) throw new Error(`site.ts: no package named ${name}`);
  return entry.version;
}
