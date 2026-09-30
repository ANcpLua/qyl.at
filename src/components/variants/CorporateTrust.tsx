"use client";

import { ArrowRight, ArrowUpRight, Check, ChevronDown, Copy, Database, FileText, GitBranch, Layers, Radio, Terminal, Workflow } from "lucide-react";
import { externalLinks, productNavigation, versionOf } from "../../data/site";

const shell = "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4DB1]";
const primary = `inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#1B4DB1] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163F92] ${focus}`;
const secondary = `inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-[#D3DAE5] bg-white px-5 py-3 text-sm font-semibold text-[#16202E] hover:bg-[#F6F8FB] ${focus}`;
const heading = "text-3xl leading-tight font-semibold tracking-[-0.025em] lg:text-[40px]";
const eyebrow = "mb-4 text-xs font-semibold tracking-[0.08em] text-[#4A5666] uppercase";

const capabilities = [
  { title: "Traces", detail: "Follow a request through every span. Query a waterfall or open an embedded MCP App.", href: "/product/tracing/", icon: GitBranch, action: "Inspect a trace" },
  { title: "Logs", detail: "Search the records correlated with the run your agent is already investigating.", href: "/product/logs/", icon: FileText, action: "Find a record" },
  { title: "Metrics", detail: "Query a time window and work with aggregated buckets instead of raw points.", href: "/product/metrics/", icon: Layers, action: "Explore a series" },
  { title: "MCP evidence", detail: "Keep tool calls, protocol frames, approvals, tests and usage in the investigation.", href: "/product/mcp-evidence/", icon: Workflow, action: "Review a run" },
  { title: "CI telemetry", detail: "Read build runs as telemetry, alongside the runtime signals they help explain.", href: "/product/ci/", icon: Terminal, action: "Connect your CI" },
];
const questions = [
  { question: "Does qyl require a hosted service?", answer: "The dotnet tool runs the collector and embedded dashboard locally. Your traces, logs and metrics are stored in local DuckDB. Start locally, then choose how you want your agent to connect.", href: "/docs/getting-started/", link: "Read the local setup guide" },
  { question: "Can I keep my existing instrumentation?", answer: "Yes. Point a compliant OpenTelemetry SDK at the OTLP receiver. Python, Go, Java, Node and .NET can send to the same endpoint. The qyl .NET packages are an additional integration path.", href: "/docs/telemetry/", link: "Read the telemetry guide" },
  { question: "How does my coding agent connect?", answer: "The qyl MCP server supports stdio for local clients and Streamable HTTP for hosted connections. The workbench keeps requests, results and protocol timelines available for review.", href: "/docs/mcp/", link: "Read the MCP connection guide" },
];

