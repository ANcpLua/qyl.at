"use client";

import { Activity, ArrowRight, Bot, Check, Copy, Database, Layers } from "lucide-react";
import type { ReactNode } from "react";
import { externalLinks, primaryNavigation, productNavigation, versionOf } from "../../data/site";

// Soft Glass: pastel light, frosted translucent panels and generous radii.
// Every surface is near-white glass over a fixed pastel wash, so text contrast
// holds on the lightest and the most saturated part of the gradient alike.
// Static SSR; the host progressively enhances the command's copy button.
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5b3fd1]";
const glass = "border border-white/80 bg-white/70 shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset,0_24px_60px_-28px_rgba(76,60,160,0.35)] backdrop-blur-xl";
const primary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#5b3fd1] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(91,63,209,0.7)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#4c32bd] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${focus}`;
const secondary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#1e1b3a] transition duration-300 hover:bg-white motion-reduce:transition-none ${glass} ${focus}`;
const link = `inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#5b3fd1] hover:underline underline-offset-4 ${focus}`;
const wash = "bg-[#f7f5ff] bg-[radial-gradient(60%_45%_at_8%_0%,#ffd9ec_0%,transparent_70%),radial-gradient(55%_45%_at_95%_8%,#d6e4ff_0%,transparent_70%),radial-gradient(60%_40%_at_50%_100%,#dcf5ec_0%,transparent_70%)]";
const command = "dotnet tool install --global qyl\nqyl up";

