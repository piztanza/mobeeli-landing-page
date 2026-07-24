"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { Lang } from "@/lib/i18n";

import {
  ARC_DOT_SPEED,
  ARC_STATIC_POINT,
  CAM_LERP,
  CITIES,
  DRAG_X_FACTOR,
  DRAG_Z_FACTOR,
  ENTRY_IDLE_MS,
  ENTRY_THRESHOLD,
  HOME_PAN_X,
  HOME_PAN_Z,
  IDLE_RESUME_MS,
  JAKARTA,
  LABEL_REVEAL_S,
  MAX_PIXEL_RATIO,
  buildLandDots,
  buildOceanDots,
  clampPanX,
  clampPanZ,
  driftStep,
  getJakartaLabel,
  project,
  ringPulse,
} from "./indoMap";

import "./indo-globe.css";

// Type-only imports are erased at build time — three itself stays code-split.
import type { Mesh, QuadraticBezierCurve3, WebGLRenderer } from "three";

type ThreeModule = typeof import("three");

export interface IndoGlobeProps {
  lang: Lang;
  /** Render without camera drift/arc motion (reduced motion). */
  isStatic?: boolean;
}

/** Start loading three.js once the container is within this margin of the viewport. */
const IN_VIEW_ROOT_MARGIN = "25% 0px";

/** Mutable state the imperative scene shares with the React shell. */
interface SceneRefs {
  staticRef: { current: boolean };
  lblRef: { current: HTMLDivElement | null };
}

/**
 * <IndoGlobe> — client-only island for the Indonesia flyover map (F-006),
 * a near-1:1 port of the approved design's indo-globe.js custom element:
 * tilted 3D land view of the archipelago in bright blue dots (two-tone
 * layers with jitter + pseudo-elevation over the island polygons), a faint
 * ocean grid, fog + radial edge fade, Jakarta marker with pulsing ring and
 * a projected label, and six quadratic-bezier arcs with additive moving
 * dots toward the major cities. The camera drifts west↔east like a flyover
 * and reverses at the bounds; dragging pans within clamps (grab/grabbing
 * cursor) and the drift resumes 3s after the last drag; scrolling the map
 * into view re-centers it on Jakarta's island.
 *
 * three from npm, imported only once the container nears the viewport;
 * until then — and whenever WebGL is unavailable — the host's dark gradient
 * stays visible as the fallback. Loaded via next/dynamic (ssr: false) from
 * the Unify band. `isStatic` prop and prefers-reduced-motion stop the drift,
 * steady the pulse ring and freeze the arc dots mid-arc.
 */
export default function IndoGlobe({ lang, isStatic = false }: IndoGlobeProps) {
  const reduced = useReducedMotion();
  const staticMode = isStatic || reduced;

  const hostRef = useRef<HTMLDivElement>(null);
  const lblRef = useRef<HTMLDivElement>(null);
  const staticRef = useRef(staticMode);
  // Without IntersectionObserver support there is nothing to defer on.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    staticRef.current = staticMode;
  }, [staticMode]);

  // Initialize three.js only near the viewport (rubric: dynamic + IntersectionObserver).
  useEffect(() => {
    if (inView) return;
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: IN_VIEW_ROOT_MARGIN },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [inView]);

  // Code-split three.js and build the scene; dispose cleanly on unmount.
  useEffect(() => {
    if (!inView) return;
    const host = hostRef.current;
    if (!host) return;
    let unmounted = false;
    let dispose: (() => void) | null = null;
    import("three")
      .then((THREE) => {
        if (unmounted) return;
        dispose = initScene(THREE, host, { staticRef, lblRef });
      })
      .catch(() => {
        // three failed to load — keep the host's dark gradient fallback.
      });
    return () => {
      unmounted = true;
      dispose?.();
    };
  }, [inView]);

  const label = getJakartaLabel(lang);
  return (
    <div ref={hostRef} className="mb-indo" data-component="indo-globe">
      <div className="mb-indo-fade" />
      <div ref={lblRef} className="mb-indo-lbl">
        <b>{label.city}</b>&nbsp;<span>{label.note}</span>
      </div>
    </div>
  );
}

/**
 * Build renderer + scene graph and start the tick loop — a near-verbatim port
 * of the design's _init(THREE). Returns a dispose callback (cancels the RAF,
 * disconnects the observers, removes the pointer listeners, disposes the
 * renderer), or null when a WebGL context can't be created so the dark
 * gradient stays as fallback.
 */
