"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { cn } from "@/lib/utils";
export type GlassRevealShape = "square" | "circle" | "blob" | "portal";
export interface GlassRevealProps {
  image?: string;
  backgroundImage?: string;
  shape?: GlassRevealShape;
  size?: number;
  softness?: number;
  distortion?: number;
  aberration?: number;
  wobble?: number;
  wobbleSpeed?: number;
  waveFrequency?: number;
  waveStrength?: number;
  waveSpeed?: number;
  grain?: number;
  grainSpeed?: number;
  grayscale?: number;
  dim?: number;
  follow?: number;
  returnToCenter?: boolean;
  fallbackColor?: string;
  paused?: boolean;
  dpr?: number;
  className?: string;
  children?: ReactNode;
}
const SHAPES: Record<GlassRevealShape, number> = {
  square: 0,
  circle: 1,
  blob: 2,
  portal: 3,
};
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

uniform sampler2D uInside;
uniform sampler2D uOutside;
uniform vec2 uInsideSize;
uniform vec2 uOutsideSize;
uniform float uInsideReady;
uniform float uOutsideReady;
uniform vec3 uFallback;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform int uShape;
uniform float uSize;
uniform float uSoftness;
uniform float uDistortion;
uniform float uAberration;
uniform float uWobble;
uniform float uWobbleTime;
uniform float uWaveFrequency;
uniform float uWaveStrength;
uniform float uWaveTime;
uniform float uGrain;
uniform float uGrainTime;
uniform float uGray;
uniform float uDim;


vec2 coverUv(vec2 uv, vec2 box, vec2 tex) {
  float boxRatio = box.x / box.y;
  float texRatio = tex.x / tex.y;
  vec2 scale = boxRatio > texRatio
    ? vec2(1.0, texRatio / boxRatio)
    : vec2(boxRatio / texRatio, 1.0);
  return (uv - 0.5) * scale + 0.5;
}


