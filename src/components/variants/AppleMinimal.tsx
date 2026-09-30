"use client";

import { Copy } from "lucide-react";
import { externalLinks, versionOf } from "../../data/site";

// React Bits Pro / Apple Minimal: one idea per screen, two neutral surfaces,
// a product-first type scale and one action colour. No motion runtime required.
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3]";
const link = `inline-flex min-h-11 items-center gap-2 text-[#0066cc] hover:underline ${focus}`;
const action = `inline-flex min-h-12 items-center justify-center rounded-full bg-[#0071e3] px-7 py-3 text-[17px] font-normal text-white hover:bg-[#0063c7] ${focus}`;
const install = "dotnet tool install --global qyl && qyl up";

function InstallCommand() {
  return (
    <div data-command-panel className="mx-auto mt-10 w-full max-w-xl text-left">
      <div className="flex items-center gap-3 border-y border-[#d2d2d7] py-3">
        <pre className="min-w-0 flex-1 overflow-x-auto py-1 text-[12px] leading-6 sm:text-sm"><code><span className="text-[#515154]">$ </span><span className="font-medium">dotnet</span> tool install --global qyl <span className="text-[#515154]">&&</span> <span className="font-medium">qyl</span> up</code></pre>
        <button type="button" data-copy-command={install} aria-label="Copy qyl install command" className={`flex size-11 shrink-0 items-center justify-center rounded-lg text-[#515154] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] ${focus}`}>
          <Copy size={18} aria-hidden="true" />
        </button>
      </div>
      <p data-copy-status aria-live="polite" className="mt-3 min-h-8 text-center text-xs text-[#515154]">
        Installs the collector and opens your local dashboard. Requires .NET.
      </p>
    </div>
  );
}

function TraceIllustration() {
  const spans = [
    { label: "agent.run", duration: "842 ms", bar: "w-full bg-[#1d1d1f]", indent: "" },
    { label: "tools/call", duration: "531 ms", bar: "ml-[12%] w-[63%] bg-[#515154]", indent: "pl-3" },
    { label: "search_logs", duration: "209 ms", bar: "ml-[21%] w-[25%] bg-[#6e6e73]", indent: "pl-6" },
    { label: "db.query", duration: "113 ms", bar: "ml-[27%] w-[14%] bg-[#6e6e73]", indent: "pl-9" },
  ];
  return (
    <figure className="mx-auto w-full max-w-[940px] pt-12 sm:pt-16">
      <figcaption className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#515154]">
        <span>One request. Every clue.</span><span>Trace illustration · example values</span>
      </figcaption>
      <div className="border-y border-[#d2d2d7] py-4 sm:py-7">
        <div className="mb-4 grid grid-cols-[108px_1fr_54px] gap-4 text-[10px] text-[#515154] sm:grid-cols-[180px_1fr_64px] sm:text-xs"><span>Span</span><span className="flex justify-between"><span>0 ms</span><span>842 ms</span></span><span className="text-right">Duration</span></div>
        {spans.map((span) => <div key={span.label} className="grid grid-cols-[108px_1fr_54px] items-center gap-4 py-3 sm:grid-cols-[180px_1fr_64px] sm:py-4"><span className={`truncate font-mono text-[10px] sm:text-sm ${span.indent}`}>{span.label}</span><div className="h-2 rounded-sm bg-[#f5f5f7]"><div className={`h-full rounded-sm ${span.bar}`} /></div><span className="text-right text-[10px] tabular-nums text-[#515154] sm:text-sm">{span.duration}</span></div>)}
      </div>
      <p className="mt-4 text-left text-xs leading-5 text-[#515154]">Illustrative telemetry, not a live connection. In qyl, traces and correlated logs stay available to you and your agent.</p>
    </figure>
  );
}

