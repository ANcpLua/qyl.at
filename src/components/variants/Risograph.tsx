"use client";

import { ArrowRight, ArrowUpRight, Copy, Scissors } from "lucide-react";
import { externalLinks, primaryNavigation, productNavigation, versionOf } from "../../data/site";

// Risograph direction: two fluorescent inks overprinted on cream stock, halftone
// and grain, zine energy. Fluorescent pink and blue are for shapes only; text uses
// the dark ink tones so every line keeps AA contrast.
// Static SSR; the host progressively enhances the command's copy button.
const command = "dotnet tool install --global qyl\nqyl up";
const focus = "focus-visible:outline-3 focus-visible:outline-dashed focus-visible:outline-offset-4 focus-visible:outline-[#b0165e]";
const link = `inline-flex min-h-11 items-center gap-2 font-bold underline decoration-2 decoration-[#ff48b0] underline-offset-4 hover:decoration-[#0078bf] ${focus}`;
const display = "font-[Impact,Haettenschweiler,Arial_Narrow_Bold,Arial_Black,sans-serif] uppercase tracking-[0.01em]";
const mono = "font-mono text-xs font-bold tracking-[0.12em] uppercase";
const halftone = "[background-image:radial-gradient(#0078bf_1.2px,transparent_1.4px)] [background-size:7px_7px]";
const halftonePink = "[background-image:radial-gradient(#ff48b0_1.4px,transparent_1.6px)] [background-size:8px_8px]";
const tilt = "motion-safe:transition-transform motion-safe:duration-200 motion-reduce:transform-none";
const pages = [
  { no: "p. 02", title: "Collect", text: "Point any compliant OpenTelemetry SDK at qyl. Traces, logs and metrics land in local DuckDB with explicit retention.", detail: ["OTLP / HTTP → 127.0.0.1:4318", "OTLP / gRPC → 127.0.0.1:4317"], href: "/docs/telemetry/", cta: "Ingestion details", ink: "bg-[#ff48b0]", turn: "-rotate-1" },
  { no: "p. 03", title: "Investigate", text: "Your agent lists traces, reads the complete span tree and searches related logs. Open an MCP App for a closer look.", detail: ["list_traces", "get_trace", "display_traces"], href: "/product/tracing/", cta: "Explore tracing", ink: "bg-[#0078bf]", turn: "rotate-1" },
];

function Grain({ id }: { id: string }) {
  return <svg className="pointer-events-none absolute inset-0 size-full opacity-25 mix-blend-multiply" aria-hidden="true" focusable="false">
    <filter id={id}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="100%" height="100%" filter={`url(#${id})`} />
  </svg>;
}

