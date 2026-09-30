"use client";

import { ArrowRight, Check, Copy, Database, Inbox, MessageSquare, Smile } from "lucide-react";
import type { ReactNode } from "react";
import { externalLinks, primaryNavigation, productNavigation, versionOf } from "../../data/site";

// 1-bit desktop direction: black on white, pixel-edged windows, striped title bars and a
// dithered desktop. Static SSR; the host progressively enhances the command's copy button.
const command = "dotnet tool install --global qyl\nqyl up";
const chrome = "font-[Geneva,Verdana,ui-sans-serif,system-ui,sans-serif]";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black";
const shell = "mx-auto max-w-6xl px-4 sm:px-6";
const menuItem = `inline-flex min-h-11 items-center px-3 text-sm font-bold hover:bg-black hover:text-white ${focus}`;
const buttonBase = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-5 text-sm font-bold hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-black";
const button = `${buttonBase} focus-visible:outline-offset-4`;
// The default button of a classic dialog: a second heavy ring, clear of the focus outline.
const defaultButton = `${buttonBase} ring-[3px] ring-black ring-offset-2 focus-visible:outline-offset-8`;
const link = `inline-flex min-h-11 items-center gap-2 text-sm font-bold underline underline-offset-4 hover:bg-black hover:text-white hover:no-underline ${focus}`;
const eyebrow = "font-mono text-xs font-bold tracking-[0.12em] uppercase";

function Dither({ id }: { id: string }) {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" shapeRendering="crispEdges">
      <defs><pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse"><rect width="1" height="1" /><rect x="2" y="2" width="1" height="1" /></pattern></defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function Window({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`relative min-w-0 border-2 border-black bg-white shadow-[4px_4px_0_0_#000] ${className}`}>
      <div className="relative flex h-8 items-center justify-center border-b-2 border-black px-10">
        <span aria-hidden="true" className="absolute inset-x-1 inset-y-[7px] bg-[repeating-linear-gradient(to_bottom,#000_0_1px,#fff_1px_3px)]" />
        <span aria-hidden="true" className="absolute top-1/2 left-3 -translate-y-1/2 bg-white px-1"><span className="block size-3.5 border-2 border-black bg-white" /></span>
        <span className="relative truncate bg-white px-2 text-[13px] font-bold">{title}</span>
      </div>
      {children}
    </div>
  );
}

const steps = [
  { name: "Collect", icon: Inbox, detail: "Point a compliant OpenTelemetry SDK at qyl. One receiver for traces, logs, and metrics.", code: "OTLP → 127.0.0.1:4318", href: "/docs/telemetry/", action: "See ingestion details" },
  { name: "Store", icon: Database, detail: "Everything lands in a local DuckDB store with explicit retention.", code: "DuckDB, on your machine", href: "/product/logs/", action: "Read about logs" },
  { name: "Ask", icon: MessageSquare, detail: "Your coding agent queries the same evidence through MCP.", code: "MCP → your agent", href: "/docs/mcp/", action: "Connect over MCP" },
] as const;

const tools = [
  { name: "list_traces", result: "Traces to choose from" },
  { name: "get_trace", result: "One complete span tree" },
  { name: "display_traces", result: "Traces opened in an MCP App" },
] as const;

