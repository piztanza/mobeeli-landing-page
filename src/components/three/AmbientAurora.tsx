"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { AURORA_INTENSITY } from "./auroraIntensity";

export interface AmbientAuroraProps {
  /** Base intensity multiplier. Callers should pass {@link AURORA_INTENSITY}. */
  intensity?: number;
  className?: string;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uProgress;
  uniform float uVelocity;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform float uBaseIntensity;

  vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uAspect;

    float t = uTime * 0.05;
    float n = snoise(p * 1.5 + vec2(t, t * 0.6));
    n += 0.5 * snoise(p * 3.0 - vec2(t * 0.8, t));
    n = n * 0.5 + 0.5;

    float shift = 0.5 + 0.5 * sin(uTime * 0.08 + uProgress * 3.0 + n * 1.6);
    vec3 blueA = vec3(0.184, 0.490, 0.965);   // #2f7df6
    vec3 blueB = vec3(0.106, 0.373, 0.851);   // #1b5fd9
    vec3 glow  = mix(blueA, blueB, shift);

    vec2 ctr = uPointer * vec2(0.32 * uAspect, 0.32);
    float rad = 1.0 - smoothstep(0.15, 1.2, length(p - ctr));
    float intensity = pow(n, 2.1) * rad * (uBaseIntensity + 0.4 * uVelocity);
    float alpha = clamp(intensity * (1.0 - 0.28 * length(p)), 0.0, 1.0);

    gl_FragColor = vec4(glow * alpha, alpha);
  }
`;

/**
 * <AmbientAurora> — Lightweight vanilla Three.js client island for the persistent
 * WebGL aurora backdrop (R10-A).
 */
export default function AmbientAurora({
  intensity = AURORA_INTENSITY,
  className = "mb-ambient-aurora",
}: AmbientAuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    if (!container) return;

    let unmounted = false;
    let animId: number | null = null;
    let dispose: (() => void) | null = null;

    import("three")
      .then((THREE) => {
        if (unmounted) return;

        const renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          preserveDrawingBuffer: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(container.clientWidth, container.clientHeight);

        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const pointer = new THREE.Vector2(0, 0);
        const targetPointer = new THREE.Vector2(0, 0);
        let targetProgress = 0;
        let targetVelocity = 0;
        let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;

        const uniforms = {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uVelocity: { value: 0 },
          uAspect: { value: container.clientWidth / Math.max(container.clientHeight, 1) },
          uPointer: { value: pointer },
          uBaseIntensity: { value: intensity },
        };

        const mat = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms,
          depthTest: false,
          depthWrite: false,
          transparent: true,
          blending: THREE.AdditiveBlending,
        });

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
        scene.add(mesh);

        const handlePointerMove = (e: PointerEvent) => {
          const rect = container.getBoundingClientRect();
          targetPointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          targetPointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        };

        const handleScroll = () => {
          const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
          targetProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
          const dy = Math.abs(window.scrollY - lastScrollY);
          lastScrollY = window.scrollY;
          targetVelocity = Math.min(dy * 0.015, 1.0);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("scroll", handleScroll, { passive: true });

        const handleResize = () => {
          if (!container) return;
          renderer.setSize(container.clientWidth, container.clientHeight);
          uniforms.uAspect.value = container.clientWidth / Math.max(container.clientHeight, 1);
        };

        window.addEventListener("resize", handleResize);

        const clock = new THREE.Clock();
        const loop = () => {
          animId = requestAnimationFrame(loop);
          const delta = clock.getDelta();
          uniforms.uTime.value += delta;
          pointer.x += (targetPointer.x - pointer.x) * 0.05;
          pointer.y += (targetPointer.y - pointer.y) * 0.05;

          uniforms.uProgress.value += (targetProgress - uniforms.uProgress.value) * 0.06;
          uniforms.uVelocity.value += (targetVelocity - uniforms.uVelocity.value) * 0.08;
          targetVelocity *= 0.92;

          renderer.render(scene, camera);
        };

        loop();

        dispose = () => {
          if (animId) cancelAnimationFrame(animId);
          window.removeEventListener("pointermove", handlePointerMove);
          window.removeEventListener("scroll", handleScroll);
          window.removeEventListener("resize", handleResize);
          renderer.dispose();
          mat.dispose();
          mesh.geometry.dispose();
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        };
      })
      .catch(() => {
        // Fallback under WebGL error
      });

    return () => {
      unmounted = true;
      dispose?.();
    };
  }, [intensity, reduced]);

  if (reduced) return null;

  return <div ref={containerRef} className={className} aria-hidden />;
}