export default function Risograph() {
  return (
    <div className="min-h-screen bg-[#f7f1e3] font-sans text-[#24356f] selection:bg-[#ff48b0] selection:text-[#24356f]">
      <a href="#main" className={`sr-only fixed top-3 left-3 z-50 bg-[#f7f1e3] p-4 font-bold focus:not-sr-only ${focus}`}>Skip to content</a>
      <header className="border-b-2 border-dashed border-[#24356f]">
        <div className="mx-auto flex min-h-20 max-w-[1240px] items-center justify-between gap-5 px-5 sm:px-8">
          <a href="/" aria-label="qyl home" className={`relative text-5xl leading-none ${display} ${focus}`}><span className="[text-shadow:3px_2px_0_#ff48b0]">qyl</span></a>
          <nav aria-label="Main navigation" className="flex items-center gap-6 text-sm">
            {primaryNavigation.map(({ href, label }) => <a key={href} href={href} className={`${link} ${label === "Docs" ? "" : "max-md:hidden"}`}>{label}</a>)}
            <a href="/docs/getting-started/" className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[#24356f] bg-white px-4 font-bold hover:bg-[#ffe3f1] max-sm:hidden ${focus}`}>Start locally <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" /></a>
          </nav>
        </div>
      </header>
      <main id="main">
        <section aria-labelledby="riso-title" className="relative overflow-hidden">
          <Grain id="riso-grain-hero" />
          <div className="relative mx-auto grid max-w-[1240px] gap-12 px-5 pt-12 pb-16 sm:px-8 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-24">
            <div className="lg:col-span-7">
              <p className={`${mono} mb-7 inline-flex -rotate-2 items-center gap-3 bg-white px-3 py-2 text-[#b0165e] shadow-[3px_3px_0_0_#ff48b0]`}>Issue: qyl {versionOf("qyl")} · Local observability</p>
              <h1 id="riso-title" className={`${display} text-[clamp(3.6rem,10vw,8.5rem)] leading-[0.88] [text-shadow:5px_4px_0_#ff48b0]`}>Printed in<br />two inks.</h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed font-medium">Your traces, logs and metrics, pressed onto one local page. qyl collects OpenTelemetry in DuckDB and passes the evidence to your coding agent through MCP.</p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <a href="/docs/getting-started/" className={`inline-flex min-h-13 items-center gap-3 bg-[#24356f] px-6 font-bold text-white shadow-[5px_5px_0_0_#ff48b0] hover:-translate-y-0.5 ${tilt} ${focus}`}>Run qyl locally <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" /></a>
                <a href="/docs/mcp/" className={link}>Connect your agent <ArrowUpRight size={17} strokeWidth={2.5} aria-hidden="true" /></a>
              </div>
            </div>
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto aspect-square w-full max-w-[420px]" aria-hidden="true">
                <span className="absolute top-0 left-0 size-[72%] rounded-full bg-[#ff48b0] opacity-90 mix-blend-multiply" />
                <span className="absolute right-0 bottom-0 size-[72%] bg-[#0078bf] opacity-85 mix-blend-multiply" />
                <span className={`absolute top-[18%] right-[6%] size-[38%] rounded-full ${halftone}`} />
                <span className={`absolute bottom-[8%] left-[4%] size-[34%] ${halftonePink}`} />
              </div>
              <div data-command-panel="" className="relative -mt-24 -rotate-1 border-2 border-[#24356f] bg-white p-5 shadow-[6px_6px_0_0_#0078bf] sm:mx-6 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3"><span className={`${mono} text-[#b0165e]`}>Cut here, paste in terminal</span><button type="button" data-copy-command={command} aria-label="Copy qyl install commands" className={`inline-flex min-h-11 shrink-0 items-center gap-2 border-2 border-[#24356f] px-3 text-xs font-bold hover:bg-[#ffe3f1] ${focus}`}><Copy size={14} strokeWidth={2.5} aria-hidden="true" /><span data-copy-label="">Copy</span></button></div>
                <pre className="overflow-x-auto border-y-2 border-dashed border-[#24356f] py-4 font-mono text-[13px] leading-8 sm:text-sm"><code><span className="text-[#b0165e]">$ </span>dotnet tool install --global qyl{"\n"}<span className="text-[#b0165e]">$ </span>qyl up</code></pre>
                <p className="mt-4 text-sm font-medium">Then open <code className="font-mono font-bold break-all">http://127.0.0.1:5100</code></p>
                <div aria-live="polite" data-copy-status="" className="mt-2 min-h-4 font-mono text-xs text-[#b0165e]" />
              </div>
            </div>
          </div>
        </section>
        <div className="border-y-2 border-[#24356f] bg-[#ffe3f1]" aria-label="qyl architecture">
          <p className={`${display} mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 py-4 text-xl sm:text-2xl`}>
            {["OpenTelemetry in", "DuckDB storage", "MCP to your agent", "Your machine"].map((item, index) => <span key={item} className="flex items-center gap-6">{index > 0 && <span className="size-3 rounded-full bg-[#0078bf]" aria-hidden="true" />}{item}</span>)}
          </p>
        </div>
        <section aria-labelledby="riso-evidence" className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7"><p className={`${mono} mb-4 text-[#b0165e]`}>Inside this issue</p><h2 id="riso-evidence" className={`${display} text-[clamp(2.6rem,6vw,4.75rem)] leading-[0.92] [text-shadow:3px_3px_0_#7fc4ea]`}>Less dashboard tourism.<br />More evidence.</h2></div>
            <p className="max-w-md text-base leading-relaxed font-medium md:col-span-5">Keep humans and agents on the same facts, from the request that failed to the span that explains why.</p>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            {pages.map(({ no, title, text, detail, href, cta, ink: tone, turn }) => <article key={no} className={`relative border-2 border-[#24356f] bg-white p-6 sm:p-8 ${turn} hover:rotate-0 ${tilt}`}>
              <span className={`absolute -top-3 left-8 h-6 w-20 ${tone} opacity-70 mix-blend-multiply`} aria-hidden="true" />
              <div className="flex items-start justify-between gap-4"><span className={`${mono} text-[#b0165e]`}>{no}</span><Scissors size={20} strokeWidth={2.25} aria-hidden="true" /></div>
              <h3 className={`${display} mt-8 text-4xl leading-none sm:text-5xl`}>{title}</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed">{text}</p>
              <p className="mt-6 border-y-2 border-dashed border-[#24356f] py-4 font-mono text-xs leading-6 font-bold sm:text-sm">{detail.map(line => <span key={line} className="block">{line}</span>)}</p>
              <a href={href} className={`${link} mt-4 text-sm`}>{cta} <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" /></a>
            </article>)}
          </div>
        </section>
        <section aria-labelledby="riso-signals" className="relative border-y-2 border-[#24356f] bg-[#eaf5fb]">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:py-20">
            <div className="lg:col-span-5"><p className={`${mono} mb-4 text-[#b0165e]`}>Table of contents</p><h2 id="riso-signals" className={`${display} text-5xl leading-[0.92] sm:text-6xl`}>Every signal,<br />in context.</h2><p className="mt-5 max-w-sm text-base leading-relaxed font-medium">Errors stay errors. Demo data is always explicit.</p></div>
            <ol className="lg:col-span-7">
              {productNavigation.map(({ href, label }, index) => <li key={href}><a href={href} className={`group flex min-h-16 items-center justify-between gap-5 border-b-2 border-dashed border-[#24356f] py-4 hover:bg-white ${index === 0 ? "border-t-2" : ""} ${focus}`}>
                <span className="flex items-baseline gap-5"><span className="font-mono text-xs font-bold text-[#b0165e]">p. 0{index + 4}</span><span className={`${display} text-2xl sm:text-3xl`}>{label}</span></span>
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${index % 2 === 0 ? "bg-[#ff48b0]" : "bg-[#7fc4ea]"} group-hover:-rotate-12 ${tilt}`}><ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" /></span>
              </a></li>)}
            </ol>
          </div>
        </section>
        <section aria-labelledby="riso-start" className="relative overflow-hidden">
          <Grain id="riso-grain-cta" />
          <div className="relative mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-24">
            <div className="relative grid gap-8 border-2 border-[#24356f] bg-[#ffe3f1] p-6 shadow-[8px_8px_0_0_#0078bf] sm:p-10 lg:grid-cols-12">
              <div className="lg:col-span-8"><p className={`${mono} text-[#b0165e]`}>Back cover · one plan, every shipped feature</p><h2 id="riso-start" className={`${display} mt-5 text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.9]`}>Local. Useful. Free.</h2><p className="mt-5 max-w-xl text-base leading-relaxed font-medium">The native collector, embedded dashboard and MCP workbench are included. Your local setup works without a hosted account.</p></div>
              <div className="flex flex-col items-start justify-end gap-4 lg:col-span-4 lg:items-end"><a href="/docs/getting-started/" className={`inline-flex min-h-13 items-center gap-3 bg-[#24356f] px-6 font-bold text-white shadow-[5px_5px_0_0_#ff48b0] hover:-translate-y-0.5 ${tilt} ${focus}`}>Start locally <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" /></a><a href="/pricing/" className={`${link} text-sm`}>Read the pricing details</a></div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t-2 border-dashed border-[#24356f]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div><a href="/" aria-label="qyl home" className={`text-6xl leading-none ${display} [text-shadow:3px_2px_0_#ff48b0] ${focus}`}>qyl</a><p className={`${mono} mt-4`}>Printed locally. Read by your agent.</p></div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm"><a href="/docs/" className={link}>Documentation</a><a href={externalLinks.github} className={link}>GitHub <ArrowUpRight size={14} aria-hidden="true" /></a><a href="/faq/" className={link}>FAQ</a><a href="/privacy/" className={link}>Privacy</a></nav>
          <span className="font-mono text-xs font-bold">qyl {versionOf("qyl")}</span>
        </div>
      </footer>
    </div>
  );
}
