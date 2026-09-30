"use client";

import { ArrowDown, ArrowRight, Check, Copy, CornerDownRight, Terminal } from "lucide-react";
import { externalLinks, primaryNavigation, productNavigation, versionOf } from "../../data/site";

// React Bits Pro neobrutalism skill, harmonized with the Hero 11 hierarchy.
// Static SSR; the host progressively enhances the command's copy button.
const button = "inline-flex min-h-12 items-center justify-center gap-3 border-[3px] border-black px-5 py-3 text-sm font-extrabold shadow-[4px_4px_0_0_#000] transition duration-100 ease-linear hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black motion-reduce:transition-none";
const link = "inline-flex min-h-11 items-center gap-2 font-bold underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black";
const command = "dotnet tool install --global qyl\nqyl up";

export default function Neobrutalism() {
  return (
    <div className="min-h-screen bg-[#fafaf5] font-sans text-[#111111] selection:bg-[#e8fc39] selection:text-black">
      <a href="#main" className="sr-only fixed top-3 left-3 z-50 border-[3px] border-black bg-[#e8fc39] p-4 font-bold focus:not-sr-only">Skip to content</a>
      <header className="border-b-[3px] border-black bg-[#fafaf5]">
        <div className="mx-auto flex min-h-22 max-w-[1280px] items-center justify-between gap-5 px-5 sm:px-8">
          <a href="/" aria-label="qyl home" className="text-[42px] leading-none font-black tracking-[-0.08em] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black">qyl<span className="text-2xl">↗</span></a>
          <nav aria-label="Main navigation" className="flex items-center gap-6 text-sm">
            {primaryNavigation.map(({ href, label }) => <a key={href} href={href} className={`${link} ${label === "Docs" ? "" : "max-md:hidden"}`}>{label}</a>)}
          </nav>
          <a href="/docs/getting-started/" className={`${button} max-sm:hidden bg-[#e8fc39]`}>Start locally <ArrowRight size={17} strokeWidth={2.5} aria-hidden="true" /></a>
        </div>
      </header>
      <main id="main">
        <section aria-labelledby="neo-title" className="mx-auto max-w-[1280px] px-5 pt-12 pb-14 sm:px-8 sm:pt-18 lg:pb-22">
          <div className="mb-9 flex flex-wrap items-center gap-4 text-xs font-bold tracking-[0.06em] uppercase">
            <span className="border-2 border-black bg-[#e8fc39] px-3 py-2 shadow-[3px_3px_0_0_#000]">Your local observability tool</span>
            <span className="font-mono">qyl / v{versionOf("qyl")}</span>
          </div>
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <h1 id="neo-title" className="max-w-3xl text-[clamp(3.65rem,8vw,7.25rem)] leading-[0.92] font-black tracking-[-0.065em]">Debug with<br />receipts.</h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed font-medium sm:text-xl">Your agent has the code. Give it the traces, logs, and metrics that explain what happened.</p>
              <p className="mt-4 max-w-lg text-base leading-relaxed font-medium text-[#4a4a43]">qyl collects OpenTelemetry locally in DuckDB and puts the evidence within reach of your coding agent through MCP.</p>
              <div className="mt-8 flex flex-wrap gap-5">
                <a href="/docs/getting-started/" className={`${button} bg-[#e8fc39]`}>Run qyl locally <Terminal size={18} strokeWidth={2.5} aria-hidden="true" /></a>
                <a href="/docs/mcp/" className={`${button} bg-[#fafaf5]`}>Connect your agent <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" /></a>
              </div>
              <a href="#how-it-works" className={`${link} mt-8 text-sm`}><ArrowDown size={16} strokeWidth={2.5} aria-hidden="true" /> Follow the evidence</a>
            </div>
            <div className="border-[3px] border-black bg-[#fafaf5] shadow-[8px_8px_0_0_#000] lg:col-span-5 lg:mt-13">
              <div className="flex items-center justify-between gap-3 border-b-[3px] border-black bg-[#e8fc39] px-5 py-4"><span className="font-mono text-sm font-bold">01 / START HERE</span><Terminal size={22} strokeWidth={2.5} aria-hidden="true" /></div>
              <div data-command-panel="" className="bg-[#111111] p-5 text-[#fafaf5] sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-3 text-xs"><span className="font-mono text-[#d5d5c9]">terminal</span><button type="button" data-copy-command={command} aria-label="Copy qyl install commands" className="flex min-h-11 items-center gap-2 border-2 border-[#fafaf5] px-3 py-2 font-bold text-[#fafaf5] hover:bg-[#fafaf5] hover:text-black focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#e8fc39]"><Copy size={14} strokeWidth={2.5} aria-hidden="true" /><span data-copy-label="">Copy</span></button></div>
                <pre className="overflow-x-auto font-mono text-[13px] leading-8 sm:text-sm"><code><span className="text-[#e8fc39]">$ </span>dotnet tool install --global qyl{"\n"}<span className="text-[#e8fc39]">$ </span>qyl up</code></pre>
                <div aria-live="polite" data-copy-status="" className="mt-4 min-h-4 font-mono text-xs text-[#e8fc39]" />
              </div>
              <div className="border-t-[3px] border-black px-5 py-6 sm:px-6"><p className="mb-4 text-sm font-extrabold">Then open your local dashboard.</p><code className="break-all font-mono text-sm font-semibold">http://127.0.0.1:5100</code><div className="mt-6 flex items-center gap-2 border-t-2 border-black pt-4 text-xs font-bold"><Check size={17} strokeWidth={3} aria-hidden="true" /> Collector + dashboard included</div></div>
            </div>
          </div>
        </section>
        <div className="border-y-[3px] border-black bg-[#e8fc39]" aria-label="qyl architecture"><div className="mx-auto grid max-w-[1280px] grid-cols-2 px-5 text-center text-sm font-black tracking-[-0.02em] sm:px-8 sm:text-base md:grid-cols-4">{["OPENTELEMETRY IN", "DUCKDB STORAGE", "MCP TO YOUR AGENT", "YOUR MACHINE"].map((item, index) => <div key={item} className={`py-5 ${index > 0 ? "md:border-l-[3px] md:border-black" : ""}`}>{item}</div>)}</div></div>
        <section id="how-it-works" aria-labelledby="neo-evidence" className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="mb-10 grid gap-5 md:grid-cols-12"><div className="md:col-span-8"><span className="font-mono text-xs font-bold uppercase">02 / A shorter investigation</span><h2 id="neo-evidence" className="mt-4 max-w-2xl text-4xl leading-none font-black tracking-[-0.045em] sm:text-5xl">Less dashboard tourism.<br />More evidence.</h2></div><p className="max-w-md self-end text-base leading-relaxed font-medium md:col-span-4">Keep humans and agents on the same facts. From the request that failed to the span that explains why.</p></div>
          <div className="grid gap-7 lg:grid-cols-12">
            <article className="border-[3px] border-black bg-[#e8fc39] p-6 shadow-[6px_6px_0_0_#000] sm:p-8 lg:col-span-7">
              <div className="flex items-start justify-between gap-5"><span className="font-mono text-sm font-bold">01 → COLLECT</span><CornerDownRight size={32} strokeWidth={3} aria-hidden="true" /></div>
              <h3 className="mt-10 max-w-sm text-4xl leading-none font-extrabold tracking-[-0.04em]">Your stack.<br />One receiver.</h3><p className="mt-5 max-w-lg text-base leading-relaxed font-medium">Point a compliant OpenTelemetry SDK at qyl. Traces, logs, and metrics land in a local DuckDB store with explicit retention.</p>
              <div className="mt-8 border-y-[3px] border-black py-5 font-mono text-xs font-bold leading-7 sm:text-sm"><p>OTLP / HTTP → 127.0.0.1:4318</p><p>OTLP / gRPC → 127.0.0.1:4317</p></div><a href="/docs/telemetry/" className={`${link} mt-4 text-sm`}>See ingestion details <ArrowRight size={17} strokeWidth={2.5} aria-hidden="true" /></a>
            </article>
            <article className="border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000] sm:p-8 lg:col-span-5 lg:mt-10"><span className="font-mono text-sm font-bold">02 → INVESTIGATE</span><h3 className="mt-10 text-4xl leading-none font-extrabold tracking-[-0.04em]">Ask the agent.<br />Keep the proof.</h3><p className="mt-5 text-base leading-relaxed font-medium">List traces, inspect a complete span tree, search related logs, and open an MCP App when you need a closer look.</p><div className="mt-8 space-y-3 border-y-[3px] border-black py-5 font-mono text-sm font-bold"><p>list_traces</p><p>get_trace</p><p>display_traces</p></div><a href="/product/tracing/" className={`${link} mt-4 text-sm`}>Explore tracing <ArrowRight size={17} strokeWidth={2.5} aria-hidden="true" /></a></article>
          </div>
        </section>
        <section aria-labelledby="neo-signal" className="border-y-[3px] border-black"><div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:py-20"><div className="lg:col-span-5"><span className="font-mono text-xs font-bold uppercase">03 / Follow every signal</span><h2 id="neo-signal" className="mt-4 max-w-md text-4xl leading-none font-black tracking-[-0.045em] sm:text-5xl">The whole run.<br />In context.</h2><p className="mt-6 max-w-sm text-base leading-relaxed font-medium">Read the product details for each evidence path. Errors stay errors. Demo data is always explicit.</p></div><div className="lg:col-span-7">{productNavigation.map(({ href, label }, index) => <a href={href} key={href} className="group flex min-h-18 items-center justify-between gap-5 border-b-[3px] border-black py-5 font-extrabold first:border-t-[3px] hover:bg-[#e8fc39] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black"><span className="flex items-center gap-5"><span className="font-mono text-xs">0{index + 1}</span><span className="text-xl sm:text-2xl">{label}</span></span><ArrowRight size={24} strokeWidth={2.5} className="transition-transform duration-100 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" /></a>)}</div></div></section>
        <section aria-labelledby="neo-start" className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:py-24"><div className="grid gap-8 border-[3px] border-black bg-[#e8fc39] p-6 shadow-[8px_8px_0_0_#000] sm:p-10 lg:grid-cols-12"><div className="lg:col-span-8"><span className="font-mono text-xs font-bold uppercase">One plan. Every shipped feature.</span><h2 id="neo-start" className="mt-5 text-5xl leading-none font-black tracking-[-0.05em] sm:text-6xl">Local. Useful. Free.</h2><p className="mt-5 max-w-xl text-base leading-relaxed font-medium">The native collector, embedded dashboard, and MCP workbench are included. Your local setup works without a hosted account.</p></div><div className="flex flex-col items-start justify-end gap-4 lg:col-span-4 lg:items-end"><a href="/docs/getting-started/" className={`${button} bg-[#fafaf5]`}>Start locally <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" /></a><a href="/pricing/" className={`${link} text-sm`}>Read the pricing details</a></div></div></section>
      </main>
      <footer className="border-t-[3px] border-black"><div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between"><div><a href="/" className="text-5xl leading-none font-black tracking-[-0.08em] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black" aria-label="qyl home">qyl↗</a><p className="mt-4 font-mono text-xs font-semibold">Local signals. Shared context.</p></div><nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm"><a href="/docs/" className={link}>Documentation</a><a href={externalLinks.github} className={link}>GitHub <ArrowRight size={14} aria-hidden="true" /></a><a href="/faq/" className={link}>FAQ</a><a href="/privacy/" className={link}>Privacy</a></nav><span className="font-mono text-xs font-bold">qyl {versionOf("qyl")}</span></div></footer>
    </div>
  );
}
