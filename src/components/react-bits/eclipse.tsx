"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { cn } from "@/lib/utils";
export interface EclipseProps {
  speed?: number;
  radius?: number;
  edgeSoftness?: number;
  reach?: number;
  turbulence?: number;
  streaks?: number;
  brightness?: number;
  colorCycle?: number;
  colors?: string[];
  backgroundColor?: string;
  coreColor?: string;
  opacity?: number;
  cursorInteraction?: boolean;
  cursorStrength?: number;
  cursorRadius?: number;
  paused?: boolean;
  dpr?: number;
  className?: string;
  children?: ReactNode;
}
const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
}
`;
const fragmentShader = `
precision highp float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uFlow;
uniform float uStir;
uniform float uStirRadius;
uniform float uTime;
uniform float uRadius;
uniform float uEdge;
uniform float uReach;
uniform float uTurbulence;
uniform float uStreaks;
uniform float uBrightness;
uniform float uCycle;
uniform float uColorCount;
uniform float uOpacity;
uniform float uBackgroundAlpha;
uniform vec3 uBackground;
uniform vec3 uCore;
uniform vec3 uColors[4];


vec3 lattice(vec3 cell) {
  cell = fract(cell * vec3(0.1031, 0.1030, 0.0973));
  cell += dot(cell, cell.yxz + 33.33);
  return fract((cell.xxy + cell.yxx) * cell.zyx) * 2.0 - 1.0;
}


float drift(vec3 p) {
  vec3 cell = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float c000 = dot(lattice(cell), f);
  float c100 = dot(lattice(cell + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));
  float c010 = dot(lattice(cell + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));
  float c110 = dot(lattice(cell + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));
  float c001 = dot(lattice(cell + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));
  float c101 = dot(lattice(cell + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));
  float c011 = dot(lattice(cell + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));
  float c111 = dot(lattice(cell + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));

  float bottom = mix(mix(c000, c100, u.x), mix(c010, c110, u.x), u.y);
  float top = mix(mix(c001, c101, u.x), mix(c011, c111, u.x), u.y);
  return mix(bottom, top, u.z) * 1.6;
}


vec3 palette(float phase, vec2 point) {
  if (uColorCount < 0.5) {
    return 0.5 + 0.5 * cos(phase + point.xyx * 3.0 + vec3(0.0, 2.0, 4.0));
  }
  float pos = fract(phase / 6.28318530718) * uColorCount;
  vec3 result = uColors[0];
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    if (fi + 1.0 > uColorCount) break;
    vec3 next = fi + 1.0 < uColorCount ? uColors[i + 1] : uColors[0];
    float local = clamp(pos - fi, 0.0, 1.0);
    result = mix(result, mix(uColors[i], next, smoothstep(0.0, 1.0, local)), step(fi, pos));
  }
  return result;
}

