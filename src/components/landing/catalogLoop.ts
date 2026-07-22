/*
 * F-005 — AI catalog showcase loop: timing + geometry contract, ported 1:1
 * from the approved design's setupScatter() (Mobeeli Landing.dc.html).
 * Everything here is pure so the phase schedule and orbit math are unit
 * testable; AiCatalogCard owns the DOM side (refs, transitions, rAF).
 *
 * Loop phases (one cycle):
 *   pop-in   sprites spring in one-by-one, name chips follow each sprite
 *   orbit    chips fade, sprites glide onto a circle, then a rAF pass
 *            shrinks the orbit (r0 → r1) while each sprite self-spins
 *   bloom    sprites bloom back out to their grid slots with a full 360°
 *   assemble centered "✓ One catalog · 120M+ mappings" pill + AI chip flip
 *   fade     everything fades down and the cycle restarts
 */

/** Pop-in: first sprite starts at 380ms, one sprite every 560ms after. */
export const POP_START_MS = 380;
export const POP_STAGGER_MS = 560;
export const POP_DUR_MS = 750;
/** Overshooting spring ease for the pop-in (design's cubic-bezier(.2,1.4,.35,1)). */
export const POP_EASE = "cubic-bezier(.2,1.4,.35,1)";
/** Default glide ease used everywhere else. */
export const GLIDE_EASE = "cubic-bezier(.22,.75,.2,1)";
/** Each sprite's name chip appears 230ms after its sprite starts popping in. */
export const NAME_CHIP_DELAY_MS = 230;
/** How long the last name chip lingers before all chips fade together. */
export const NAME_LINGER_MS = 450;
/** Gap between the chips fading and the glide onto the orbit. */
export const NAME_FADE_TO_ORBIT_MS = 250;

/** Glide onto the orbit circle: 750ms, 50ms stagger per sprite. */
export const ORBIT_GLIDE_DUR_MS = 750;
export const ORBIT_GLIDE_STAGGER_MS = 50;
/** The rAF shrink-and-spin pass starts 880ms after the glide begins… */
export const ORBIT_SPIN_START_MS = 880;
/** …and runs ~1.3s, easing the radius from r0 to r1. */
export const ORBIT_SPIN_DUR_MS = 1300;
/** Orbit radii as fractions of the stage's smaller dimension. */
export const ORBIT_R0_FACTOR = 0.36;
export const ORBIT_R1_FACTOR = 0.12;
/** Radians the whole formation sweeps across the shrink pass. */
export const ORBIT_SWEEP_RAD = 3.6;
/** Self-spin across the shrink pass: 330° plus 12° per sprite index. */
export const SELF_SPIN_DEG = 330;
export const SELF_SPIN_STAGGER_DEG = 12;

/** Bloom back to the grid slots (rotate 360°): starts 2230ms after the glide. */
export const BLOOM_AT_MS = 2230;
export const BLOOM_DUR_MS = 850;
export const BLOOM_STAGGER_MS = 60;
/** Assemble: pill fades in + AI chip flips to "assembled ✓" 3150ms after the glide. */
export const ASSEMBLE_AT_MS = 3150;
/** Fade-down starts 5650ms after the glide; restart 850ms after that. */
export const FADE_AT_MS = 5650;
export const FADE_DUR_MS = 480;
export const FADE_STAGGER_MS = 40;
export const RESTART_AFTER_FADE_MS = 850;

/**
 * Scattered entry offsets per design grid slot: [dx px, dy px, tilt deg].
 * Slot order matches the design stage: pad, filter, plug, disc, shock, air.
 * (The pad slot's sprite asset is still unsupplied — the offsets stay so the
 * sixth sprite is a one-line add in AiCatalogCard when the asset lands.)
 */
export const ENTER_OFFSETS: readonly (readonly [number, number, number])[] = [
  [-70, -20, -14],
  [60, -60, 10],
  [90, -20, 18],
  [-50, 40, -16],
  [40, 70, -8],
  [90, 50, 14],
];

