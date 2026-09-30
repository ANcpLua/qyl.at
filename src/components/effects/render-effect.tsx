"use client";

import { Component, useEffect, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

type Kind = 'eclipse' | 'scroll-portal' | 'ascii-ripple' | 'depth-image' | 'bend-gallery' | 'glass-reveal' | 'tile-reveal';
type Lifecycle = { ready: () => void; error: () => void };
const art = ['/effects/trace-map.svg', '/effects/signal-sculpture.svg', '/effects/signal-map.svg', '/effects/eclipse-poster.svg'];

function Frame({ children, ready }: { children: ReactNode; ready: () => void }) {
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(ready); });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, [ready]);
  return children;
}

class EffectBoundary extends Component<{ children: ReactNode; error: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.error(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Scene({ number, title, text, image, dark = false }: { number: string; title: string; text: string; image: string; dark?: boolean }) {
  return <div className={`relative flex h-full w-full flex-col justify-center overflow-hidden px-8 py-16 sm:px-16 lg:px-24 ${dark ? 'text-white' : 'text-zinc-950'}`}>
    <div className="relative z-10 max-w-xl"><p className={`mb-6 font-mono text-xs uppercase tracking-[.18em] ${dark ? 'text-blue-200' : 'text-blue-700'}`}>{number} / Follow the evidence</p><h3 className="text-5xl font-medium leading-[1.02] tracking-[-.055em] md:text-7xl">{title}</h3><p className={`mt-7 max-w-md text-lg leading-relaxed ${dark ? 'text-slate-300' : 'text-zinc-600'}`}>{text}</p></div>
    <img src={image} alt="" width="1200" height="1000" className="mt-8 h-[34vh] w-full object-contain lg:absolute lg:right-[-5%] lg:top-[16%] lg:mt-0 lg:h-[70%] lg:w-[60%]" />
    <p className={`absolute bottom-8 left-8 font-mono text-[10px] uppercase tracking-[.16em] sm:left-16 lg:left-24 ${dark ? 'text-slate-300' : 'text-zinc-500'}`}>Illustrative telemetry / Scroll to explore</p>
  </div>;
}

export async function mountEffect(node: HTMLElement, kind: Kind, lifecycle: Lifecycle): Promise<() => void> {
  let content: ReactNode;
  switch (kind) {
    case 'eclipse': {
      const { default: Eclipse } = await import('../react-bits/eclipse');
      content = <Eclipse className="h-full w-full [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_72%)]" colors={['#2962ff', '#73caff', '#f4bb91', '#8a9dff']} backgroundColor="transparent" coreColor="#151e32" radius={0.28} edgeSoftness={0.065} reach={1.15} brightness={0.6} turbulence={2.5} streaks={2.4} speed={0.7} colorCycle={0.65} cursorStrength={0.55} dpr={1.25} />;
      break;
    }
    case 'scroll-portal': {
      const { default: ScrollPortal } = await import('../react-bits/scroll-portal');
      content = <ScrollPortal scrollLength={0.7} frameDepth={0.85} frameRadius={20} frameBorder={1} accent="#8aa4f0" perspective={1100} dimColor="#e7e9f4" dim={0.2} scrub={0.2} scenes={[
        { id: 'collect', background: '#f6f5f1', content: <Scene number="01" title="A signal becomes a story." text="Follow one request through its traces, logs and metrics. See where the time went." image={art[0]} /> },
        { id: 'connect', background: '#edf2ff', content: <Scene number="02" title="The context comes together." text="OpenTelemetry brings your runtime signals into one local analytical store." image={art[2]} /> },
        { id: 'understand', background: '#111a2d', content: <Scene number="03" title="Your agent sees it, too." text="Give your coding agent the evidence over MCP. Keep the investigation close to the code." image={art[1]} dark /> },
      ]} />;
      break;
    }
    case 'ascii-ripple': {
      const { default: AsciiRipple } = await import('../react-bits/ascii-ripple');
      content = <AsciiRipple className="h-full w-full" text={Array(16).fill('qyl / trace_id 8fa2 / service checkout / span agent.run / logs correlated / metrics received / evidence available / OTLP local / query DuckDB / MCP connected / inspect the run / follow the signal / ').join(' ')} textColor="#283a61" rippleColor="#124aff" troughColor="#9eb5ed" backgroundColor="#f6f5f1" textOpacity={0.48} fontSize={13} lineHeight={1.6} rain={0.5} rainStrength={0.7} dropStrength={1.8} refraction={1.5} />;
      break;
    }
    case 'depth-image': {
      const { default: DepthImage } = await import('../react-bits/depth-image');
      content = <DepthImage className="h-full w-full" image={art[1]} backgroundColor="#121b2c" fallbackColor="#f6f5f1" lightColor="#e2eeff" lightIntensity={4} ambient={0.4} colorPreserve={0.8} displacement={0.7} shadowIntensity={0.45} orbitRadius={0.8} orbitDuration={12} dpr={1.25} />;
      break;
    }
    case 'bend-gallery': {
      const { default: BendGallery } = await import('../react-bits/bend-gallery');
      content = <BendGallery className="h-full w-full" images={art.map((src, i) => ({ src, alt: ['Illustrated qyl request trace', 'Sculptural signal in three dimensions', 'Correlated telemetry diagram', 'Eclipse light study'][i] }))} itemWidth={Math.min(node.clientWidth * 0.78, 460)} aspectRatio={1.35} gap={-55} borderRadius={14} grayscale={0} perspective={1000} bendAngle={75} depth={700} autoScroll={32} wheelInteraction={false} backgroundColor="#f6f5f1" vignette={false} />;
      break;
    }
    case 'glass-reveal': {
      const { default: GlassReveal } = await import('../react-bits/glass-reveal');
      content = <GlassReveal className="h-full w-full" image={art[2]} backgroundImage={art[0]} shape="portal" size={0.32} distortion={0.24} aberration={0.025} grain={0} grayscale={0} dim={0.05} waveStrength={0.035} fallbackColor="#f6f5f1" dpr={1.25} />;
      break;
    }
    case 'tile-reveal': {
      const { default: TileReveal } = await import('../react-bits/tile-reveal');
      content = <TileReveal images={[...art, art[0], art[2]]} columns={3} gridWidth={950} tileAspect={1.25} tileRadius={12} gap={20} grayscale={false} backgroundColor="#f6f5f1" scrollLength={1.4} headline={<h2 className="max-w-3xl px-6 text-5xl font-medium leading-[1.02] tracking-[-.06em] text-zinc-950 md:text-8xl">Every signal.<br />One clear picture.</h2>}><a href="/docs/getting-started/" className="inline-flex min-h-12 items-center rounded-full bg-blue-700 px-7 text-base text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4">Start locally ↗</a></TileReveal>;
      break;
    }
  }
  const root = createRoot(node);
  root.render(<EffectBoundary error={lifecycle.error}><Frame ready={lifecycle.ready}>{content}</Frame></EffectBoundary>);
  return () => root.unmount();
}