function Chip({ children, tint }: { children: ReactNode; tint: string }) {
  return <span aria-hidden="true" className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${tint}`}>{children}</span>;
}

export default function SoftGlass() {
  return (
    <div className={`min-h-screen font-sans text-[#1e1b3a] antialiased selection:bg-[#e0d4ff] selection:text-[#1e1b3a] ${wash}`}>
      <a href="#main" className={`sr-only z-50 rounded-full bg-white p-4 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${focus}`}>Skip to content</a>
      <header className="px-4 pt-4 sm:px-6">
        <div className={`mx-auto flex max-w-[1120px] items-center justify-between gap-4 rounded-full py-2 pl-5 pr-2 ${glass}`}>
          <a href="/" aria-label="qyl home" className={`flex min-h-11 items-center gap-2 text-2xl font-semibold tracking-[-0.05em] ${focus}`}><span aria-hidden="true" className="size-3 rounded-full bg-[linear-gradient(135deg,#ff9ac9,#8f7bff,#6fd6b5)]" />qyl</a>
          <nav aria-label="Main navigation" className="flex items-center gap-1 text-sm text-[#4a4766]">
            {primaryNavigation.map(({ href, label }) => <a key={href} href={href} className={`${label === "Docs" ? "inline-flex" : "hidden md:inline-flex"} min-h-11 items-center rounded-full px-4 hover:bg-white/80 hover:text-[#1e1b3a] ${focus}`}>{label}</a>)}
            <a href="/docs/getting-started/" className={`${primary} ml-2 max-sm:hidden`}>Start locally</a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section aria-labelledby="glass-title" className="mx-auto max-w-[1120px] px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className={`mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#5b3fd1] ${glass}`}><Layers size={14} aria-hidden="true" /> Local observability · qyl {versionOf("qyl")}</p>
            <h1 id="glass-title" className="mt-8 text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.055em]">Clear, light,<br /><span className="text-[#5b3fd1]">layered.</span></h1>
            <p className="mx-auto mt-7 max-w-[40ch] text-lg leading-relaxed text-[#4a4766] sm:text-xl">Your traces, logs and metrics, collected locally and laid out in calm, readable layers. Ready for you and for your coding agent.</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3"><a href="/docs/getting-started/" className={primary}>Run qyl locally <ArrowRight size={16} aria-hidden="true" /></a><a href="/docs/mcp/" className={secondary}>Connect your agent</a></div>
          </div>

          <div className="mt-16 grid items-start gap-5 lg:mt-20 lg:grid-cols-12">
            <div data-command-panel="" className={`rounded-[28px] p-5 sm:p-7 lg:col-span-7 ${glass}`}>
              <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4a4766]">Start here</span><button type="button" data-copy-command={command} aria-label="Copy qyl install commands" className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#1e1b3a] shadow-sm hover:bg-[#f1ecff] ${focus}`}><Copy size={15} aria-hidden="true" /><span data-copy-label="">Copy</span></button></div>
              <pre className="mt-5 overflow-x-auto rounded-2xl bg-white/80 p-5 font-mono text-[13px] leading-8 sm:text-sm"><code><span className="text-[#5b3fd1]">$ </span>dotnet tool install --global qyl{"\n"}<span className="text-[#5b3fd1]">$ </span>qyl up</code></pre>
              <div className="mt-5 flex flex-col gap-2 text-sm text-[#4a4766] sm:flex-row sm:items-center sm:justify-between"><span>Then open <code className="break-all font-mono font-semibold text-[#1e1b3a]">http://127.0.0.1:5100</code></span><span aria-live="polite" data-copy-status="" className="min-h-5 font-semibold text-[#5b3fd1]" /></div>
            </div>
            <div role="group" aria-label="Signal layers" className="relative lg:col-span-5">
              {[
                ["Traces", "The whole request, span by span.", "bg-[#ffe3f0]", "", Activity],
                ["Logs", "Records correlated with that request.", "bg-[#e3e9ff]", "lg:ml-6", Layers],
                ["Metrics", "A time window, bucket by bucket.", "bg-[#dcf5ec]", "lg:ml-12", Database],
              ].map(([title, copy, tint, offset, Icon], index) => {
                const Glyph = Icon as typeof Activity;
                return <div key={title as string} className={`flex items-center gap-4 rounded-3xl p-5 ${glass} ${offset as string} ${index > 0 ? "mt-3 lg:-mt-2" : ""}`}><Chip tint={tint as string}><Glyph size={20} className="text-[#1e1b3a]" /></Chip><div><p className="font-semibold">{title as string}</p><p className="text-sm text-[#4a4766]">{copy as string}</p></div></div>;
              })}
            </div>
          </div>
        </section>

        <section aria-labelledby="glass-layers" className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5b3fd1]">How it fits together</p><h2 id="glass-layers" className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-5xl">Three layers.<br />One clear picture.</h2></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ["Collect", "Point any OpenTelemetry SDK at qyl. Standard OTLP, nothing proprietary.", ["OTLP / HTTP → 127.0.0.1:4318", "OTLP / gRPC → 127.0.0.1:4317"], "bg-[#ffe3f0]", Activity, "/docs/telemetry/", "Ingestion details"],
              ["Store", "Traces, logs and metrics land in one local DuckDB store with explicit retention.", ["Local DuckDB", "Your machine only"], "bg-[#e3e9ff]", Database, "/product/metrics/", "Explore metrics"],
              ["Investigate", "Your coding agent reads the same evidence you do, over MCP.", ["list_traces", "get_trace", "display_traces"], "bg-[#dcf5ec]", Bot, "/docs/mcp/", "Set up MCP"],
            ].map(([title, copy, lines, tint, Icon, href, cta]) => {
              const Glyph = Icon as typeof Activity;
              return (
                <article key={title as string} className={`flex flex-col rounded-[28px] p-6 sm:p-7 ${glass}`}>
                  <Chip tint={tint as string}><Glyph size={20} className="text-[#1e1b3a]" /></Chip>
                  <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">{title as string}</h3>
                  <p className="mt-3 leading-relaxed text-[#4a4766]">{copy as string}</p>
                  <ul className="mt-6 space-y-2 rounded-2xl bg-white/80 p-4 font-mono text-[13px]">{(lines as string[]).map((line) => <li key={line} className="flex items-center gap-2 break-all"><Check size={14} className="shrink-0 text-[#12795a]" aria-hidden="true" />{line}</li>)}</ul>
                  <a href={href as string} className={`${link} mt-auto pt-5`}>{cta as string} <ArrowRight size={15} aria-hidden="true" /></a>
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="glass-paths" className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 lg:py-28">
          <div className={`grid gap-10 rounded-[36px] p-6 sm:p-10 lg:grid-cols-12 ${glass}`}>
            <div className="lg:col-span-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5b3fd1]">Every signal</p><h2 id="glass-paths" className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.045em]">See each layer up close.</h2><p className="mt-5 max-w-[36ch] leading-relaxed text-[#4a4766]">Read the detail behind each evidence path. Errors stay errors, and demo data is always labelled.</p></div>
            <nav aria-label="Product details" className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
              {productNavigation.map(({ href, label }) => <a key={href} href={href} className={`group flex min-h-16 items-center justify-between gap-4 rounded-2xl bg-white/80 px-5 font-semibold transition duration-300 hover:bg-white motion-reduce:transition-none ${focus}`}>{label}<ArrowRight size={18} className="text-[#5b3fd1] transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" aria-hidden="true" /></a>)}
            </nav>
          </div>
        </section>

        <section aria-labelledby="glass-start" className="mx-auto max-w-[1120px] px-4 pb-24 pt-8 sm:px-6 lg:pb-32">
          <div className="rounded-[36px] bg-[linear-gradient(135deg,#ffd9ec,#e0d4ff,#d6f3e8)] p-px">
            <div className="rounded-[35px] bg-white/75 px-6 py-14 text-center backdrop-blur-xl sm:px-12 sm:py-20">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5b3fd1]">One plan. Every shipped feature.</p>
              <h2 id="glass-start" className="mt-4 text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-none tracking-[-0.05em]">Local. Free. Calm.</h2>
              <p className="mx-auto mt-6 max-w-[42ch] leading-relaxed text-[#4a4766]">The native collector, embedded dashboard and MCP workbench are included. Your local setup works without a hosted account.</p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3"><a href="/docs/getting-started/" className={primary}>Start locally <ArrowRight size={16} aria-hidden="true" /></a><a href="/pricing/" className={secondary}>Read the pricing details</a></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 pb-6 sm:px-6">
        <div className={`mx-auto flex max-w-[1120px] flex-col gap-6 rounded-[28px] px-6 py-8 md:flex-row md:items-center md:justify-between ${glass}`}>
          <div><a href="/" aria-label="qyl home" className={`inline-flex min-h-11 items-center gap-2 text-2xl font-semibold tracking-[-0.05em] ${focus}`}><span aria-hidden="true" className="size-3 rounded-full bg-[linear-gradient(135deg,#ff9ac9,#8f7bff,#6fd6b5)]" />qyl</a><p className="text-sm text-[#4a4766]">Local signals. Shared context.</p></div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-[#4a4766]"><a href="/docs/" className={`inline-flex min-h-11 items-center rounded-full px-3 hover:bg-white/80 ${focus}`}>Documentation</a><a href={externalLinks.github} className={`inline-flex min-h-11 items-center rounded-full px-3 hover:bg-white/80 ${focus}`}>GitHub</a><a href="/faq/" className={`inline-flex min-h-11 items-center rounded-full px-3 hover:bg-white/80 ${focus}`}>FAQ</a><a href="/privacy/" className={`inline-flex min-h-11 items-center rounded-full px-3 hover:bg-white/80 ${focus}`}>Privacy</a></nav>
          <span className="font-mono text-xs text-[#4a4766]">qyl {versionOf("qyl")}</span>
        </div>
      </footer>
    </div>
  );
}
