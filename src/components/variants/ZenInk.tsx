"use client";

import { ArrowRight, Copy } from "lucide-react";
import { externalLinks, primaryNavigation, productNavigation, versionOf } from "../../data/site";

// Zen Ink: rice paper, sumi ink and one vermilion seal. Vast negative space,
// hairline rules, a mincho display face from the system and a single brushed
// ensō. Static SSR; the host progressively enhances the command's copy button.
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c23b22]";
const mincho = "font-['Hiragino_Mincho_ProN','Yu_Mincho',Georgia,serif] font-normal";
const link = `inline-flex min-h-11 items-center gap-2 border-b border-[#1b1a17]/25 text-sm tracking-[0.04em] transition-colors duration-700 hover:border-[#c23b22] hover:text-[#c23b22] motion-reduce:transition-none ${focus}`;
const action = `inline-flex min-h-12 items-center justify-center gap-3 bg-[#1b1a17] px-7 py-3 text-sm tracking-[0.08em] text-[#f6f1e7] transition-colors duration-700 hover:bg-[#c23b22] motion-reduce:transition-none ${focus}`;
const command = "dotnet tool install --global qyl\nqyl up";

function Seal({ size = "size-9 text-[11px]" }: { size?: string }) {
  return <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-[3px] bg-[#c23b22] font-semibold tracking-[0.06em] text-[#f6f1e7] ${size}`}>qyl</span>;
}

function Enso() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className="h-auto w-full max-w-[340px] text-[#1b1a17]">
      <path d="M154 58c-14-20-38-32-64-29-38 5-64 40-58 78 6 37 42 62 79 56 34-5 58-35 57-68-1-12-5-22-11-31" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" opacity="0.88" />
      <path d="M150 54c-6-6-12-10-19-13" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export default function ZenInk() {
  return (
    <div className="min-h-screen bg-[#f6f1e7] font-sans text-[#1b1a17] antialiased selection:bg-[#1b1a17] selection:text-[#f6f1e7]">
      <a href="#main" className={`sr-only z-50 bg-[#1b1a17] p-4 text-[#f6f1e7] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${focus}`}>Skip to content</a>
      <header className="mx-auto flex h-20 max-w-[1200px] items-center justify-between gap-6 px-6 md:h-24 md:px-12">
        <a href="/" aria-label="qyl home" className={`flex min-h-11 items-center gap-3 ${focus}`}><Seal /><span className={`${mincho} text-2xl tracking-[0.08em]`}>qyl</span></a>
        <nav aria-label="Main navigation" className="flex items-center gap-6 text-sm tracking-[0.04em] md:gap-10">
          {primaryNavigation.map(({ href, label }) => <a key={href} href={href} className={`${label === "Docs" ? "inline-flex" : "hidden md:inline-flex"} min-h-11 items-center text-[#5c574e] hover:text-[#1b1a17] ${focus}`}>{label}</a>)}
        </nav>
      </header>

      <main id="main">
        <section aria-labelledby="zen-title" className="mx-auto max-w-[1200px] px-6 pb-24 pt-16 md:px-12 md:pb-40 md:pt-32">
          <div className="grid items-center gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="mb-10 text-xs tracking-[0.3em] text-[#5c574e] uppercase">Local observability · qyl {versionOf("qyl")}</p>
              <h1 id="zen-title" className={`${mincho} text-[clamp(3.25rem,8vw,6.75rem)] leading-[1.08] tracking-[0.01em]`}>Only what<br />matters.</h1>
              <p className="mt-10 max-w-[34ch] text-lg leading-[1.9] text-[#5c574e]">Traces, logs and metrics, kept on your machine. Read them yourself, or hand them to your coding agent. Nothing more.</p>
              <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
                <a href="/docs/getting-started/" className={action}>Start locally <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" /></a>
                <a href="/docs/mcp/" className={link}>Connect your agent</a>
              </div>
            </div>
            <div className="flex justify-center lg:col-span-5 lg:justify-end"><Enso /></div>
          </div>

          <div data-command-panel="" className="mt-24 max-w-2xl md:mt-32">
            <div className="flex items-center justify-between gap-4 border-t border-[#1b1a17]/20 pt-5">
              <p className="text-xs tracking-[0.3em] text-[#5c574e] uppercase">Begin</p>
              <button type="button" data-copy-command={command} aria-label="Copy qyl install commands" className={`inline-flex min-h-11 items-center gap-2 px-2 text-sm tracking-[0.04em] text-[#5c574e] hover:text-[#1b1a17] ${focus}`}><Copy size={15} strokeWidth={1.5} aria-hidden="true" /><span data-copy-label="">Copy</span></button>
            </div>
            <pre className="overflow-x-auto py-6 font-mono text-[13px] leading-9 sm:text-[15px]"><code><span className="text-[#c23b22]">$ </span>dotnet tool install --global qyl{"\n"}<span className="text-[#c23b22]">$ </span>qyl up</code></pre>
            <div className="flex flex-col gap-2 border-b border-[#1b1a17]/20 pb-5 text-sm text-[#5c574e] sm:flex-row sm:items-center sm:justify-between">
              <span>Then open <code className="break-all font-mono text-[#1b1a17]">http://127.0.0.1:5100</code></span>
              <span aria-live="polite" data-copy-status="" className="min-h-5 text-[#c23b22]" />
            </div>
          </div>
        </section>

        <section aria-labelledby="zen-strokes" className="border-t border-[#1b1a17]/15">
          <div className="mx-auto max-w-[1200px] px-6 py-24 md:px-12 md:py-40">
            <p className="text-xs tracking-[0.3em] text-[#5c574e] uppercase">Three strokes</p>
            <h2 id="zen-strokes" className={`${mincho} mt-6 max-w-[18ch] text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[1.2]`}>Collect. Keep.<br />Understand.</h2>
            <div className="mt-20 grid gap-16 md:grid-cols-3 md:gap-12">
              {[
                ["一", "Collect", "Point any OpenTelemetry SDK at qyl. Nothing leaves your machine.", ["OTLP / HTTP  127.0.0.1:4318", "OTLP / gRPC  127.0.0.1:4317"], "/docs/telemetry/", "Telemetry path"],
                ["二", "Keep", "Every signal lands in one local DuckDB store, with retention you set.", ["traces · logs · metrics", "local DuckDB"], "/product/logs/", "Read the logs"],
                ["三", "Understand", "Your agent asks through MCP and receives the evidence, not a summary of it.", ["list_traces", "get_trace", "display_traces"], "/product/mcp-evidence/", "MCP evidence"],
              ].map(([mark, title, copy, lines, href, cta]) => (
                <article key={title as string} className="border-t border-[#1b1a17] pt-8">
                  <div className="flex items-baseline justify-between gap-4"><h3 className={`${mincho} text-3xl`}>{title}</h3><span aria-hidden="true" className={`${mincho} text-2xl text-[#c23b22]`}>{mark}</span></div>
                  <p className="mt-6 max-w-[30ch] leading-[1.9] text-[#5c574e]">{copy}</p>
                  <ul className="mt-8 space-y-2 font-mono text-[13px] text-[#1b1a17]">{(lines as string[]).map((line) => <li key={line} className="break-words">{line}</li>)}</ul>
                  <a href={href as string} className={`${link} mt-8`}>{cta as string}</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="zen-trace" className="bg-[#efe8da]">
          <div className="mx-auto grid max-w-[1200px] gap-16 px-6 py-24 md:px-12 md:py-40 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs tracking-[0.3em] text-[#5c574e] uppercase">One request</p>
              <h2 id="zen-trace" className={`${mincho} mt-6 text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[1.2]`}>The trace,<br />and nothing else.</h2>
              <p className="mt-8 max-w-[34ch] leading-[1.9] text-[#5c574e]">Follow a request from its first span to its last. Correlated logs sit beside it. Errors stay errors.</p>
              <a href="/product/tracing/" className={`${link} mt-8`}>Explore tracing</a>
            </div>
            <figure className="lg:col-span-7 lg:pt-4">
              <div className="space-y-7 border-y border-[#1b1a17]/20 py-10">
                {[
                  ["agent.run", "w-full", ""],
                  ["tools/call", "ml-[10%] w-[66%]", "pl-4"],
                  ["search_logs", "ml-[20%] w-[30%]", "pl-8"],
                  ["db.query", "ml-[28%] w-[14%]", "pl-12"],
                ].map(([name, bar, indent]) => <div key={name} className="grid grid-cols-[112px_1fr] items-center gap-5 sm:grid-cols-[160px_1fr]"><span className={`truncate font-mono text-xs sm:text-sm ${indent}`}>{name}</span><div className="h-px bg-[#1b1a17]/15"><div className={`h-[3px] -translate-y-px rounded-full bg-[#1b1a17] ${bar}`} /></div></div>)}
              </div>
              <figcaption className="mt-4 text-xs leading-5 text-[#5c574e]">Illustration, not live data.</figcaption>
            </figure>
          </div>
        </section>

        <section aria-labelledby="zen-paths" className="mx-auto max-w-[1200px] px-6 py-24 md:px-12 md:py-40">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-xs tracking-[0.3em] text-[#5c574e] uppercase">Paths</p>
              <h2 id="zen-paths" className={`${mincho} mt-6 text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[1.2]`}>Walk each signal.</h2>
            </div>
            <nav aria-label="Product details" className="lg:col-span-8">
              {productNavigation.map(({ href, label }) => <a key={href} href={href} className={`group flex min-h-20 items-center justify-between gap-6 border-b border-[#1b1a17]/20 first:border-t ${focus}`}><span className={`${mincho} text-2xl sm:text-3xl`}>{label}</span><span aria-hidden="true" className="size-2 rounded-full bg-[#1b1a17]/20 transition-colors duration-700 group-hover:bg-[#c23b22] motion-reduce:transition-none" /></a>)}
            </nav>
          </div>
        </section>

        <section aria-labelledby="zen-start" className="border-t border-[#1b1a17]/15">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center px-6 py-28 text-center md:px-12 md:py-44">
            <Seal size="size-14 text-sm" />
            <h2 id="zen-start" className={`${mincho} mt-10 text-[clamp(2.5rem,5.4vw,4.5rem)] leading-[1.15]`}>Local. Free.<br />Quiet.</h2>
            <p className="mt-8 max-w-[38ch] leading-[1.9] text-[#5c574e]">The collector, the dashboard and the MCP workbench are included. No hosted account is needed to begin.</p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-5"><a href="/docs/getting-started/" className={action}>Start locally <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" /></a><a href="/pricing/" className={link}>What is included</a></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1b1a17]/15">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-12">
          <a href="/" aria-label="qyl home" className={`flex min-h-11 items-center gap-3 ${focus}`}><Seal /><span className="text-sm text-[#5c574e]">Local signals. Shared context.</span></a>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-8 gap-y-1 text-sm text-[#5c574e]"><a href="/docs/" className={`inline-flex min-h-11 items-center hover:text-[#1b1a17] ${focus}`}>Documentation</a><a href={externalLinks.github} className={`inline-flex min-h-11 items-center hover:text-[#1b1a17] ${focus}`}>GitHub</a><a href="/faq/" className={`inline-flex min-h-11 items-center hover:text-[#1b1a17] ${focus}`}>FAQ</a><a href="/privacy/" className={`inline-flex min-h-11 items-center hover:text-[#1b1a17] ${focus}`}>Privacy</a></nav>
          <span className="font-mono text-xs text-[#5c574e]">qyl {versionOf("qyl")}</span>
        </div>
      </footer>
    </div>
  );
}
