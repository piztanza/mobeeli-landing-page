"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { Lang } from "@/lib/i18n";

import { FITMENT_LABEL_ANCHORS, getFitmentLabels } from "./fitmentLabels";
import {
  BOLT_COUNT,
  BOLT_FAR_Z,
  BOLT_RADIUS,
  BOLT_SEAT_Z,
  BOLT_SPIN_STEP,
  ENTRANCE_S,
  LABEL_REVEAL_S,
  LABEL_STAGGER_MS,
  MAX_PIXEL_RATIO,
  STATIC_ROT_Y,
  WHEEL_SEAT_Z,
  boltPose,
  entrancePose,
  loopTime,
  ringPulse,
  wheelPose,
} from "./fitmentTimeline";

import "./fitment-wheel.css";

// Type-only imports are erased at build time — three itself stays code-split.
import type { BufferGeometry, Group, WebGLRenderer } from "three";

type ThreeModule = typeof import("three");

export interface FitmentWheelProps {
  lang: Lang;
  /** Render the static seated state (reduced motion). */
  isStatic?: boolean;
  /** Fires once — after the first mount loop (immediately when static). */
  onFirstLoop?: () => void;
}

/** Start loading three.js once the container is within this margin of the viewport. */
const IN_VIEW_ROOT_MARGIN = "25% 0px";

/** Mutable state the imperative scene shares with the React shell. */
interface SceneRefs {
  staticRef: { current: boolean };
  shownRef: { current: boolean };
  labelRefs: { current: (HTMLDivElement | null)[] };
  onFirstLoop: () => void;
}

/**
 * <FitmentWheel> — client-only island for the 3D hero fitment scene (F-002),
 * a near-1:1 port of the approved design's fitment-3d.js custom element:
 * wireframe blueprint car with feature lines, rear wheel, hub + studs and
 * ground shadows; the front wheel mounts/dismounts on a ~7s loop with 4
 * streaking lug bolts that seat with spin, a flash ring after seating, and an
 * entrance ease settling into an idle sway. Projected spec labels track their
 * 3D anchor points and fade in after the first loop, when the fitment-first-
 * loop callback/event fires once (revealing the hero's floating cards).
 *
 * three from npm, imported only once the container nears the viewport; until
 * then — and whenever WebGL is unavailable — the parent .mb-hero-scene's
 * static gradient stays visible as the fallback. Loaded via next/dynamic
 * (ssr: false) from the Hero. `static` prop and prefers-reduced-motion render
 * the seated wheel with labels immediately visible.
 */
export default function FitmentWheel({ lang, isStatic = false, onFirstLoop }: FitmentWheelProps) {
  const reduced = useReducedMotion();
  const staticMode = isStatic || reduced;

  const hostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const staticRef = useRef(staticMode);
  const shownRef = useRef(false);
  const onFirstLoopRef = useRef(onFirstLoop);
  // Without IntersectionObserver support there is nothing to defer on.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === "undefined");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    staticRef.current = staticMode;
  }, [staticMode]);
  useEffect(() => {
    onFirstLoopRef.current = onFirstLoop;
  }, [onFirstLoop]);

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
        dispose = initScene(THREE, host, {
          staticRef,
          shownRef,
          labelRefs,
          onFirstLoop: () => {
            setShown(true);
            onFirstLoopRef.current?.();
          },
        });
      })
      .catch(() => {
        // three failed to load — keep the hero's static gradient fallback.
      });
    return () => {
      unmounted = true;
      dispose?.();
    };
  }, [inView]);

  const labels = getFitmentLabels(lang);
  return (
    <div ref={hostRef} className="mb-fitment" data-component="fitment-wheel">
      <div className="mb-fitment-labels">
        {labels.map((label, i) => (
          <div
            key={label.id}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className={`mb-fitment-label${shown ? " is-shown" : ""}`}
            style={
              shown && !staticMode ? { transitionDelay: `${i * LABEL_STAGGER_MS}ms` } : undefined
            }
          >
            <div className="mb-fitment-label-content">
              <div className="mb-fitment-label-title">{label.title}</div>
              <div className="mb-fitment-label-value">{label.value}</div>
            </div>
            <div className="mb-fitment-label-line" />
          </div>
        ))}
      </div>
      <div className="mb-fitment-vignette" />
    </div>
  );
}

