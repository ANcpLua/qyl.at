import { lazy, Suspense } from "react";

const SynapticShift = lazy(() => import("@/components/react-bits/synaptic-shift"));

const products = [
  {
    href: "/product/tracing/",
    title: "Tracing",
    text: "OTLP ingest to DuckDB. Query traces and spans through MCP tools or the embedded trace explorer.",
  },
  {
    href: "/product/logs/",
    title: "Logs",
    text: "Search collected telemetry logs from your agent — no log UI tab-hopping.",
  },
  {
    href: "/product/metrics/",
    title: "Metrics",
    text: "MCP call stats, token usage, and cost — derived from real execution evidence.",
  },
  {
    href: "/product/ci/",
    title: "CI telemetry",
    text: "CI runs land in the same collector. Ask your agent why the build was slow.",
  },
];

const nav = [
  { href: "/product/tracing/", label: "Tracing" },
  { href: "/product/logs/", label: "Logs" },
  { href: "/product/metrics/", label: "Metrics" },
  { href: "/product/ci/", label: "CI" },
  { href: "https://mcp.qyl.at/healthz", label: "MCP" },
  { href: "https://github.com/ANcpLua/qyl", label: "GitHub" },
];

export default function App() {
  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-55">
        <Suspense fallback={null}>
          <SynapticShift color="#8b7cf6" speed={0.35} scale={0.55} complexity={12} breathing />
        </Suspense>
      </div>
      <header className="sticky top-0 z-20 border-b border-qyl-line bg-qyl-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-15 max-w-4xl items-center gap-7 px-6">
          <a href="/" className="text-xl font-bold tracking-wide">
            <span className="text-qyl-accent">q</span>yl
          </a>
          <nav className="ml-auto flex gap-5">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-qyl-muted transition-colors hover:text-qyl-text"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6">
        <section className="relative py-22">
          <h1 className="text-5xl leading-[1.15] font-bold tracking-tight md:text-6xl">
            Observability,
            <br />
            <span className="bg-gradient-to-r from-qyl-accent to-qyl-accent2 bg-clip-text text-transparent">
              maintained by AI.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-qyl-muted">
            qyl is an OpenTelemetry-native observability platform whose code, releases, and
            infrastructure are built and operated end-to-end by AI agents. MCP-first by design:
            your agent doesn't read dashboards — it queries them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <a
              href="#get-started"
              className="rounded-lg bg-qyl-accent px-5 py-2.5 text-sm font-semibold text-qyl-bg transition-[filter] hover:brightness-110"
            >
              Get started
            </a>
            <a
              href="https://github.com/ANcpLua/qyl.mcp"
              className="rounded-lg border border-qyl-line px-5 py-2.5 text-sm font-semibold transition-colors hover:border-qyl-accent2"
            >
              MCP server source
            </a>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 pt-4 pb-4 sm:grid-cols-2">
          {products.map((product) => (
            <a
              key={product.title}
              href={product.href}
              className="block rounded-xl border border-qyl-line bg-qyl-panel/75 p-5 backdrop-blur-sm transition-colors hover:border-qyl-accent"
            >
              <h3 className="font-semibold">{product.title}</h3>
              <p className="mt-1.5 text-sm text-qyl-muted">{product.text}</p>
            </a>
          ))}
        </div>

        <section id="get-started" className="mt-10 border-t border-qyl-line py-10">
          <h2 className="text-2xl font-bold">Get started</h2>
          <p className="mt-3 max-w-2xl text-qyl-muted">
            One command starts the local stack — collector, dashboard, and diagnostics — and can
            supervise an MCP server over stdio:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-qyl-line bg-[#0f1117]/85 p-4 backdrop-blur-sm text-[13.5px] leading-relaxed">
            <code>{`dotnet tool install -g qyl\nqyl up --mcp-stdio npx -y qyl-mcp-server --stdio`}</code>
          </pre>
          <p className="mt-4 max-w-2xl text-qyl-muted">
            Or connect an MCP client straight to the hosted endpoint — OAuth 2.1 with instant
            anonymous approval, no account needed:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-qyl-line bg-[#0f1117]/85 p-4 backdrop-blur-sm text-[13.5px] leading-relaxed">
            <code>claude mcp add --transport http qyl https://mcp.qyl.at/</code>
          </pre>
        </section>

        <section className="border-t border-qyl-line py-10">
          <h2 className="text-2xl font-bold">Why "AI-maintained"?</h2>
          <p className="mt-3 max-w-2xl text-qyl-muted">
            Every commit, release, deployment, and incident response on this platform is executed
            by AI agents against real production infrastructure — the same workflow qyl instruments
            for you. The platform is its own first customer: qyl's CI, releases, and MCP server
            report into qyl.
          </p>
        </section>
      </main>

      <footer className="mt-12 border-t border-qyl-line py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap gap-5 px-6 text-sm text-qyl-muted">
          <span>© 2026 qyl</span>
          <a className="text-qyl-accent2 hover:underline" href="https://www.npmjs.com/package/qyl-mcp-server">
            npm: qyl-mcp-server
          </a>
          <a className="text-qyl-accent2 hover:underline" href="https://www.nuget.org/packages/qyl">
            NuGet: qyl
          </a>
          <a className="text-qyl-accent2 hover:underline" href="https://github.com/ANcpLua/qyl">
            GitHub
          </a>
          <a className="text-qyl-accent2 hover:underline" href="https://mcp.qyl.at/healthz">
            status
          </a>
        </div>
      </footer>
    </div>
  );
}
