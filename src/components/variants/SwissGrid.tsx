"use client";

import { ArrowDown, ArrowRight, ArrowUpRight, Copy, Plus } from "lucide-react";
import { versionOf } from "../../data/site";

// React Bits Pro Agent Kit: Swiss Grid + Developer Tool.
// Ordered fields adapt the supplied Features 1 structure to the Swiss grid.
const grid = "grid grid-cols-2 gap-x-4 sm:grid-cols-4 md:grid-cols-6 md:gap-x-6 lg:grid-cols-12 xl:gap-x-8";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E2231A]";
const link = `underline decoration-[#111111]/30 underline-offset-4 hover:text-[#E2231A] hover:decoration-current ${focus}`;
const caption = "text-xs leading-4 tracking-[0.01em]";
const heading = "text-[clamp(1.25rem,2vw,1.75rem)] font-medium leading-8 tracking-[-0.01em]";
const capabilities = [
  { id: "01", title: "Traces", text: "Follow a request across spans. Inspect the waterfall and open the same evidence from an MCP conversation.", href: "/product/tracing/" },
  { id: "02", title: "Logs", text: "Find the records around a failure. Keep the log, the trace, and the request connected.", href: "/product/logs/" },
  { id: "03", title: "Metrics", text: "Query a time window. Read aggregated buckets, with the context you need to explain a change.", href: "/product/metrics/" },
  { id: "04", title: "MCP evidence", text: "Inspect tool calls, protocol frames, approvals, and evaluations in the local workbench.", href: "/product/mcp-evidence/" },
];

function Header() {
  return <header className={`${grid} relative min-h-16 items-center border-b border-[#111111]`}>
    <a href="/" aria-label="qyl home" className={`${heading} col-span-1 ${focus}`}>qyl<span className="text-[#E2231A]">.</span></a>
    <p className={`${caption} col-span-3 hidden text-[#666666] lg:block`}>Observability, in context.</p>
    <nav aria-label="Primary navigation" className="col-span-1 flex items-center justify-end gap-6 sm:col-span-3 md:col-span-5 lg:col-span-8">
      <a className={`${link} hidden sm:inline`} href="/product/tracing/">Product</a>
      <a className={link} href="/docs/">Docs</a>
      <a className={`${link} hidden md:inline`} href="/pricing/">Pricing</a>
      <a className={`hidden items-center gap-2 bg-[#111111] px-4 py-2 text-white hover:bg-[#E2231A] sm:inline-flex ${focus}`} href="/docs/getting-started/">Start locally <ArrowUpRight size={16} aria-hidden="true" /></a>
      <details className="group sm:hidden">
        <summary className={`cursor-pointer list-none ${focus}`} aria-label="Open navigation"><Plus className="group-open:rotate-45" size={24} aria-hidden="true" /></summary>
        <div className="absolute inset-x-0 top-16 z-20 flex flex-col gap-6 border-b border-[#111111] bg-white py-8">
          <a className={link} href="/product/tracing/">Product</a><a className={link} href="/pricing/">Pricing</a><a className={link} href="/docs/getting-started/">Start locally</a>
        </div>
      </details>
    </nav>
  </header>;
}

function TraceFigure() {
  return <figure className="col-span-full lg:col-span-7 lg:col-start-6" aria-labelledby="trace-figure-title">
    <figcaption id="trace-figure-title" className="mb-8 flex flex-wrap items-start justify-between gap-4 border-t border-[#111111] pt-4">
      <span className={caption}>FIG. 01 / AN EXAMPLE REQUEST</span><span className={`${caption} text-[#666666]`}>Illustrative data · not a live session</span>
    </figcaption>
    <div className="grid grid-cols-12 gap-x-4"><p className={`${heading} col-span-8`}>Where did the time go?</p><p className={`${heading} col-span-4 text-right tabular-nums`}>842 ms</p></div>
    <table className="mt-8 w-full table-fixed text-left text-xs leading-4">
      <caption className="sr-only">Illustrative request span durations; these values are example data, not product performance benchmarks.</caption>
      <thead><tr className="text-[#666666]"><th scope="col" className="w-1/3 pb-4 font-normal">SPAN</th><th scope="col" className="w-1/2 pb-4 font-normal">RELATIVE DURATION</th><th scope="col" className="pb-4 text-right font-normal">ms</th></tr></thead>
      <tbody>{[
        ["agent.run", "842", "w-full", "bg-[#111111]"],
        ["tools/call", "531", "w-[63%]", "bg-[#111111]"],
        ["search_logs", "209", "w-[25%]", "bg-[#111111]"],
        ["db.query", "113", "w-[14%]", "bg-[#E2231A]"],
        ["http.client", "68", "w-[8%]", "bg-[#111111]"],
      ].map(([name, duration, width, color]) => <tr key={name} className="h-12">
        <th scope="row" className={`font-normal ${name === "db.query" ? "text-[#E2231A]" : ""}`}>{name}</th><td className="pr-4"><div className={`h-2 ${width} ${color}`} aria-hidden="true" /></td><td className="text-right tabular-nums">{duration}</td>
      </tr>)}</tbody>
    </table>
    <details className="group mt-8 border-t border-[#111111] pt-4" open>
      <summary className={`flex cursor-pointer list-none items-start justify-between gap-4 ${focus}`}><span className="font-medium"><span className="text-[#E2231A]">↳</span> Inspect the database span</span><Plus size={16} className="mt-2 shrink-0 group-open:rotate-45" aria-hidden="true" /></summary>
      <dl className="grid grid-cols-2 gap-4 pt-6 text-xs leading-4 sm:grid-cols-3">
        <div><dt className="mb-2 text-[#666666]">STATUS</dt><dd className="break-words text-[#E2231A]">deadline_exceeded</dd></div><div><dt className="mb-2 text-[#666666]">CORRELATION</dt><dd>3 log records</dd></div><div><dt className="mb-2 text-[#666666]">TRACE</dt><dd>7f3b…91c2</dd></div>
      </dl>
    </details>
  </figure>;
}