/** Absolute phase times (ms from cycle start) for a loop of `count` sprites. */
export interface LoopTimeline {
  /** When sprite `i` starts its pop-in. */
  popStart: (i: number) => number;
  /** All name chips fade out together. */
  namesFadeAt: number;
  /** Sprites start gliding onto the orbit circle (design's tC). */
  orbitGlideAt: number;
  /** The rAF shrink-and-spin pass starts. */
  orbitSpinAt: number;
  /** Sprites bloom back out to their grid slots. */
  bloomAt: number;
  /** Pill fades in and the AI chip flips to "assembled ✓". */
  assembleAt: number;
  /** Everything starts fading down. */
  fadeAt: number;
  /** The next cycle begins. */
  restartAt: number;
}

export function buildTimeline(count: number): LoopTimeline {
  const namesFadeAt = POP_START_MS + count * POP_STAGGER_MS + NAME_LINGER_MS;
  const orbitGlideAt = namesFadeAt + NAME_FADE_TO_ORBIT_MS;
  return {
    popStart: (i) => POP_START_MS + i * POP_STAGGER_MS,
    namesFadeAt,
    orbitGlideAt,
    orbitSpinAt: orbitGlideAt + ORBIT_SPIN_START_MS,
    bloomAt: orbitGlideAt + BLOOM_AT_MS,
    assembleAt: orbitGlideAt + ASSEMBLE_AT_MS,
    fadeAt: orbitGlideAt + FADE_AT_MS,
    restartAt: orbitGlideAt + FADE_AT_MS + RESTART_AFTER_FADE_MS,
  };
}

/** Stage geometry snapshot taken right before the orbit phase. */
export interface OrbitGeometry {
  /** Stage center. */
  cx: number;
  cy: number;
  /** Start/end orbit radii (r0 shrinking to r1 across the spin pass). */
  r0: number;
  r1: number;
  /** Each sprite's at-rest center within the stage. */
  hx: number[];
  hy: number[];
}

export function orbitRadii(stageWidth: number, stageHeight: number): { r0: number; r1: number } {
  const m = Math.min(stageWidth, stageHeight);
  return { r0: m * ORBIT_R0_FACTOR, r1: m * ORBIT_R1_FACTOR };
}

/** Design's ease for the orbit shrink (quadratic in-out). */
export function orbitEase(prog: number): number {
  return prog < 0.5 ? 2 * prog * prog : 1 - Math.pow(-2 * prog + 2, 2) / 2;
}

/**
 * Sprite position along the orbit at `prog` ∈ [0, 1]. Sprites sit evenly
 * spaced on the circle (the design's i·π/3 for its six slots), the whole
 * formation sweeps ORBIT_SWEEP_RAD while the radius eases r0 → r1, and each
 * sprite self-spins 330° + 12°·i. x/y are translate() deltas from the
 * sprite's grid slot.
 */
export function orbitPos(
  i: number,
  count: number,
  prog: number,
  geo: OrbitGeometry,
): { x: number; y: number; spin: number } {
  const th = (i * 2 * Math.PI) / count + prog * ORBIT_SWEEP_RAD;
  const r = geo.r0 + (geo.r1 - geo.r0) * orbitEase(prog);
  return {
    x: geo.cx + r * Math.cos(th) - geo.hx[i],
    y: geo.cy + r * Math.sin(th) - geo.hy[i],
    spin: prog * SELF_SPIN_DEG + i * SELF_SPIN_STAGGER_DEG,
  };
}

/** translate/rotate(/scale) shorthand matching the design's tfOf(). */
export function transformOf(
  offset: readonly [number, number, number],
  scale?: number,
): string {
  const base = `translate(${offset[0]}px,${offset[1]}px) rotate(${offset[2]}deg)`;
  return scale ? `${base} scale(${scale})` : base;
}

/**
 * Timer bag for one animation cycle: every scheduled step registers here so
 * stop/unmount can cancel the whole in-flight cycle at once.
 */
export interface LoopScheduler {
  at: (ms: number, fn: () => void) => void;
  clear: () => void;
}

export function createLoopScheduler(): LoopScheduler {
  const timers: ReturnType<typeof setTimeout>[] = [];
  return {
    at(ms, fn) {
      timers.push(setTimeout(fn, ms));
    },
    clear() {
      for (const timer of timers) clearTimeout(timer);
      timers.length = 0;
    },
  };
}