function initScene(THREE: ThreeModule, host: HTMLDivElement, refs: SceneRefs): (() => void) | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
  } catch {
    return null; // WebGL unavailable
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  host.insertBefore(renderer.domElement, host.firstChild);

  const toM = (lonLat: readonly [number, number] | readonly number[], y = 0) => {
    const [x, py, z] = project(lonLat[0], lonLat[1], y);
    return new THREE.Vector3(x, py, z);
  };

  const scene = new THREE.Scene();
  // Fog pushed out (R10-E) to match the pulled-back camera — the newly-visible
  // Java corridor edges stay crisp instead of dissolving into background.
  scene.fog = new THREE.Fog(0x0d1522, 8.0, 15.2);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);

  const mkPts = (arr: number[], color: number, size: number, op: number) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return new THREE.Points(
      g,
      new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        opacity: op,
        sizeAttenuation: true,
      }),
    );
  };

  // Ocean grid + two-tone land dots with pseudo-elevation (design loops,
  // ported as pure builders in indoMap.ts)
  scene.add(mkPts(buildOceanDots(), 0x27395a, 0.028, 0.5));
  const { land, landHi } = buildLandDots();
  scene.add(mkPts(land, 0x4a90f7, 0.034, 0.92));
  scene.add(mkPts(landHi, 0x9cc3ff, 0.04, 0.95));

  // Jakarta marker + pulse ring, city dots, bezier arcs with moving dots
  const jv = toM(JAKARTA, 0.03);
  const jkt = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  jkt.position.copy(jv);
  scene.add(jkt);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.008, 8, 40),
    new THREE.MeshBasicMaterial({ color: 0x5b9bf7, transparent: true, opacity: 0.7 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.copy(jv);
  scene.add(ring);
  const movers: { dot: Mesh; curve: QuadraticBezierCurve3; off: number }[] = [];
  CITIES.forEach((c) => {
    const cv = toM(c, 0.03);
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xd7e7ff }),
    );
    m.position.copy(cv);
    scene.add(m);
    const mid = jv.clone().add(cv).multiplyScalar(0.5);
    mid.y = 0.35 + jv.distanceTo(cv) * 0.22;
    const curve = new THREE.QuadraticBezierCurve3(jv, mid, cv);
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(36)),
        new THREE.LineBasicMaterial({
          color: 0x3f8bf8,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      }),
    );
    scene.add(dot);
    movers.push({ dot, curve, off: Math.random() });
  });

  // Camera rig: tilted flyover; drag pans, idle drifts along the islands
  let panX = HOME_PAN_X;
  let panZ = HOME_PAN_Z;
  let drift = 0;
  let dir: 1 | -1 = 1;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let idleAt = 0;
  let camX = panX;
  let camZ = panZ;
  const applyCam = () => {
    // Pulled up + back (R10-E, founder): zoom out and tilt slightly more top-down
    // so the corridor across Java reads (was 4.3 / 3.3). Stays inside the fog
    // near-plane (8.0) at this distance so nothing clips.
    camera.position.set(camX + drift, 5.0, 3.9 + camZ);
    camera.lookAt(camX + drift, 0, camZ - 0.1);
  };
  applyCam();

  const onPointerDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    host.classList.add("is-drag");
    host.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    panX = clampPanX(panX - (e.clientX - lastX) * DRAG_X_FACTOR);
    panZ = clampPanZ(panZ - (e.clientY - lastY) * DRAG_Z_FACTOR);
    lastX = e.clientX;
    lastY = e.clientY;
    idleAt = performance.now() + IDLE_RESUME_MS;
  };
  const endDrag = () => {
    dragging = false;
    host.classList.remove("is-drag");
  };
  host.addEventListener("pointerdown", onPointerDown);
  host.addEventListener("pointermove", onPointerMove);
  host.addEventListener("pointerup", endDrag);
  host.addEventListener("pointercancel", endDrag);

  // Re-center on Jakarta's island whenever the map scrolls back into view
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting && !dragging) {
          panX = HOME_PAN_X;
          panZ = HOME_PAN_Z;
          idleAt = performance.now() + ENTRY_IDLE_MS;
        }
      }),
    { threshold: ENTRY_THRESHOLD },
  );
  io.observe(host);

  const resize = () => {
    const w = host.clientWidth || 300;
    const h = host.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const tmp = new THREE.Vector3();
  const start = performance.now();
  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const now = performance.now();
    const t = (now - start) / 1000;
    const isStatic = refs.staticRef.current;
    // idle west↔east drift, reversing at the bounds
    if (!isStatic && !dragging && now > idleAt) {
      ({ drift, dir } = driftStep(panX, drift, dir));
    }
    camX += (panX - camX) * CAM_LERP;
    camZ += (panZ - camZ) * CAM_LERP;
    applyCam();
    // Jakarta pulse ring (steady when static)
    const pulse = ringPulse(t, isStatic);
    ring.scale.set(pulse.scale, pulse.scale, 1);
    ring.material.opacity = pulse.opacity;
    // arc dots sweep toward the cities (frozen mid-arc when static)
    movers.forEach((m) => {
      m.dot.position.copy(
        m.curve.getPoint(isStatic ? ARC_STATIC_POINT : (t * ARC_DOT_SPEED + m.off) % 1),
      );
    });
    // project the Jakarta label to screen space, fade it in after reveal
    const lbl = refs.lblRef.current;
    if (lbl) {
      if (t > LABEL_REVEAL_S) lbl.style.opacity = "1";
      tmp.copy(jv).project(camera);
      const w = host.clientWidth;
      const h = host.clientHeight;
      lbl.style.display = tmp.z > 1 ? "none" : "block";
      lbl.style.left = `${(tmp.x * 0.5 + 0.5) * w}px`;
      lbl.style.top = `${(-(tmp.y * 0.5) + 0.5) * h}px`;
    }
    renderer.render(scene, camera);
  };
  tick();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    host.removeEventListener("pointerdown", onPointerDown);
    host.removeEventListener("pointermove", onPointerMove);
    host.removeEventListener("pointerup", endDrag);
    host.removeEventListener("pointercancel", endDrag);
    host.classList.remove("is-drag");
    renderer.dispose();
    renderer.domElement.remove();
  };
}
