"use client";

import { ArrowRight, ArrowUpRight, Copy } from "lucide-react";
import type { ReactNode } from "react";
import { externalLinks, primaryNavigation, productNavigation, releaseWave, versionOf } from "../../data/site";

// Lab Notebook direction: a research-paper page with numbered sections, figures, a listing and footnotes.
// Static SSR; the host progressively enhances the command's copy button.
const command = "dotnet tool install --global qyl\nqyl up";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1e40af]";
const shell = "mx-auto max-w-[1120px] px-5 sm:px-8";
const serif = "font-[Georgia,Cambria,serif]";
const link = `underline decoration-[#1e40af]/50 underline-offset-4 text-[#1e40af] hover:decoration-[#1e40af] ${focus}`;
const caption = "mt-3 text-sm leading-6 text-[#4b4b45]";

function Note({ n }: { n: number }) {
  return <sup className="ml-0.5 text-[0.7em]"><a id={`nb-ref-${n}`} href={`#nb-fn-${n}`} aria-label={`Note ${n}`} className={link}>{n}</a></sup>;
}

function Section({ id, n, title, children }: { id: string; n: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-6">
      <h2 id={id} className="flex gap-3 text-2xl font-semibold tracking-[-0.01em]"><span className="font-mono text-base font-normal text-[#4b4b45] tabular-nums">{n}</span>{title}</h2>
      <div className="mt-4 space-y-4 text-[17px] leading-[1.75]">{children}</div>
    </section>
  );
}

const endpoints = [
  ["Dashboard", "HTTP", "127.0.0.1:5100"],
  ["OTLP receiver", "HTTP / protobuf", "127.0.0.1:4318"],
  ["OTLP receiver", "gRPC", "127.0.0.1:4317"],
] as const;