export default function SwissGrid() {
  return <div className="min-h-screen bg-white font-[Arial,Helvetica,sans-serif] text-base leading-6 text-[#111111] selection:bg-[#E2231A] selection:text-white">
    <a href="#main" className={`sr-only fixed left-4 top-4 z-50 bg-white p-4 focus:not-sr-only ${focus}`}>Skip to content</a>
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <Header />
      <main id="main">
        <section aria-labelledby="hero-title" className="pb-16 pt-16 lg:pb-24 lg:pt-24">
          <div className={grid}>
            <p className={`${caption} col-span-full mb-8`}>LOCAL-FIRST OBSERVABILITY <span className="mx-2 text-[#666666]">/</span> qyl {versionOf("qyl")}</p>
            <h1 id="hero-title" className="col-span-full text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-none tracking-[-0.02em] lg:col-span-9">Follow the run.<br />Find the reason.</h1>
            <p className={`${caption} col-span-full mt-8 text-[#666666] lg:col-span-3 lg:mt-2`}>01 — COLLECT<br />02 — CORRELATE<br />03 — UNDERSTAND</p>
            <div className="col-span-full mt-8 sm:col-span-4 md:col-span-5 lg:col-span-5 lg:mt-12">
              <p className="max-w-[66ch]">Traces, logs, and metrics, collected locally. qyl gives your coding agent the evidence behind a request through MCP.</p>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <a className={`inline-flex items-center gap-4 bg-[#111111] px-6 py-4 text-white hover:bg-[#E2231A] ${focus}`} href="/docs/getting-started/">Start locally <ArrowUpRight size={16} aria-hidden="true" /></a>
                <a className={`${link} inline-flex items-center gap-2`} href="/docs/mcp/">Connect MCP <ArrowRight size={16} aria-hidden="true" /></a>
              </div>
            </div>
            <div className="col-span-full min-w-0 mt-12 border-t border-[#111111] pt-4 lg:col-span-6 lg:col-start-7">
              <div className="flex items-start justify-between gap-4"><p className={`${caption} text-[#666666]`}>START WITH TWO COMMANDS</p><button data-copy-setup type="button" className={`${caption} inline-flex min-h-8 items-start gap-2 underline underline-offset-4 hover:text-[#E2231A] ${focus}`} aria-label="Copy qyl installation commands"><Copy size={16} aria-hidden="true" /><span data-copy-label>Copy</span></button></div>
              <pre className="mt-4 overflow-x-auto pb-2 font-[family-name:inherit] text-base leading-8"><code data-install-code className="font-[family-name:inherit]"><span className="font-medium text-[#E2231A]">dotnet</span> tool install --global qyl{"\n"}<span className="font-medium text-[#E2231A]">qyl</span> up</code></pre>
              <p className={`${caption} mt-4 text-[#666666]`}>Then open <span className="text-[#111111]">127.0.0.1:5100</span>. Collector and dashboard, on your machine.</p><span data-copy-status aria-live="polite" className="sr-only" />
            </div>
          </div>
        </section>
        <section aria-labelledby="architecture-title" className={`${grid} gap-y-12 border-t border-[#111111] py-16 lg:py-24`}>
          <div className="col-span-full lg:col-span-4">
            <p className={`${caption} mb-8 text-[#666666]`}>01 / FROM SIGNAL TO CONTEXT</p><h2 id="architecture-title" className={heading}>Same evidence.<br />A shorter path to it.</h2>
            <p className="mt-6 max-w-[66ch] text-[#666666]">Your application emits telemetry. qyl stores it in local DuckDB. Your agent queries it through MCP. You keep a human surface for inspection.</p>
            <ol className="mt-8 flex flex-col gap-4" aria-label="qyl data flow"><li className="flex items-center gap-4"><span className={`${caption} w-8 text-[#666666]`}>IN</span> OpenTelemetry / OTLP</li><li className="flex items-center gap-4"><span className={`${caption} w-8 text-[#666666]`}>AT</span> Local DuckDB</li><li className="flex items-center gap-4"><span className={`${caption} w-8 text-[#666666]`}>OUT</span> Your coding agent / MCP</li></ol>
            <a className={`${link} mt-8 inline-flex items-center gap-2`} href="/docs/telemetry/">Read the architecture <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
          <TraceFigure />
        </section>
        <section aria-labelledby="capabilities-title" className="border-t border-[#111111] py-16 lg:py-24">
          <div className={`${grid} gap-y-8`}><p className={`${caption} col-span-full text-[#666666] lg:col-span-3`}>02 / THE INVESTIGATION INDEX</p><h2 id="capabilities-title" className={`${heading} col-span-full lg:col-span-6 lg:col-start-5`}>One request can leave many signals.<br />Keep them in the same investigation.</h2></div>
          <div className="mt-16">{capabilities.map((item) => <article key={item.id} className={`${grid} gap-y-4 py-8 first:pt-0 last:pb-0`}>
            <span className={`${caption} col-span-full pt-2 text-[#666666] sm:col-span-1 lg:col-span-1`}>{item.id}</span><h3 className={`${heading} col-span-full sm:col-span-3 md:col-span-5 lg:col-span-3`}><a className={`${link} inline-flex items-center gap-4`} href={item.href}>{item.title}<ArrowUpRight size={24} aria-hidden="true" /></a></h3><p className="col-span-full max-w-[66ch] text-[#666666] sm:col-start-2 sm:col-end-5 md:col-end-7 lg:col-span-6 lg:col-start-5">{item.text}</p>
          </article>)}</div>
        </section>
        <section aria-labelledby="start-title" className={`${grid} gap-y-12 border-t border-[#111111] py-16 lg:py-24`}>
          <div className="col-span-full lg:col-span-5"><p className={`${caption} mb-8 text-[#666666]`}>03 / MAKE THE CONNECTION</p><h2 id="start-title" className={heading}>Your machine.<br />Your runtime evidence.</h2><p className="mt-6 max-w-[66ch] text-[#666666]">Keep the collector running, point your application at it, then connect your MCP client. Any compliant OpenTelemetry SDK can send data.</p><a className={`${link} mt-8 inline-flex items-center gap-2`} href="/docs/getting-started/">Follow the complete quickstart <ArrowUpRight size={16} aria-hidden="true" /></a></div>
          <div className="col-span-full min-w-0 lg:col-span-6 lg:col-start-7">
            <div className="mb-8"><p className={`${caption} mb-4 text-[#666666]`}>A / SEND YOUR APPLICATION’S TELEMETRY</p><pre className="overflow-x-auto pb-4 font-[family-name:inherit] text-xs leading-6"><code className="font-[family-name:inherit]"><span className="text-[#E2231A]">export</span> OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318{"\n"}<span className="text-[#E2231A]">export</span> OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf</code></pre></div>
            <div><p className={`${caption} mb-4 text-[#666666]`}>B / START THE MCP SERVER</p><pre className="overflow-x-auto pb-2 font-[family-name:inherit] text-base leading-8"><code className="font-[family-name:inherit]"><span className="text-[#E2231A]">npx</span> -y qyl-mcp-server --stdio</code></pre><p className={`${caption} mt-4 max-w-[66ch] text-[#666666]`}>Requires an MCP client compatible with revision 2026-07-28. Check the <a className={link} href="/docs/mcp/">connection guide</a> for client setup.</p></div>
          </div>
        </section>
        <section aria-labelledby="closing-title" className={`${grid} gap-y-8 border-t border-[#111111] py-16 lg:py-24`}>
          <h2 id="closing-title" className="col-span-full text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-none tracking-[-0.02em] lg:col-span-8">The next run<br />has a story.</h2><div className="col-span-full lg:col-span-3 lg:col-start-10"><ArrowDown className="mb-8 text-[#E2231A]" size={32} strokeWidth={1.5} aria-hidden="true" /><a className={`${link} inline-flex items-center gap-2`} href="/docs/getting-started/">Start reading it <ArrowUpRight size={16} aria-hidden="true" /></a><p className={`${caption} mt-8 text-[#666666]`}>Local collector. OpenTelemetry in.<br />Evidence for you and your agent.</p></div>
        </section>
      </main>
      <footer className={`${grid} gap-y-8 border-t border-[#111111] py-8`}><a className={`${heading} col-span-1 ${focus}`} href="/" aria-label="qyl home">qyl.</a><p className={`${caption} col-span-1 text-[#666666] sm:col-span-3 md:col-span-5 lg:col-span-3`}>qyl {versionOf("qyl")}<br />Local-first observability.</p><nav aria-label="Footer navigation" className="col-span-full flex flex-wrap gap-x-8 gap-y-4 lg:col-span-8 lg:justify-end"><a className={link} href="/docs/">Documentation</a><a className={link} href="/pricing/">Pricing</a><a className={link} href="https://github.com/ANcpLua/qyl">GitHub</a><a className={link} href="/privacy/">Privacy</a></nav></footer>
    </div>
  </div>;
}