export default function SystemClassic() {
  return (
    <div className={`min-h-screen bg-white ${chrome} text-black selection:bg-black selection:text-white`}>
      <a href="#main" className={`sr-only fixed top-3 left-3 z-50 border-2 border-black bg-white p-4 font-bold focus:not-sr-only ${focus}`}>Skip to content</a>
      <header className="border-b-2 border-black bg-white">
        <div className={`${shell} flex min-h-12 items-center gap-1`}>
          <a href="/" aria-label="qyl home" className={`mr-1 inline-flex min-h-11 items-center gap-2 px-2 text-xl font-black tracking-[-0.06em] hover:bg-black hover:text-white ${focus}`}>
            <svg aria-hidden="true" viewBox="0 0 8 9" className="h-[18px] w-4" shapeRendering="crispEdges" fill="currentColor"><path d="M1 0h5v1H1zM0 1h1v4H0zM6 1h1v8H6zM1 5h5v1H1zM6 8h2v1H6z" /></svg>qyl
          </a>
          <nav aria-label="Main navigation" className="flex items-center">
            {primaryNavigation.map(({ href, label }) => <a key={href} href={href} className={`${menuItem} ${label === "Docs" ? "" : "max-sm:hidden"}`}>{label}</a>)}
          </nav>
          <a href="/docs/getting-started/" className={`ml-auto inline-flex min-h-11 items-center px-3 text-sm font-bold bg-black text-white hover:bg-white hover:text-black ${focus}`}>Start locally</a>
        </div>
      </header>

      <main id="main">
        <section aria-labelledby="sc-title" className="relative overflow-hidden border-b-2 border-black">
          <Dither id="sc-desktop" />
          <div className={`${shell} relative grid items-start gap-8 py-10 sm:py-14 lg:grid-cols-[1.12fr_1fr] lg:gap-10 lg:py-20`}>
            <Window title="Read Me">
              <div className="p-6 sm:p-9">
                <p className={`flex items-center gap-2 ${eyebrow}`}><span aria-hidden="true" className="size-2 bg-black" />It just works, in 1-bit.</p>
                <h1 id="sc-title" className="mt-6 text-[clamp(2rem,6.4vw,4.9rem)] leading-[0.98] font-black tracking-[-0.045em]">Plain evidence.<br />Black on white.</h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed">Traces, logs, and metrics from your own machine, laid out plainly enough for you and your coding agent to read.</p>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed">qyl collects OpenTelemetry locally in DuckDB and hands the evidence to your agent through MCP.</p>
                <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-5">
                  <a href="/docs/getting-started/" className={defaultButton}>Run qyl locally</a>
                  <a href="/docs/mcp/" className={button}>Connect your agent <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" /></a>
                </div>
                <p className="mt-7 text-xs">Free to use. The local product works without a hosted account.</p>
              </div>
            </Window>
            <div className="grid min-w-0 gap-8 lg:pt-12">
              <Window title="Terminal">
                <div data-command-panel="" className="p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="font-mono text-xs font-bold">~ / quick start</span>
                    <button type="button" data-copy-command={command} aria-label="Copy qyl install commands" className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border-2 border-black bg-white px-3 text-xs font-bold hover:bg-black hover:text-white ${focus}`}><Copy size={14} strokeWidth={2.5} aria-hidden="true" /><span data-copy-label="">Copy</span></button>
                  </div>
                  <pre className="overflow-x-auto border-2 border-black bg-black p-4 font-mono text-[13px] leading-7 text-white sm:text-sm"><code>$ dotnet tool install --global qyl{"\n"}$ qyl up<span aria-hidden="true" className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-white motion-reduce:animate-none" /></code></pre>
                  <div aria-live="polite" data-copy-status="" className="mt-3 min-h-4 font-mono text-xs font-bold" />
                </div>
              </Window>
              <Window title="qyl Info" className="lg:ml-8">
                <dl className="divide-y-2 divide-black font-mono text-xs sm:text-[13px]">
                  {[["Dashboard", "http://127.0.0.1:5100"], ["OTLP / HTTP", "127.0.0.1:4318"], ["OTLP / gRPC", "127.0.0.1:4317"], ["Kind", ".NET tool"]].map(([term, value]) => <div key={term} className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-3"><dt className="font-bold">{term}</dt><dd className="break-all">{value}</dd></div>)}
                </dl>
                <p className="flex items-center gap-2 border-t-2 border-black px-4 py-3 text-xs font-bold"><Check size={16} strokeWidth={3} aria-hidden="true" /> Collector + dashboard included</p>
              </Window>
            </div>
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="sc-evidence" className={`${shell} py-14 sm:py-20`}>
          <div className="mb-10 grid gap-5 md:grid-cols-12">
            <div className="md:col-span-7"><p className={eyebrow}>02 / Open the evidence</p><h2 id="sc-evidence" className="mt-4 text-4xl leading-[1.02] font-black tracking-[-0.04em] sm:text-5xl">Collect. Store. Ask.</h2></div>
            <p className="self-end text-base leading-relaxed md:col-span-5">Three steps, each one you can open and inspect. From the request that failed to the span that explains why.</p>
          </div>
          <Window title="Evidence">
            <div className="flex items-center justify-between gap-3 border-b-2 border-black px-4 py-1.5 text-xs font-bold"><span>3 items</span><span>on your machine</span></div>
            <ul className="grid sm:grid-cols-3">
              {steps.map(({ name, icon: Icon, detail, code, href, action }, index) => (
                <li key={name} className={`flex flex-col items-start p-6 sm:p-7 ${index > 0 ? "border-t-2 border-black sm:border-t-0 sm:border-l-2" : ""}`}>
                  <span className="flex size-14 items-center justify-center border-2 border-black bg-white shadow-[3px_3px_0_0_#000]"><Icon size={28} strokeWidth={2} aria-hidden="true" /></span>
                  <h3 className={`mt-5 px-1.5 text-lg font-bold ${index === 0 ? "bg-black text-white" : ""}`}>{name}</h3>
                  <p className="mt-3 text-sm leading-relaxed">{detail}</p>
                  <p className="mt-4 font-mono text-xs font-bold break-all">{code}</p>
                  <div className="mt-auto pt-5"><a href={href} className={link}>{action} <ArrowRight size={15} strokeWidth={2.5} aria-hidden="true" /></a></div>
                </li>
              ))}
            </ul>
          </Window>
        </section>

        <section aria-labelledby="sc-agent" className="border-y-2 border-black">
          <div className={`${shell} grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-12`}>
            <div className="lg:col-span-5">
              <p className={eyebrow}>03 / Ask the agent</p>
              <h2 id="sc-agent" className="mt-4 text-4xl leading-[1.02] font-black tracking-[-0.04em] sm:text-5xl">Ask the agent.<br />Keep the proof.</h2>
              <p className="mt-6 max-w-md text-base leading-relaxed">List traces, inspect a complete span tree, and open an MCP App when you need a closer look. Errors stay errors. Demo data is always explicit.</p>
              <a href="/docs/workbench/" className={`${link} mt-5`}>Inside the MCP workbench <ArrowRight size={15} strokeWidth={2.5} aria-hidden="true" /></a>
            </div>
            <Window title="MCP Tools" className="lg:col-span-7">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">MCP tools qyl gives your coding agent</caption>
                  <thead><tr className="border-b-2 border-black text-xs"><th scope="col" className="px-4 py-2.5 font-bold">Name</th><th scope="col" className="px-4 py-2.5 font-bold">What it returns</th></tr></thead>
                  <tbody>
                    {tools.map((tool, index) => <tr key={tool.name} className={`border-b border-dotted border-black ${index === 1 ? "bg-black text-white" : ""}`}><th scope="row" className="px-4 py-3.5 font-mono text-[13px] font-bold break-all">{tool.name}</th><td className="px-4 py-3.5">{tool.result}</td></tr>)}
                  </tbody>
                </table>
              </div>
              <p className="px-4 py-3 font-mono text-xs font-bold break-all">npx -y qyl-mcp-server --stdio</p>
            </Window>
          </div>
        </section>

        <section aria-labelledby="sc-signals" className="relative overflow-hidden border-b-2 border-black">
          <Dither id="sc-signals-desktop" />
          <div className={`${shell} relative grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:items-start`}>
            <Window title="Signals" className="lg:col-span-5">
              <div className="p-6 sm:p-8"><p className={eyebrow}>04 / Follow every signal</p><h2 id="sc-signals" className="mt-4 text-4xl leading-[1.02] font-black tracking-[-0.04em]">Pull down<br />any signal.</h2><p className="mt-5 text-base leading-relaxed">Every evidence path has its own page with the details. Pick one from the menu.</p></div>
            </Window>
            <div className="min-w-0 lg:col-span-5 lg:col-start-7">
              <p className="inline-flex min-h-10 items-center border-2 border-b-0 border-black bg-black px-4 text-sm font-bold text-white">Product</p>
              <ul className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
                {productNavigation.map(({ href, label }, index) => <li key={href} className={index < productNavigation.length - 1 ? "border-b border-dotted border-black" : ""}><a href={href} className="flex min-h-12 items-center justify-between gap-4 px-4 text-base font-bold hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"><span className="flex items-center gap-4"><span className="font-mono text-xs">0{index + 1}</span>{label}</span><ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" /></a></li>)}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="sc-start" className={`${shell} py-14 sm:py-20`}>
          <div className="mx-auto max-w-3xl border-2 border-black bg-white p-1.5 shadow-[4px_4px_0_0_#000]">
            <div className="grid gap-6 border-[3px] border-black p-6 sm:grid-cols-[auto_1fr] sm:gap-8 sm:p-9">
              <span className="flex size-16 items-center justify-center border-2 border-black"><Smile size={34} strokeWidth={2} aria-hidden="true" /></span>
              <div>
                <p className={eyebrow}>One plan. Every shipped feature.</p>
                <h2 id="sc-start" className="mt-3 text-4xl leading-none font-black tracking-[-0.04em] sm:text-5xl">Free on your machine.</h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed">The native collector, embedded dashboard, and MCP workbench are included. Your local setup works without a hosted account.</p>
                <div className="mt-8 flex flex-wrap justify-end gap-x-7 gap-y-5"><a href="/pricing/" className={button}>Read pricing</a><a href="/docs/getting-started/" className={defaultButton}>Start locally</a></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-black bg-white">
        <div className={`${shell} flex flex-col gap-8 py-10 md:flex-row md:items-end md:justify-between`}>
          <div><a href="/" aria-label="qyl home" className={`text-4xl font-black tracking-[-0.06em] ${focus}`}>qyl</a><p className="mt-3 font-mono text-xs font-bold">Welcome to your runtime.</p></div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {[["/docs/", "Documentation"], [externalLinks.github, "GitHub"], ["/faq/", "FAQ"], ["/privacy/", "Privacy"]].map(([href, label]) => <a key={href} href={href} className={`inline-flex min-h-11 items-center font-bold underline-offset-4 hover:underline ${focus}`}>{label}</a>)}
          </nav>
          <span className="font-mono text-xs font-bold">qyl {versionOf("qyl")} / MCP {versionOf("qyl-mcp-server")}</span>
        </div>
      </footer>
    </div>
  );
}