export default function LabNotebook() {
  return (
    <div className={`min-h-screen bg-[#fdfcf8] ${serif} text-[#1c1c1a] antialiased selection:bg-[#dbe4ff]`}>
      <a href="#main" className={`sr-only z-50 bg-white px-4 py-3 font-sans focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${focus}`}>Skip to content</a>
      <header className="border-b border-[#1c1c1a]">
        <div className={`${shell} flex min-h-16 items-center justify-between gap-5 font-sans`}>
          <a href="/" aria-label="qyl home" className={`inline-flex min-h-11 items-center gap-3 ${focus}`}><span className="text-2xl font-semibold tracking-[-0.05em]">qyl</span><span className="hidden text-xs text-[#4b4b45] sm:inline">Technical report · rev. {versionOf("qyl")}</span></a>
          <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm sm:gap-6">
            {primaryNavigation.map(({ href, label }) => <a key={href} href={href} className={`${label === "Docs" ? "inline-flex" : "hidden md:inline-flex"} min-h-11 items-center hover:text-[#1e40af] ${focus}`}>{label}</a>)}
            <a href="/docs/getting-started/" className={`inline-flex min-h-11 items-center gap-2 border border-[#1c1c1a] px-4 font-medium hover:bg-[#1c1c1a] hover:text-white ${focus}`}>Start locally</a>
          </nav>
        </div>
      </header>

      <main id="main">
        <div className={`${shell} pt-12 pb-10 text-center sm:pt-18`}>
          <p className="font-sans text-xs tracking-[0.18em] text-[#4b4b45] uppercase">Release wave {releaseWave} · Local observability</p>
          <h1 id="nb-title" className="mx-auto mt-6 max-w-3xl text-[clamp(2.6rem,6.4vw,4.75rem)] leading-[1.04] font-normal tracking-[-0.03em]">Observed, recorded, reproduced.</h1>
          <p className="mt-6 text-lg italic text-[#4b4b45]">The qyl project</p>
          <p className="mt-1 font-sans text-sm text-[#4b4b45]">OpenTelemetry, DuckDB and MCP on your own machine</p>
        </div>

        <section aria-labelledby="nb-abstract" className={`${shell} pb-12`}>
          <div className="mx-auto max-w-3xl border-y border-[#1c1c1a] py-6">
            <h2 id="nb-abstract" className="font-sans text-xs font-semibold tracking-[0.18em] uppercase">Abstract</h2>
            <p className="mt-3 text-[17px] leading-[1.75]">A coding agent can read the source, but not the run that failed. We describe qyl, a local collector that receives OpenTelemetry traces, logs and metrics, stores them in DuckDB<Note n={1} />, and exposes the same evidence to the agent over MCP<Note n={2} />. The investigation that follows cites spans and log records instead of guesses.</p>
            <p className="mt-4 font-sans text-sm text-[#4b4b45]"><span className="font-semibold text-[#1c1c1a]">Keywords:</span> OpenTelemetry · DuckDB · Model Context Protocol · local-first</p>
          </div>
        </section>

        <div className={`${shell} grid gap-14 pb-16 lg:grid-cols-2 lg:gap-16`}>
          <div className="min-w-0 space-y-12">
            <Section id="nb-intro" n="1" title="Introduction">
              <p>Debugging with an agent usually ends at the edge of the repository. The traces, logs and metrics that explain a failure live in a dashboard the agent cannot open. qyl moves that evidence next to the code and keeps it there.</p>
            </Section>
            <Section id="nb-methods" n="2" title="Methods">
              <p>Install the dotnet tool and start the collector. The dashboard and both OTLP receivers come up on loopback, as listed in Table 1.</p>
              <figure data-command-panel="" className="border border-[#1c1c1a] bg-white font-sans">
                <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[#1c1c1a] px-4"><span className="text-xs font-semibold tracking-[0.12em] uppercase">Listing 1</span><button type="button" data-copy-command={command} aria-label="Copy qyl install commands" className={`inline-flex min-h-11 items-center gap-2 px-2 text-xs font-medium hover:text-[#1e40af] ${focus}`}><Copy aria-hidden="true" className="size-3.5" /><span data-copy-label="">Copy</span></button></div>
                <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-7 sm:text-sm"><code><span className="text-[#4b4b45] select-none">1  </span>dotnet tool install --global qyl{"\n"}<span className="text-[#4b4b45] select-none">2  </span>qyl up</code></pre>
                <figcaption className="border-t border-dashed border-[#1c1c1a]/40 px-4 py-3 text-xs text-[#4b4b45]">Listing 1. Installation and start. <span aria-live="polite" data-copy-status="" className="text-[#1e40af]" /></figcaption>
              </figure>
              <p>Point any compliant OpenTelemetry SDK at the receiver. No hosted account is involved in this setup<Note n={3} />. See the <a href="/docs/telemetry/" className={link}>telemetry documentation</a> for exporter settings.</p>
            </Section>
          </div>

          <div className="min-w-0 space-y-12">
            <figure>
              <div className="grid gap-3 border border-[#1c1c1a] bg-white p-5 font-sans text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                {["Your application", "qyl + DuckDB", "Coding agent"].flatMap((node, index) => [
                  <div key={node} className="border border-[#1c1c1a] px-3 py-4 text-center font-medium">{node}</div>,
                  ...(index < 2 ? [<div key={`${node}-edge`} className="text-center font-mono text-xs text-[#4b4b45]"><span aria-hidden="true" className="hidden sm:inline">→<br /></span>{index === 0 ? "OTLP" : "MCP"}</div>] : []),
                ])}
              </div>
              <figcaption className={caption}><span className="font-semibold text-[#1c1c1a]">Figure 1.</span> Signal path from an instrumented application to a coding agent. Schematic, not to scale.</figcaption>
            </figure>
            <figure className="min-w-0 overflow-x-auto">
              <table className="w-full min-w-[20rem] border-collapse border-y-2 border-[#1c1c1a] text-left font-sans text-sm">
                <caption className="mb-3 caption-top text-left text-sm text-[#4b4b45]"><span className="font-semibold text-[#1c1c1a]">Table 1.</span> Local endpoints after <code className="font-mono">qyl up</code>.</caption>
                <thead className="border-b border-[#1c1c1a]"><tr><th scope="col" className="py-2 pr-4 font-semibold">Component</th><th scope="col" className="py-2 pr-4 font-semibold">Protocol</th><th scope="col" className="py-2 font-semibold">Address</th></tr></thead>
                <tbody>{endpoints.map(([name, protocol, address]) => <tr key={address} className="border-b border-[#1c1c1a]/20"><th scope="row" className="py-3 pr-4 font-normal">{name}</th><td className="py-3 pr-4 text-[#4b4b45]">{protocol}</td><td className="py-3 font-mono text-xs">{address}</td></tr>)}</tbody>
              </table>
            </figure>
            <Section id="nb-results" n="3" title="Observations">
              <p>Through MCP the agent lists traces, reads a complete span tree and opens a closer view: <code className="font-mono text-[15px]">list_traces</code>, <code className="font-mono text-[15px]">get_trace</code> and <code className="font-mono text-[15px]">display_traces</code>. Errors stay errors, and demo data is always marked as demo data.</p>
            </Section>
          </div>
        </div>

        <div className="border-t border-[#1c1c1a]">
          <div className={`${shell} grid gap-14 py-16 lg:grid-cols-2 lg:gap-16`}>
            <Section id="nb-supplement" n="4" title="Supplementary material">
              <ol className="border-t border-[#1c1c1a]/30 font-sans">{productNavigation.map(({ href, label }, index) => <li key={href}><a href={href} className={`group flex min-h-14 items-center justify-between gap-4 border-b border-[#1c1c1a]/30 py-2 hover:text-[#1e40af] ${focus}`}><span className="flex items-baseline gap-4"><span className="font-mono text-xs text-[#4b4b45]">S{index + 1}</span><span className="text-lg">{label}</span></span><ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" /></a></li>)}</ol>
            </Section>
            <Section id="nb-availability" n="5" title="Availability">
              <p>qyl is free to use. One plan covers every shipped feature: the native collector, the embedded dashboard and the MCP workbench.</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 font-sans">
                <a href="/docs/getting-started/" className={`inline-flex min-h-12 items-center gap-2 bg-[#1c1c1a] px-5 text-sm font-medium text-white hover:bg-[#1e40af] ${focus}`}>Reproduce locally <ArrowRight aria-hidden="true" className="size-4" /></a>
                <a href="/pricing/" className={`${link} inline-flex min-h-11 items-center text-sm`}>Pricing details</a>
              </div>
            </Section>
          </div>
        </div>

        <section aria-labelledby="nb-notes" className="border-t border-[#1c1c1a]">
          <div className={`${shell} grid gap-10 py-12 lg:grid-cols-2 lg:gap-16`}>
            <div><h2 id="nb-notes" className="font-sans text-xs font-semibold tracking-[0.18em] uppercase">Notes</h2>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-[#4b4b45]">
                <li id="nb-fn-1">1. One analytical store with explicit retention. <a href="#nb-ref-1" aria-label="Back to note 1" className={link}>↩</a></li>
                <li id="nb-fn-2">2. The MCP server is published as qyl-mcp-server {versionOf("qyl-mcp-server")}. <a href="#nb-ref-2" aria-label="Back to note 2" className={link}>↩</a></li>
                <li id="nb-fn-3">3. The local product works without a hosted account. <a href="#nb-ref-3" aria-label="Back to note 3" className={link}>↩</a></li>
              </ol>
            </div>
            <div><h2 className="font-sans text-xs font-semibold tracking-[0.18em] uppercase">References</h2>
              <ol className="mt-4 space-y-2 text-sm leading-6">
                <li>[1] qyl source. <a href={externalLinks.github} className={`${link} inline-flex min-h-11 items-center gap-1 break-all`}>github.com/ANcpLua/qyl <ArrowUpRight aria-hidden="true" className="size-3.5" /></a></li>
                <li>[2] qyl on NuGet. <a href={externalLinks.nuget} className={`${link} inline-flex min-h-11 items-center gap-1 break-all`}>nuget.org/packages/qyl <ArrowUpRight aria-hidden="true" className="size-3.5" /></a></li>
                <li>[3] qyl-mcp-server on npm. <a href={externalLinks.npm} className={`${link} inline-flex min-h-11 items-center gap-1 break-all`}>npmjs.com/package/qyl-mcp-server <ArrowUpRight aria-hidden="true" className="size-3.5" /></a></li>
              </ol>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1c1c1a]">
        <div className={`${shell} flex flex-col gap-4 py-8 font-sans text-xs text-[#4b4b45] sm:flex-row sm:items-center sm:justify-between`}>
          <p><a href="/" className={`text-base font-semibold text-[#1c1c1a] ${focus}`}>qyl</a> {versionOf("qyl")} · Local signals. Shared context.</p>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5">{[["/docs/", "Documentation"], ["/faq/", "FAQ"], ["/privacy/", "Privacy"]].map(([href, label]) => <a key={href} href={href} className={`inline-flex min-h-11 items-center hover:text-[#1e40af] ${focus}`}>{label}</a>)}</nav>
        </div>
      </footer>
    </div>
  );
}
