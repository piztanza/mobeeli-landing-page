/**
 * Timeline math for the 3D hero fitment scene (F-002) — ported VERBATIM from
 * the approved design's fitment-3d.js tick(). Pure functions so the phase
 * math (wheel z / bolt z at key timestamps) is unit-testable without WebGL.
 *
 * Timeline (seconds after ENTRANCE, per loop): hold → wheel flies in 0.4–2.2
 * → bolts streak in 0.9–2.8 (staggered) with spin → flash ring 3.2–3.75 →
 * dismount from 5.2 (bolts) / 5.6 (wheel) → loop at 7.0. Labels (and the
 * first-loop callback) fire once at 7.2 — after the first full loop.
 */

/** Seconds of entrance ease before the loop clock starts (design: ENTRANCE). */
export const ENTRANCE_S = 1.0;
/** One full mount → dismount cycle (design: LOOP). */
export const LOOP_S = 7.0;
/** Wheel travel endpoints on Z (design: W_FAR / W_SEAT). */
export const WHEEL_FAR_Z = 2.8;
export const WHEEL_SEAT_Z = 0.15;
/** Bolt travel endpoints on Z (design: B_FAR / B_SEAT). */
export const BOLT_FAR_Z = 12;
export const BOLT_SEAT_Z = 0.42;
/** Lug bolts on the 4×100 pattern (design: 4 bolts on radius BR). */
export const BOLT_COUNT = 4;
export const BOLT_RADIUS = 0.32;
/** Per-frame yaw added to a bolt while it streaks (design: 0.35). */
export const BOLT_SPIN_STEP = 0.35;
/** Labels + first-loop callback fire once `ta` passes this (design: 7.2). */
export const LABEL_REVEAL_S = 7.2;
/** Stagger between each label's fade-in (design: 150ms). */
export const LABEL_STAGGER_MS = 150;
/** Idle yaw the scene settles into / static yaw (design: 0.14). */
export const STATIC_ROT_Y = 0.14;
/** devicePixelRatio cap (design: Math.min(devicePixelRatio, 2)). */
export const MAX_PIXEL_RATIO = 2;

export const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
export const easeOut = (p: number): number => 1 - Math.pow(1 - p, 3);

/**
 * Loop-local time: -1 during the entrance hold, else seconds into the
 * current mount/dismount loop (design: ta = t - ENTRANCE; tl = ta % LOOP).
 */
export function loopTime(elapsed: number): number {
  return elapsed > ENTRANCE_S ? (elapsed - ENTRANCE_S) % LOOP_S : -1;
}

/** Entrance ease + idle sway for the scene root (design: root scale / rotation.y). */
export function entrancePose(elapsed: number): { scale: number; rotY: number } {
  const e = Math.min(elapsed / 2.0, 1);
  const ease = 1 - Math.pow(2, -10 * e);
  return {
    scale: Math.max(0.001, ease),
    rotY: Math.PI * (1 - ease) * 0.25 + STATIC_ROT_Y + 0.04 * Math.sin(elapsed * 0.4),
  };
}

/** Wheel Z + roll at loop time `tl` — mounts 0.4–2.2, dismounts 5.6–6.6. */
export function wheelPose(tl: number): { z: number; rot: number } {
  if (tl < 0.4) return { z: WHEEL_FAR_Z, rot: -0.35 };
  if (tl < 5.6) {
    const k = easeOut(clamp01((tl - 0.4) / 1.8));
    return { z: WHEEL_FAR_Z + (WHEEL_SEAT_Z - WHEEL_FAR_Z) * k, rot: -0.35 * (1 - k) };
  }
  const q = clamp01((tl - 5.6) / 1.0);
  return { z: WHEEL_SEAT_Z + (WHEEL_FAR_Z - WHEEL_SEAT_Z) * q * q * q, rot: -0.2 * q };
}

/**
 * Bolt `index` (0–3) at loop time `tl` — hidden until the wheel moves, then
 * streaks in from past the camera (staggered 0.12s per bolt), seats as the
 * wheel finishes fitting, and unbolts back off-screen on dismount.
 */
export function boltPose(
  tl: number,
  index: number,
): { z: number; visible: boolean; spinning: boolean } {
  const inS = 0.9 + index * 0.12;
  const outS = 5.2 + index * 0.08;
  let z = BOLT_FAR_Z;
  let spinning = false;
  if (tl < inS) {
    z = BOLT_FAR_Z;
  } else if (tl < outS) {
    const p = clamp01((tl - inS) / 1.9);
    z = BOLT_FAR_Z + (BOLT_SEAT_Z - BOLT_FAR_Z) * easeOut(p);
    spinning = p < 1;
  } else {
    const q = clamp01((tl - outS) / 0.7);
    z = BOLT_SEAT_Z + (BOLT_FAR_Z - BOLT_SEAT_Z) * q * q * q;
    spinning = q < 1;
  }
  return { z, visible: tl >= inS && tl < outS + 0.75, spinning };
}

/** Flash ring after the last bolt seats — 3.2–3.75 each loop. */
export function ringPulse(tl: number): { opacity: number; scale: number } {
  if (tl > 3.2 && tl < 3.75) {
    const u = clamp01((tl - 3.2) / 0.55);
    return { opacity: 0.85 * (1 - u), scale: 1 + 0.55 * u };
  }
  return { opacity: 0, scale: 1 };
}
