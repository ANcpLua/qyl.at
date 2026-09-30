"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
export interface BendGalleryImage {
  src: string;
  alt?: string;
}
export interface BendGalleryProps {
  images?: (string | BendGalleryImage)[];
  infinite?: boolean;
  itemWidth?: number;
  aspectRatio?: number;
  gap?: number;
  borderRadius?: number;
  grayscale?: number;
  perspective?: number;
  bendAngle?: number;
  bendCurve?: number;
  depth?: number;
  depthFocus?: number;
  lift?: number;
  fade?: number;
  fadeCurve?: number;
  overshoot?: number;
  smooth?: number;
  wheelSpeed?: number;
  wheelInteraction?: boolean;
  dragSpeed?: number;
  autoScroll?: number;
  pauseOnHover?: boolean;
  vignette?: boolean;
  vignetteColor?: string;
  backgroundColor?: string;
  onIndexChange?: (index: number) => void;
  className?: string;
  children?: ReactNode;
}
const DEFAULT_IMAGES = [
  "/effects/trace-map.svg",
  "/effects/signal-map.svg",
  "/effects/signal-sculpture.svg",
  "/effects/eclipse-poster.svg",
];
const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));
const wrap = (value: number, span: number) => ((value % span) + span) % span;
const normalise = (image: string | BendGalleryImage): BendGalleryImage =>
  typeof image === "string" ? { src: image } : image;
