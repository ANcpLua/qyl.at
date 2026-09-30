"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
export interface ScrollPortalScene {
  id?: string;
  background?: string;
  content?: ReactNode;
  radius?: number;
  accent?: string;
}
export interface ScrollPortalProps {
  scenes: ScrollPortalScene[];
  frameDepth?: number;
  perspective?: number;
  scrollLength?: number;
  frameRadius?: number;
  frameBorder?: number;
  scrub?: number;
  hold?: number;
  dim?: number;
  dimColor?: string;
  accent?: string;
  mobileBreakpoint?: number;
  onSceneChange?: (index: number) => void;
  className?: string;
}
const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;
const glide = (t: number) => t * t * (3 - 2 * t);
const fadeColor = (color: string, alpha: number) =>
  alpha >= 1
    ? color
    : `color-mix(in srgb, ${color} ${(clamp(alpha, 0, 1) * 100).toFixed(1)}%, transparent)`;
const DEPTH_UNIT = 1000;
const HIDE_AFTER = 1.5;
function useMedia(query: string): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
export const ScrollPortal = ({
  scenes,
  frameDepth = 1,
  perspective = 1000,
  scrollLength = 1,
  frameRadius = 16,
  frameBorder = 1,
  scrub = 0.35,
  hold = 0,
  dim = 0.55,
  dimColor = "#000000",
  accent = "rgba(255,255,255,0.18)",
  mobileBreakpoint = 768,
  onSceneChange,
  className,
}: ScrollPortalProps) => {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dimRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stageSize = useRef({ w: 0, h: 0 });
  const shown = useRef(0);
  const beat = useRef(0);
  const spin = useRef(0);
  const live = useRef(false);
  const reported = useRef(-1);
  const change = useRef(onSceneChange);
  useEffect(() => {
    change.current = onSceneChange;
  }, [onSceneChange]);
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  const compact = useMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
  const count = Math.max(scenes.length, 1);
  const runway = Math.max(0, count - 1) * Math.max(scrollLength, 0.1);
  const focal = Math.max(perspective * (compact ? 0.7 : 1), 200);
  const spacing = Math.max(frameDepth * (compact ? 0.7 : 1), 0.05) * DEPTH_UNIT;
  const rest = clamp(hold, 0, 0.9);
  const shape = useCallback(
    (p: number) => {
      if (rest <= 0) return p;
      const base = Math.floor(p);
      if (base >= count - 1) return count - 1;
      const frac = p - base;
      const travel = clamp((frac - rest) / Math.max(1e-6, 1 - rest), 0, 1);
      return base + glide(travel);
    },
    [count, rest],
  );
  const report = useCallback((p: number) => {
    const index = Math.round(p);
    if (index !== reported.current) {
      reported.current = index;
      change.current?.(index);
    }
  }, []);
  const paint = useCallback(
    (raw: number) => {
      const p = shape(raw);
      const frames = frameRefs.current;
      const { w, h } = stageSize.current;
      for (let i = 0; i < count; i += 1) {
        const frame = frames[i];
        if (!frame) continue;
        const t = p - i;
        const seen = t < HIDE_AFTER;
        frame.style.visibility = seen ? "visible" : "hidden";
        if (!seen) continue;
        const z = t * spacing;
        const scale = focal / Math.max(focal - z, focal / 3);
        const scene = scenes[i];
        const fw = w * scale;
        const fh = h * scale;
        frame.style.width = `${fw.toFixed(2)}px`;
        frame.style.height = `${fh.toFixed(2)}px`;
        frame.style.left = `${((w - fw) / 2).toFixed(2)}px`;
        frame.style.top = `${((h - fh) / 2).toFixed(2)}px`;
        const framed = t < 0;
        frame.style.borderRadius = `${scene?.radius ?? frameRadius}px`;
        frame.style.borderWidth = framed ? `${frameBorder}px` : "0px";
        const content = contentRefs.current[i];
        if (content) {
          const gone = clamp((t - 0.05) / 0.45, 0, 1);
          content.style.opacity = (1 - gone).toFixed(3);
          content.style.width = `${w}px`;
          content.style.height = `${h}px`;
          const inset = framed ? -frameBorder : 0;
          content.style.transform = `translate(${inset.toFixed(2)}px, ${inset.toFixed(2)}px) scale(${scale.toFixed(5)})`;
        }
        const far = clamp(-t * 0.6, 0, 1) * dim;
        frame.style.borderColor = fadeColor(scene?.accent ?? accent, 1 - far);
        const veil = dimRefs.current[i];
        if (veil) veil.style.opacity = far.toFixed(3);
      }
      report(p);
    },
    [
      accent,
      count,
      dim,
      focal,
      frameBorder,
      frameRadius,
      report,
      scenes,
      shape,
      spacing,
    ],
  );
  const measure = useCallback(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return 0;
    const rect = root.getBoundingClientRect();
    const run = rect.height - stage.getBoundingClientRect().height;
    if (run <= 0) return 0;
    return clamp(-rect.top / run, 0, 1) * (count - 1);
  }, [count]);
  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const doc = root.ownerDocument;
    const view = doc.defaultView;
    if (!view) return;
    const lag = Math.max(scrub, 0);
    const step = (now: number) => {
      const last = beat.current || now;
      const delta = Math.min(0.05, Math.max(0, (now - last) / 1000));
      beat.current = now;
      const target = measure();
      const pull = lag > 0 ? 1 - Math.exp(-delta / lag) : 1;
      const next = shown.current + (target - shown.current) * pull;
      shown.current = next;
      paint(next);
      if (Math.abs(target - next) > 0.0004) {
        spin.current = view.requestAnimationFrame(step);
      } else {
        shown.current = target;
        paint(target);
        live.current = false;
      }
    };
    const wake = () => {
      if (live.current) return;
      live.current = true;
      beat.current = 0;
      spin.current = view.requestAnimationFrame(step);
    };
    const settle = () => {
      const box = stage.getBoundingClientRect();
      stageSize.current = { w: box.width, h: box.height };
      shown.current = measure();
      paint(shown.current);
    };
    settle();
    view.addEventListener("scroll", wake, { passive: true });
    doc.addEventListener("scroll", wake, { passive: true, capture: true });
    view.addEventListener("resize", settle);
    view.addEventListener("pageshow", settle);
    const watch = new ResizeObserver(settle);
    watch.observe(root);
    watch.observe(stage);
    return () => {
      view.cancelAnimationFrame(spin.current);
      live.current = false;
      view.removeEventListener("scroll", wake);
      doc.removeEventListener("scroll", wake, { capture: true });
      view.removeEventListener("resize", settle);
      view.removeEventListener("pageshow", settle);
      watch.disconnect();
    };
  }, [measure, paint, reducedMotion, scrub]);
  useEffect(() => {
    if (!reducedMotion) return;
    const root = rootRef.current;
    if (!root) return;
    const view = root.ownerDocument.defaultView;
    if (!view) return;
    const read = () => {
      const rect = root.getBoundingClientRect();
      const each = rect.height / count;
      const centre = view.innerHeight / 2 - rect.top;
      report(clamp(Math.floor(centre / each), 0, count - 1));
    };
    read();
    view.addEventListener("scroll", read, { passive: true });
    view.addEventListener("resize", read);
    return () => {
      view.removeEventListener("scroll", read);
      view.removeEventListener("resize", read);
    };
  }, [count, reducedMotion, report]);
  const rootStyle = useMemo<CSSProperties>(() => {
    if (reducedMotion) return {};
    return { height: `${((1 + runway) * 100).toFixed(2)}svh` };
  }, [reducedMotion, runway]);
  if (reducedMotion) {
    return (
      <section ref={rootRef} className={cn("relative w-full", className)}>
        {scenes.map((scene, i) => (
          <div
            key={scene.id ?? i}
            className="relative w-full overflow-hidden"
            style={{ height: "100svh", background: scene.background }}
          >
            {scene.content}
          </div>
        ))}
      </section>
    );
  }
  return (
    <section
      ref={rootRef}
      className={cn("relative w-full", className)}
      style={rootStyle}
    >
      <div
        ref={stageRef}
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: "100svh", background: scenes[0]?.background }}
      >
        {scenes.map((scene, i) => {
          const tone = scene.accent ?? accent;
          return (
            <div
              key={scene.id ?? i}
              ref={(node) => {
                frameRefs.current[i] = node;
              }}
              className="absolute left-0 top-0 h-full w-full isolate overflow-hidden border-solid [backface-visibility:hidden] [transform:translateZ(0)]"
              style={{
                background: scene.background,
                borderColor: tone,
                borderWidth: 0,
                visibility: "hidden",
              }}
            >
              <div
                ref={(node) => {
                  contentRefs.current[i] = node;
                }}
                className="absolute left-0 top-0 origin-top-left [backface-visibility:hidden]"
              >
                {scene.content}
              </div>
              <div
                ref={(node) => {
                  dimRefs.current[i] = node;
                }}
                className="pointer-events-none absolute inset-0"
                style={{ opacity: 0, background: dimColor }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
export default ScrollPortal;
