"use client";

import { ArrowDown, ArrowRight, ArrowUpRight, Copy, Crosshair, Ruler } from "lucide-react";
import { externalLinks, primaryNavigation, productNavigation, versionOf } from "../../data/site";

// Blueprint direction: pale drafting paper, cyan construction lines, dimensioned callouts.
// Static SSR; the host progressively enhances the command's copy button.
const command = "dotnet tool install --global qyl\nqyl up";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0e7490]";
const shell = "mx-auto max-w-[1240px] px-5 sm:px-8";
const paper = "bg-[#f4f9fc] bg-[linear-gradient(to_right,rgba(14,116,144,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.07)_1px,transparent_1px)] bg-size-[24px_24px]";
const label = "font-mono text-[11px] tracking-[0.14em] text-[#155e75] uppercase";
const link = `inline-flex min-h-11 items-center gap-2 underline decoration-[#0e7490]/40 underline-offset-4 hover:text-[#0e7490] hover:decoration-[#0e7490] ${focus}`;

const parts = [
  { item: "01", part: "Receiver", spec: "OTLP / HTTP", value: "127.0.0.1:4318" },
  { item: "02", part: "Receiver", spec: "OTLP / gRPC", value: "127.0.0.1:4317" },
  { item: "03", part: "Store", spec: "DuckDB, explicit retention", value: "local disk" },
  { item: "04", part: "Dashboard", spec: "Embedded, ships with the tool", value: "127.0.0.1:5100" },
  { item: "05", part: "MCP tools", spec: "list_traces · get_trace · display_traces", value: "your agent" },
] as const;

function Dimension({ text }: { text: string }) {
  return (
    <div aria-hidden="true" className="flex items-center gap-2 text-[#0e7490]">
      <span className="h-3 border-l border-current" /><span className="h-px flex-1 bg-current" /><span className="shrink-0 font-mono text-[10px] tracking-[0.14em] uppercase">{text}</span><span className="h-px flex-1 bg-current" /><span className="h-3 border-l border-current" />
    </div>
  );
}