export default function AppleMinimal() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#1d1d1f] antialiased">
      <a href="#main" className={`sr-only z-50 bg-white p-4 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${focus}`}>Skip to content</a>
      <header className="border-b border-[#d2d2d7]">
        <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-6">
          <a href="/" aria-label="qyl home" className={`text-[27px] font-semibold tracking-[-0.07em] ${focus}`}>qyl<span aria-hidden="true">.</span></a>
          <div className="flex items-center gap-5 text-xs text-[#515154] sm:gap-8">
            <a href="/product/tracing/" className={`hidden min-h-11 items-center hover:text-[#1d1d1f] sm:inline-flex ${focus}`}>Product</a>
            <a href="/docs/" className={`inline-flex min-h-11 items-center hover:text-[#1d1d1f] ${focus}`}>Docs</a>
            <a href="/pricing/" className={`hidden min-h-11 items-center hover:text-[#1d1d1f] sm:inline-flex ${focus}`}>Pricing</a>
            <a href={externalLinks.github} className={`hidden min-h-11 items-center hover:text-[#1d1d1f] md:inline-flex ${focus}`}>GitHub</a>
            <a href="/docs/getting-started/" className={`inline-flex min-h-11 items-center text-[#0066cc] hover:underline ${focus}`}>Get qyl <span aria-hidden="true">›</span></a>
          </div>
        </nav>
      </header>

      <main id="main">
        <section aria-labelledby="hero-title" className="px-6 pb-24 pt-20 sm:pb-32 sm:pt-28">
          <div className="mx-auto max-w-[1120px] text-center">
            <p className="mb-6 text-sm font-medium">qyl. Local-first observability.</p>
            <h1 id="hero-title" className="text-[clamp(3rem,8.3vw,7.5rem)] font-semibold leading-[0.96] tracking-[-0.055em]">Less guessing.<br />More evidence.</h1>
            <p className="mx-auto mt-7 max-w-[37ch] text-[19px] leading-[1.5] tracking-[-0.015em] text-[#6e6e73] sm:text-[21px]">Your traces, logs and metrics. Collected locally.<br className="hidden sm:block" /> Ready for your coding agent to read.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3"><a className={action} href="/docs/getting-started/">Start locally</a><a className={`${link} text-[17px]`} href="/docs/mcp/">Connect your agent <span aria-hidden="true">›</span></a></div>
            <InstallCommand /><TraceIllustration />
          </div>
        </section>

        <section aria-labelledby="local-title" className="bg-[#f5f5f7] px-6 py-24 sm:py-40">
          <div className="mx-auto grid max-w-[1120px] items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <p className="mb-5 text-sm font-medium">Keep your context close.</p>
              <h2 id="local-title" className="text-[clamp(2.75rem,5.8vw,5rem)] font-semibold leading-[1.02] tracking-[-0.045em]">Your machine.<br />Your signals.</h2>
              <p className="mt-7 max-w-[36ch] text-[19px] leading-[1.5] text-[#6e6e73] sm:text-[21px]">Point your OpenTelemetry SDK at qyl. Traces, logs and metrics go into local DuckDB, with a dashboard to investigate what happened.</p>
              <a href="/docs/telemetry/" className={`${link} mt-5 text-[17px]`}>Explore the telemetry path <span aria-hidden="true">›</span></a>
            </div>
            <div aria-label="Local telemetry architecture" className="w-full">
              <div className="border-b border-[#d2d2d7] py-8"><p className="text-xs text-[#515154]">Collect</p><p className="mt-2 text-[32px] font-medium tracking-[-0.025em]">OpenTelemetry</p><p className="mt-2 text-sm text-[#515154]">Your SDK. Standard OTLP over HTTP or gRPC.</p></div>
              <div className="border-b border-[#d2d2d7] py-8"><p className="text-xs text-[#515154]">Store</p><p className="mt-2 text-[32px] font-medium tracking-[-0.025em]">Local DuckDB</p><p className="mt-2 text-sm text-[#515154]">One analytical store, with explicit retention.</p></div>
              <div className="py-8"><p className="text-xs text-[#515154]">Investigate</p><p className="mt-2 text-[32px] font-medium tracking-[-0.025em]">You + your agent</p><p className="mt-2 text-sm text-[#515154]">A human dashboard. An MCP connection.</p></div>
            </div>
          </div>
        </section>

        <section aria-labelledby="agent-title" className="px-6 py-24 sm:py-40">
          <div className="mx-auto max-w-[1120px]">
            <div className="max-w-[900px]">
              <p className="mb-5 text-sm font-medium">Evidence, in the conversation.</p>
              <h2 id="agent-title" className="text-[clamp(2.75rem,5.8vw,5rem)] font-semibold leading-[1.02] tracking-[-0.045em]">Your agent has the code.<br /><span className="text-[#6e6e73]">Give it the context.</span></h2>
              <p className="mt-7 max-w-[43ch] text-[19px] leading-[1.5] text-[#6e6e73] sm:text-[21px]">Connect through MCP to list traces, search correlated logs, and inspect a complete request. Keep the evidence beside the code you’re debugging.</p>
              <a href="/docs/mcp/" className={`${link} mt-5 text-[17px]`}>Set up MCP <span aria-hidden="true">›</span></a>
            </div>
            <div className="mt-16 grid gap-x-16 md:grid-cols-2">
              {[
                ["Tracing", "Follow a request from the first span to the last.", "/product/tracing/"],
                ["Logs", "Read the records correlated with that request.", "/product/logs/"],
                ["Metrics", "Query a time window and inspect the buckets.", "/product/metrics/"],
                ["MCP evidence", "Inspect calls, protocol frames, approvals and tests.", "/product/mcp-evidence/"],
              ].map(([title, copy, href]) => <a key={title} href={href} className={`group flex min-h-32 items-start justify-between gap-4 border-t border-[#d2d2d7] py-7 ${focus}`}><div><h3 className="text-xl font-medium tracking-[-0.02em] group-hover:underline">{title}</h3><p className="mt-2 max-w-[35ch] text-[15px] leading-6 text-[#515154]">{copy}</p></div><span aria-hidden="true" className="text-2xl text-[#515154]">↗</span></a>)}
            </div>
          </div>
        </section>

        <section aria-labelledby="start-title" className="bg-[#f5f5f7] px-6 py-24 text-center sm:py-40">
          <div className="mx-auto max-w-[900px]">
            <p className="mb-5 text-sm font-medium">qyl {versionOf("qyl")}</p>
            <h2 id="start-title" className="text-[clamp(2.75rem,5.8vw,5rem)] font-semibold leading-[1.02] tracking-[-0.045em]">Start with one command.<br />See where it leads.</h2>
            <p className="mx-auto mt-7 max-w-[35ch] text-[19px] leading-[1.5] text-[#6e6e73] sm:text-[21px]">The local collector, dashboard and MCP workbench are free. No hosted account needed to get started.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3"><a href="/docs/getting-started/" className={action}>Get qyl</a><a href="/pricing/" className={`${link} text-[17px]`}>See what’s included <span aria-hidden="true">›</span></a></div>
          </div>
        </section>
      </main>

      <footer className="bg-[#f5f5f7] px-6 pb-9">
        <div className="mx-auto flex max-w-[1120px] flex-col justify-between gap-6 border-t border-[#d2d2d7] pt-7 text-xs text-[#515154] sm:flex-row sm:items-center">
          <p>qyl. Every signal has a story.</p>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-1"><a href="/docs/" className={`inline-flex min-h-11 items-center hover:underline ${focus}`}>Documentation</a><a href={externalLinks.github} className={`inline-flex min-h-11 items-center hover:underline ${focus}`}>GitHub</a><a href="/faq/" className={`inline-flex min-h-11 items-center hover:underline ${focus}`}>FAQ</a><a href="/privacy/" className={`inline-flex min-h-11 items-center hover:underline ${focus}`}>Privacy</a></nav>
        </div>
      </footer>
    </div>
  );
}
