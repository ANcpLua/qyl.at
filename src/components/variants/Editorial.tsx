"use client";

import { externalLinks, versionOf } from "../../data/site";

const installCommand = "dotnet tool install --global qyl\nqyl up";
const evidence = [
  { number: "01", title: "Traces", text: "Follow a request through every span. Read the waterfall, then give the same context to your agent.", href: "/product/tracing/" },
  { number: "02", title: "Logs", text: "Find the records that belong to the run you are investigating. Keep the conversation connected to its evidence.", href: "/product/logs/" },
  { number: "03", title: "Metrics", text: "Query a time window and work with meaningful buckets. See what changed around the incident.", href: "/product/metrics/" },
  { number: "04", title: "MCP evidence", text: "Inspect tool calls, protocol frames, approvals, tests, and explicit usage evidence in one workbench.", href: "/product/mcp-evidence/" },
  { number: "05", title: "CI telemetry", text: "Read the build as telemetry. Bring the evidence from your development loop into the same investigation.", href: "/product/ci/" },
];
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a6301f]";
const textLink = `underline decoration-[#a6301f]/40 underline-offset-4 hover:text-[#a6301f] hover:decoration-[#a6301f] ${focus}`;

/** React Bits Pro Editorial design skill + Developer Tool prompt. */
export default function Editorial() {
  return (
    <div className="min-h-screen bg-[#fbf9f4] font-sans text-[#1a1815] selection:bg-[#e8ddca]">
      <a href="#main" className="sr-only z-50 bg-[#fbf9f4] p-4 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <div className="mx-auto max-w-[1360px] px-6 md:px-10 lg:px-16">
        <header className="border-b border-[#dad3c7] pt-5">
          <div className="flex items-center justify-between border-b border-[#dad3c7] pb-3 text-[11px] tracking-[0.13em] sm:text-xs">
            <p>FIELD NOTES ON SOFTWARE</p>
            <p className="text-[#6b655c]">qyl {versionOf("qyl")}</p>
          </div>
          <div className="flex min-h-24 items-center justify-between gap-8">
            <a className={`font-[Georgia] text-5xl italic tracking-[-0.07em] ${focus}`} href="/" aria-label="qyl home">qyl.</a>
            <p className="hidden max-w-[22ch] text-xs leading-relaxed text-[#6b655c] lg:block">Local observability.<br />A clearer picture of your code.</p>
            <nav className="hidden items-center gap-7 text-[13px] sm:flex" aria-label="Primary navigation">
              <a className={textLink} href="/product/tracing/">Product</a>
              <a className={textLink} href="/docs/">Documentation</a>
              <a className={textLink} href="/pricing/">Pricing</a>
              <a className={textLink} href={externalLinks.github}>GitHub ↗</a>
            </nav>
            <details className="relative sm:hidden">
              <summary className={`cursor-pointer py-3 text-sm underline underline-offset-4 ${focus}`}>Index</summary>
              <nav aria-label="Mobile navigation" className="absolute right-0 z-20 mt-3 w-56 border border-[#dad3c7] bg-[#fbf9f4] p-6 text-base">
                <a className={`block py-3 ${textLink}`} href="/product/tracing/">Product</a>
                <a className={`block py-3 ${textLink}`} href="/docs/">Documentation</a>
                <a className={`block py-3 ${textLink}`} href="/pricing/">Pricing</a>
                <a className={`block py-3 ${textLink}`} href={externalLinks.github}>GitHub ↗</a>
              </nav>
            </details>
          </div>
        </header>

        <main id="main">
          <section aria-labelledby="hero-title" className="grid grid-cols-12 gap-x-6 pb-14 pt-8 md:gap-x-8 md:pb-20 md:pt-12">
            <div className="col-span-12 mb-7 flex items-center gap-4 text-xs tracking-[0.1em] text-[#6b655c]">
              <span className="h-px w-10 bg-[#a6301f]" aria-hidden="true" /> OPEN TELEMETRY, CLOSE TO HOME
            </div>
            <div className="col-span-12 md:col-span-8">
              <h1 id="hero-title" className="max-w-[13ch] font-[Georgia] text-[clamp(3.5rem,7.8vw,7.1rem)] leading-[0.97] font-normal tracking-[-0.06em]">
                The evidence<br />is in the<br /><em className="font-normal text-[#a6301f]">execution.</em>
              </h1>
            </div>
            <div className="col-span-12 mt-10 flex flex-col justify-between md:col-span-4 md:mt-2 md:border-l md:border-[#dad3c7] md:pl-7">
              <div>
                <p className="max-w-[28ch] font-[Georgia] text-[25px] leading-[1.35] tracking-[-0.02em]">Your agent knows the code.<br />Let it see what happened.</p>
                <p className="mt-5 max-w-[36ch] text-sm leading-7 text-[#6b655c]">qyl collects traces, logs, and metrics locally, then puts the evidence within reach of your coding agent over MCP.</p>
                <a className={`mt-6 inline-flex min-h-11 items-center gap-6 text-sm text-[#a6301f] ${textLink}`} href="/docs/getting-started/">Start locally <span aria-hidden="true">↗</span></a>
              </div>
              <div className="mt-9 border-t border-[#dad3c7] pt-4">
                <div className="mb-3 flex items-center justify-between gap-2 text-xs text-[#6b655c]">
                  <span>THE FIRST TWO LINES</span>
                  <button type="button" data-copy-command={installCommand} aria-live="polite" className={`min-h-9 cursor-pointer px-1 text-[#a6301f] underline underline-offset-4 ${focus}`}><span data-copy-label>Copy commands</span></button>
                </div>
                <pre className="overflow-x-auto pb-2 text-[12px] leading-7 sm:text-[13px]"><code><span className="text-[#a6301f]">dotnet</span> tool install --global qyl{"\n"}<span className="text-[#a6301f]">qyl</span> up</code></pre>
              </div>
            </div>
          </section>

          <section aria-label="Example trace" className="grid grid-cols-12 gap-x-6 border-y border-[#dad3c7] py-7 md:gap-x-8 md:py-10">
            <div className="col-span-12 mb-6 md:col-span-3 md:mb-0">
              <p className="text-xs tracking-[0.12em] text-[#a6301f]">FIG. 01 / THE RUN</p>
              <h2 className="mt-4 max-w-[11ch] font-[Georgia] text-3xl leading-[1.15] tracking-[-0.035em]">From symptom<br />to source.</h2>
              <p className="mt-5 max-w-[28ch] text-[13px] leading-6 text-[#6b655c]">One request. Its related spans. A trail your agent can follow.</p>
            </div>
            <figure className="col-span-12 min-w-0 md:col-span-9">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <p className="font-mono">POST /checkout <span className="ml-3 text-[#a6301f]">500</span></p>
                <span className="text-[#6b655c]">Illustrative trace · 248 ms</span>
              </div>
              <div className="grid grid-cols-[minmax(7rem,0.7fr)_minmax(0,1fr)_3rem] gap-x-3 text-[11px] sm:grid-cols-[minmax(11rem,1fr)_minmax(0,2fr)_4rem] sm:text-xs">
                <div className="border-b border-[#dad3c7] pb-3 text-[#6b655c]">SPAN</div>
                <div className="flex justify-between border-b border-[#dad3c7] pb-3 font-mono text-[#6b655c]"><span>0</span><span>125</span><span>250 ms</span></div>
                <div className="border-b border-[#dad3c7] pb-3 text-right text-[#6b655c]">TIME</div>
                <span className="py-4 font-mono">checkout</span>
                <div className="flex items-center" aria-hidden="true"><div className="h-3 w-full bg-[#312d27]" /></div>
                <span className="py-4 text-right font-mono tabular-nums">248</span>
                <span className="border-t border-[#dad3c7]/60 py-4 pl-3 font-mono">inventory</span>
                <div className="flex items-center border-t border-[#dad3c7]/60" aria-hidden="true"><div className="ml-[8%] h-3 w-[24%] bg-[#9c9486]" /></div>
                <span className="border-t border-[#dad3c7]/60 py-4 text-right font-mono tabular-nums">61</span>
                <span className="border-y border-[#dad3c7]/60 py-4 pl-3 font-mono text-[#a6301f]">payment</span>
                <div className="flex items-center border-y border-[#dad3c7]/60" aria-hidden="true"><div className="ml-[33%] h-3 w-[64%] bg-[#a6301f]" /></div>
                <span className="border-y border-[#dad3c7]/60 py-4 text-right font-mono text-[#a6301f] tabular-nums">159</span>
              </div>
              <figcaption className="mt-4 max-w-[66ch] text-xs leading-6 text-[#6b655c]">Example data, drawn to explain the workflow. This page is not connected to a running collector.</figcaption>
            </figure>
          </section>

          <section className="grid grid-cols-12 gap-x-6 py-16 md:gap-x-8 md:py-24" aria-labelledby="local-title">
            <p className="col-span-12 mb-6 text-xs tracking-[0.12em] text-[#6b655c] md:col-span-2">01 / A LOCAL VIEW</p>
            <div className="col-span-12 md:col-span-7">
              <h2 id="local-title" className="max-w-[22ch] font-[Georgia] text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.08] tracking-[-0.045em]">Your agent should not need a screenshot of a dashboard.</h2>
              <p className="mt-8 max-w-[66ch] text-base leading-8 text-[#514b43] first-letter:float-left first-letter:mr-2 first-letter:font-[Georgia] first-letter:text-[4.8rem] first-letter:leading-[0.85] first-letter:text-[#a6301f]">Put the same traces, logs, and execution evidence in front of the agent that is already debugging your code. qyl receives standard OpenTelemetry data, keeps it in local DuckDB, and makes it available through MCP. Keep a human surface for judgment.</p>
              <p className="mt-5 max-w-[66ch] text-base leading-8 text-[#514b43]">The useful unit is the investigation. Follow a slow request into its spans, find correlated logs, and carry that context into the next question.</p>
            </div>
            <aside className="col-span-12 mt-8 border-t border-[#dad3c7] pt-5 md:col-span-2 md:col-start-11 md:mt-2 md:border-t-0 md:pt-0">
              <p className="font-[Georgia] text-xl italic">On your terms.</p>
              <p className="mt-3 max-w-[30ch] text-[13px] leading-6 text-[#6b655c]">A native collector.<br />A local analytical store.<br />Standard OTLP ingestion.</p>
              <a href="/docs/telemetry/" className={`mt-5 inline-block text-xs ${textLink}`}>Read the architecture ↗</a>
            </aside>
          </section>

          <section className="grid grid-cols-12 gap-x-6 border-y border-[#dad3c7] py-9 md:gap-x-8 md:py-12" aria-label="The principle">
            <span className="col-span-12 mb-4 text-xs text-[#6b655c] md:col-span-2 md:mb-0">A WORKING PRINCIPLE</span>
            <blockquote className="col-span-12 max-w-[30ch] font-[Georgia] text-[clamp(1.9rem,3.5vw,3rem)] leading-[1.2] italic tracking-[-0.035em] md:col-span-9 md:col-start-3">The useful unit is the investigation.</blockquote>
          </section>

          <section className="py-16 md:py-24" aria-labelledby="evidence-title">
            <div className="mb-10 grid grid-cols-12 gap-x-6 md:gap-x-8">
              <p className="col-span-12 mb-6 text-xs tracking-[0.12em] text-[#6b655c] md:col-span-2">02 / CONTENTS</p>
              <h2 id="evidence-title" className="col-span-12 font-[Georgia] text-4xl tracking-[-0.045em] md:col-span-7 md:text-5xl">Five ways into the evidence.</h2>
            </div>
            <div className="border-t border-[#dad3c7]">
              {evidence.map((item) => (
                <a key={item.number} href={item.href} className={`group grid grid-cols-12 gap-x-6 border-b border-[#dad3c7] py-6 transition-colors hover:bg-[#f3efe6] md:gap-x-8 md:py-7 ${focus}`}>
                  <span className="col-span-2 pt-1 font-[Georgia] text-xl text-[#a6301f] md:col-span-2">{item.number}</span>
                  <h3 className="col-span-9 font-[Georgia] text-3xl tracking-[-0.035em] md:col-span-4">{item.title}</h3>
                  <p className="col-span-10 col-start-3 mt-3 max-w-[46ch] text-sm leading-7 text-[#6b655c] md:col-span-5 md:col-start-auto md:mt-0">{item.text}</p>
                  <span aria-hidden="true" className="col-span-1 col-start-12 row-start-1 text-right text-xl text-[#a6301f] md:row-auto">↗</span>
                </a>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-12 gap-x-6 border-t border-[#dad3c7] pb-20 pt-10 md:gap-x-8 md:pb-28 md:pt-14" aria-labelledby="closing-title">
            <p className="col-span-12 mb-6 text-xs tracking-[0.12em] text-[#6b655c] md:col-span-2">03 / BEGIN HERE</p>
            <div className="col-span-12 md:col-span-7">
              <h2 id="closing-title" className="max-w-[18ch] font-[Georgia] text-4xl leading-[1.1] tracking-[-0.045em] md:text-5xl">A shorter distance<br />from question to evidence.</h2>
              <p className="mt-6 max-w-[48ch] text-sm leading-7 text-[#6b655c]">Start the collector. Point your OpenTelemetry SDK at it. Connect your coding agent. The documentation walks through each step.</p>
              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4 text-sm">
                <a href="/docs/getting-started/" className={`min-h-11 py-3 text-[#a6301f] ${textLink}`}>Read the quickstart ↗</a>
                <a href="/docs/mcp/" className={`min-h-11 py-3 ${textLink}`}>Connect over MCP ↗</a>
              </div>
            </div>
            <div className="col-span-12 mt-9 md:col-span-2 md:col-start-11 md:mt-1">
              <p className="text-xs tracking-[0.1em] text-[#6b655c]">OPEN IN YOUR BROWSER</p>
              <p className="mt-3 font-mono text-[13px]">127.0.0.1:5100</p>
              <p className="mt-3 text-xs leading-6 text-[#6b655c]">The local dashboard after running <code className="text-[#1a1815]">qyl up</code>.</p>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#dad3c7] pb-8 pt-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div><a href="/" className={`font-[Georgia] text-4xl italic tracking-[-0.07em] ${focus}`} aria-label="qyl home">qyl.</a><p className="mt-3 text-xs text-[#6b655c]">Telemetry, with context.</p></div>
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-7 gap-y-5 text-xs">
              <a className={textLink} href="/docs/">Documentation</a>
              <a className={textLink} href="/pricing/">Pricing</a>
              <a className={textLink} href="/faq/">FAQ</a>
              <a className={textLink} href={externalLinks.github}>Source ↗</a>
              <a className={textLink} href="/privacy/">Privacy</a>
            </nav>
            <p className="text-xs text-[#6b655c]">Made for the next question.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