export default function CorporateTrust() {
  return <div className="min-h-screen bg-white font-sans text-[#16202E] antialiased selection:bg-[#DDE8FA]">
    <a href="#main" className={`sr-only fixed left-5 top-5 z-50 rounded-md bg-white px-4 py-3 focus:not-sr-only ${focus}`}>Skip to content</a>
    <header className="border-b border-[#E1E7EF] bg-white">
      <div className={`${shell} flex min-h-20 items-center justify-between gap-5`}>
        <a href="/" aria-label="qyl home" className={`text-3xl font-semibold tracking-[-0.07em] ${focus}`}>qyl<span className="text-[#1B4DB1]">.</span></a>
        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium text-[#4A5666] md:flex">
          <a href="#capabilities" className={`py-3 hover:text-[#1B4DB1] ${focus}`}>Product</a>
          <a href="/docs/" className={`py-3 hover:text-[#1B4DB1] ${focus}`}>Documentation</a>
          <a href="/pricing/" className={`py-3 hover:text-[#1B4DB1] ${focus}`}>Pricing</a>
          <a href={externalLinks.github} className={`inline-flex items-center gap-1.5 py-3 hover:text-[#1B4DB1] ${focus}`}>GitHub <ArrowUpRight size={14} aria-hidden="true" /></a>
        </nav>
        <div className="flex items-center gap-4"><a href="/docs/" className={`py-3 text-sm font-medium md:hidden ${focus}`}>Docs</a><a href="/docs/getting-started/" className={primary}>Start locally <ArrowRight size={16} aria-hidden="true" /></a></div>
      </div>
    </header>
    <main id="main">
      <section aria-labelledby="hero-heading" className="py-16 lg:py-24">
        <div className={`${shell} grid items-center gap-12 lg:grid-cols-2 lg:gap-16`}>
          <div>
            <p className="mb-6 inline-flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.08em] text-[#4A5666] uppercase"><span className="h-2 w-2 rounded-full bg-[#1E7A52]" aria-hidden="true" />Agent-ready observability <span className="font-mono">v{versionOf("qyl")}</span></p>
            <h1 id="hero-heading" className="max-w-xl text-[36px] leading-[1.1] font-semibold tracking-[-0.035em] sm:text-5xl lg:text-[56px]">Give your agent the evidence.</h1>
            <p className="mt-6 max-w-lg text-lg leading-[1.6] text-[#4A5666]">Collect traces, logs and metrics locally. Put them within reach of your coding agent through MCP—with the same evidence available for you to inspect.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="/docs/getting-started/" className={primary}>Start locally <ArrowRight size={17} aria-hidden="true" /></a><a href="/docs/mcp/" className={secondary}>Explore MCP</a></div>
            <p className="mt-5 text-sm text-[#4A5666]">OpenTelemetry in. Local DuckDB storage. Context out.</p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-lg border border-[#D3DAE5] bg-[#F6F8FB]">
            <div className="flex min-h-14 items-center justify-between gap-4 border-b border-[#E1E7EF] bg-white px-5"><span className="inline-flex items-center gap-2.5 text-sm font-semibold"><Terminal size={17} className="text-[#4A5666]" aria-hidden="true" />Start the collector</span><button type="button" data-qyl-copy={'dotnet tool install --global qyl\nqyl up'} aria-label="Copy qyl install commands" className={`inline-flex min-h-11 items-center gap-2 rounded px-2 text-xs font-medium text-[#4A5666] hover:bg-[#F6F8FB] ${focus}`}><Copy size={14} aria-hidden="true" /><span data-copy-label>Copy</span></button></div>
            <div className="p-5 sm:p-7">
              <pre className="overflow-x-auto pb-2 font-mono text-[13px] leading-8 sm:text-sm"><code><span className="text-[#4A5666]"># Install and run</span>{"\n"}<span className="text-[#1B4DB1]">dotnet</span>{" tool install --global qyl\n"}<span className="text-[#1B4DB1]">qyl</span>{" up"}</code></pre>
              <div className="mt-7 rounded-md border border-[#E1E7EF] bg-white p-4"><p className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#1E7A52]"><Check size={15} aria-hidden="true" />Your local endpoints</p><dl className="space-y-3 text-xs sm:text-sm">{[{name:"Dashboard",port:"5100"},{name:"OTLP / HTTP",port:"4318"},{name:"OTLP / gRPC",port:"4317"}].map(({name,port})=><div key={name} className="flex flex-wrap justify-between gap-2"><dt className="text-[#4A5666]">{name}</dt><dd className="font-mono tabular-nums">127.0.0.1:{port}</dd></div>)}</dl></div>
              <a href="/docs/getting-started/" className={`mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#1B4DB1] ${focus}`}>Requirements and full setup <ArrowRight size={15} aria-hidden="true" /></a>
            </div>
          </div>
        </div>
      </section>
      <section aria-label="Architecture foundations" className="border-y border-[#E1E7EF] bg-[#F6F8FB]">
        <div className={`${shell} grid divide-y divide-[#E1E7EF] md:grid-cols-3 md:divide-x md:divide-y-0`}>
          {[
            { icon: Radio, title: "Standard signals", text: "OTLP over HTTP and gRPC. Keep your OpenTelemetry SDK.", href: "/docs/telemetry/" },
            { icon: Database, title: "Local analytical storage", text: "Traces, logs and metrics in DuckDB, with explicit retention.", href: "/docs/getting-started/" },
            { icon: Workflow, title: "Evidence over MCP", text: "Query real runs and inspect the protocol behind each response.", href: "/docs/workbench/" },
          ].map(({ icon: Icon, title, text, href }, index) => <a href={href} key={title} className={`group py-8 ${index === 0 ? "md:pr-8" : index === 2 ? "md:pl-8" : "md:px-8"} ${focus}`}><div className="flex items-center gap-3"><Icon size={20} className="shrink-0 text-[#4A5666]" aria-hidden="true" /><h2 className="text-base font-semibold">{title}</h2><ArrowUpRight size={15} className="ml-auto shrink-0 text-[#4A5666] group-hover:text-[#1B4DB1]" aria-hidden="true" /></div><p className="mt-3 max-w-sm text-sm leading-relaxed text-[#4A5666]">{text}</p></a>)}
        </div>
      </section>
      <section id="capabilities" aria-labelledby="capabilities-heading" className="py-16 lg:py-24">
        <div className={shell}>
          <div className="grid gap-5 lg:grid-cols-2 lg:gap-16"><div><p className={eyebrow}>One investigation</p><h2 id="capabilities-heading" className={`${heading} max-w-md`}>The context is already there. Make it accessible.</h2></div><p className="max-w-xl self-end text-base leading-[1.7] text-[#4A5666]">A failed request is more than a red status. Bring its trace, related logs, metric window and execution history into the conversation where you are debugging it.</p></div>
          <div className="mt-12 border-t border-[#D3DAE5]">{capabilities.map(({ title, detail, href, icon: Icon, action }) => <a key={title} href={href} className={`group grid gap-3 border-b border-[#E1E7EF] py-6 sm:grid-cols-[180px_1fr] sm:gap-8 lg:grid-cols-[220px_1fr_170px] ${focus}`}><h3 className="flex items-center gap-3 text-base font-semibold"><Icon size={20} className="text-[#4A5666]" aria-hidden="true" />{title}</h3><p className="max-w-2xl text-sm leading-[1.7] text-[#4A5666]">{detail}</p><span className="inline-flex items-center gap-2 text-sm font-medium text-[#1B4DB1] sm:col-start-2 lg:col-start-auto lg:justify-end">{action}<ArrowRight size={15} aria-hidden="true" /></span></a>)}</div>
        </div>
      </section>
      <section aria-labelledby="workflow-heading" className="border-y border-[#E1E7EF] bg-[#F6F8FB] py-16 lg:py-24">
        <div className={`${shell} grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20`}>
          <div><p className={eyebrow}>From runtime to reasoning</p><h2 id="workflow-heading" className={heading}>A short path to a better question.</h2><p className="mt-5 text-base leading-[1.7] text-[#4A5666]">Start with your local collector. Connect your instrumented application. Give your agent access to the same run you can inspect in the dashboard.</p><a href="/docs/getting-started/" className={`mt-8 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-[#1B4DB1] ${focus}`}>Follow the quickstart <ArrowRight size={17} aria-hidden="true" /></a></div>
          <ol className="min-w-0 space-y-6">{[
            { title: "Run qyl on your machine", text: "The dotnet tool includes the native collector, dashboard and product API.", cmd: "qyl", rest: " up" },
            { title: "Point your SDK at the receiver", text: "Export telemetry from your application using its OpenTelemetry SDK.", cmd: "export", rest: " OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318" },
            { title: "Connect your MCP client", text: "Use the stdio server with your client, then ask what the last run did.", cmd: "npx", rest: " -y qyl-mcp-server --stdio" },
          ].map(({title,text,cmd,rest},i)=><li key={title} className="grid grid-cols-[36px_minmax(0,1fr)] gap-4"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D3DAE5] bg-white font-mono text-xs tabular-nums">0{i+1}</span><div><h3 className="pt-1 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#4A5666]">{text}</p><pre className="mt-3 overflow-x-auto rounded-md border border-[#E1E7EF] bg-white p-4 text-xs leading-6"><code><span className="text-[#1B4DB1]">{cmd}</span>{rest}</code></pre></div></li>)}</ol>
        </div>
      </section>
      <section aria-labelledby="questions-heading" className="py-16 lg:py-24">
        <div className={`${shell} grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20`}><div><p className={eyebrow}>Before you start</p><h2 id="questions-heading" className={heading}>A few practical answers.</h2><a href="/faq/" className={`mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#1B4DB1] ${focus}`}>All questions <ArrowRight size={15} aria-hidden="true" /></a></div><div className="border-t border-[#D3DAE5]">{questions.map(({ question, answer, href, link }) => <details key={question} className="group border-b border-[#E1E7EF]"><summary className={`flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-semibold [&::-webkit-details-marker]:hidden ${focus}`}>{question}<ChevronDown className="shrink-0 text-[#4A5666] group-open:rotate-180" size={18} aria-hidden="true" /></summary><div className="pb-6"><p className="text-sm leading-[1.8] text-[#4A5666]">{answer}</p><a href={href} className={`mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#1B4DB1] ${focus}`}>{link}<ArrowRight size={14} aria-hidden="true" /></a></div></details>)}</div></div>
      </section>
      <section aria-labelledby="start-heading" className="border-y border-[#E1E7EF] bg-[#F6F8FB] py-16"><div className={`${shell} flex flex-col justify-between gap-8 lg:flex-row lg:items-center`}><div><h2 id="start-heading" className={heading}>Start with your next local run.</h2><p className="mt-4 text-base text-[#4A5666]">Collect the signals. Inspect the evidence. Keep building.</p></div><div className="flex flex-wrap gap-3"><a href="/docs/getting-started/" className={primary}>Start locally <ArrowRight size={17} aria-hidden="true" /></a><a href={externalLinks.github} className={secondary}>View source <ArrowUpRight size={16} aria-hidden="true" /></a></div></div></section>
    </main>
    <footer className="py-12"><div className={shell}>
      <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1"><a href="/" className={`text-3xl font-semibold tracking-[-0.07em] ${focus}`} aria-label="qyl home">qyl<span className="text-[#1B4DB1]">.</span></a><p className="mt-4 max-w-56 text-sm leading-relaxed text-[#4A5666]">Local telemetry.<br />Shared context for people and agents.</p></div>
        {[
          {label:"Product",links:productNavigation},
          {label:"Resources",links:[{href:"/docs/",label:"Documentation"},{href:"/docs/getting-started/",label:"Quickstart"},{href:"/docs/workbench/",label:"MCP workbench"},{href:"/faq/",label:"FAQ"}]},
          {label:"Project",links:[{href:externalLinks.github,label:"GitHub"},{href:externalLinks.nuget,label:"NuGet"},{href:"/pricing/",label:"Pricing"},{href:"/privacy/",label:"Privacy"}]},
        ].map(({label,links})=><nav key={label} aria-label={label}><h2 className="mb-3 text-xs font-semibold tracking-[0.05em] uppercase">{label}</h2>{links.map(({href,label:linkLabel})=><a key={href} href={href} className={`block min-h-9 py-2 text-sm text-[#4A5666] hover:text-[#1B4DB1] ${focus}`}>{linkLabel}</a>)}</nav>)}
      </div>
      <div className="mt-10 flex flex-col justify-between gap-3 border-t border-[#E1E7EF] pt-6 text-xs text-[#4A5666] sm:flex-row"><p>qyl · Agent-ready observability</p><p className="font-mono">qyl {versionOf("qyl")} · MCP server {versionOf("qyl-mcp-server")}</p></div>
    </div></footer>
  </div>;
}
