"use client";

import { ArrowDown, ArrowRight, ArrowUpRight, Copy, Terminal } from "lucide-react";
import type { ReactNode } from "react";
import { externalLinks, primaryNavigation, productNavigation, versionOf } from "../../data/site";

// React Bits Pro terminal-dark + developer-tool, re-derived for the requested light palette.
// The two-tone split hero follows the installed Hero6 source; real commands replace its slideshow.
const startCommand = "dotnet tool install --global qyl\nqyl up";
const exporterCommand = "export OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318\nexport OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf";
const mcpCommand = "npx -y qyl-mcp-server --stdio";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700";
const shell = "mx-auto max-w-6xl px-5 sm:px-8";

function CommandFrame({ title, command, children }: { title: string; command: string; children?: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-100 p-1">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-slate-200 px-4">
          <span className="font-mono text-xs text-slate-600">{title}</span>
          <button type="button" data-copy-command={command} aria-label={`Copy ${title} command`} className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${focus}`}><Copy aria-hidden="true" className="size-3.5" /><span data-copy-label="" aria-live="polite">Copy</span></button>
        </div>
        <pre className="overflow-x-auto p-5 text-[13px] leading-[1.8] text-slate-900 sm:text-sm"><code>{command}</code></pre>
        {children}
      </div>
    </div>
  );
}

const evidence = [
  { id: "01", name: "Traces", detail: "Follow a request across services and inspect every span.", route: "/product/tracing/", technical: "trace_id → spans" },
  { id: "02", name: "Logs", detail: "Find the log records that belong to the run you are investigating.", route: "/product/logs/", technical: "trace_id → records" },
  { id: "03", name: "Metrics", detail: "Query a time window and receive aggregated buckets.", route: "/product/metrics/", technical: "time window → buckets" },
  { id: "04", name: "MCP evidence", detail: "Keep requests, results, protocol frames, approvals, and tests.", route: "/product/mcp-evidence/", technical: "tool call → evidence" },
] as const;

export default function TerminalLight() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-950">
      <a href="#main-content" className={`sr-only z-50 rounded-lg bg-slate-900 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${focus}`}>Skip to content</a>
      <header className="border-b border-slate-200">
        <div className={`${shell} flex min-h-18 items-center justify-between gap-5`}>
          <a href="/" aria-label="qyl home" className={`flex items-center gap-2.5 rounded-sm ${focus}`}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-slate-50"><Terminal aria-hidden="true" className="size-4" /></span><span className="text-2xl font-semibold tracking-[-0.06em]">qyl</span><span className="ml-2 hidden font-mono text-[11px] text-slate-600 sm:block">v{versionOf("qyl")}</span>
          </a>
          <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm font-medium text-slate-600 sm:gap-7">
            {primaryNavigation.map((item) => <a key={item.href} href={item.href} className={`${item.label === "Docs" ? "inline-flex" : "hidden sm:inline-flex"} min-h-11 items-center hover:text-blue-700 ${focus}`}>{item.label}</a>)}
            <a href={externalLinks.github} className={`hidden min-h-11 items-center gap-1 hover:text-blue-700 md:inline-flex ${focus}`}>GitHub <ArrowUpRight aria-hidden="true" className="size-3.5" /></a>
            <a href="/docs/getting-started/" className={`inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-3.5 text-slate-50 hover:bg-slate-700 ${focus}`}>Start locally <ArrowRight aria-hidden="true" className="hidden size-3.5 sm:block" /></a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section aria-labelledby="terminal-light-heading" className={`${shell} pb-14 pt-12 sm:pb-16 sm:pt-20`}>
          <div className="grid items-start gap-10 lg:grid-cols-[1.03fr_1fr] lg:gap-14">
            <div>
              <p className="mb-5 flex items-center gap-2 text-xs font-medium text-blue-700"><span aria-hidden="true" className="size-1.5 rounded-full bg-blue-700" />OpenTelemetry, on your machine.</p>
              <h1 id="terminal-light-heading" className="max-w-xl text-[40px] leading-[1.08] font-medium tracking-[-0.045em] sm:text-[52px] lg:text-[58px]">The evidence is local. <span className="text-slate-600">Your agent can read it.</span></h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-600">Collect traces, logs, and metrics in DuckDB. Give your coding agent access over MCP. Keep the same evidence close enough to inspect yourself.</p>
              <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3">
                <a href="/docs/getting-started/" className={`inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-medium text-slate-50 hover:bg-slate-700 ${focus}`}>Run your first collector <ArrowRight aria-hidden="true" className="size-4" /></a>
                <a href="#evidence" className={`inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-700 ${focus}`}>Follow the evidence <ArrowDown aria-hidden="true" className="size-3.5" /></a>
              </div>
              <p className="mt-6 text-xs leading-5 text-slate-600">Free to use. Local product works without a hosted account.</p>
            </div>
            <div className="min-w-0 lg:pt-2">
              <CommandFrame title="terminal / quickstart" command={startCommand}>
                <div className="mx-5 border-t border-dashed border-slate-200 py-5">
                  <p className="mb-3 font-mono text-xs text-slate-600"># Local endpoints after starting qyl</p>
                  <dl className="space-y-2.5 font-mono text-xs sm:text-[13px]">
                    <div className="flex flex-wrap justify-between gap-x-5 gap-y-1"><dt className="text-slate-600">dashboard</dt><dd className="text-blue-700">127.0.0.1:5100</dd></div>
                    <div className="flex flex-wrap justify-between gap-x-5 gap-y-1"><dt className="text-slate-600">OTLP / HTTP</dt><dd>127.0.0.1:4318</dd></div>
                    <div className="flex flex-wrap justify-between gap-x-5 gap-y-1"><dt className="text-slate-600">OTLP / gRPC</dt><dd>127.0.0.1:4317</dd></div>
                  </dl>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-100/70 px-5 py-3 font-mono text-[11px] text-slate-600"><span>native collector + embedded dashboard</span><span>.NET tool</span></div>
              </CommandFrame>
              <a href="/docs/getting-started/" className={`mt-3 inline-flex min-h-11 items-center gap-2 text-xs text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-blue-700 ${focus}`}>Read prerequisites and the full quickstart <ArrowUpRight aria-hidden="true" className="size-3" /></a>
            </div>
          </div>
          <div className="mt-12 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-3 sm:gap-8">
            <div><p className="font-mono text-xs text-blue-700">01 / INGEST</p><h2 className="mt-2 text-base font-medium">Standard OTLP in.</h2><p className="mt-1 text-sm leading-6 text-slate-600">Any compliant OpenTelemetry SDK.</p></div>
            <div className="sm:border-l sm:border-slate-200 sm:pl-8"><p className="font-mono text-xs text-blue-700">02 / STORE</p><h2 className="mt-2 text-base font-medium">Local DuckDB underneath.</h2><p className="mt-1 text-sm leading-6 text-slate-600">One analytical store with explicit retention.</p></div>
            <div className="sm:border-l sm:border-slate-200 sm:pl-8"><p className="font-mono text-xs text-blue-700">03 / INVESTIGATE</p><h2 className="mt-2 text-base font-medium">Useful context out.</h2><p className="mt-1 text-sm leading-6 text-slate-600">Query the evidence through your MCP client.</p></div>
          </div>
        </section>

        <section id="evidence" aria-labelledby="evidence-heading" className="border-y border-slate-200 bg-slate-100/60 py-14 sm:py-16">
          <div className={shell}>
            <div className="mb-8 grid gap-5 md:grid-cols-2 md:gap-14"><h2 id="evidence-heading" className="max-w-md text-3xl leading-[1.15] font-medium tracking-[-0.035em] sm:text-4xl">Read the run.<br /><span className="text-slate-600">Follow the cause.</span></h2><div className="md:pt-1"><p className="max-w-md text-sm leading-6 text-slate-600">A trace becomes more useful when the related logs are one query away. qyl keeps those connections available to both you and your agent.</p><p className="mt-3 font-mono text-[11px] text-blue-700">01 / A CORRELATED INVESTIGATION</p></div></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-1">
              <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4 text-xs"><span className="font-medium text-slate-800">Example investigation</span><span className="font-mono text-slate-600">Illustrative sample · not live data</span></figcaption>
                <div className="grid lg:grid-cols-[1.35fr_1fr]">
                  <div className="min-w-0 overflow-x-auto p-5 sm:p-6">
                    <div className="mb-5 flex min-w-80 items-center justify-between gap-4 font-mono text-xs"><span className="text-slate-600">trace / 7f3b…91c2</span><span className="text-slate-900">842 ms</span></div>
                    <table className="w-full min-w-80 border-collapse text-left font-mono text-xs leading-6">
                      <caption className="sr-only">Sample spans in an agent run. Durations are illustrative and do not describe qyl performance.</caption>
                      <thead className="border-b border-slate-200 text-[11px] text-slate-600"><tr><th scope="col" className="pb-2 font-normal">SPAN</th><th scope="col" className="pb-2 font-normal">STATUS</th><th scope="col" className="pb-2 text-right font-normal">DURATION</th></tr></thead>
                      <tbody className="divide-y divide-slate-200/70">
                        <tr><th scope="row" className="py-3 font-normal">agent.run</th><td className="text-slate-600">complete</td><td className="text-right">842 ms</td></tr>
                        <tr><th scope="row" className="py-3 pl-3 font-normal">tools/call</th><td className="text-slate-600">complete</td><td className="text-right">531 ms</td></tr>
                        <tr><th scope="row" className="py-3 pl-6 font-normal">search_logs</th><td className="text-slate-600">complete</td><td className="text-right">209 ms</td></tr>
                        <tr className="bg-blue-50 text-blue-800"><th scope="row" className="border-l-2 border-blue-700 py-3 pl-6 font-medium">db.query</th><td>timeout</td><td className="pr-2 text-right">113 ms</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-slate-200 p-5 sm:p-6 lg:border-t-0 lg:border-l">
                    <p className="mb-5 font-mono text-xs text-slate-600">MCP result / search_logs</p><p className="max-w-sm text-lg leading-7 font-medium tracking-tight">The timeout starts in the database call.</p>
                    <dl className="mt-5 space-y-3 font-mono text-xs"><div className="grid grid-cols-[5rem_1fr] gap-4"><dt className="text-slate-600">span</dt><dd>db.query</dd></div><div className="grid grid-cols-[5rem_1fr] gap-4"><dt className="text-slate-600">status</dt><dd className="break-all text-blue-800">deadline_exceeded</dd></div><div className="grid grid-cols-[5rem_1fr] gap-4"><dt className="text-slate-600">context</dt><dd>3 correlated log records</dd></div></dl>
                    <a href="/product/tracing/" className={`mt-6 inline-flex min-h-11 items-center gap-2 text-xs font-medium text-blue-700 hover:underline ${focus}`}>Explore trace investigations <ArrowRight aria-hidden="true" className="size-3.5" /></a>
                  </div>
                </div>
              </figure>
            </div>
          </div>
        </section>

        <section aria-labelledby="context-heading" className={`${shell} py-14 sm:py-16`}>
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div><p className="mb-3 font-mono text-[11px] text-blue-700">02 / THE SAME WORKING CONTEXT</p><h2 id="context-heading" className="text-3xl leading-[1.15] font-medium tracking-[-0.035em] sm:text-4xl">Less switching.<br /><span className="text-slate-600">More evidence.</span></h2><p className="mt-5 max-w-sm text-sm leading-6 text-slate-600">Let the agent query what happened. Keep the human investigation surface for the decisions that need you.</p><a href="/docs/workbench/" className={`mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-blue-700 hover:underline ${focus}`}>Inside the MCP workbench <ArrowRight aria-hidden="true" className="size-3.5" /></a></div>
            <dl className="border-t border-slate-200">{evidence.map((item) => <div key={item.id} className="grid gap-2 border-b border-slate-200 py-5 sm:grid-cols-[9rem_1fr] sm:gap-5"><dt><a href={item.route} className={`inline-flex min-h-11 items-center gap-3 text-sm font-medium hover:text-blue-700 ${focus}`}><span className="font-mono text-[11px] font-normal text-slate-600">{item.id}</span>{item.name}</a></dt><dd><p className="text-sm leading-6 text-slate-600">{item.detail}</p><p className="mt-2 font-mono text-[11px] text-blue-700">{item.technical}</p></dd></div>)}</dl>
          </div>
        </section>

        <section aria-labelledby="connect-heading" className="border-y border-slate-200 bg-slate-100/60 py-14 sm:py-16">
          <div className={shell}>
            <div className="mb-8 grid gap-5 md:grid-cols-2 md:gap-14"><h2 id="connect-heading" className="text-3xl leading-[1.15] font-medium tracking-[-0.035em] sm:text-4xl">Start local.<br /><span className="text-slate-600">Connect your agent.</span></h2><p className="max-w-md text-sm leading-6 text-slate-600 md:pt-1">After <code className="rounded-sm bg-slate-200/60 px-1 text-xs text-slate-800">qyl up</code>, point your application’s exporter at the receiver. Then connect an MCP client that supports protocol revision 2026-07-28.</p></div>
            <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]"><CommandFrame title="shell / application environment" command={exporterCommand} /><CommandFrame title="MCP client / stdio server" command={mcpCommand}><p className="px-5 pb-5 text-xs leading-5 text-slate-600">Add this server command to your compatible MCP client. <a href="/docs/mcp/" className={`text-blue-700 underline underline-offset-4 ${focus}`}>Connection guide</a></p></CommandFrame></div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-slate-600">Ready when your next debugging session is.</p><a href="/docs/getting-started/" className={`inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-medium text-slate-50 hover:bg-slate-700 ${focus}`}>Start locally <ArrowRight aria-hidden="true" className="size-3.5" /></a></div>
          </div>
        </section>
      </main>

      <footer className={`${shell} py-10`}>
        <div className="flex flex-col justify-between gap-7 sm:flex-row"><div><a href="/" className={`text-2xl font-semibold tracking-[-0.06em] ${focus}`}>qyl</a><p className="mt-2 text-xs text-slate-600">The run. The context. The evidence.</p></div><nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600">{productNavigation.map((item) => <a key={item.href} href={item.href} className={`inline-flex min-h-11 items-center hover:text-blue-700 ${focus}`}>{item.label}</a>)}<a href="/privacy/" className={`inline-flex min-h-11 items-center hover:text-blue-700 ${focus}`}>Privacy</a></nav></div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 font-mono text-[11px] text-slate-600"><span>qyl {versionOf("qyl")} / MCP {versionOf("qyl-mcp-server")}</span><a href={externalLinks.github} className={`inline-flex min-h-11 items-center gap-1 hover:text-blue-700 ${focus}`}>github.com/ANcpLua/qyl <ArrowUpRight aria-hidden="true" className="size-3" /></a></div>
      </footer>
    </div>
  );
}
