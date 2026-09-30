"use client";

import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Code2, Copy, Database, GitBranch, Radio, Terminal, Waypoints } from "lucide-react";
import { externalLinks, versionOf } from "../../data/site";

const installCommand = "dotnet tool install --global qyl\nqyl up";
const mcpCommand = "npx -y qyl-mcp-server --stdio";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ab371d]";
const feedback = "motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.97] motion-reduce:transform-none";

const evidence = [
  { number: "01", title: "Follow a request", description: "Read the full trace and see how the work moved through your application.", href: "/product/tracing/", icon: GitBranch },
  { number: "02", title: "Find the conversation", description: "Search logs correlated with the run you are already investigating.", href: "/product/logs/", icon: Terminal },
  { number: "03", title: "Keep the bigger picture", description: "Query metric series over a time window, with useful buckets returned.", href: "/product/metrics/", icon: Radio },
];

/**
 * React Bits Pro Playful Motion + Developer Tool composition.
 * Adapts Features4's explanatory two-column structure into native disclosure.
 * Static rendering and user-triggered motion honor this project's speed brief.
 */
export default function PlayfulMotion() {
  return (
    <div className="min-h-screen bg-[#fffdf8] font-sans text-[#27231f] antialiased selection:bg-[#ffd3bd]">
      <a href="#main" className={`sr-only z-50 rounded-full bg-[#27231f] px-5 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${focus}`}>Skip to content</a>

      <header className="mx-auto flex h-22 max-w-[1200px] items-center justify-between gap-5 px-5 sm:px-8">
        <a href="/" aria-label="qyl home" className={`flex items-center gap-2.5 rounded-full ${focus}`}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1603e]"><Waypoints aria-hidden="true" className="size-6 text-[#27231f]" strokeWidth={2} /></span>
          <span className="text-3xl font-bold tracking-[-0.08em]">qyl</span>
        </a>
        <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm font-medium sm:gap-8">
          <a href="/product/tracing/" className={`hidden rounded-sm hover:underline md:inline ${focus}`}>Product</a>
          <a href="/docs/" className={`rounded-sm hover:underline ${focus}`}>Docs</a>
          <a href="/pricing/" className={`hidden rounded-sm hover:underline sm:inline ${focus}`}>Pricing</a>
          <a href="/docs/getting-started/" className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-[#27231f] px-5 text-[#fffdf8] hover:bg-[#484038] ${feedback} ${focus}`}>
            Start locally <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </nav>
      </header>

      <main id="main">
        <section aria-labelledby="hero-title" className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-18 pt-11 sm:px-8 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pb-24 lg:pt-18">
          <div>
            <a href="/docs/getting-started/" className={`mb-7 inline-flex min-h-8 items-center gap-2 rounded-full border border-[#dfd9ce] px-3.5 py-1 text-xs font-semibold ${focus}`}>
              <span className="size-1.5 rounded-full bg-[#ab371d]" aria-hidden="true" />
              qyl {versionOf("qyl")} · Your local observability companion
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
            <h1 id="hero-title" className="max-w-[10ch] text-[48px] leading-[1.02] font-bold tracking-[-0.055em] sm:text-[68px] lg:text-[76px]">
              Follow the signals.<br /><span className="text-[#ab371d]">Find the fix.</span>
            </h1>
            <p className="mt-6 max-w-[42ch] text-[17px] leading-7 text-[#655d53] sm:text-lg">
              Traces, logs and metrics, right where you work. Give your coding agent the runtime context it needs, through MCP.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a href="/docs/getting-started/" className={`inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#f1603e] px-7 text-base font-semibold hover:bg-[#e95533] ${feedback} ${focus}`}>
                Let’s run qyl <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a href={externalLinks.github} className={`inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold underline decoration-[#cbc1b4] underline-offset-4 hover:decoration-[#27231f] ${focus}`}>
                Explore the source <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
            <div className="mt-8 max-w-[470px] rounded-[20px] border border-[#e8e0d5] bg-white p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="font-mono text-[11px] tracking-wider text-[#6a6157]">YOUR TERMINAL</span>
                <button type="button" data-copy-command={installCommand} aria-label="Copy install and run commands" className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold hover:bg-[#f4f0e8] ${focus}`}>
                  <Copy className="size-3.5" aria-hidden="true" /><span data-copy-label aria-live="polite">Copy</span>
                </button>
              </div>
              <pre className="overflow-x-auto pb-1 font-mono text-xs leading-7 sm:text-sm"><code><span className="text-[#ab371d]">dotnet</span> tool install --global qyl{"\n"}<span className="text-[#ab371d]">qyl</span> up</code></pre>
              <p className="mt-3 border-t border-[#e8e0d5] pt-3 text-xs text-[#6a6157]">Then open the dashboard at <code className="text-[#27231f]">127.0.0.1:5100</code></p>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-[#6a6157]"><Check className="size-3.5" aria-hidden="true" /> Free to run. No hosted account needed.</p>
          </div>

          <figure className="relative mx-auto w-full max-w-[480px] rounded-[32px] bg-[#f8e8da] px-6 py-8 sm:rounded-[48px] sm:px-10 sm:py-10">
            <figcaption className="mb-9 flex items-center justify-between text-[11px] font-semibold tracking-[0.12em] text-[#74513c]">
              <span>THE SHORT WAY TO CONTEXT</span><span>01 → 03</span>
            </figcaption>
            <div className="flex flex-col items-center">
              <div className="flex w-full max-w-76 items-center gap-4 rounded-[20px] bg-[#fffdf8] p-5">
                <Code2 className="size-7 shrink-0 text-[#74513c]" aria-hidden="true" />
                <div><p className="text-lg font-semibold">Your application</p><p className="mt-1 text-sm text-[#6a6157]">Any OpenTelemetry SDK</p></div>
              </div>
              <div className="flex h-17 items-center gap-3 text-[#74513c]"><ArrowDown className="size-5" aria-hidden="true" /><span className="font-mono text-xs">OTLP</span></div>
              <div className="w-full max-w-76 rounded-[32px] bg-[#f1603e] px-6 py-7 text-center">
                <span className="text-[56px] leading-none font-bold tracking-[-0.07em]">qyl</span>
                <p className="mt-3 text-sm font-medium">Collect. Connect. Understand.</p>
                <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#fffdf8]/75 px-3 py-2 text-xs"><Database className="size-3.5" aria-hidden="true" /> Local DuckDB storage</div>
              </div>
              <div className="flex h-17 items-center gap-3 text-[#74513c]"><ArrowDown className="size-5" aria-hidden="true" /><span className="font-mono text-xs">MCP</span></div>
              <div className="flex w-full max-w-76 items-center gap-4 rounded-[20px] bg-[#fffdf8] p-5">
                <Waypoints className="size-7 shrink-0 text-[#74513c]" aria-hidden="true" />
                <div><p className="text-lg font-semibold">Your coding agent</p><p className="mt-1 text-sm text-[#6a6157]">Runtime evidence in context</p></div>
              </div>
            </div>
            <p className="mt-8 text-center text-xs text-[#74513c]">Architecture, minus the detours.</p>
          </figure>
        </section>

        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-y border-[#e8e0d5] py-6 text-sm text-[#655d53]">
            <span className="font-medium text-[#27231f]">Familiar pieces. One useful loop.</span>
            <span className="font-mono text-xs">OpenTelemetry</span><span className="font-mono text-xs">DuckDB</span><span className="font-mono text-xs">Native AOT</span><span className="font-mono text-xs">MCP</span>
          </div>
        </div>

        <section aria-labelledby="evidence-title" className="mx-auto max-w-[1200px] px-5 py-18 sm:px-8 lg:py-24">
          <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
            <div><p className="mb-4 text-xs font-semibold tracking-[0.12em] text-[#ab371d]">MAKE THE NEXT QUESTION COUNT</p><h2 id="evidence-title" className="max-w-[15ch] text-4xl leading-[1.08] font-bold tracking-[-0.04em] sm:text-5xl">The clues belong together.</h2></div>
            <p className="max-w-[44ch] text-[17px] leading-7 text-[#655d53]">Follow a trace, read its logs, then ask what changed. qyl gives you and your agent a shared place to investigate.</p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {evidence.map(({ number, title, description, href, icon: Icon }) => (
              <a key={number} href={href} className={`group border-t border-[#d8cfc2] pt-6 ${focus}`}>
                <div className="mb-7 flex items-center justify-between"><span className="flex size-12 items-center justify-center rounded-xl bg-[#f3eee5]"><Icon className="size-5 text-[#74513c]" aria-hidden="true" /></span><span className="font-mono text-xs text-[#6a6157]">{number}</span></div>
                <h3 className="flex items-center justify-between gap-2 text-xl font-semibold tracking-tight">{title}<ArrowUpRight className="size-5 shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 motion-reduce:transform-none" aria-hidden="true" /></h3>
                <p className="mt-3 text-base leading-7 text-[#655d53]">{description}</p>
              </a>
            ))}
          </div>
        </section>

        <section aria-labelledby="agent-title" className="mx-auto max-w-[1200px] px-5 pb-18 sm:px-8 lg:pb-24">
          <div className="grid gap-10 rounded-[32px] bg-[#f3eee5] p-6 sm:rounded-[48px] sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:p-14">
            <div>
              <p className="mb-5 text-xs font-semibold tracking-[0.12em] text-[#ab371d]">BRING YOUR AGENT ALONG</p>
              <h2 id="agent-title" className="text-4xl leading-[1.08] font-bold tracking-[-0.04em] sm:text-5xl">Less copying.<br />More context.</h2>
              <p className="mt-5 max-w-[40ch] text-[17px] leading-7 text-[#655d53]">Connect over MCP to query the evidence directly. Keep the dashboard for the moments when you want to look for yourself.</p>
              <a href="/docs/mcp/" className={`mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold underline decoration-[#cbc1b4] underline-offset-4 hover:decoration-[#27231f] ${focus}`}>Read the MCP guide <ArrowRight className="size-4" aria-hidden="true" /></a>
            </div>
            <div className="self-center">
              <div className="rounded-[20px] bg-[#fffdf8] p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs font-medium"><Terminal className="size-4" aria-hidden="true" /> Local MCP · stdio</span><button type="button" data-copy-command={mcpCommand} aria-label="Copy local MCP command" className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold hover:bg-[#f3eee5] ${focus}`}><Copy className="size-3.5" aria-hidden="true" /><span data-copy-label aria-live="polite">Copy</span></button></div>
                <pre className="overflow-x-auto pb-2 font-mono text-xs leading-7 sm:text-sm"><code><span className="text-[#ab371d]">npx</span> -y qyl-mcp-server --stdio</code></pre>
              </div>
              <details className="group mt-4 rounded-[20px] border border-[#d8cfc2]">
                <summary className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 rounded-[20px] px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden ${focus}`}>
                  What happens after connecting?<ChevronDown className="size-4 shrink-0 group-open:rotate-180 motion-safe:transition-transform motion-reduce:transition-none" aria-hidden="true" />
                </summary>
                <div className="border-t border-[#d8cfc2] px-5 py-5 text-sm leading-6 text-[#655d53]">
                  <p>Your agent can list traces, read a complete trace and search logs. The workbench keeps requests, results and protocol timelines available for inspection.</p>
                  <a href="/docs/workbench/" className={`mt-3 inline-flex min-h-11 items-center gap-2 rounded-sm font-semibold text-[#27231f] underline underline-offset-4 ${focus}`}>Explore the workbench <ArrowUpRight className="size-3.5" aria-hidden="true" /></a>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section aria-labelledby="start-title" className="mx-auto max-w-[1200px] px-5 pb-18 text-center sm:px-8 lg:pb-24">
          <p className="mb-5 text-xs font-semibold tracking-[0.12em] text-[#ab371d]">YOUR NEXT DEBUGGING SESSION</p>
          <h2 id="start-title" className="text-4xl leading-[1.08] font-bold tracking-[-0.04em] sm:text-5xl">Start with a little more context.</h2>
          <p className="mx-auto mt-5 max-w-[50ch] text-[17px] leading-7 text-[#655d53]">The local collector, dashboard and MCP workbench are free. Bring an app. Follow a signal. See where it takes you.</p>
          <a href="/docs/getting-started/" className={`mt-7 inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#f1603e] px-7 font-semibold hover:bg-[#e95533] ${feedback} ${focus}`}>Start locally <ArrowRight className="size-4" aria-hidden="true" /></a>
          <p className="mt-4 text-sm text-[#655d53]">No hosted account needed. <a href="/pricing/" className={`rounded-sm underline underline-offset-4 ${focus}`}>See what’s included</a></p>
        </section>
      </main>

      <footer className="border-t border-[#e8e0d5]">
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-7 px-5 py-9 sm:px-8 md:flex-row md:items-center">
          <a href="/" className={`inline-flex w-fit items-baseline gap-4 rounded-sm ${focus}`}><span className="text-3xl font-bold tracking-[-0.08em]">qyl</span><span className="text-xs text-[#6a6157]">A little closer to the answer.</span></a>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-4 text-xs font-medium text-[#655d53]">
            <a href="/docs/" className={`rounded-sm hover:underline ${focus}`}>Documentation</a><a href={externalLinks.github} className={`rounded-sm hover:underline ${focus}`}>GitHub</a><a href="/faq/" className={`rounded-sm hover:underline ${focus}`}>FAQ</a><a href="/privacy/" className={`rounded-sm hover:underline ${focus}`}>Privacy</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
