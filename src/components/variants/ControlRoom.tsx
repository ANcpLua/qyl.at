"use client";

import { ArrowRight, ArrowUpRight, Copy, Radio } from "lucide-react";
import type { ReactNode } from "react";
import { externalLinks, primaryNavigation, productNavigation, versionOf } from "../../data/site";

// Dense, light operations console: labelled panels, status lights and tabular mono readouts.
// Every light names a documented state after `qyl up`, never a live metric.
// Static SSR; the host progressively enhances the command's copy button.
const command = "dotnet tool install --global qyl\nqyl up";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";
const focusInset = "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-700";
const shell = "mx-auto max-w-[1360px] px-4 sm:px-6";
const ink = "text-[#0f1f1c]";
const muted = "text-[#4b5a56]";
const mono = "font-mono tabular-nums";
const label = `text-[11px] tracking-[0.14em] uppercase text-emerald-800 ${mono}`;
const primary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0f1f1c] px-4 text-sm font-semibold text-white hover:bg-emerald-800 ${focus}`;
const secondary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#9fb0ab] bg-white px-4 text-sm font-semibold ${ink} hover:border-[#0f1f1c] ${focus}`;
const textLink = `inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:underline underline-offset-4 ${focus}`;

type Tone = "ok" | "standby" | "info";
const tones: Record<Tone, { dot: string; text: string }> = {
  ok: { dot: "bg-emerald-500 ring-emerald-500/20", text: "text-emerald-800" },
  standby: { dot: "bg-amber-400 ring-amber-400/25", text: "text-amber-800" },
  info: { dot: "bg-sky-500 ring-sky-500/20", text: "text-sky-800" },
};

function Light({ tone, text }: { tone: Tone; text: string }) {
  return <span className={`inline-flex shrink-0 items-center gap-1.5 ${tones[tone].text}`}><span aria-hidden="true" className={`size-2 rounded-full ring-3 ${tones[tone].dot}`} />{text}</span>;
}

function Panel({ code, title, light, flush = false, className = "", children }: { code: string; title: string; light?: { tone: Tone; text: string }; flush?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={`flex min-w-0 flex-col rounded-lg border border-[#c9d3d0] bg-white ${className}`}>
      <div className={`flex min-h-10 items-center justify-between gap-3 border-b border-[#dde4e2] px-3.5 text-[11px] tracking-[0.08em] uppercase ${mono}`}>
        <span className={`min-w-0 truncate ${muted}`}><span className={`font-semibold ${ink}`}>{code}</span> / {title}</span>
        {light && <Light {...light} />}
      </div>
      <div className={`flex flex-1 flex-col ${flush ? "" : "p-4 sm:p-5"}`}>{children}</div>
    </div>
  );
}

function SectionHead({ wall, id, title, text }: { wall: string; id: string; title: string; text: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-12 md:items-end">
      <div className="md:col-span-7"><p className={label}>{wall}</p><h2 id={id} className="mt-3 text-3xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h2></div>
      <p className={`max-w-md text-sm leading-6 md:col-span-5 ${muted}`}>{text}</p>
    </div>
  );
}

const services = [
  { name: "OTLP/HTTP :4318", tone: "ok", state: "listening" },
  { name: "OTLP/gRPC :4317", tone: "ok", state: "listening" },
  { name: "Dashboard :5100", tone: "ok", state: "serving" },
  { name: "DuckDB", tone: "info", state: "local" },
  { name: "MCP", tone: "standby", state: "on request" },
] as const;

const endpoints = [
  { channel: "Dashboard", address: "http://127.0.0.1:5100" },
  { channel: "OTLP / HTTP", address: "127.0.0.1:4318" },
  { channel: "OTLP / gRPC", address: "127.0.0.1:4317" },
] as const;

const feeds = [
  { code: "B1", name: "Traces", detail: "Follow a request across services and inspect every span.", route: "/product/tracing/", readout: "trace_id → spans", io: "OTLP in" },
  { code: "B2", name: "Logs", detail: "Find the log records that belong to the run you are investigating.", route: "/product/logs/", readout: "trace_id → records", io: "OTLP in" },
  { code: "B3", name: "Metrics", detail: "Query a time window and receive aggregated buckets.", route: "/product/metrics/", readout: "time window → buckets", io: "OTLP in" },
  { code: "B4", name: "MCP evidence", detail: "Keep requests, results, protocol frames, approvals, and tests.", route: "/product/mcp-evidence/", readout: "tool call → evidence", io: "MCP out" },
] as const;