/**
 * Build renderer + scene graph and start the tick loop — a near-verbatim port
 * of the design's _init(THREE). Returns a dispose callback (cancels the RAF,
 * disconnects the ResizeObserver, disposes the renderer), or null when a
 * WebGL context can't be created so the static gradient stays as fallback.
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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.insertBefore(renderer.domElement, host.firstChild);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#0a1322", 0.022);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  // Pulled back slightly (R7) to leave margin around the wheel now that it
  // headlines a full-viewport stage (was 1.4, 0.8, 9.0).
  const CAM_CLOSE = new THREE.Vector3(1.4, 0.9, 10.2);
  const LOOK_CLOSE = new THREE.Vector3(0.4, 0.6, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  const dir = new THREE.DirectionalLight(0x2f7df6, 4);
  dir.position.set(5, 5, 4);
  scene.add(dir);
  const pt = new THREE.PointLight(0x123f9e, 10, 16);
  pt.position.set(-2, -2, 2);
  scene.add(pt);

  const solidMat = new THREE.MeshPhysicalMaterial({
    color: 0x060d18,
    metalness: 0.7,
    roughness: 0.3,
    clearcoat: 0.8,
    emissive: 0x123f9e,
    emissiveIntensity: 0.15,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const wire = (geom: BufferGeometry, color: number, op = 0.7, thresh = 1) =>
    new THREE.LineSegments(
      new THREE.EdgesGeometry(geom, thresh),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: op }),
    );
  const root = new THREE.Group();
  scene.add(root);

  // ---- Full car body: side profile with front + rear arches, front arch centered on origin ----
  const car = new THREE.Group();
  root.add(car);
  const prof = new THREE.Shape();
  prof.moveTo(-11.2, -1.5);
  prof.lineTo(-10.35, -1.5);
  prof.lineTo(-10.35, 0);
  prof.absarc(-7.6, 0, 2.75, Math.PI, 0, true);
  prof.lineTo(-4.85, -1.5);
  prof.lineTo(-2.75, -1.5);
  prof.lineTo(-2.75, 0);
  prof.absarc(0, 0, 2.75, Math.PI, 0, true);
  prof.lineTo(2.75, -1.5);
  prof.lineTo(6.7, -1.5);
  prof.quadraticCurveTo(7.9, -1.35, 7.95, -0.2);
  prof.quadraticCurveTo(8.0, 1.0, 7.2, 1.45);
  prof.quadraticCurveTo(5.6, 1.95, 3.6, 2.3);
  prof.quadraticCurveTo(2.4, 2.5, 1.6, 3.4);
  prof.quadraticCurveTo(0.9, 4.35, -0.8, 4.6);
  prof.quadraticCurveTo(-3.5, 4.85, -6.0, 4.45);
  prof.quadraticCurveTo(-8.6, 4.0, -9.9, 2.7);
  prof.quadraticCurveTo(-11.15, 1.5, -11.2, 0.2);
  prof.closePath();
  const bodyGeom = new THREE.ExtrudeGeometry(prof, {
    depth: 3.2,
    bevelEnabled: false,
    curveSegments: 24,
  });
  const body = new THREE.Mesh(bodyGeom, solidMat);
  body.position.z = -3.5;
  car.add(body);
  const bodyWire = wire(bodyGeom, 0x2f7df6, 0.45, 10);
  bodyWire.position.z = -3.5;
  car.add(bodyWire);

  // Blueprint feature lines on the visible face: windows, pillars, seams
  const feat = [
    [1.7, 3.0, -8.8, 2.95],
    [2.5, 2.45, 1.0, 4.1],
    [-2.6, 4.55, -2.55, 3.0],
    [-6.2, 4.3, -8.8, 2.95],
    [-3.8, 2.95, -3.8, -1.25],
    [3.1, 2.35, 3.05, -1.3],
    [7.0, 1.3, 5.9, 1.7],
  ];
  const featArr: number[] = [];
  feat.forEach((s) => {
    featArr.push(s[0], s[1], -0.27, s[2], s[3], -0.27);
  });
  const featGeom = new THREE.BufferGeometry();
  featGeom.setAttribute("position", new THREE.Float32BufferAttribute(featArr, 3));
  car.add(
    new THREE.LineSegments(
      featGeom,
      new THREE.LineBasicMaterial({ color: 0x2f7df6, transparent: true, opacity: 0.55 }),
    ),
  );

  // Rear wheel (static, same design as the front wheel)
  const rear = new THREE.Group();
  rear.position.set(-7.6, 0, -0.05);
  car.add(rear);
  const rearRimG = new THREE.TorusGeometry(2, 0.4, 24, 56);
  rear.add(new THREE.Mesh(rearRimG, solidMat));
  rear.add(wire(rearRimG, 0x2f7df6, 0.5));
  const rearHubG = new THREE.CylinderGeometry(0.55, 0.55, 0.6, 24);
  const rearHub = new THREE.Mesh(rearHubG, solidMat);
  rearHub.rotation.x = Math.PI / 2;
  rear.add(rearHub);
  const rearHubW = wire(rearHubG, 0x2f7df6, 0.5);
  rearHubW.rotation.x = Math.PI / 2;
  rear.add(rearHubW);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const g = new THREE.CylinderGeometry(0.11, 0.11, 1.6, 8);
    const s = new THREE.Mesh(g, solidMat);
    s.position.set(Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0);
    s.rotation.z = a + Math.PI / 2;
    rear.add(s);
    const w2 = wire(g, 0x2f7df6, 0.35);
    w2.position.copy(s.position);
    w2.rotation.copy(s.rotation);
    rear.add(w2);
  }

  // Hub + studs in the front arch
  const hubBaseG = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 20);
  const hubBase = new THREE.Mesh(hubBaseG, solidMat);
  hubBase.rotation.x = Math.PI / 2;
  hubBase.position.z = -0.05;
  car.add(hubBase);
  const hubBaseW = wire(hubBaseG, 0x5b9bf7, 0.8);
  hubBaseW.rotation.x = Math.PI / 2;
  hubBaseW.position.z = -0.05;
  car.add(hubBaseW);
  for (let i = 0; i < BOLT_COUNT; i++) {
    const a = Math.PI / 4 + (i / BOLT_COUNT) * Math.PI * 2;
    const sg = new THREE.CylinderGeometry(0.035, 0.035, 0.8, 8);
    const stud = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: 0x5b9bf7 }));
    stud.rotation.x = Math.PI / 2;
    stud.position.set(Math.cos(a) * BOLT_RADIUS, Math.sin(a) * BOLT_RADIUS, 0.1);
    car.add(stud);
  }

  // Ground shadows
  const groundCar = new THREE.Mesh(
    new THREE.CircleGeometry(10.5, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }),
  );
  groundCar.rotation.x = -Math.PI / 2;
  groundCar.scale.set(1.12, 0.42, 1);
  groundCar.position.set(-2.2, -2.47, -1.2);
  root.add(groundCar);
  const groundWheel = new THREE.Mesh(
    new THREE.CircleGeometry(2.3, 40),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 }),
  );
  groundWheel.rotation.x = -Math.PI / 2;
  groundWheel.scale.x = 1.4;
  groundWheel.position.y = -2.45;
  root.add(groundWheel);

  // ---- Wheel group (travels on Z onto the studs) ----
  const wheel = new THREE.Group();
  root.add(wheel);
  const rimGeom = new THREE.TorusGeometry(2, 0.4, 24, 56);
  wheel.add(new THREE.Mesh(rimGeom, solidMat));
  wheel.add(wire(rimGeom, 0x5b9bf7));
  const hubGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.6, 24);
  const hub = new THREE.Mesh(hubGeom, solidMat);
  hub.rotation.x = Math.PI / 2;
  wheel.add(hub);
  const hubWire = wire(hubGeom, 0x5b9bf7);
  hubWire.rotation.x = Math.PI / 2;
  wheel.add(hubWire);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const g = new THREE.CylinderGeometry(0.11, 0.11, 1.6, 8);
    const s = new THREE.Mesh(g, solidMat);
    s.position.set(Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0);
    s.rotation.z = a + Math.PI / 2;
    wheel.add(s);
    const w = wire(g, 0x2f7df6);
    w.position.copy(s.position);
    w.rotation.copy(s.rotation);
    wheel.add(w);
  }
  const bolts: Group[] = [];
  for (let i = 0; i < BOLT_COUNT; i++) {
    const a = Math.PI / 4 + (i / BOLT_COUNT) * Math.PI * 2;
    const b = new THREE.Group();
    const headG = new THREE.CylinderGeometry(0.1, 0.1, 0.09, 6);
    const shaftG = new THREE.CylinderGeometry(0.042, 0.042, 0.26, 10);
    const head = new THREE.Mesh(headG, solidMat);
    head.position.y = 0.13;
    b.add(head);
    b.add(new THREE.Mesh(shaftG, solidMat));
    const hw = wire(headG, 0x5b9bf7, 0.95);
    hw.position.y = 0.13;
    b.add(hw);
    b.add(wire(shaftG, 0x2f7df6, 0.8));
    b.rotation.x = Math.PI / 2;
    b.position.set(Math.cos(a) * BOLT_RADIUS, Math.sin(a) * BOLT_RADIUS, BOLT_FAR_Z);
    wheel.add(b);
    bolts.push(b);
  }
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x5b9bf7,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.014, 8, 48), ringMat);
  ring.position.z = 0.36;
  wheel.add(ring);

  const resize = () => {
    const w = host.clientWidth || 300;
    const h = host.clientHeight || 200;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const tempV = new THREE.Vector3();
  const start = performance.now();
  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const t = (performance.now() - start) / 1000;
    const isStatic = refs.staticRef.current;
    const entrance = entrancePose(t);
    const sc = isStatic ? 1 : entrance.scale;
    root.scale.set(sc, sc, sc);
    root.rotation.y = isStatic ? STATIC_ROT_Y : entrance.rotY;
    const ta = isStatic ? Number.POSITIVE_INFINITY : t - ENTRANCE_S;
    camera.position.copy(CAM_CLOSE);
    camera.lookAt(LOOK_CLOSE);
    const tl = isStatic ? -1 : loopTime(t);
    // wheel mounts and dismounts each loop
    const wp = isStatic ? { z: WHEEL_SEAT_Z, rot: 0 } : wheelPose(tl);
    wheel.position.z = wp.z;
    wheel.rotation.z = wp.rot;
    // bolts: hidden until the wheel starts moving, then streak in from off-screen
    // (past the camera) and seat right as the wheel finishes fitting
    bolts.forEach((b, i) => {
      if (isStatic) {
        b.visible = true;
        b.position.z = BOLT_SEAT_Z;
        return;
      }
      const bp = boltPose(tl, i);
      if (bp.spinning) b.rotation.y += BOLT_SPIN_STEP;
      b.visible = bp.visible;
      b.position.z = bp.z;
    });
    // flash ring after the last bolt seats each loop
    const rp = isStatic ? { opacity: 0, scale: 1 } : ringPulse(tl);
    ringMat.opacity = rp.opacity;
    ring.scale.set(rp.scale, rp.scale, rp.scale);
    // labels + first-loop callback after the first full loop
    if (!refs.shownRef.current && (isStatic || ta > LABEL_REVEAL_S)) {
      refs.shownRef.current = true;
      host.dispatchEvent(new CustomEvent("fitment-first-loop", { bubbles: true, composed: true }));
      refs.onFirstLoop();
    }
    // project each label's 3D anchor to screen space
    const w = host.clientWidth;
    const h = host.clientHeight;
    FITMENT_LABEL_ANCHORS.forEach((p, i) => {
      const el = refs.labelRefs.current[i];
      if (!el) return;
      tempV.set(p[0], p[1], p[2]);
      tempV.applyMatrix4(wheel.matrixWorld);
      tempV.project(camera);
      if (tempV.z > 1) {
        el.style.display = "none";
        return;
      }
      el.style.display = "flex";
      el.style.left = `${(tempV.x * 0.5 + 0.5) * w}px`;
      el.style.top = `${(-(tempV.y * 0.5) + 0.5) * h}px`;
    });
    renderer.render(scene, camera);
  };
  tick();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
