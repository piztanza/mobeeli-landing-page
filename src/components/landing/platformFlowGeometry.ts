/**
 * Platform-flow Sankey geometry (R20 band 2a) — PURE. No React, no DOM, no
 * side effects, so it unit-tests in isolation and renders identically on the
 * server and client (no hydration risk).
 *
 * The diagram argues CONVERGENCE: three inputs pinch to a narrower verified
 * core, then fan back out to three outputs. Every path here is DERIVED from the
 * node rectangles and the pinch ratio — never hand-authored — because authoring
 * absolute coordinates is how earlier drafts silently encoded expansion, the
 * exact opposite of the point. `computeFlowGeometry().invariant` exposes the
 * numbers the contract test in tests/platform-flow.test.ts pins.
 */

export const FLOW_VIEW = { w: 1280, h: 440 } as const;

// Layout constants (viewBox units). Locked to the node DOM via FLOW_LAYOUT below.
const NW = 140; // source / destination node width
const SX = 565; // spine (verified core) left edge
const SW = 150; // spine width
const SY = 80; // spine top
const SH = 280; // spine height
const PINCH = 0.55; // ribbons narrow to 55% of node mass at the core (compositional, not measured — see §11)
const GAP = 14; // dark space between stacked ribbons inside the spine
const ATTACH = 0.58; // ribbons attach to the centred 58% of each node's edge, not its full height
const BIAS = 0.66; // control points at 66% of each run: ribbons leave nodes flat, taper hard near the core

/** [top, bottom] of each party node box in viewBox units — identical on both sides. */
const NODE_BOXES: readonly (readonly [number, number])[] = [
  [20, 116],
  [152, 264],
  [300, 420],
];

const DEEP = "#1b5fd9";
const PRIM = "#2f7df6";
const LITE = "#5b9bf7";
// Outbound (verified) greens — FOUNDER RULING 2026-07-28 evening: the flow
// matches the R25 mockup fully, superseding the earlier keep-blue call. Same
// verified-green family the catalogue chips are allowed (the semantic is
// identical: what leaves the core is verified — see r15-catalog.test.tsx).
const OUT_DEEP = "#0b8f66";
const OUT_PRIM = "#10b981";
const OUT_LITE = "#34d399";
const META = [
  { color: DEEP, outColor: OUT_DEEP, delay: "0.05s" },
  { color: PRIM, outColor: OUT_PRIM, delay: "0.18s" },
  { color: LITE, outColor: OUT_LITE, delay: "0.31s" },
] as const;

export interface FlowRibbon {
  key: string;
  color: string;
  /** Colour after the core — the verified side of the ribbon's gradient. */
  outColor: string;
  delay: string;
  /** Closed ribbon outline, source edge → through the core → destination edge. */
  path: string;
  /** Open centreline the flow packets travel along (offset-path). */
  centerline: string;
}

export interface FlowGeometry {
  ribbons: FlowRibbon[];
  /** Node placement as % of the viewBox, so the DOM nodes track the scaling SVG. */
  nodes: { topPct: number; heightPct: number }[];
  spine: { leftPct: number; widthPct: number; topPct: number; heightPct: number };
  /** Numbers the contract test pins — the convergence invariant lives here. */
  invariant: {
    inflow: number;
    outflow: number;
    stackHeight: number;
    fitsSpine: boolean;
    gapsPositive: boolean;
  };
}

/** Fixed layout fractions the component reads so DOM nodes and geometry share one source of truth. */
export const FLOW_LAYOUT = {
  nodeWidthPct: (NW / FLOW_VIEW.w) * 100,
  srcLeftPct: 0,
  dstLeftPct: ((FLOW_VIEW.w - NW) / FLOW_VIEW.w) * 100,
} as const;

export function computeFlowGeometry(): FlowGeometry {
  const { w: W, h: H } = FLOW_VIEW;

  // Ribbons attach to a centred fraction of each node edge — thin ribbons with
  // dark space around them, per the reference. Tying ribbon mass to full node
  // height is what made them read as solid slabs.
  const attach = NODE_BOXES.map(([a, b]) => {
    const c = (a + b) / 2;
    const half = ((b - a) * ATTACH) / 2;
    return [c - half, c + half] as [number, number];
  });

  const heights = attach.map(([a, b]) => b - a);
  const sliceH = heights.map((h) => Math.round(h * PINCH));
  const stackH = sliceH.reduce((s, h) => s + h, 0) + GAP * (sliceH.length - 1);

  // Slices centred vertically inside the spine.
  let cursor = SY + (SH - stackH) / 2;
  const slices = sliceH.map((h) => {
    const s: [number, number] = [cursor, cursor + h];
    cursor += h + GAP;
    return s;
  });

  const X0 = NW;
  const X1 = SX;
  const X2 = SX + SW;
  const X3 = W - NW;
  const m1 = X0 + (X1 - X0) * BIAS;
  const m2 = X3 - (X3 - X2) * BIAS;

  // One continuous ribbon per party: source edge → straight through the core →
  // destination edge. A single shape (not two halves) keeps flow passing UNDER
  // the glass core, which is what makes the core read as glass.
  const thru = (n: [number, number], s: [number, number]) =>
    `M${X0},${n[0]} C${m1},${n[0]} ${m1},${s[0]} ${X1},${s[0]} L${X2},${s[0]} ` +
    `C${m2},${s[0]} ${m2},${n[0]} ${X3},${n[0]} L${X3},${n[1]} ` +
    `C${m2},${n[1]} ${m2},${s[1]} ${X2},${s[1]} L${X1},${s[1]} ` +
    `C${m1},${s[1]} ${m1},${n[1]} ${X0},${n[1]} Z`;

  const thruLine = (n: [number, number], s: [number, number]) => {
    const cn = (n[0] + n[1]) / 2;
    const cs = (s[0] + s[1]) / 2;
    return `M${X0},${cn} C${m1},${cn} ${m1},${cs} ${X1},${cs} L${X2},${cs} C${m2},${cs} ${m2},${cn} ${X3},${cn}`;
  };

  const ribbons: FlowRibbon[] = attach.map((n, i) => ({
    key: `rib-${i}`,
    color: META[i].color,
    outColor: META[i].outColor,
    delay: META[i].delay,
    path: thru(n, slices[i]),
    centerline: thruLine(n, slices[i]),
  }));

  const inflow = heights.reduce((s, h) => s + h, 0);
  const outflow = sliceH.reduce((s, h) => s + h, 0);

  return {
    ribbons,
    nodes: NODE_BOXES.map(([a, b]) => ({ topPct: (a / H) * 100, heightPct: ((b - a) / H) * 100 })),
    spine: {
      leftPct: (SX / W) * 100,
      widthPct: (SW / W) * 100,
      topPct: (SY / H) * 100,
      heightPct: (SH / H) * 100,
    },
    invariant: {
      inflow,
      outflow,
      stackHeight: stackH,
      fitsSpine: stackH <= SH,
      gapsPositive: GAP > 0,
    },
  };
}

/** Computed once at module load — geometry is fully static. */
export const FLOW = computeFlowGeometry();