const tools = [
  { name: "list_traces", result: "Traces to choose from" },
  { name: "get_trace", result: "One complete span tree" },
  { name: "display_traces", result: "Traces opened in an MCP App" },
] as const;

export default function ControlRoom() {
  return (
    <div className={`min-h-screen bg-[#eef2f1] font-sans ${ink} antialiased selection:bg-emerald-100 selection:text-emerald-950`}>
      <a href="#main" className={`sr-only z-50 rounded-md bg-[#0f1f1c] px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 ${focus}`}>Skip to content</a>
      <header className="border-b border-[#c9d3d0] bg-white">
        <div className={`${shell} flex min-h-15 items-center justify-between gap-4`}>
          <a href="/" aria-label="qyl home" className={`flex min-h-11 items-center gap-3 rounded-sm ${focus}`}>
            <span className="flex size-8 items-center justify-center rounded-md bg-[#0f1f1c] text-emerald-300"><Radio aria-hidden="true" className="size-4" /></span>
            <span className="text-2xl font-semibold tracking-[-0.06em]">qyl</span>
            <span className={`hidden border-l border-[#c9d3d0] pl-3 text-[11px] tracking-[0.12em] uppercase sm:block ${mono} ${muted}`}>Ops console</span>
          </a>
          <nav aria-label="Main navigation" className="flex items-center gap-1 text-sm font-medium sm:gap-2">
            {primaryNavigation.map((item) => <a key={item.href} href={item.href} className={`${item.label === "Docs" ? "inline-flex" : "hidden md:inline-flex"} min-h-11 items-center rounded-md px-2.5 ${muted} hover:bg-[#eef2f1] hover:text-[#0f1f1c] ${focus}`}>{item.label}</a>)}
            <a href={externalLinks.github} className={`hidden min-h-11 items-center gap-1 rounded-md px-2.5 lg:inline-flex ${muted} hover:bg-[#eef2f1] hover:text-[#0f1f1c] ${focus}`}>GitHub <ArrowUpRight aria-hidden="true" className="size-3.5" /></a>
            <a href="/docs/getting-started/" className={`${primary} ml-1`}>Start locally</a>
          </nav>
        </div>
        <div className="border-t border-[#dde4e2] bg-[#f7f9f8]">
          <div className={`${shell} flex flex-wrap items-center gap-x-6 gap-y-2 py-2.5 text-[11px] tracking-[0.06em] uppercase ${mono}`}>
            <span className="font-semibold">After qyl up</span>
            <ul aria-label="Local services after qyl up" className="flex flex-wrap gap-x-5 gap-y-2">
              {services.map((service) => <li key={service.name} className="flex items-center gap-2"><span className={muted}>{service.name}</span><Light tone={service.tone} text={service.state} /></li>)}
            </ul>
          </div>
        </div>
      </header>

      <main id="main">
        <section aria-labelledby="cr-title" className={`${shell} pt-6 pb-12 sm:pt-8 sm:pb-16`}>
          <div className="grid gap-3 lg:grid-cols-12">
            <Panel code="A1" title="Overview" light={{ tone: "ok", text: "local" }} className="lg:col-span-7 lg:row-span-2">
              <div className="flex flex-1 flex-col sm:p-3">
                <p className={label}>Wall 01 / Your runtime, in one view</p>
                <h1 id="cr-title" className="mt-5 max-w-2xl text-[clamp(2.4rem,5.6vw,4.6rem)] leading-[0.98] font-semibold tracking-[-0.05em]">Every signal<br />on one wall.</h1>
                <p className={`mt-6 max-w-xl text-lg leading-relaxed ${muted}`}>Traces, logs, and metrics from your own machine, collected in one local store. Your coding agent reads the same evidence over MCP.</p>
                <div className="mt-8 flex flex-wrap gap-3"><a href="/docs/getting-started/" className={primary}>Run qyl locally <ArrowRight aria-hidden="true" className="size-4" /></a><a href="/docs/mcp/" className={secondary}>Connect your agent</a></div>
                <p className={`mt-4 text-xs ${muted}`}>Free to use. The local product works without a hosted account.</p>
                <div aria-hidden="true" className="min-h-10 flex-1" />
                <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-[#dde4e2] bg-[#dde4e2]">
                  {[["Ingest", "OTLP"], ["Store", "DuckDB"], ["Serve", "MCP"]].map(([term, value]) => <div key={term} className="bg-[#f7f9f8] p-3 sm:p-4"><dt className={`text-[11px] tracking-[0.12em] uppercase ${mono} ${muted}`}>{term}</dt><dd className="mt-1 text-sm font-semibold sm:text-base">{value}</dd></div>)}
                </dl>
              </div>
            </Panel>
            <Panel code="A2" title="Start" light={{ tone: "standby", text: "ready to run" }} className="lg:col-span-5">
              <div data-command-panel="">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className={`text-xs ${mono} ${muted}`}>terminal</span>
                  <button type="button" data-copy-command={command} aria-label="Copy qyl install commands" className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-[#c9d3d0] bg-white px-3 text-xs font-semibold hover:border-[#0f1f1c] ${focus}`}><Copy aria-hidden="true" className="size-3.5" /><span data-copy-label="">Copy</span></button>
                </div>
                <pre className={`overflow-x-auto rounded-md border border-[#dde4e2] bg-[#f3f6f5] p-4 text-[13px] leading-7 ${mono}`}><code><span className="text-emerald-700">$ </span>dotnet tool install --global qyl{"\n"}<span className="text-emerald-700">$ </span>qyl up</code></pre>
                <div aria-live="polite" data-copy-status="" className="mt-3 min-h-4 font-mono text-xs text-emerald-800" />
              </div>
            </Panel>
            <Panel code="A3" title="Endpoints" light={{ tone: "info", text: "after qyl up" }} className="lg:col-span-5" flush>
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Local endpoints qyl opens after qyl up</caption>
                <thead><tr className={`border-b border-[#dde4e2] text-[11px] tracking-[0.08em] uppercase ${mono} ${muted}`}><th scope="col" className="px-4 py-2.5 font-medium">Channel</th><th scope="col" className="px-4 py-2.5 text-right font-medium">Address</th></tr></thead>
                <tbody className="divide-y divide-[#eef2f1]">
                  {endpoints.map((endpoint) => <tr key={endpoint.channel}><th scope="row" className="px-4 py-3.5 font-medium"><span className="flex items-center gap-2"><span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-emerald-500" />{endpoint.channel}</span></th><td className={`px-4 py-3.5 text-right break-all ${mono}`}>{endpoint.address}</td></tr>)}
                </tbody>
              </table>
              <p className={`mt-auto border-t border-[#dde4e2] px-4 py-3 text-[11px] ${mono} ${muted}`}>native collector + embedded dashboard · .NET tool</p>
            </Panel>
          </div>
        </section>

        <section id="signals" aria-labelledby="cr-feeds" className="border-y border-[#c9d3d0] bg-[#f7f9f8]">
          <div className={`${shell} py-12 sm:py-16`}>
            <SectionHead wall="Wall 02 / Feeds" id="cr-feeds" title="Four feeds. One investigation." text="A trace gets more useful when the related logs are one query away. qyl keeps those connections for you and your agent." />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {feeds.map((feed) => (
                <li key={feed.code} className="flex">
                  <Panel code={feed.code} title="Feed" light={{ tone: feed.io === "MCP out" ? "info" : "ok", text: feed.io }} className="w-full">
                    <h3 className="text-xl font-semibold tracking-tight">{feed.name}</h3>
                    <p className={`mt-2 text-sm leading-6 ${muted}`}>{feed.detail}</p>
                    <p className={`mt-5 rounded-md bg-[#f3f6f5] px-3 py-2 text-xs break-all text-emerald-800 ${mono}`}>{feed.readout}</p>
                    <div className="mt-auto pt-3"><a href={feed.route} className={`group ${textLink}`}>Open {feed.name.toLowerCase()} <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none" /></a></div>
                  </Panel>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="cr-agent" className={`${shell} py-12 sm:py-16`}>
          <SectionHead wall="Wall 03 / Agent console" id="cr-agent" title="Ask the agent. Keep the proof." text="List traces, inspect a complete span tree, and open an MCP App when you need a closer look. Errors stay errors. Demo data is always explicit." />
          <div className="mt-8 grid gap-3 lg:grid-cols-12">
            <Panel code="C1" title="MCP tools" light={{ tone: "ok", text: "available" }} className="lg:col-span-8" flush>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">MCP tools qyl gives your coding agent</caption>
                  <thead><tr className={`border-b border-[#dde4e2] text-[11px] tracking-[0.08em] uppercase ${mono} ${muted}`}><th scope="col" className="w-14 px-4 py-2.5 font-medium">Ch</th><th scope="col" className="px-4 py-2.5 font-medium">Tool</th><th scope="col" className="px-4 py-2.5 font-medium">Returns</th></tr></thead>
                  <tbody className="divide-y divide-[#eef2f1]">
                    {tools.map((tool, index) => <tr key={tool.name}><td className={`px-4 py-4 text-xs ${mono} ${muted}`}>0{index + 1}</td><th scope="row" className={`px-4 py-4 text-[13px] font-semibold break-all text-emerald-800 ${mono}`}>{tool.name}</th><td className="px-4 py-4">{tool.result}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </Panel>
            <Panel code="C2" title="Connect" light={{ tone: "standby", text: "stdio" }} className="lg:col-span-4">
              <p className={`text-sm leading-6 ${muted}`}>Add the server command to an MCP client that supports protocol revision 2026-07-28.</p>
              <pre className={`mt-4 overflow-x-auto rounded-md border border-[#dde4e2] bg-[#f3f6f5] p-3 text-[13px] ${mono}`}><code>npx -y qyl-mcp-server --stdio</code></pre>
              <div className="mt-auto pt-3"><a href="/docs/mcp/" className={textLink}>Connection guide <ArrowRight aria-hidden="true" className="size-3.5" /></a></div>
            </Panel>
          </div>
        </section>

        <section aria-labelledby="cr-routes" className="border-t border-[#c9d3d0] bg-[#f7f9f8]">
          <div className={`${shell} grid gap-8 py-12 sm:py-16 lg:grid-cols-12`}>
            <div className="lg:col-span-4"><p className={label}>Wall 04 / Routing</p><h2 id="cr-routes" className="mt-3 text-3xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-4xl">Patch into any signal.</h2><p className={`mt-4 max-w-sm text-sm leading-6 ${muted}`}>Each evidence path has its own page with the details, from the first span to the CI run.</p></div>
            <Panel code="D1" title="Patch bay" light={{ tone: "ok", text: `${productNavigation.length} routes` }} className="lg:col-span-8" flush>
              <ul>
                {productNavigation.map(({ href, label: name }, index) => <li key={href} className="border-b border-[#eef2f1] last:border-b-0"><a href={href} className={`group grid min-h-14 grid-cols-[3.5rem_1fr_auto] items-center gap-3 px-4 hover:bg-[#f3f6f5] ${focusInset}`}><span className={`text-xs ${mono} ${muted}`}>D1.{index + 1}</span><span className="font-semibold">{name}</span><span className={`flex items-center gap-3 text-xs ${mono} ${muted}`}><span className="max-sm:hidden">{href}</span><ArrowRight aria-hidden="true" className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none" /></span></a></li>)}
              </ul>
            </Panel>
          </div>
        </section>

        <section aria-labelledby="cr-start" className={`${shell} py-12 sm:py-16`}>
          <div className="grid gap-6 rounded-lg border border-l-4 border-[#c9d3d0] border-l-emerald-600 bg-white p-6 sm:p-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8"><p className={label}>Wall 05 / Access</p><h2 id="cr-start" className="mt-3 text-3xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-4xl">One plan. Every shipped feature.</h2><p className={`mt-3 max-w-xl text-sm leading-6 ${muted}`}>The native collector, embedded dashboard, and MCP workbench are included. Your local setup works without a hosted account.</p></div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end"><a href="/docs/getting-started/" className={primary}>Start locally <ArrowRight aria-hidden="true" className="size-4" /></a><a href="/pricing/" className={secondary}>Read pricing</a></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#c9d3d0] bg-white">
        <div className={`${shell} flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between`}>
          <div><a href="/" aria-label="qyl home" className={`text-2xl font-semibold tracking-[-0.06em] ${focus}`}>qyl</a><p className={`mt-1 text-xs ${muted}`}>Every signal on one wall.</p></div>
          <nav aria-label="Footer navigation" className={`flex flex-wrap gap-x-5 text-sm ${muted}`}>
            {[["/docs/", "Documentation"], [externalLinks.github, "GitHub"], ["/faq/", "FAQ"], ["/privacy/", "Privacy"]].map(([href, name]) => <a key={href} href={href} className={`inline-flex min-h-11 items-center hover:text-[#0f1f1c] ${focus}`}>{name}</a>)}
          </nav>
          <span className={`text-[11px] ${mono} ${muted}`}>qyl {versionOf("qyl")} / MCP {versionOf("qyl-mcp-server")}</span>
        </div>
      </footer>
    </div>
  );
}
