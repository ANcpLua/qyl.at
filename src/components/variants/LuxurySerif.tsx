"use client";

import { externalLinks, versionOf } from "../../data/site";

const link = "inline-flex min-h-11 items-center border-b border-[#1A1712]/30 text-[11px] uppercase tracking-[0.16em] transition-colors duration-500 hover:border-[#1A1712] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#1A1712] motion-reduce:transition-none";
const eyebrow = "text-[11px] font-medium uppercase tracking-[0.22em]";
const serif = "font-[Georgia,serif] font-normal tracking-[-0.04em]";
const install = "dotnet tool install --global qyl\nqyl up";

export default function LuxurySerif() {
  return (
    <div className="min-h-screen bg-[#F4F1EA] font-sans text-[#1A1712] antialiased selection:bg-[#D8D1C4] selection:text-[#1A1712]">
      <a href="#main" className="sr-only z-50 bg-[#1A1712] p-4 text-[#F4F1EA] focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <header className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 md:h-24 md:px-12 xl:px-20">
        <a href="/" aria-label="qyl home" className={`${serif} text-[40px] leading-none focus-visible:outline focus-visible:outline-offset-4`}>qyl<span className="text-[22px]">.</span></a>
        <nav aria-label="Main navigation" className="flex items-center gap-7 md:gap-12">
          <a href="/product/tracing/" className={`${link} max-md:hidden border-transparent`}>Product</a>
          <a href="/docs/" className={`${link} border-transparent`}>Docs</a>
          <a href={externalLinks.github} className={`${link} max-lg:hidden border-transparent`}>Source</a>
          <a href="/docs/getting-started/" className={link}>Start locally <span aria-hidden="true" className="ml-3 text-base">↗</span></a>
        </nav>
      </header>

      <main id="main">
        <section aria-labelledby="luxury-title" className="mx-auto max-w-[1440px] px-6 pb-16 pt-10 md:px-12 md:pb-24 md:pt-24 xl:px-20">
          <div className="mb-7 flex items-center justify-between gap-4 md:mb-12">
            <p className={eyebrow}>Local observability, considered.</p>
            <span className="hidden text-[11px] uppercase tracking-[0.12em] text-[#6E665A] sm:block">qyl {versionOf("qyl")}</span>
          </div>
          <h1 id="luxury-title" className={`${serif} max-w-[1100px] text-[clamp(3.9rem,9.6vw,8.6rem)] leading-[0.99]`}>
            Every trace.<br />
            <span className="italic">In context.</span>
          </h1>
          <div className="mt-8 flex flex-col justify-between gap-4 md:mt-12 md:flex-row md:items-end md:gap-8">
            <p className="max-w-[425px] text-[16px] leading-[1.7] text-[#6E665A]">
              Your code tells a story. qyl brings its traces, logs and metrics together — so your coding agent can read what actually happened.
            </p>
            <a href="/docs/mcp/" className={`${link} self-start md:self-auto`}>Give your agent the evidence <span aria-hidden="true" className="ml-4 text-base">↗</span></a>
          </div>
          <div className="mt-8 flex flex-col gap-5 border-y border-[#D8D1C4] py-6 sm:flex-row sm:items-center sm:justify-between md:mt-16">
            <div className="min-w-0">
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#6E665A]">Begin on your machine</p>
              <pre tabIndex={0} aria-label="Install and start qyl" className="max-w-full overflow-x-auto font-mono text-[12px] leading-7 focus-visible:outline focus-visible:outline-offset-2 sm:text-[13px]"><code><span aria-hidden="true" className="select-none text-[#6E665A]">$ </span><span className="font-semibold">dotnet</span> tool install --global qyl{"\n"}<span aria-hidden="true" className="select-none text-[#6E665A]">$ </span><span className="font-semibold">qyl</span> up</code></pre>
            </div>
            <button type="button" data-copy={install} className={`${link} shrink-0 self-start sm:self-center`}><span data-copy-label>Copy commands</span><span aria-hidden="true" className="ml-4 text-base">⧉</span></button>
          </div>
          <p role="status" aria-live="polite" data-copy-status className="mt-2 min-h-5 text-xs text-[#6E665A]" />
        </section>

        <section aria-labelledby="luxury-approach" className="border-t border-[#D8D1C4] bg-[#EDE8DE] px-6 py-24 md:px-12 md:py-32 xl:px-20">
          <div className="mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
            <div>
              <p className={`${eyebrow} mb-8 text-[#5A5348]`}>01 / The approach</p>
              <h2 id="luxury-approach" className={`${serif} max-w-[500px] text-[clamp(2.7rem,4.7vw,4.5rem)] leading-[1.08]`}>A shorter distance<br />from signal<br />to <em>understanding.</em></h2>
              <p className="mt-9 max-w-[350px] text-[16px] leading-[1.7] text-[#5A5348]">Collect through an open standard. Keep the data local. Put the evidence in the conversation where the work happens.</p>
            </div>
            <div className="lg:pt-10">
              {[
                { number: "I", title: "Collect", sub: "OpenTelemetry", text: "Point any compliant OTLP SDK at qyl. Traces, logs and metrics arrive through the same local receiver.", href: "/docs/telemetry/" },
                { number: "II", title: "Keep", sub: "Local DuckDB", text: "One local analytical store with explicit retention. The collector and dashboard run on your machine.", href: "/docs/getting-started/" },
                { number: "III", title: "Ask", sub: "Model Context Protocol", text: "Let your agent inspect traces, search correlated logs and work with execution evidence over MCP.", href: "/docs/mcp/" },
              ].map((item) => (
                <article key={item.number} className="grid grid-cols-[30px_1fr] gap-5 border-t border-[#D8D1C4] py-8 first:pt-0 first:border-t-0 sm:grid-cols-[45px_1fr]">
                  <span aria-hidden="true" className="pt-3 font-[Georgia,serif] text-[20px] text-[#5A5348]">{item.number}</span>
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className={`${serif} text-[36px]`}>{item.title}</h3>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[#5A5348]">{item.sub}</span>
                    </div>
                    <p className="mt-4 max-w-[430px] text-[15px] leading-[1.75] text-[#5A5348]">{item.text}</p>
                    <a href={item.href} className={`${link} mt-4`}>Read the details <span aria-hidden="true" className="ml-3 text-base">↗</span></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="luxury-evidence" className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-32 xl:px-20">
          <div className="mb-16 flex flex-col justify-between gap-9 md:flex-row md:items-end">
            <div>
              <p className={`${eyebrow} mb-8 text-[#6E665A]`}>02 / The evidence</p>
              <h2 id="luxury-evidence" className={`${serif} text-[clamp(2.7rem,5.2vw,4.7rem)] leading-[1.1]`}>Nothing lost<br />in <em>translation.</em></h2>
            </div>
            <p className="max-w-[345px] text-[16px] leading-[1.7] text-[#6E665A]">The same execution, seen from every angle. Explore the signal itself, then follow the connections.</p>
          </div>
          <div className="border-t border-[#D8D1C4]">
            {[
              { n: "01", title: "Traces", text: "Follow a request through its spans.", href: "/product/tracing/" },
              { n: "02", title: "Logs", text: "Find the records behind the result.", href: "/product/logs/" },
              { n: "03", title: "Metrics", text: "Read the pattern across a time window.", href: "/product/metrics/" },
              { n: "04", title: "MCP evidence", text: "Inspect calls, approvals and protocol frames.", href: "/product/mcp-evidence/" },
              { n: "05", title: "CI telemetry", text: "Bring build runs into the investigation.", href: "/product/ci/" },
            ].map((item) => (
              <a key={item.n} href={item.href} className="group grid min-h-28 grid-cols-[25px_1fr_22px] items-center gap-x-4 gap-y-2 border-b border-[#D8D1C4] py-6 outline-offset-4 focus-visible:outline focus-visible:outline-1 md:grid-cols-[60px_1fr_1fr_30px] md:gap-x-8">
                <span className="text-[11px] text-[#6E665A]">{item.n}</span>
                <h3 className={`${serif} text-[29px] md:text-[36px]`}>{item.title}</h3>
                <p className="col-start-2 row-start-2 text-[14px] leading-relaxed text-[#6E665A] md:col-start-3 md:row-start-1">{item.text}</p>
                <span aria-hidden="true" className="col-start-3 row-start-1 text-2xl transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none md:col-start-4">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section aria-labelledby="luxury-start" className="border-y border-[#D8D1C4] bg-[#EDE8DE] px-6 py-24 md:px-12 md:py-32 xl:px-20">
          <div className="mx-auto grid max-w-[1280px] gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div>
              <p className={`${eyebrow} mb-8 text-[#5A5348]`}>03 / On your terms</p>
              <h2 id="luxury-start" className={`${serif} text-[clamp(2.7rem,5vw,4.5rem)] leading-[1.08]`}>Local by design.<br /><em>Ready for work.</em></h2>
              <p className="mt-9 max-w-[360px] text-[16px] leading-[1.7] text-[#5A5348]">Install the collector, connect your application and give your agent access. The local product needs no hosted account.</p>
              <a href="/docs/getting-started/" className="mt-9 inline-flex min-h-12 items-center border border-[#1A1712] px-7 py-4 text-[11px] uppercase tracking-[0.18em] transition-colors duration-500 hover:bg-[#1A1712] hover:text-[#F4F1EA] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 motion-reduce:transition-none">Open the quickstart</a>
            </div>
            <div className="min-w-0 lg:pt-5">
              <div className="border-t border-[#D8D1C4] py-6">
                <p className="mb-4 text-[11px] uppercase tracking-[0.16em] text-[#5A5348]">01 — Start the collector</p>
                <pre tabIndex={0} className="overflow-x-auto font-mono text-[13px] leading-7 focus-visible:outline focus-visible:outline-offset-2"><code>dotnet tool install --global qyl{"\n"}<span className="font-semibold">qyl up</span></code></pre>
              </div>
              <div className="border-t border-[#D8D1C4] py-6">
                <p className="mb-4 text-[11px] uppercase tracking-[0.16em] text-[#5A5348]">02 — Send telemetry</p>
                <pre tabIndex={0} className="overflow-x-auto font-mono text-[12px] leading-7 focus-visible:outline focus-visible:outline-offset-2"><code><span className="font-semibold">export</span> OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318</code></pre>
                <p className="mt-3 text-[13px] leading-relaxed text-[#5A5348]">Set the endpoint in your application’s environment. See the <a href="/docs/telemetry/" className="underline decoration-[#1A1712]/40 underline-offset-4 focus-visible:outline">telemetry guide</a> for SDK configuration.</p>
              </div>
              <div className="border-t border-[#D8D1C4] py-6">
                <p className="mb-4 text-[11px] uppercase tracking-[0.16em] text-[#5A5348]">03 — Connect your coding agent</p>
                <pre tabIndex={0} className="overflow-x-auto font-mono text-[13px] leading-7 focus-visible:outline focus-visible:outline-offset-2"><code><span className="font-semibold">npx</span> -y qyl-mcp-server --stdio</code></pre>
                <a href="/docs/mcp/" className={`${link} mt-3`}>MCP configuration <span aria-hidden="true" className="ml-3 text-base">↗</span></a>
              </div>
              <p className="border-t border-[#D8D1C4] pt-5 text-[12px] leading-relaxed text-[#5A5348]">Dashboard at <code className="font-mono">127.0.0.1:5100</code> after startup.<br />qyl is free. <a href="/pricing/" className="underline decoration-[#1A1712]/40 underline-offset-4 focus-visible:outline">Read what’s included.</a></p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-[1440px] px-6 pb-8 pt-16 md:px-12 md:pt-20 xl:px-20">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
          <div>
            <a href="/" aria-label="qyl home" className={`${serif} text-[64px] leading-none focus-visible:outline focus-visible:outline-offset-4`}>qyl.</a>
            <p className="mt-5 text-[13px] leading-relaxed text-[#6E665A]">Keep the context.<br />Ask the next question.</p>
          </div>
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-14 gap-y-1 sm:grid-cols-3 sm:gap-x-12">
            <a href="/docs/" className={link}>Documentation</a>
            <a href="/pricing/" className={link}>Pricing</a>
            <a href={externalLinks.github} className={link}>Source code</a>
            <a href="/docs/workbench/" className={link}>Workbench</a>
            <a href="/faq/" className={link}>Questions</a>
            <a href="/privacy/" className={link}>Privacy</a>
          </nav>
        </div>
        <div className="mt-16 flex flex-wrap justify-between gap-3 border-t border-[#D8D1C4] pt-6 text-[10px] uppercase tracking-[0.12em] text-[#6E665A]">
          <p>OpenTelemetry · DuckDB · MCP</p>
          <p>qyl {versionOf("qyl")} / MCP {versionOf("qyl-mcp-server")}</p>
        </div>
      </footer>
    </div>
  );
}
