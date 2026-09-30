"use client";

import { ArrowRight, ArrowUpRight, Copy } from "lucide-react";
import { externalLinks, primaryNavigation, productNavigation, versionOf } from "../../data/site";

// Bauhaus direction: primary red, yellow and blue geometry on a strict modular grid.
// Circle = signal in, square = storage, triangle = the agent's question.
// Static SSR; the host progressively enhances the command's copy button.
const command = "dotnet tool install --global qyl\nqyl up";
const focus = "focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#111111]";
const focusOnColor = "focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2c80f]";
const link = `inline-flex min-h-11 items-center gap-2 font-bold underline-offset-4 hover:underline ${focus}`;
const button = "inline-flex min-h-12 items-center justify-center gap-3 px-6 py-3 text-sm font-bold tracking-[0.04em] lowercase transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0";
const label = "font-mono text-xs font-bold tracking-[0.14em] uppercase";
const triangle = "[clip-path:polygon(50%_0,100%_100%,0_100%)]";
const shapes = ["rounded-full bg-[#c8102e]", "bg-[#1d3f94]", `bg-[#f2c80f] ${triangle}`];
const stages = [
  { mark: "rounded-full bg-[#c8102e]", tone: "bg-[#c8102e] text-white", step: "01 / in", title: "OpenTelemetry", text: "Point a compliant SDK at qyl. OTLP over HTTP on 4318, gRPC on 4317." },
  { mark: "bg-[#111111]", tone: "bg-[#f2c80f] text-[#111111]", step: "02 / at", title: "Local DuckDB", text: "Traces, logs and metrics land in one local store with explicit retention." },
  { mark: `bg-[#f2c80f] ${triangle}`, tone: "bg-[#1d3f94] text-white", step: "03 / out", title: "MCP to your agent", text: "Your coding agent queries the same evidence you inspect in the dashboard." },
];