void main() {
  vec2 pixel = vUv * uResolution;
  vec2 point = (pixel - uResolution * 0.5) / max(uResolution.y, 1.0);



  vec2 toward = point - uPointer;
  float reachSq = uStirRadius * uStirRadius;
  float bubble = exp(-dot(toward, toward) / max(reachSq, 0.0001));
  float twist = uStir * bubble * 1.4;
  float cs = cos(twist);
  float sn = sin(twist);
  toward = vec2(toward.x * cs - toward.y * sn, toward.x * sn + toward.y * cs);
  float ring = sin(length(toward) * 28.0 - uTime * 14.0) * uStir * bubble * 0.02;
  point = uPointer + toward + normalize(toward + 0.0001) * ring - uFlow * bubble * 0.12;

  float dist = length(point);
  float angle = atan(point.y, point.x);

  float spoke = abs(cos(angle) + 0.5) * 0.25;
  float clock = uTime;


  float haloFall = clamp(0.1 / smoothstep(0.0, 1.75 * uReach, dist), 0.0, 1.0);
  float innerLift = clamp(0.1 / smoothstep(uRadius * 1.27, 0.0, dist), 0.0, 1.0);
  float disc = smoothstep(uRadius * (1.0 - uEdge), uRadius, dist);


  float ripple = drift(vec3(point * 2.0, 1.0 + clock)) * max(1.0 - dist * 1.75, 0.0) * uTurbulence + 0.9;
  float wash = drift(vec3(point, 15.0 + clock)) * max(dist, 0.025) * uTurbulence + 1.25;
  float rays = drift(vec3(vec2(spoke, spoke * 100.0 + clock * 5.7) * 0.15, 30.0 + clock)) * max(dist, 0.25) * uStreaks + 1.5;
  rays *= smoothstep(0.0, uRadius, dist);

  float fade = max(1.0 - dist / uReach, 0.0);
  float glow = haloFall * haloFall * innerLift * (ripple * wash * rays) * fade * disc * uBrightness;

  vec3 tint = palette(clock * uCycle * 1.9, point);
  vec3 base = mix(uCore, uBackground, disc);
  vec3 color = clamp(mix(base, tint, glow), 0.0, 1.0);

  float coverage = max(clamp(glow, 0.0, 1.0), 1.0 - disc);
  float alpha = mix(uBackgroundAlpha, 1.0, coverage) * uOpacity;

  gl_FragColor = vec4(color, alpha);
}
`;
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const isTransparent = (value: string) =>
  value === "transparent" || value === "none" || value === "";
const makeColor = (value: string, fallback: string) => {
  const color = new THREE.Color();
  try {
    color.setStyle(value, THREE.LinearSRGBColorSpace);
  } catch {
    color.setStyle(fallback, THREE.LinearSRGBColorSpace);
  }
  return color;
};
const updateColor = (color: THREE.Color, value: string) => {
  try {
    color.setStyle(value, THREE.LinearSRGBColorSpace);
  } catch {
    return;
  }
};
const subscribeToDpr = (notify: () => void) => {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(min-resolution: 2dppx)");
  media.addEventListener("change", notify);
  window.addEventListener("resize", notify);
  return () => {
    media.removeEventListener("change", notify);
    window.removeEventListener("resize", notify);
  };
};
const readDpr = () =>
  typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
interface EclipseFieldProps {
  speed: number;
  radius: number;
  edgeSoftness: number;
  reach: number;
  turbulence: number;
  streaks: number;
  brightness: number;
  colorCycle: number;
  colors: string[] | undefined;
  backgroundColor: string;
  coreColor: string;
  opacity: number;
  cursorInteraction: boolean;
  cursorStrength: number;
  cursorRadius: number;
  paused: boolean;
  readPointer: () => {
    x: number;
    y: number;
    active: boolean;
  };
}
const EclipseField = ({
  speed,
  radius,
  edgeSoftness,
  reach,
  turbulence,
  streaks,
  brightness,
  colorCycle,
  colors,
  backgroundColor,
  coreColor,
  opacity,
  cursorInteraction,
  cursorStrength,
  cursorRadius,
  paused,
  readPointer,
}: EclipseFieldProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const elapsed = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const flow = useRef({ x: 0, y: 0 });
  const stir = useRef(0);
  const { gl, size } = useThree();
  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uFlow: { value: new THREE.Vector2(0, 0) },
      uStir: { value: 0 },
      uStirRadius: { value: 0.3 },
      uTime: { value: 0 },
      uRadius: { value: 0.33 },
      uEdge: { value: 0.55 },
      uReach: { value: 1 },
      uTurbulence: { value: 1 },
      uStreaks: { value: 1 },
      uBrightness: { value: 1 },
      uCycle: { value: 1 },
      uColorCount: { value: 0 },
      uOpacity: { value: 1 },
      uBackgroundAlpha: { value: 1 },
      uBackground: { value: makeColor("#101519", "#101519") },
      uCore: { value: makeColor("#101519", "#101519") },
      uColors: {
        value: [0, 1, 2, 3].map(() => makeColor("#ffffff", "#ffffff")),
      },
    }),
    [],
  );
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const values = material.uniforms;
    updateColor(values.uCore.value, coreColor);
    const transparent = isTransparent(backgroundColor);
    values.uBackgroundAlpha.value = transparent ? 0 : 1;
    if (!transparent) updateColor(values.uBackground.value, backgroundColor);
    const stops = (colors ?? []).slice(0, 4);
    values.uColorCount.value = stops.length;
    const slots = values.uColors.value as THREE.Color[];
    stops.forEach((stop, index) => updateColor(slots[index], stop));
  }, [backgroundColor, colors, coreColor]);
  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const frame = Math.min(delta, 0.05);
    if (!paused) elapsed.current += frame * speed * 0.525;
    const target = readPointer();
    const engaged = cursorInteraction && target.active;
    const follow = 1 - Math.exp(-frame * 14);
    const dx = target.x - pointer.current.x;
    const dy = target.y - pointer.current.y;
    pointer.current.x += dx * follow;
    pointer.current.y += dy * follow;
    const velocityX = engaged ? (dx * follow) / Math.max(frame, 0.001) : 0;
    const velocityY = engaged ? (dy * follow) / Math.max(frame, 0.001) : 0;
    const settle = 1 - Math.exp(-frame * 4);
    flow.current.x += (velocityX - flow.current.x) * settle;
    flow.current.y += (velocityY - flow.current.y) * settle;
    const energy = Math.min(Math.hypot(flow.current.x, flow.current.y), 3);
    stir.current += (energy - stir.current) * (1 - Math.exp(-frame * 3));
    const pixelRatio = gl.getPixelRatio();
    const values = material.uniforms;
    values.uResolution.value.set(
      size.width * pixelRatio,
      size.height * pixelRatio,
    );
    values.uPointer.value.set(pointer.current.x, pointer.current.y);
    values.uFlow.value.set(
      flow.current.x * cursorStrength,
      flow.current.y * cursorStrength,
    );
    values.uStir.value = stir.current * cursorStrength;
    values.uStirRadius.value = Math.max(cursorRadius, 0.02);
    values.uTime.value = elapsed.current;
    values.uRadius.value = clamp(radius, 0.02, 0.8);
    values.uEdge.value = clamp(edgeSoftness, 0.01, 1);
    values.uReach.value = Math.max(reach, 0.1);
    values.uTurbulence.value = Math.max(turbulence, 0);
    values.uStreaks.value = Math.max(streaks, 0);
    values.uBrightness.value = Math.max(brightness, 0);
    values.uCycle.value = colorCycle;
    values.uOpacity.value = clamp(opacity, 0, 1);
  });
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};
export const Eclipse = ({
  speed = 1,
  radius = 0.33,
  edgeSoftness = 0.55,
  reach = 1,
  turbulence = 1,
  streaks = 1,
  brightness = 1,
  colorCycle = 1,
  colors,
  backgroundColor = "#101519",
  coreColor = "#101519",
  opacity = 1,
  cursorInteraction = true,
  cursorStrength = 1,
  cursorRadius = 0.3,
  paused = false,
  dpr = 1.75,
  className,
  children,
}: EclipseProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const deviceDpr = useSyncExternalStore(subscribeToDpr, readDpr, () => 1);
  const pixelRatio = Math.min(deviceDpr, Math.max(dpr, 0.5));
  const readPointer = useCallback(() => pointerRef.current, []);
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = rootRef.current;
    if (!node || !cursorInteraction) return;
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = node.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      pointerRef.current.x =
        (event.clientX - bounds.left - bounds.width / 2) / bounds.height;
      pointerRef.current.y =
        (bounds.top + bounds.height / 2 - event.clientY) / bounds.height;
      pointerRef.current.active = true;
    };
    const resetPointer = () => {
      pointerRef.current.active = false;
    };
    node.addEventListener("pointermove", handlePointerMove);
    node.addEventListener("pointerleave", resetPointer);
    return () => {
      node.removeEventListener("pointermove", handlePointerMove);
      node.removeEventListener("pointerleave", resetPointer);
    };
  }, [cursorInteraction]);
  const still = paused || Boolean(reducedMotion);
  return (
    <div ref={rootRef} className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0">
        <Canvas
          orthographic
          dpr={pixelRatio}
          frameloop={visible && !still ? "always" : "demand"}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <EclipseField
            speed={speed}
            radius={radius}
            edgeSoftness={edgeSoftness}
            reach={reach}
            turbulence={turbulence}
            streaks={streaks}
            brightness={brightness}
            colorCycle={colorCycle}
            colors={colors}
            backgroundColor={backgroundColor}
            coreColor={coreColor}
            opacity={opacity}
            cursorInteraction={cursorInteraction}
            cursorStrength={cursorStrength}
            cursorRadius={cursorRadius}
            paused={still}
            readPointer={readPointer}
          />
        </Canvas>
      </div>
      {children ? (
        <div className="relative z-10 h-full w-full">{children}</div>
      ) : null}
    </div>
  );
};
export default Eclipse;