float grain(vec2 uv, float t) {
  vec3 p = fract(vec3(uv * 613.7, t) * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}


float blobRadius(float a, float t) {
  float bulge = 0.5 * sin(3.0 * a + t)
    + 0.3 * sin(5.0 * a - 1.7 * t + 1.3)
    + 0.2 * sin(7.0 * a + 0.6 * t + 2.1);
  return 1.0 + bulge * uWobble * 0.35;
}


float outline(vec2 q) {
  if (uShape == 0) return max(abs(q.x), abs(q.y)) - 1.0;
  if (uShape == 1) return length(q) - 1.0;
  return length(q) - blobRadius(atan(q.y, q.x), uWobbleTime);
}

vec3 sampleOutside(vec2 uv) {
  if (uOutsideReady < 0.5) return uFallback;
  vec3 c = texture2D(uOutside, uv).rgb;
  float luma = dot(c, vec3(0.299, 0.587, 0.114));
  return mix(c, vec3(luma), uGray) * (1.0 - uDim);
}

void main() {
  vec2 aspect = vec2(
    min(uResolution.y / uResolution.x, 1.0),
    min(uResolution.x / uResolution.y, 1.0)
  );


  vec2 p = ((vUv * 2.0 - 1.0) - uPointer) / aspect;
  vec2 q = p / max(uSize, 0.001);
  float d = outline(q);

  float aa = fwidth(d) * 1.5;

  float soft = uShape == 3 ? uSoftness + 0.8 : max(uSoftness, aa);
  float mask = 1.0 - smoothstep(-soft * 0.5, soft * 0.5, d);
  if (uShape == 3) mask = mask * mask * (3.0 - 2.0 * mask);


  vec2 outUv = coverUv(vUv, uResolution, uOutsideSize);
  outUv.y += sin(outUv.y * uWaveFrequency + uWaveTime) * uWaveStrength;
  outUv += (grain(vUv, uGrainTime) - 0.5) * uGrain;
  vec3 outside = sampleOutside(outUv);


  float r2 = dot(q, q) * 0.25;
  float scale = uDistortion >= 0.0
    ? 1.0 + uDistortion * r2
    : 1.0 / (1.0 - uDistortion * r2);
  float reach = uShape == 3 ? mask : 1.0;
  vec2 lensOffset = q * (scale - 1.0) * uSize * aspect * 0.5 * reach;
  vec2 inUv = coverUv(vUv - lensOffset, uResolution, uInsideSize);
  vec2 fringe = q * uAberration * 0.5 * reach;

  vec3 inside = uFallback;
  if (uInsideReady > 0.5) {
    inside = vec3(
      texture2D(uInside, inUv + fringe).r,
      texture2D(uInside, inUv).g,
      texture2D(uInside, inUv - fringe).b
    );
  }

  gl_FragColor = vec4(mix(outside, inside, mask), 1.0);
}
`;
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const makeColor = (value: string, fallback: string) => {
  const color = new THREE.Color();
  try {
    color.setStyle(value, THREE.LinearSRGBColorSpace);
  } catch {
    color.setStyle(fallback, THREE.LinearSRGBColorSpace);
  }
  return color;
};
const updateColor = (target: THREE.Color, value: string) => {
  try {
    target.setStyle(value, THREE.LinearSRGBColorSpace);
  } catch {}
};
const subscribeToDpr = (notify: () => void) => {
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
interface Loaded {
  texture: THREE.Texture;
  width: number;
  height: number;
}
const loadTexture = (
  src: string,
  anisotropy: number,
  onDone: (result: Loaded | null) => void,
) => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";
  let cancelled = false;
  image.onload = () => {
    if (cancelled) return;
    const texture = new THREE.Texture(image);
    texture.colorSpace = THREE.NoColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = anisotropy;
    texture.needsUpdate = true;
    onDone({
      texture,
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
  };
  image.onerror = () => {
    if (!cancelled) onDone(null);
  };
  image.src = src;
  return () => {
    cancelled = true;
  };
};
interface LensProps {
  image: string;
  backgroundImage: string;
  shape: GlassRevealShape;
  size: number;
  softness: number;
  distortion: number;
  aberration: number;
  wobble: number;
  wobbleSpeed: number;
  waveFrequency: number;
  waveStrength: number;
  waveSpeed: number;
  grain: number;
  grainSpeed: number;
  grayscale: number;
  dim: number;
  follow: number;
  returnToCenter: boolean;
  fallbackColor: string;
  paused: boolean;
  pointer: React.RefObject<{
    x: number;
    y: number;
    inside: boolean;
  }>;
}
const Lens = ({
  image,
  backgroundImage,
  shape,
  size,
  softness,
  distortion,
  aberration,
  wobble,
  wobbleSpeed,
  waveFrequency,
  waveStrength,
  waveSpeed,
  grain,
  grainSpeed,
  grayscale,
  dim,
  follow,
  returnToCenter,
  fallbackColor,
  paused,
  pointer,
}: LensProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const eased = useRef(new THREE.Vector2(0, 0));
  const clocks = useRef({ wobble: 0, wave: 0, grain: 0 });
  const { gl, size: view, invalidate } = useThree();
  const uniforms = useMemo(
    () => ({
      uInside: { value: null as THREE.Texture | null },
      uOutside: { value: null as THREE.Texture | null },
      uInsideSize: { value: new THREE.Vector2(1, 1) },
      uOutsideSize: { value: new THREE.Vector2(1, 1) },
      uInsideReady: { value: 0 },
      uOutsideReady: { value: 0 },
      uFallback: { value: makeColor("#171717", "#171717") },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uShape: { value: 0 },
      uSize: { value: 0.4 },
      uSoftness: { value: 0 },
      uDistortion: { value: 1.5 },
      uAberration: { value: 0.02 },
      uWobble: { value: 0.5 },
      uWobbleTime: { value: 0 },
      uWaveFrequency: { value: 10 },
      uWaveStrength: { value: 0.01 },
      uWaveTime: { value: 0 },
      uGrain: { value: 0.02 },
      uGrainTime: { value: 0 },
      uGray: { value: 1 },
      uDim: { value: 0 },
    }),
    [],
  );
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const anisotropy = gl.capabilities.getMaxAnisotropy();
    let current: THREE.Texture | null = null;
    const cancel = loadTexture(image, anisotropy, (result) => {
      const values = material.uniforms;
      if (!result) {
        values.uInsideReady.value = 0;
        invalidate();
        return;
      }
      current = result.texture;
      values.uInside.value = result.texture;
      values.uInsideSize.value.set(result.width, result.height);
      values.uInsideReady.value = 1;
      invalidate();
    });
    return () => {
      cancel();
      current?.dispose();
    };
  }, [image, gl, invalidate]);
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const anisotropy = gl.capabilities.getMaxAnisotropy();
    let current: THREE.Texture | null = null;
    const cancel = loadTexture(backgroundImage, anisotropy, (result) => {
      const values = material.uniforms;
      if (!result) {
        values.uOutsideReady.value = 0;
        invalidate();
        return;
      }
      current = result.texture;
      values.uOutside.value = result.texture;
      values.uOutsideSize.value.set(result.width, result.height);
      values.uOutsideReady.value = 1;
      invalidate();
    });
    return () => {
      cancel();
      current?.dispose();
    };
  }, [backgroundImage, gl, invalidate]);
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    updateColor(material.uniforms.uFallback.value, fallbackColor);
    invalidate();
  }, [fallbackColor, invalidate]);
  useEffect(() => {
    invalidate();
  }, [
    shape,
    size,
    softness,
    distortion,
    aberration,
    wobble,
    waveFrequency,
    waveStrength,
    grain,
    grayscale,
    dim,
    invalidate,
  ]);
  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const step = Math.min(delta, 0.05);
    if (!paused) {
      const t = clocks.current;
      t.wobble += step * wobbleSpeed;
      t.wave += step * waveSpeed;
      t.grain += step * grainSpeed;
    }
    const aim = pointer.current;
    const targetX = aim.inside || !returnToCenter ? aim.x : 0;
    const targetY = aim.inside || !returnToCenter ? aim.y : 0;
    const rate = 2 + (1 - clamp(follow, 0, 1)) * 40;
    const ease = 1 - Math.exp(-step * rate);
    eased.current.x += (targetX - eased.current.x) * ease;
    eased.current.y += (targetY - eased.current.y) * ease;
    const pixelRatio = gl.getPixelRatio();
    const values = material.uniforms;
    values.uResolution.value.set(
      view.width * pixelRatio,
      view.height * pixelRatio,
    );
    values.uPointer.value.copy(eased.current);
    values.uShape.value = SHAPES[shape] ?? 0;
    values.uSize.value = clamp(size, 0.02, 2);
    values.uSoftness.value = Math.max(softness, 0);
    values.uDistortion.value = distortion;
    values.uAberration.value = aberration;
    values.uWobble.value = clamp(wobble, 0, 1);
    values.uWobbleTime.value = clocks.current.wobble;
    values.uWaveFrequency.value = waveFrequency;
    values.uWaveStrength.value = waveStrength;
    values.uWaveTime.value = clocks.current.wave;
    values.uGrain.value = grain;
    values.uGrainTime.value = clocks.current.grain;
    values.uGray.value = clamp(grayscale, 0, 1);
    values.uDim.value = clamp(dim, 0, 1);
  });
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};
export const GlassReveal = ({
  image = "/effects/signal-map.svg",
  backgroundImage,
  shape = "circle",
  size = 0.6,
  softness = 0,
  distortion = 1,
  aberration = 0.01,
  wobble = 0.5,
  wobbleSpeed = 2,
  waveFrequency = 6,
  waveStrength = 0.01,
  waveSpeed = 1,
  grain = 0.02,
  grainSpeed = 10,
  grayscale = 1,
  dim = 0,
  follow = 0.85,
  returnToCenter = true,
  fallbackColor = "#171717",
  paused = false,
  dpr = 1.5,
  className,
  children,
}: GlassRevealProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0, inside: false });
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const deviceDpr = useSyncExternalStore(subscribeToDpr, readDpr, () => 1);
  const pixelRatio = Math.min(deviceDpr, Math.max(dpr, 0.5));
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
  const track = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current.x = clamp(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -1,
      1,
    );
    pointer.current.y = clamp(
      1 - ((event.clientY - rect.top) / rect.height) * 2,
      -1,
      1,
    );
    pointer.current.inside = true;
  };
  const still = paused || Boolean(reducedMotion);
  return (
    <div
      ref={rootRef}
      className={cn("relative touch-pan-y overflow-hidden", className)}
      onPointerMove={track}
      onPointerDown={track}
      onPointerLeave={() => {
        pointer.current.inside = false;
      }}
    >
      <div className="absolute inset-0">
        <Canvas
          orthographic
          dpr={pixelRatio}
          frameloop={visible ? "always" : "demand"}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: "high-performance",
          }}
        >
          <Lens
            image={image}
            backgroundImage={backgroundImage ?? image}
            shape={shape}
            size={size}
            softness={softness}
            distortion={distortion}
            aberration={aberration}
            wobble={wobble}
            wobbleSpeed={still ? 0 : wobbleSpeed}
            waveFrequency={waveFrequency}
            waveStrength={still ? 0 : waveStrength}
            waveSpeed={waveSpeed}
            grain={still ? 0 : grain}
            grainSpeed={grainSpeed}
            grayscale={grayscale}
            dim={dim}
            follow={reducedMotion ? 0 : follow}
            returnToCenter={returnToCenter}
            fallbackColor={fallbackColor}
            paused={still}
            pointer={pointer}
          />
        </Canvas>
      </div>
      {children ? (
        <div className="pointer-events-none relative z-10 h-full w-full">
          {children}
        </div>
      ) : null}
    </div>
  );
};
export default GlassReveal;