export default function Bauhaus() {
  return (
    <div className="min-h-screen bg-[#f4efe6] font-[Futura,Avenir_Next,Avenir,Century_Gothic,Arial,sans-serif] text-[#111111] selection:bg-[#f2c80f] selection:text-[#111111]">
      <a href="#main" className={`sr-only fixed top-3 left-3 z-50 bg-[#f2c80f] p-4 font-bold focus:not-sr-only ${focus}`}>Skip to content</a>
      <header className="border-b-4 border-[#111111]">
        <div className="mx-auto flex min-h-20 max-w-[1280px] items-center justify-between gap-5 px-5 sm:px-8">
          <a href="/" aria-label="qyl home" className={`flex items-center gap-3 ${focus}`}>
            <span className="flex items-end gap-1" aria-hidden="true"><span className="size-5 rounded-full bg-[#c8102e]" /><span className="size-5 bg-[#1d3f94]" /><span className={`size-5 bg-[#f2c80f] ${triangle}`} /></span>
            <span className="text-4xl leading-none font-bold tracking-[-0.06em]">qyl</span>
          </a>
          <nav aria-label="Main navigation" className="flex items-center gap-6 text-sm lowercase">
            {primaryNavigation.map(({ href, label: text }) => <a key={href} href={href} className={`${link} ${text === "Docs" ? "" : "max-md:hidden"}`}>{text}</a>)}
            <a href="/docs/getting-started/" className={`${button} bg-[#c8102e] text-white max-sm:hidden ${focus}`}>start locally <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" /></a>
          </nav>
        </div>
      </header>
      <main id="main">
        <section aria-labelledby="bauhaus-title" className="mx-auto grid max-w-[1280px] gap-10 px-5 pt-12 pb-16 sm:px-8 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-24">
          <div className="lg:col-span-7">
            <p className={`${label} mb-8 flex flex-wrap items-center gap-3`}><span className="size-3 rounded-full bg-[#c8102e]" aria-hidden="true" />Local observability <span aria-hidden="true">/</span> qyl {versionOf("qyl")}</p>
            <h1 id="bauhaus-title" className="text-[clamp(3.4rem,8.5vw,7.5rem)] leading-[0.9] font-bold tracking-[-0.055em] lowercase">Form<br />follows<br /><span className="text-[#c8102e]">signal.</span></h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed">Traces, logs and metrics, collected on your machine. qyl stores them in DuckDB and hands the evidence to your coding agent through MCP.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="/docs/getting-started/" className={`${button} bg-[#c8102e] text-white ${focus}`}>run qyl locally <ArrowRight size={17} strokeWidth={2.5} aria-hidden="true" /></a>
              <a href="/docs/mcp/" className={`${button} border-4 border-[#111111] ${focus}`}>connect your agent <ArrowUpRight size={17} strokeWidth={2.5} aria-hidden="true" /></a>
            </div>
          </div>
          <div className="lg:col-span-5">
            <figure aria-labelledby="bauhaus-figure" className="grid grid-cols-2 border-4 border-[#111111]">
              <div className="flex aspect-square items-center justify-center border-r-4 border-b-4 border-[#111111] bg-[#f4efe6] p-6"><span className="size-full rounded-full bg-[#c8102e] transition-transform duration-300 hover:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100" aria-hidden="true" /></div>
              <div className="flex aspect-square flex-col justify-between border-b-4 border-[#111111] bg-[#1d3f94] p-5 text-white"><span className={label}>Store</span><span className="text-2xl leading-none font-bold tracking-[-0.03em] lowercase">duckdb, local.</span></div>
              <div className="flex aspect-square flex-col justify-between border-r-4 border-[#111111] bg-[#f2c80f] p-5"><span className={label}>Ask</span><span className="text-2xl leading-none font-bold tracking-[-0.03em] lowercase">mcp, for the agent.</span></div>
              <div className="flex aspect-square items-end justify-center bg-[#f4efe6] p-6"><span className={`h-[86%] w-full bg-[#111111] ${triangle}`} aria-hidden="true" /></div>
              <figcaption id="bauhaus-figure" className={`${label} col-span-2 border-t-4 border-[#111111] bg-white px-5 py-3`}>Fig. 1: three forms, one loop</figcaption>
            </figure>
          </div>
          <div data-command-panel="" className="bg-[#111111] text-white lg:col-span-7">
            <div className="flex items-center justify-between gap-4 border-b-4 border-[#c8102e] px-5 py-3">
              <span className={`${label} text-[#f2c80f]`}>Two commands</span>
              <button type="button" data-copy-command={command} aria-label="Copy qyl install commands" className={`inline-flex min-h-11 items-center gap-2 border-2 border-white px-3 text-xs font-bold hover:bg-white hover:text-[#111111] ${focusOnColor}`}><Copy size={14} strokeWidth={2.5} aria-hidden="true" /><span data-copy-label="">Copy</span></button>
            </div>
            <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-8 sm:text-sm"><code><span className="text-[#f2c80f]">$ </span>dotnet tool install --global qyl{"\n"}<span className="text-[#f2c80f]">$ </span>qyl up</code></pre>
            <div aria-live="polite" data-copy-status="" className="min-h-4 px-5 pb-4 font-mono text-xs text-[#f2c80f]" />
          </div>
          <div className="flex flex-col justify-center border-4 border-[#111111] bg-white p-5 lg:col-span-5">
            <p className={label}>Then open the dashboard</p>
            <code className="mt-3 font-mono text-lg font-bold break-all">http://127.0.0.1:5100</code>
            <p className="mt-3 text-sm text-[#4a4a4a]">Collector and dashboard included. No hosted account needed.</p>
          </div>
        </section>
        <section aria-labelledby="bauhaus-method" className="border-y-4 border-[#111111]">
          <h2 id="bauhaus-method" className="sr-only">From signal to answer</h2>
          <div className="mx-auto grid max-w-[1280px] md:grid-cols-3">
            {stages.map(({ mark, tone, step, title, text }, index) => <article key={step} className={`${tone} p-6 sm:p-8 ${index > 0 ? "border-t-4 border-[#111111] md:border-t-0 md:border-l-4" : ""}`}>
              <div className="flex items-start justify-between gap-4"><span className={label}>{step}</span><span className={`size-10 ${mark} ${index === 0 ? "ring-4 ring-white" : ""}`} aria-hidden="true" /></div>
              <h3 className="mt-10 text-3xl leading-none font-bold tracking-[-0.04em] lowercase">{title}</h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed">{text}</p>
            </article>)}
          </div>
        </section>
        <section aria-labelledby="bauhaus-evidence" className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-5">
            <p className={`${label} mb-5`}>The workshop</p>
            <h2 id="bauhaus-evidence" className="text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] font-bold tracking-[-0.05em] lowercase">less decoration.<br /><span className="text-[#1d3f94]">more evidence.</span></h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#4a4a4a]">Every element on a trace has a job. Follow the request that failed down to the span that explains why, and keep the proof next to the answer.</p>
            <a href="/docs/telemetry/" className={`${link} mt-6 text-sm lowercase`}>see ingestion details <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" /></a>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
            <article className="border-4 border-[#111111] bg-white p-6">
              <span className="block size-12 rounded-full bg-[#c8102e]" aria-hidden="true" />
              <h3 className="mt-8 text-2xl font-bold tracking-[-0.03em] lowercase">collect once</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4a4a4a]">One receiver for your whole stack.</p>
              <p className="mt-5 border-t-4 border-[#111111] pt-4 font-mono text-xs leading-6 font-bold">OTLP / HTTP → 127.0.0.1:4318<br />OTLP / gRPC → 127.0.0.1:4317</p>
            </article>
            <article className="border-4 border-[#111111] bg-white p-6 sm:mt-12">
              <span className={`block size-12 bg-[#f2c80f] ${triangle}`} aria-hidden="true" />
              <h3 className="mt-8 text-2xl font-bold tracking-[-0.03em] lowercase">ask precisely</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4a4a4a]">List traces, read a complete span tree, open an MCP App when you want to look closer.</p>
              <p className="mt-5 border-t-4 border-[#111111] pt-4 font-mono text-xs leading-6 font-bold">list_traces<br />get_trace<br />display_traces</p>
            </article>
          </div>
        </section>
        <section aria-labelledby="bauhaus-signals" className="border-t-4 border-[#111111] bg-white">
          <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:py-20">
            <div className="lg:col-span-4"><p className={`${label} mb-5`}>Index of signals</p><h2 id="bauhaus-signals" className="text-4xl leading-none font-bold tracking-[-0.05em] lowercase">every path,<br />one grid.</h2><p className="mt-5 max-w-sm text-base leading-relaxed text-[#4a4a4a]">Errors stay errors. Demo data is always explicit.</p></div>
            <ol className="lg:col-span-8">
              {productNavigation.map(({ href, label: text }, index) => <li key={href}><a href={href} className={`group flex min-h-18 items-center justify-between gap-5 border-b-4 border-[#111111] py-4 hover:bg-[#f2c80f] ${index === 0 ? "border-t-4" : ""} ${focus}`}>
                <span className="flex items-center gap-5"><span className={`size-6 shrink-0 ${shapes[index % shapes.length]}`} aria-hidden="true" /><span className="font-mono text-xs font-bold">0{index + 1}</span><span className="text-xl font-bold lowercase sm:text-2xl">{text}</span></span>
                <ArrowRight size={24} strokeWidth={2.5} className="shrink-0 transition-transform duration-150 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
              </a></li>)}
            </ol>
          </div>
        </section>
        <section aria-labelledby="bauhaus-start" className="bg-[#1d3f94] text-white">
          <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
            <div className="lg:col-span-8">
              <p className={`${label} mb-5 text-[#f2c80f]`}>One plan. Every shipped feature.</p>
              <h2 id="bauhaus-start" className="text-[clamp(2.6rem,6vw,5rem)] leading-[0.92] font-bold tracking-[-0.055em] lowercase">local. complete.<br />free to run.</h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed">The native collector, embedded dashboard and MCP workbench are included. Your local setup works without a hosted account.</p>
            </div>
            <div className="flex flex-col items-start gap-5 lg:col-span-4 lg:items-end">
              <div className="flex gap-3" aria-hidden="true"><span className="size-14 rounded-full bg-[#c8102e]" /><span className="size-14 bg-white" /><span className={`size-14 bg-[#f2c80f] ${triangle}`} /></div>
              <a href="/docs/getting-started/" className={`${button} bg-[#f2c80f] text-[#111111] ${focusOnColor}`}>start locally <ArrowRight size={17} strokeWidth={2.5} aria-hidden="true" /></a>
              <a href="/pricing/" className={`inline-flex min-h-11 items-center gap-2 text-sm font-bold lowercase underline underline-offset-4 ${focusOnColor}`}>read the pricing details</a>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t-4 border-[#111111]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div><a href="/" aria-label="qyl home" className={`text-5xl leading-none font-bold tracking-[-0.07em] ${focus}`}>qyl</a><p className={`${label} mt-4`}>Form follows signal.</p></div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-sm lowercase"><a href="/docs/" className={link}>documentation</a><a href={externalLinks.github} className={link}>github <ArrowUpRight size={14} aria-hidden="true" /></a><a href="/faq/" className={link}>faq</a><a href="/privacy/" className={link}>privacy</a></nav>
          <span className="font-mono text-xs font-bold">qyl {versionOf("qyl")}</span>
        </div>
      </footer>
    </div>
  );
}