export default function Blueprint() {
  return (
    <div className={`min-h-screen ${paper} font-sans text-[#0c2d3f] antialiased selection:bg-cyan-100 selection:text-[#0c2d3f]`}>
      <a href="#main" className={`sr-only z-50 border border-[#0e7490] bg-white px-4 py-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${focus}`}>Skip to content</a>
      <header className="border-b border-dashed border-[#0e7490]/50">
        <div className={`${shell} flex min-h-18 items-center justify-between gap-5`}>
          <a href="/" aria-label="qyl home" className={`flex items-center gap-3 ${focus}`}><span className="flex size-9 items-center justify-center border border-[#0e7490] text-[#0e7490]"><Crosshair aria-hidden="true" className="size-4" /></span><span className="text-2xl font-semibold tracking-[-0.05em]">qyl</span><span className="hidden font-mono text-[11px] text-[#155e75] sm:block">DWG / REV {versionOf("qyl")}</span></a>
          <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm sm:gap-7">
            {primaryNavigation.map(({ href, label: text }) => <a key={href} href={href} className={`${text === "Docs" ? "inline-flex" : "hidden md:inline-flex"} min-h-11 items-center hover:text-[#0e7490] ${focus}`}>{text}</a>)}
            <a href="/docs/getting-started/" className={`inline-flex min-h-11 items-center gap-2 border border-[#0c2d3f] bg-[#0c2d3f] px-4 text-sm font-medium text-white hover:bg-[#155e75] ${focus}`}>Start locally <ArrowRight aria-hidden="true" className="hidden size-4 sm:block" /></a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section aria-labelledby="blueprint-title" className={`${shell} pt-12 pb-16 sm:pt-18 lg:pb-22`}>
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <p className={label}>Sheet 01 / General arrangement</p>
              <div className="mt-6 max-w-xl"><Dimension text="Local · 127.0.0.1" /></div>
              <h1 id="blueprint-title" className="mt-5 text-[clamp(3.25rem,8vw,6.75rem)] leading-[0.95] font-semibold tracking-[-0.06em]">Drawn<br />to spec.</h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#27485a]">Every signal has a place on the drawing. qyl receives OpenTelemetry on your machine, stores it in DuckDB, and hands the evidence to your coding agent over MCP.</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
                <a href="/docs/getting-started/" className={`inline-flex min-h-12 items-center gap-2 border border-[#0c2d3f] bg-[#0c2d3f] px-5 text-sm font-medium text-white hover:bg-[#155e75] ${focus}`}>Run qyl locally <ArrowRight aria-hidden="true" className="size-4" /></a>
                <a href="#blueprint-section" className={`${link} text-sm font-medium`}>Read the section <ArrowDown aria-hidden="true" className="size-4" /></a>
              </div>
              <p className="mt-6 font-mono text-xs text-[#27485a]">Note 1: free to use. The local product works without a hosted account.</p>
            </div>
            <div className="min-w-0 lg:col-span-5 lg:mt-8">
              <div className="relative border border-[#0e7490] bg-white/90">
                <span aria-hidden="true" className="absolute -top-px -left-px size-3 border-t-2 border-l-2 border-[#0c2d3f]" /><span aria-hidden="true" className="absolute -right-px -bottom-px size-3 border-r-2 border-b-2 border-[#0c2d3f]" />
                <div className="flex min-h-12 items-center justify-between gap-3 border-b border-dashed border-[#0e7490]/60 px-5"><span className={label}>Detail A / Install</span><Ruler aria-hidden="true" className="size-4 text-[#0e7490]" /></div>
                <div data-command-panel="" className="p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3"><span className="font-mono text-xs text-[#27485a]">shell</span><button type="button" data-copy-command={command} aria-label="Copy qyl install commands" className={`inline-flex min-h-11 items-center gap-2 border border-[#0e7490] px-3 text-xs font-medium text-[#155e75] hover:bg-cyan-50 ${focus}`}><Copy aria-hidden="true" className="size-3.5" /><span data-copy-label="">Copy</span></button></div>
                  <pre className="overflow-x-auto border-l-2 border-[#0e7490] bg-[#f4f9fc] py-3 pl-4 font-mono text-[13px] leading-7 sm:text-sm"><code><span className="text-[#0e7490]">$ </span>dotnet tool install --global qyl{"\n"}<span className="text-[#0e7490]">$ </span>qyl up</code></pre>
                  <div aria-live="polite" data-copy-status="" className="mt-3 min-h-4 font-mono text-xs text-[#155e75]" />
                </div>
                <dl className="grid grid-cols-2 border-t border-dashed border-[#0e7490]/60 font-mono text-xs">
                  <div className="border-r border-dashed border-[#0e7490]/60 px-5 py-4"><dt className="text-[#27485a]">Dashboard</dt><dd className="mt-1 break-all font-semibold">127.0.0.1:5100</dd></div>
                  <div className="px-5 py-4"><dt className="text-[#27485a]">Tolerance</dt><dd className="mt-1 font-semibold">No hosted account</dd></div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section id="blueprint-section" aria-labelledby="blueprint-flow" className="border-y border-dashed border-[#0e7490]/50 bg-white/70 py-16 lg:py-22">
          <div className={shell}>
            <div className="grid gap-6 md:grid-cols-12"><div className="md:col-span-7"><p className={label}>Section B–B / Signal path</p><h2 id="blueprint-flow" className="mt-4 max-w-2xl text-4xl leading-[1.05] font-semibold tracking-[-0.045em] sm:text-5xl">One path. Every joint labelled.</h2></div><p className="max-w-md self-end text-base leading-relaxed text-[#27485a] md:col-span-5">Follow a request from the SDK that emitted it to the agent that explains it. Nothing leaves the machine unless you send it.</p></div>
            <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-0">
              {[["A", "Receive", "Any compliant OpenTelemetry SDK exports over OTLP to ports 4318 or 4317."], ["B", "Store", "Traces, logs and metrics land in one local DuckDB store with explicit retention."], ["C", "Investigate", "Your agent calls list_traces, get_trace and display_traces over MCP."]].map(([mark, title, text], index) => (
                <li key={mark} className={`relative border border-[#0e7490]/60 bg-[#f4f9fc] p-6 md:border-r-0 ${index === 2 ? "md:border-r" : ""}`}>
                  <span className="flex size-10 items-center justify-center rounded-full border border-[#0e7490] font-mono text-sm font-semibold text-[#155e75]">{mark}</span>
                  <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#27485a]">{text}</p>
                  <div className="mt-6"><Dimension text={`Stage ${index + 1} of 3`} /></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="blueprint-parts" className={`${shell} py-16 lg:py-22`}>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4"><p className={label}>Bill of materials</p><h2 id="blueprint-parts" className="mt-4 text-4xl leading-[1.05] font-semibold tracking-[-0.045em]">Parts, as shipped.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#27485a]">One dotnet tool carries the native collector and the embedded dashboard. The MCP server connects your agent.</p><a href="/docs/telemetry/" className={`${link} mt-4 text-sm font-medium`}>Ingestion details <ArrowRight aria-hidden="true" className="size-4" /></a></div>
            <div className="min-w-0 overflow-x-auto lg:col-span-8">
              <table className="w-full min-w-[34rem] border-collapse border border-[#0e7490]/60 bg-white/80 text-left text-sm">
                <caption className="sr-only">qyl components and their local endpoints</caption>
                <thead className="border-b border-[#0e7490]/60 font-mono text-[11px] tracking-[0.12em] text-[#155e75] uppercase"><tr><th scope="col" className="px-4 py-3 font-medium">Item</th><th scope="col" className="px-4 py-3 font-medium">Part</th><th scope="col" className="px-4 py-3 font-medium">Specification</th><th scope="col" className="px-4 py-3 font-medium">Reference</th></tr></thead>
                <tbody className="divide-y divide-dashed divide-[#0e7490]/40">{parts.map((row) => <tr key={row.item}><td className="px-4 py-4 font-mono text-xs text-[#155e75]">{row.item}</td><th scope="row" className="px-4 py-4 font-semibold">{row.part}</th><td className="px-4 py-4 text-[#27485a]">{row.spec}</td><td className="px-4 py-4 font-mono text-xs">{row.value}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>

        <section aria-labelledby="blueprint-sheets" className="border-y border-dashed border-[#0e7490]/50 bg-white/70 py-16 lg:py-22">
          <div className={`${shell} grid gap-10 lg:grid-cols-12`}>
            <div className="lg:col-span-5"><p className={label}>Sheet index</p><h2 id="blueprint-sheets" className="mt-4 max-w-md text-4xl leading-[1.05] font-semibold tracking-[-0.045em]">Each signal has its own sheet.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#27485a]">Errors stay errors. Demo data is always marked as demo data.</p></div>
            <nav aria-label="Product sheets" className="lg:col-span-7">{productNavigation.map(({ href, label: text }, index) => <a key={href} href={href} className={`group flex min-h-16 items-center justify-between gap-5 border-b border-dashed border-[#0e7490]/50 py-4 first:border-t hover:bg-cyan-50/70 ${focus}`}><span className="flex items-center gap-5"><span className="font-mono text-xs text-[#155e75]">SHEET 0{index + 2}</span><span className="text-xl font-medium sm:text-2xl">{text}</span></span><ArrowRight aria-hidden="true" className="size-5 text-[#0e7490] transition-transform group-hover:translate-x-1 motion-reduce:transition-none" /></a>)}</nav>
          </div>
        </section>

        <section aria-labelledby="blueprint-start" className={`${shell} py-16 lg:py-22`}>
          <div className="grid gap-8 border-2 border-[#0c2d3f] bg-white p-6 sm:p-10 lg:grid-cols-12">
            <div className="lg:col-span-8"><p className={label}>Approved for local use</p><h2 id="blueprint-start" className="mt-4 text-5xl leading-none font-semibold tracking-[-0.05em] sm:text-6xl">Local. Useful. Free.</h2><p className="mt-5 max-w-xl text-base leading-relaxed text-[#27485a]">The native collector, embedded dashboard and MCP workbench are included. One plan, every shipped feature.</p></div>
            <div className="flex flex-col items-start justify-end gap-3 lg:col-span-4 lg:items-end"><a href="/docs/getting-started/" className={`inline-flex min-h-12 items-center gap-2 border border-[#0c2d3f] bg-[#0c2d3f] px-5 text-sm font-medium text-white hover:bg-[#155e75] ${focus}`}>Start locally <ArrowRight aria-hidden="true" className="size-4" /></a><a href="/pricing/" className={`${link} text-sm`}>Read the pricing details</a></div>
          </div>
        </section>
      </main>

      <footer className={`${shell} pb-10`}>
        <div className="grid border border-[#0c2d3f] bg-white text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-b border-[#0c2d3f] p-5 sm:border-r lg:border-b-0"><p className={label}>Project</p><a href="/" aria-label="qyl home" className={`mt-2 inline-flex min-h-11 items-center text-3xl font-semibold tracking-[-0.06em] ${focus}`}>qyl</a></div>
          <div className="border-b border-[#0c2d3f] p-5 lg:border-r lg:border-b-0"><p className={label}>Revision</p><p className="mt-3 font-mono text-xs">qyl {versionOf("qyl")}<br />MCP {versionOf("qyl-mcp-server")}</p></div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 border-b border-[#0c2d3f] p-5 sm:border-r sm:border-b-0"><a href="/docs/" className={link}>Docs</a><a href="/faq/" className={link}>FAQ</a><a href="/privacy/" className={link}>Privacy</a></nav>
          <div className="p-5"><p className={label}>Source</p><a href={externalLinks.github} className={`${link} text-xs`}>github.com/ANcpLua/qyl <ArrowUpRight aria-hidden="true" className="size-3.5" /></a></div>
        </div>
      </footer>
    </div>
  );
}