const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const readMotion = () => window.matchMedia(motionQuery).matches;
interface Slot {
  wrap: HTMLDivElement;
  tile: HTMLDivElement;
}
interface Drag {
  y: number;
  moved: number;
  at: number;
}
export const BendGallery = ({
  images = DEFAULT_IMAGES,
  infinite = true,
  itemWidth = 300,
  aspectRatio = 4 / 5,
  gap = -112,
  borderRadius = 7,
  grayscale = 1,
  perspective = 900,
  bendAngle = 90,
  bendCurve = 0.6,
  depth = 800,
  depthFocus = 8,
  lift = 40,
  fade = 1,
  fadeCurve = 3,
  overshoot = 0.2,
  smooth = 0.8,
  wheelSpeed = 1,
  wheelInteraction = true,
  dragSpeed = 1.5,
  autoScroll = 0,
  pauseOnHover = true,
  vignette = false,
  vignetteColor = "rgba(0, 0, 0, 0.5)",
  backgroundColor = "transparent",
  onIndexChange,
  className,
  children,
}: BendGalleryProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const slots = useRef<(Slot | null)[]>([]);
  const target = useRef(0);
  const shown = useRef(0);
  const frame = useRef(0);
  const live = useRef(false);
  const stamp = useRef(0);
  const hovering = useRef(false);
  const visible = useRef(true);
  const dragging = useRef<Drag | null>(null);
  const flick = useRef(0);
  const lastIndex = useRef(-1);
  const indexChange = useRef(onIndexChange);
  indexChange.current = onIndexChange;
  const [box, setBox] = useState({ width: 0, height: 0 });
  const reduced = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    () => false,
  );
  const list = useMemo(() => images.map(normalise), [images]);
  const tileWidth = Math.max(40, Math.min(itemWidth, box.width - 32));
  const tileHeight = tileWidth / Math.max(0.1, aspectRatio);
  const stride = Math.max(8, tileHeight + gap);
  const ring = useMemo(() => {
    if (!list.length) return [];
    if (!infinite) return list.map((image, index) => ({ image, index }));
    const needed = Math.ceil(
      (box.height * (1 + overshoot * 2) + tileHeight * 2) / stride,
    );
    const copies = Math.max(1, Math.ceil((needed + 1) / list.length));
    const out: {
      image: BendGalleryImage;
      index: number;
    }[] = [];
    for (let c = 0; c < copies; c++) {
      list.forEach((image, index) => out.push({ image, index }));
    }
    return out;
  }, [list, infinite, box.height, overshoot, tileHeight, stride]);
  const cycle = ring.length * stride;
  const reach = Math.max(0, (list.length - 1) * stride);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const watch = new ResizeObserver(() => {
      setBox({ width: root.clientWidth, height: root.clientHeight });
    });
    watch.observe(root);
    return () => watch.disconnect();
  }, []);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const watch = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    });
    watch.observe(root);
    return () => watch.disconnect();
  }, []);
  const paint = useCallback(
    (offset: number) => {
      const height = box.height;
      if (!height || !ring.length) return;
      const centreTop = height / 2 - tileHeight / 2;
      const span = tileHeight + height * (1 + overshoot * 2);
      const hideAbove = -tileHeight - height * overshoot;
      const hideBelow = height * (1 + overshoot);
      const half = cycle / 2;
      let nearest = -1;
      let nearestGap = Infinity;
      for (let k = 0; k < ring.length; k++) {
        const slot = slots.current[k];
        if (!slot) continue;
        const raw = k * stride - offset;
        const top =
          centreTop + (infinite ? wrap(raw + half, cycle) - half : raw);
        if (top < hideAbove || top > hideBelow) {
          slot.wrap.style.visibility = "hidden";
          continue;
        }
        slot.wrap.style.visibility = "visible";
        slot.wrap.style.transform = `translate3d(0, ${top.toFixed(2)}px, 0)`;
        const distance = Math.abs(top - centreTop);
        if (distance < nearestGap) {
          nearestGap = distance;
          nearest = ring[k].index;
        }
        const p = clamp((height * (1 + overshoot) - top) / span, 0, 1);
        const c = Math.cos(p * Math.PI);
        const s = Math.sin(p * Math.PI);
        const turn =
          Math.sign(c) * Math.pow(Math.abs(c), bendCurve) * bendAngle;
        const sink = -Math.pow(s, depthFocus) * depth;
        const squeeze = -c * c * lift;
        const glow = 1 - fade * (1 - Math.pow(s, fadeCurve));
        slot.tile.style.transform = `translate3d(0, ${squeeze.toFixed(2)}%, ${sink.toFixed(1)}px) rotateX(${turn.toFixed(2)}deg)`;
        slot.tile.style.filter =
          fade > 0
            ? `saturate(${glow.toFixed(3)}) brightness(${glow.toFixed(3)})`
            : "none";
      }
      if (nearest >= 0 && nearest !== lastIndex.current) {
        lastIndex.current = nearest;
        indexChange.current?.(nearest);
      }
    },
    [
      box.height,
      ring,
      tileHeight,
      overshoot,
      cycle,
      stride,
      infinite,
      bendCurve,
      bendAngle,
      depthFocus,
      depth,
      lift,
      fade,
      fadeCurve,
    ],
  );
  const settle = useCallback(
    (value: number) => (infinite ? value : clamp(value, 0, reach)),
    [infinite, reach],
  );
  const wake = useCallback(() => {
    if (live.current) return;
    live.current = true;
    stamp.current = 0;
    const step = (now: number) => {
      const dt = stamp.current
        ? Math.min(0.05, (now - stamp.current) / 1000)
        : 1 / 60;
      stamp.current = now;
      const drifting =
        autoScroll !== 0 &&
        visible.current &&
        !(pauseOnHover && hovering.current) &&
        !dragging.current;
      if (drifting) target.current = settle(target.current + autoScroll * dt);
      if (Math.abs(flick.current) > 1) {
        target.current = settle(target.current + flick.current * dt);
        flick.current *= Math.pow(0.02, dt);
      } else {
        flick.current = 0;
      }
      const rate = 1.5 + (1 - clamp(smooth, 0, 1)) * 30;
      const ease = reduced ? 1 : 1 - Math.exp(-dt * rate);
      const next = shown.current + (target.current - shown.current) * ease;
      const done = Math.abs(target.current - next) < 0.05;
      shown.current = done ? target.current : next;
      paint(shown.current);
      if (!done || drifting || flick.current !== 0) {
        frame.current = requestAnimationFrame(step);
      } else {
        live.current = false;
      }
    };
    frame.current = requestAnimationFrame(step);
  }, [autoScroll, pauseOnHover, settle, reduced, smooth, paint]);
  useEffect(() => {
    target.current = settle(target.current);
    shown.current = settle(shown.current);
    paint(shown.current);
    wake();
    return () => {
      cancelAnimationFrame(frame.current);
      live.current = false;
    };
  }, [paint, settle, wake]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !wheelInteraction) return;
    const onWheel = (event: WheelEvent) => {
      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? box.height : 1;
      const before = target.current;
      target.current = settle(before + event.deltaY * unit * wheelSpeed);
      if (!infinite && target.current === before) return;
      event.preventDefault();
      flick.current = 0;
      wake();
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [box.height, wheelSpeed, wheelInteraction, settle, infinite, wake]);
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragging.current = { y: event.clientY, moved: 0, at: performance.now() };
    flick.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragging.current;
    if (!drag) return;
    const dy = event.clientY - drag.y;
    const now = performance.now();
    const dt = Math.max(1, now - drag.at) / 1000;
    drag.y = event.clientY;
    drag.at = now;
    drag.moved += Math.abs(dy);
    target.current = settle(target.current - dy * dragSpeed);
    flick.current = (-dy * dragSpeed) / dt;
    wake();
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    flick.current = clamp(flick.current, -4000, 4000);
    wake();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const jumps: Record<string, number> = {
      ArrowDown: stride,
      ArrowUp: -stride,
      PageDown: box.height,
      PageUp: -box.height,
      " ": box.height,
    };
    const jump = jumps[event.key];
    if (jump === undefined) return;
    event.preventDefault();
    target.current = settle(target.current + jump);
    wake();
  };
  const wrapStyle: CSSProperties = {
    width: tileWidth,
    perspective: `${perspective}px`,
    left: "50%",
    marginLeft: -tileWidth / 2,
  };
  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image gallery"
      tabIndex={0}
      className={cn(
        "relative h-full w-full cursor-grab touch-pan-y select-none overflow-hidden outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-inset",
        className,
      )}
      style={{ backgroundColor }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={() => {
        hovering.current = true;
      }}
      onPointerLeave={() => {
        hovering.current = false;
        wake();
      }}
      onKeyDown={onKeyDown}
    >
      {ring.map(({ image, index }, k) => (
        <div
          key={k}
          ref={(node) => {
            const tile = node?.firstElementChild as HTMLDivElement | null;
            if (node && tile) slots.current[k] = { wrap: node, tile };
            else slots.current[k] = null;
          }}
          className="invisible absolute top-0"
          style={wrapStyle}
          aria-hidden={k >= list.length}
        >
          <div
            className="w-full overflow-hidden bg-neutral-800 will-change-[transform,filter] [transform-style:preserve-3d]"
            style={{ height: tileHeight, borderRadius }}
          >
            <img
              src={image.src}
              alt={image.alt ?? `Gallery image ${index + 1}`}
              draggable={false}
              loading="lazy"
              style={{
                filter:
                  grayscale > 0
                    ? `grayscale(${clamp(grayscale, 0, 1)})`
                    : undefined,
              }}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ))}
      {vignette ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: `radial-gradient(transparent 10%, ${vignetteColor} 80%)`,
          }}
        />
      ) : null}
      {children ? (
        <div className="pointer-events-none relative z-[2] h-full w-full">
          {children}
        </div>
      ) : null}
    </div>
  );
};
export default BendGallery;
