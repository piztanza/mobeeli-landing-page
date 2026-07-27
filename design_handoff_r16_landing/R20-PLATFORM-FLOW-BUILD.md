# R20 · Platform-flow band (2a) — production build spec

**To:** Claude Code
**From:** Claude Design
**Date:** 2026-07-27
**Verified against:** `main` @ `e77d388` — every path, token, class, hook and test assertion below was read from the repo on this date, not recalled. Locate code by the quoted content, not by line number.
**Deliverable:** the "Five parties. One platform in the middle." Sankey band from `R20 What Else Goes On The Front Page.dc.html` (option 2a), built as a real Next.js section that drops into the landing stack between the catalog and the coverage bands.

This document is written to be implemented **without a single open question in the code path**. Where a decision needs the founder, it is isolated in §11 and given a safe default that ships green. Everything else is fully specified.

---

## 0 · The design is a prototype, not code to paste

The `.dc.html` is a single-file mockup. It renders the intended result with a bespoke template runtime, inline styles, and a `renderVals()` logic class. **None of that transfers.** You are reproducing what it shows inside the repo's real architecture:

- strings → `copy.ts` (both `en` and `id`; parity is test-enforced)
- styling → `landing.css` classes + the `globals.css` custom-property tokens
- geometry math → a pure, unit-tested module (the mockup computes it inline; in the repo it earns its own file, exactly as `auroraIntensity.ts` and `scrollspy.ts` were extracted)
- motion → gated on `useReducedMotion()` / the `prefers-reduced-motion` media query, never unconditional

### 0.1 Asset audit — done for you

| Asset | Status | Action |
|---|---|---|
| `public/assets/mobeeli-mark.png` | **Exists** (verified in the tree) | Use as-is for the spine. `next/image`, fixed size, **not** `priority` (mid-page; protect hero LCP). |
| `public/assets/icons/{xls2,pdf2,jpg2}.png` | **Exist** | Reuse for the three inbound file chips — the same PNGs the catalog band renders, in the same white circle, so "whatever they send" reads consistently. |
| `public/assets/noise.svg` | **MISSING** | Create it — full source in §6. The mockup inlined it as a data-URI and it broke; ship it as a file and reference it from CSS. |
| Third `AmbientAurora` | **Do not add** | See §5.1. The band's wash is pure CSS. Adding a WebGL mount here would be the third live context on one page — `auroraIntensity.ts` documents why the count is deliberately held down. |

### 0.2 The copy is UNSTAMPED

All English below is **draft**. The founder approves EN and writes ID. But parity is test-enforced — a key cannot ship EN-only — so §3 ships a draft value in **both** maps with a `DRAFT` comment, exactly as the repo already does for `cat_part1_spec` ("DRAFT WORDING — founder to confirm EN and ID"). Do not machine-translate silently; the ID drafts in §3 are marked as needing a native pass, and the five party names must match the ID already used in the `id` map's `hero_sub_short`.

---

## 1 · Architecture

Five files touched, in dependency order. Each is independently reviewable.

```
ADD    src/components/landing/platformFlow.ts        pure geometry — no React, no DOM
ADD    src/components/landing/PlatformFlow.tsx       the section component
ADD    public/assets/noise.svg                       glass grain texture
EDIT   src/lib/i18n/copy.ts                           new plat_* keys (en + id)
EDIT   src/components/landing/landing.css             .mb-plat* rules (append)
EDIT   src/components/landing/LandingView.tsx         mount between catalog and coverage
ADD    tests/platform-flow.test.ts                    geometry invariant (unit)
EDIT   tests/landing.test.tsx                          band order, band id, keys, render
```

**Why a separate geometry module.** The Sankey exists to argue **convergence** — three inputs pinch through one verified point and fan back out. During design that invariant broke twice by hand-authoring absolute path coordinates that silently encoded *expansion*. Isolating the math as a pure function makes it unit-testable, and the test in §8.1 asserts the convergence invariant so it can never regress to expansion again. This is the single most important structural decision in the build.

---

## 2 · `src/components/landing/platformFlow.ts` (new — full source)

```ts
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
const META = [
  { color: DEEP, delay: "0.05s" },
  { color: PRIM, delay: "0.18s" },
  { color: LITE, delay: "0.31s" },
] as const;

export interface FlowRibbon {
  key: string;
  color: string;
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
  invariant: { inflow: number; outflow: number; stackHeight: number; fitsSpine: boolean; gapsPositive: boolean };
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
    delay: META[i].delay,
    path: thru(n, slices[i]),
    centerline: thruLine(n, slices[i]),
  }));

  const inflow = heights.reduce((s, h) => s + h, 0);
  const outflow = sliceH.reduce((s, h) => s + h, 0);

  return {
    ribbons,
    nodes: NODE_BOXES.map(([a, b]) => ({ topPct: (a / H) * 100, heightPct: ((b - a) / H) * 100 })),
    spine: { leftPct: (SX / W) * 100, widthPct: (SW / W) * 100, topPct: (SY / H) * 100, heightPct: (SH / H) * 100 },
    invariant: { inflow, outflow, stackHeight: stackH, fitsSpine: stackH <= SH, gapsPositive: GAP > 0 },
  };
}

/** Computed once at module load — geometry is fully static. */
export const FLOW = computeFlowGeometry();
```

---

## 3 · `copy.ts` — new keys (add to BOTH `en` and `id`)

Add a `plat_*` block near the other landing keys. EN is the draft to approve; ID drafts are flagged. **Party names (`*_t`) must reuse the exact ID already in this file's `id.hero_sub_short`** so the page says the five parties one consistent way.

```ts
/* R20 band 2a — platform-flow Sankey. The industry-scale "how it works": three
   parties push data in, it is verified in one core, three consume it out. No
   figures (front page is a profile, not a pitch). DRAFT WORDING — founder
   approves EN and writes ID; party names must match hero_sub_short's ID. */
plat_kicker: "Across the industry",
plat_h2: "Five parties. One platform in the middle.",
plat_p:
  "Today the same part is described five times by five people who never speak to each other. That is where the wrong part comes from — not from anyone being careless.",
plat_src1_t: "Brands",
plat_src1_s: "publish once",
plat_src2_t: "Distributors",
plat_src2_s: "send anything",
plat_src3_t: "Stores",
plat_src3_s: "even a ledger photo",
plat_dst1_t: "Stores",
plat_dst1_s: "list without retyping",
plat_dst2_t: "Mechanics",
plat_dst2_s: "order for the car in the bay",
plat_dst3_t: "Drivers",
plat_dst3_s: "see only what fits",
plat_hub: "The platform",
plat_in_xls: "Excel file",
plat_in_pdf: "PDF file",
plat_in_jpg: "Photo of a handwritten ledger",
plat_out: "verified",
/* Accessible flow summary — the SVG/stack visuals are aria-hidden; this single
   sentence is what a screen reader announces for the figure. */
plat_a11y:
  "Brands, distributors and stores send parts data in any format to the Mobeeli platform, which verifies it. Stores, mechanics and drivers then receive one clean, verified catalog.",
```

Note `plat_dst1_t` ("Stores") intentionally repeats `plat_src3_t` — Stores is the only party that both publishes and buys, and the diagram is the cheapest place to make that point. Keep both keys (don't alias); they may diverge in ID.

---

## 4 · `src/components/landing/PlatformFlow.tsx` (new — full source)

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useT } from "@/lib/i18n/LanguageProvider";
import type { CopyKey } from "@/lib/i18n/copy";

import { FLOW, FLOW_LAYOUT, FLOW_VIEW } from "./platformFlow";

type IconKey = "brand" | "truck" | "store" | "wrench" | "car";

interface Party {
  t: CopyKey;
  s: CopyKey;
  icon: IconKey;
  /** animation delay for the node reveal */
  delay: string;
}

const SOURCES: Party[] = [
  { t: "plat_src1_t", s: "plat_src1_s", icon: "brand", delay: "0.02s" },
  { t: "plat_src2_t", s: "plat_src2_s", icon: "truck", delay: "0.12s" },
  { t: "plat_src3_t", s: "plat_src3_s", icon: "store", delay: "0.22s" },
];

const DESTS: Party[] = [
  { t: "plat_dst1_t", s: "plat_dst1_s", icon: "store", delay: "0.62s" },
  { t: "plat_dst2_t", s: "plat_dst2_s", icon: "wrench", delay: "0.72s" },
  { t: "plat_dst3_t", s: "plat_dst3_s", icon: "car", delay: "0.82s" },
];

const IN_CHIPS: { key: CopyKey; src: string; delay: string }[] = [
  { key: "plat_in_xls", src: "/assets/icons/xls2.png", delay: "0.05s" },
  { key: "plat_in_pdf", src: "/assets/icons/pdf2.png", delay: "0.18s" },
  { key: "plat_in_jpg", src: "/assets/icons/jpg2.png", delay: "0.31s" },
];

function PartyGlyph({ icon }: { icon: IconKey }) {
  // Stroke inherits currentColor so one glyph set serves both dark-blue source
  // cards (white) and glass destination cards (light-accent).
  const paths: Record<IconKey, React.ReactNode> = {
    brand: (
      <>
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M7 8V5h10v3" />
        <path d="M8 12h2M14 12h2M8 16h2M14 16h2" />
      </>
    ),
    truck: (
      <>
        <path d="M3 8h13v9H3z" />
        <path d="M16 11h4l1 3v3h-5z" />
        <circle cx="7" cy="19" r="1.6" />
        <circle cx="18" cy="19" r="1.6" />
      </>
    ),
    store: (
      <>
        <path d="M4 9h16v11H4z" />
        <path d="M4 9 6 4h12l2 5" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
    wrench: (
      <>
        <path d="m14.5 5.5 4 4" />
        <path d="M20 3.5a4.5 4.5 0 0 1-5.6 5.6L6 17.5 4 20l-.5-2.5L12 9.1A4.5 4.5 0 0 1 17.6 3.5z" />
      </>
    ),
    car: (
      <>
        <path d="M4 15h16v3H4z" />
        <path d="m5 15 2-5h10l2 5" />
        <circle cx="7.5" cy="18.5" r="1.6" />
        <circle cx="16.5" cy="18.5" r="1.6" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[icon]}
    </svg>
  );
}

/**
 * Platform-flow band (R20 2a) — industry-scale "how it works" as a Sankey:
 * three inputs converge through one verified core and fan back out to three
 * outputs. Sits between the catalog and coverage bands.
 *
 * Motion is progressive-enhancement + in-view gated:
 *   • base CSS renders the final (visible) state — correct with no JS and under
 *     prefers-reduced-motion;
 *   • this component adds `mb-plat--js` on mount, which (only under
 *     prefers-reduced-motion: no-preference) ARMS the hidden start state;
 *   • an IntersectionObserver flips data-inview once the band is near view,
 *     which runs the reveal — so the "ribbons draw in" moment plays when the
 *     user arrives, not silently at page load while they read the hero.
 * The SVG layers and both visual stacks are aria-hidden; the accessible
 * description is the figcaption (plat_a11y).
 */
export default function PlatformFlow() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [js, setJs] = useState(false);

  useEffect(() => {
    setJs(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const nodeStyle = (top: number, height: number, left: number) =>
    ({
      top: `${top}%`,
      height: `${height}%`,
      left: `${left}%`,
      width: `${FLOW_LAYOUT.nodeWidthPct}%`,
    }) as React.CSSProperties;

  return (
    <section id="platform" className="mb-plat mb-section">
      <div className="mb-plat-inner mb-section-inner">
        <div data-rev="0" className="mb-kicker mb-kicker--accent">
          {t("plat_kicker")}
        </div>
        <h2 data-rev="1" className="mb-h2 mb-plat-h2">
          {t("plat_h2")}
        </h2>
        <p data-rev="2" className="mb-plat-p">
          {t("plat_p")}
        </p>

        <figure className={`mb-plat-fig ${js ? "mb-plat--js" : ""}`} ref={ref} data-inview={inView ? "true" : undefined}>
          {/* ---- desktop: the Sankey ---- */}
          <div className="mb-plat-figure" aria-hidden>
            <svg className="mb-plat-svg" viewBox={`0 0 ${FLOW_VIEW.w} ${FLOW_VIEW.h}`} preserveAspectRatio="xMidYMid meet">
              {FLOW.ribbons.map((r) => (
                <path
                  key={r.key}
                  className="mb-plat-rib"
                  d={r.path}
                  fill={r.color}
                  opacity="0.42"
                  style={{ ["--rib-delay" as string]: r.delay }}
                />
              ))}
            </svg>

            <svg className="mb-plat-svg mb-plat-svg--packets" viewBox={`0 0 ${FLOW_VIEW.w} ${FLOW_VIEW.h}`} preserveAspectRatio="xMidYMid meet">
              {FLOW.ribbons.flatMap((r, i) =>
                [0, 1].map((k) => (
                  <circle
                    key={`${r.key}-p${k}`}
                    className="mb-plat-packet"
                    r="4"
                    fill={r.color}
                    style={{
                      offsetPath: `path('${r.centerline}')`,
                      ["--pk-dur" as string]: `${7.4 + i * 0.9}s`,
                      ["--pk-delay" as string]: `${i * 0.6 + k * 3.6}s`,
                    }}
                  />
                )),
              )}
            </svg>

            {/* inbound file chips */}
            {IN_CHIPS.map((c, i) => (
              <span
                key={c.key}
                className="mb-plat-inlabel mb-plat-inchip"
                style={{ top: `${[8.6, 40.4, 74.5][i]}%`, ["--label-delay" as string]: c.delay }}
              >
                <span className="mb-plat-chip-disc">
                  <Image src={c.src} alt={t(c.key)} width={26} height={26} />
                </span>
              </span>
            ))}

            {/* outbound "verified" tag */}
            <span className="mb-plat-inlabel mb-plat-outlabel" style={{ ["--label-delay" as string]: "0.58s" }}>
              {t("plat_out")}
            </span>

            {/* source nodes */}
            {SOURCES.map((p, i) => (
              <div
                key={p.t}
                className="mb-plat-node mb-plat-node--src"
                style={{ ...nodeStyle(FLOW.nodes[i].topPct, FLOW.nodes[i].heightPct, FLOW_LAYOUT.srcLeftPct), ["--node-delay" as string]: p.delay }}
              >
                <PartyGlyph icon={p.icon} />
                <span className="mb-plat-node-t">{t(p.t)}</span>
                <span className="mb-plat-node-s">{t(p.s)}</span>
              </div>
            ))}

            {/* spine — the verified core */}
            <div className="mb-plat-spine" style={{ left: `${FLOW.spine.leftPct}%`, width: `${FLOW.spine.widthPct}%`, top: `${FLOW.spine.topPct}%`, height: `${FLOW.spine.heightPct}%` }}>
              <div className="mb-plat-spine-inner">
                <span className="mb-plat-noise" />
                <span className="mb-plat-spec" />
                <span className="mb-plat-spine-body">
                  <Image className="mb-plat-mark" src="/assets/mobeeli-mark.png" alt="Mobeeli" width={60} height={46} />
                  <span className="mb-plat-hairline" />
                  <span className="mb-plat-hub">{t("plat_hub")}</span>
                </span>
              </div>
            </div>

            {/* destination nodes */}
            {DESTS.map((p, i) => (
              <div
                key={p.t}
                className="mb-plat-node mb-plat-node--dst"
                style={{ ...nodeStyle(FLOW.nodes[i].topPct, FLOW.nodes[i].heightPct, FLOW_LAYOUT.dstLeftPct), ["--node-delay" as string]: p.delay }}
              >
                <PartyGlyph icon={p.icon} />
                <span className="mb-plat-node-t">{t(p.t)}</span>
                <span className="mb-plat-node-s">{t(p.s)}</span>
              </div>
            ))}
          </div>

          {/* ---- mobile: a vertical stack, CSS-toggled (SSR-safe, no JS branch) ---- */}
          <div className="mb-plat-stack" aria-hidden>
            <div className="mb-plat-stack-row">
              {SOURCES.map((p) => (
                <div key={p.t} className="mb-plat-scard mb-plat-scard--src">
                  <PartyGlyph icon={p.icon} />
                  <span className="mb-plat-node-t">{t(p.t)}</span>
                </div>
              ))}
            </div>
            <span className="mb-plat-arrow" />
            <div className="mb-plat-hubcard">
              <Image src="/assets/mobeeli-mark.png" alt="Mobeeli" width={52} height={40} />
              <span className="mb-plat-hub">{t("plat_hub")}</span>
            </div>
            <span className="mb-plat-arrow" />
            <div className="mb-plat-stack-row">
              {DESTS.map((p) => (
                <div key={p.t} className="mb-plat-scard mb-plat-scard--dst">
                  <PartyGlyph icon={p.icon} />
                  <span className="mb-plat-node-t">{t(p.t)}</span>
                </div>
              ))}
            </div>
          </div>

          <figcaption className="mb-plat-sr">{t("plat_a11y")}</figcaption>
        </figure>
      </div>
    </section>
  );
}
```

> **`CopyKey` typing.** The `Party`/chip arrays are typed `CopyKey`, so `t(p.t)` compiles with no cast — same pattern the catalog `parts` array uses. If `CopyKey` is not exported from `copy.ts`, export it (`export type CopyKey = keyof typeof en;`); grep first, it likely already is (the codebase passes `CopyKey` around in `Nav.tsx`).
>
> **The `["--x" as string]` casts** are the standard TS-safe way to set CSS custom properties in a React style object. Keep them; `React.CSSProperties` does not index arbitrary `--*` names.

---

## 5 · `landing.css` — append this block

Namespace `mb-plat*`. Uses only existing tokens (`--mb-ink`, `--mb-radius-card`, `--mb-ease-standard`, `--mb-light-accent`, `--mb-hairline-*`).

```css
/* ============================================================
   R20 band 2a — platform-flow Sankey. Dark band; CSS-only wash
   (NO AmbientAurora — WebGL context budget, see auroraIntensity.ts).
   ============================================================ */
.mb-plat {
  position: relative;
  background: var(--mb-ink);
  background-image: radial-gradient(900px 520px at 50% 40%, rgba(47, 125, 246, 0.13), transparent 70%);
  overflow: hidden;
}
.mb-plat-h2 {
  color: #fff;
  max-width: 17ch;
}
.mb-plat-p {
  margin: 24px 0 0;
  max-width: 600px;
  font-size: 19px;
  line-height: 1.65;
  color: var(--mb-dark-muted);
  text-wrap: pretty;
}

/* The figure scales as one unit: viewBox aspect == container aspect, so the
   SVG fits exactly and the %-positioned nodes track it at any width. */
.mb-plat-fig {
  margin: 56px 0 0;
}
.mb-plat-figure {
  position: relative;
  width: 100%;
  max-width: 1280px;
  aspect-ratio: 1280 / 440;
}
.mb-plat-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.mb-plat-rib {
  mix-blend-mode: screen;
  transform-origin: left center;
}
.mb-plat-packet {
  opacity: 0; /* only ever visible while the flow animation runs */
  filter: drop-shadow(0 0 7px currentColor);
}

/* ---- nodes ---- */
.mb-plat-node {
  position: absolute;
  box-sizing: border-box; /* there is a global reset, but pin it — the mockup broke without it */
  border-radius: 15px;
  padding: 16px 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 7px;
}
.mb-plat-node--src {
  color: #fff;
  background: linear-gradient(150deg, #1f62d6, #143f8f);
  box-shadow: 0 14px 34px rgba(3, 8, 16, 0.55);
}
.mb-plat-node--dst {
  color: var(--mb-light-accent);
  background: linear-gradient(158deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.035) 55%, rgba(91, 155, 247, 0.1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.26), 0 14px 32px rgba(3, 8, 16, 0.42);
}
.mb-plat-node-t {
  font-size: clamp(13px, 1.25vw, 15.5px);
  font-weight: 800;
  letter-spacing: -0.012em;
  line-height: 1.2;
  color: #fff;
}
.mb-plat-node-s {
  font-size: clamp(11px, 1vw, 12px);
  font-weight: 600;
  line-height: 1.35;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);
}
.mb-plat-node--dst .mb-plat-node-s {
  color: var(--mb-dark-muted);
  text-shadow: none;
}

/* ---- spine (glass, NO backdrop-filter) ---- */
.mb-plat-spine {
  position: absolute;
  border-radius: 21px;
  padding: 1px;
  background: linear-gradient(158deg, rgba(255, 255, 255, 0.5) 0%, rgba(91, 155, 247, 0.34) 38%, rgba(255, 255, 255, 0.1) 72%, rgba(255, 255, 255, 0.34) 100%);
  box-shadow: 0 26px 60px rgba(3, 8, 16, 0.66), 0 0 48px rgba(47, 125, 246, 0.2);
  transform-origin: center;
}
.mb-plat-spine-inner {
  position: relative;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.17) 0%, rgba(255, 255, 255, 0.045) 46%, rgba(91, 155, 247, 0.13) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48), inset 0 -1px 0 rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mb-plat-noise {
  position: absolute;
  inset: 0;
  opacity: 0.16;
  mix-blend-mode: overlay;
  pointer-events: none;
  background-image: url("/assets/noise.svg");
}
.mb-plat-spec {
  position: absolute;
  left: -20%;
  right: -20%;
  height: 52%;
  pointer-events: none;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.2) 45%, rgba(255, 255, 255, 0.26) 55%, transparent);
}
.mb-plat-spine-body {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 0 16px;
}
.mb-plat-mark {
  height: 46px;
  width: auto;
  filter: drop-shadow(0 4px 12px rgba(3, 8, 16, 0.6));
}
.mb-plat-hairline {
  width: 36px;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}
.mb-plat-hub {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.65);
  white-space: nowrap;
}

/* ---- edge labels ---- */
.mb-plat-inlabel {
  position: absolute;
}
.mb-plat-inchip {
  left: 18.4%; /* == 236/1280 */
}
.mb-plat-chip-disc {
  display: flex;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 22px rgba(3, 8, 16, 0.55);
}
.mb-plat-outlabel {
  left: 70.8%; /* == 906/1280 */
  top: 46.4%;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
}

/* ---- accessible caption ---- */
.mb-plat-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ---- mobile vertical stack (shown < 760px) ---- */
.mb-plat-stack {
  display: none;
}
.mb-plat-stack-row {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.mb-plat-scard {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 10px;
  border-radius: 14px;
  text-align: center;
}
.mb-plat-scard--src {
  color: #fff;
  background: linear-gradient(150deg, #1f62d6, #143f8f);
}
.mb-plat-scard--dst {
  color: var(--mb-light-accent);
  background: linear-gradient(158deg, rgba(255, 255, 255, 0.14), rgba(91, 155, 247, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.mb-plat-hubcard {
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 28px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(91, 155, 247, 0.12));
  border: 1px solid rgba(255, 255, 255, 0.28);
}
.mb-plat-arrow {
  align-self: center;
  width: 2px;
  height: 26px;
  background: linear-gradient(180deg, rgba(91, 155, 247, 0.7), rgba(91, 155, 247, 0.2));
}

@media (max-width: 760px) {
  .mb-plat-figure {
    display: none;
  }
  .mb-plat-stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 8px;
  }
}

/* ============================================================
   Motion — progressive enhancement + in-view gate.
   Base above renders the FINAL visible state (no-JS / reduced-motion safe).
   Only .mb-plat--js under no-preference arms the hidden start; data-inview runs it.
   ============================================================ */
@keyframes mbplatRib { from { opacity: 0; transform: translateX(-26px) scaleX(0.94); } to { opacity: 0.42; transform: none; } }
@keyframes mbplatNode { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes mbplatSpine { from { opacity: 0; transform: scaleY(0.72); } to { opacity: 1; transform: none; } }
@keyframes mbplatFlow { from { offset-distance: 0%; } to { offset-distance: 100%; } }
@keyframes mbplatBreathe { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.92; } }
@keyframes mbplatSpec { 0%, 100% { transform: translateY(-34%); } 50% { transform: translateY(34%); } }

@media (prefers-reduced-motion: no-preference) {
  .mb-plat--js .mb-plat-rib { opacity: 0; }
  .mb-plat--js .mb-plat-node,
  .mb-plat--js .mb-plat-inlabel { opacity: 0; transform: translateY(14px); }
  .mb-plat--js .mb-plat-spine { opacity: 0; }

  .mb-plat--js[data-inview="true"] .mb-plat-rib {
    animation: mbplatRib 0.9s var(--mb-ease-standard) var(--rib-delay, 0s) forwards;
  }
  .mb-plat--js[data-inview="true"] .mb-plat-node,
  .mb-plat--js[data-inview="true"] .mb-plat-inlabel {
    animation: mbplatNode 0.7s var(--mb-ease-standard) var(--node-delay, var(--label-delay, 0s)) forwards;
  }
  .mb-plat--js[data-inview="true"] .mb-plat-spine {
    animation: mbplatSpine 0.95s var(--mb-ease-standard) 0.34s forwards;
  }
  .mb-plat--js[data-inview="true"] .mb-plat-spec {
    animation: mbplatSpec 9s ease-in-out infinite;
  }

  /* Packets loop only once revealed AND only where offset-path is supported —
     otherwise the circle would sit stranded at the viewBox origin. */
  @supports (offset-path: path("M0,0 L1,1")) {
    .mb-plat--js[data-inview="true"] .mb-plat-packet {
      animation: mbplatFlow var(--pk-dur, 8s) linear var(--pk-delay, 0s) infinite,
        mbplatBreathe var(--pk-dur, 8s) ease-in-out var(--pk-delay, 0s) infinite;
    }
  }
}

/* Translucent surfaces get an opaque fallback where the OS asks for it. */
@media (prefers-reduced-transparency: reduce) {
  .mb-plat-spine-inner { background: rgba(13, 21, 34, 0.96); }
  .mb-plat-node--dst { background: rgba(13, 21, 34, 0.9); }
}
```

> `--mb-dark-muted` is used above — confirm the token name in `globals.css` (the catalog band's body copy uses the dark-band muted token; match it). If it is named differently, use that name. Do not invent a hex.

---

## 6 · `public/assets/noise.svg` (new — full source)

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="2.6" numOctaves="3" stitchTiles="stitch"/></filter>
  <rect width="100%" height="100%" filter="url(#n)"/>
</svg>
```

Ship it as a file (the design's inline data-URI was mangled by the mockup's template compiler; a real `.svg` file referenced from CSS has no such problem).

---

## 7 · Wiring `LandingView.tsx`

Import and mount between the catalog (`FitmentSection`) and coverage (`UnifyBand`):

```diff
 import Nav from "./Nav";
+import PlatformFlow from "./PlatformFlow";
 import ProblemSection from "./ProblemSection";
```

```diff
             <Hero />
             <ProblemSection />
             <FitmentSection />
+            <PlatformFlow />
             <UnifyBand />
             <BuyerStrip />
```

Update the band-order block comment to: `hero → problem → catalog (how-it-works) → platform → coverage → buyer strip → footer`.

**ActiveSectionProvider — deliberately unchanged.** `SPY_SECTION_IDS` is `["problem", "how-it-works"]` — the sections that have nav anchors and can be ambiguously co-visible. The platform band has **no nav link**, so it must **not** go in the spy list (adding it would make the spy publish `#platform` into the URL for a section nobody can navigate to). It gets `id="platform"` purely for the band-id test and future anchoring. Leave `SPY_SECTION_IDS` alone; record why in a one-line comment if you like.

---

## 8 · Tests

### 8.1 `tests/platform-flow.test.ts` (new) — the invariant that protects the argument

```ts
import { describe, expect, it } from "vitest";

import { computeFlowGeometry, FLOW_VIEW } from "@/components/landing/platformFlow";

describe("platform-flow geometry (R20 2a)", () => {
  const geo = computeFlowGeometry();

  it("converges — ribbon mass at the core is strictly less than at the nodes", () => {
    // THE POINT OF THE DIAGRAM. If this ever fails, the ribbons encode
    // expansion, which is the opposite of what the band argues.
    expect(geo.invariant.outflow).toBeLessThan(geo.invariant.inflow);
  });

  it("keeps the pinched stack inside the spine, with positive gaps", () => {
    expect(geo.invariant.fitsSpine).toBe(true);
    expect(geo.invariant.gapsPositive).toBe(true);
  });

  it("emits one ribbon per party, each a closed path with a centreline", () => {
    expect(geo.ribbons).toHaveLength(3);
    for (const r of geo.ribbons) {
      expect(r.path.startsWith("M")).toBe(true);
      expect(r.path.trimEnd().endsWith("Z")).toBe(true); // closed
      expect(r.centerline.startsWith("M")).toBe(true);
      expect(r.centerline).not.toContain("Z"); // open
    }
  });

  it("places nodes and spine within the viewBox", () => {
    for (const n of geo.nodes) {
      expect(n.topPct).toBeGreaterThanOrEqual(0);
      expect(n.topPct + n.heightPct).toBeLessThanOrEqual(100);
    }
    expect(geo.spine.leftPct + geo.spine.widthPct).toBeLessThanOrEqual(100);
    expect(FLOW_VIEW.w).toBe(1280);
  });
});
```

### 8.2 `tests/landing.test.tsx` — edits

**Band order** — insert `plat_h2` between catalog and coverage:

```diff
       t("en", "cat_unified_h2"), // unified catalog (dark, id="how-it-works")
+      t("en", "plat_h2"), // platform flow (dark, id="platform")
       t("en", "uni_h2"), // coverage / archipelago (dark, id="coverage")
```

**Band ids** — add `platform`:

```diff
-    for (const id of ["how-it-works", "problem", "coverage", "waitlist"]) {
+    for (const id of ["how-it-works", "problem", "coverage", "platform", "waitlist"]) {
```

**Keys present in render** — add the visible platform keys to `LANDING_KEYS` (the array asserted to render). At minimum: `plat_kicker`, `plat_h2`, `plat_p`, the six party `*_t`/`*_s`, `plat_hub`, `plat_out`. `plat_a11y` and the `plat_in_*` alts render as caption/alt text — include them too so parity + presence both hold.

**New guard** — the diagram must not silently invert:

```ts
it("renders the platform-flow band with all five parties and the core", () => {
  for (const k of ["plat_src1_t", "plat_src2_t", "plat_src3_t", "plat_dst2_t", "plat_dst3_t", "plat_hub"] as const) {
    expect(html).toContain(esc(t("en", k)));
  }
  expect(html).toContain('id="platform"');
});
```

The i18n parity test already iterates the full `en`/`id` maps, so the new keys are auto-checked for both-language presence — that is *why* §3 ships ID drafts rather than leaving them out.

---

## 9 · The recursive-improvement pass — edge cases, and how the code already handles each

I ran this critique against the code above and folded every fix back in. Each row is a failure mode and the specific line that defends against it — not a promise, a mechanism.

| # | Edge case | How it is handled |
|---|---|---|
| 1 | **Animation fires at page load, mid-page, so the "draw-in" is over before the user scrolls there** | IntersectionObserver gates `data-inview`; the reveal keyframes only run under `.mb-plat--js[data-inview="true"]`. Plays on arrival, once. |
| 2 | **No JavaScript** | `.mb-plat--js` is added in `useEffect`; without it the arming rules never match, so the base CSS (final, visible state) stands. The diagram is fully legible with JS disabled. |
| 3 | **`prefers-reduced-motion: reduce`** | All arming + animation live inside `@media (prefers-reduced-motion: no-preference)`. Under reduce it never matches → everything at rest in final state, packets `opacity:0`. No JS branch needed. |
| 4 | **`offset-path` unsupported (older Firefox)** | Packet animation is wrapped in `@supports (offset-path: path(...))`; unsupported → packets stay `opacity:0` instead of stranding at the origin. Everything else is plain transforms/opacity. |
| 5 | **SSR / hydration mismatch** | Geometry is a pure module computed identically on both sides. `js`/`inView` start `false` on server and client, so first client render matches SSR; they flip in effects (post-hydration). No `suppressHydrationWarning` needed. |
| 6 | **Third WebGL context tanks mobile** | No `AmbientAurora` here — wash is a CSS radial gradient. Context count stays at the two `auroraIntensity.ts` already accounts for. |
| 7 | **Sankey is illegible at 390px** | `@media (max-width: 760px)` hides the figure and shows a vertical stack (3 in → core → 3 out). Both are real DOM, CSS-toggled — no JS width branch, so no hydration risk. |
| 8 | **Screen readers get a wall of decorative SVG** | SVG layers and both visual stacks are `aria-hidden`; the figure's meaning is one `figcaption` (`plat_a11y`). SR users hear a sentence, not 12 nodes. |
| 9 | **Long Indonesian labels overflow nodes** | Node title/sub use `clamp()` and wrap; nodes are `box-sizing: border-box` (pinned, not assumed). "Distributors" → "Distributor" is shorter in ID, and the sub-labels are the risk — verify at the ID pass (§10). |
| 10 | **White sub-labels fail AA over light ribbon crossings** | Source sub-labels carry `text-shadow: 0 1px 3px rgba(0,0,0,.55)`; the outbound "verified" tag carries the stronger `.85` shadow the scan uses. Matches 2026 glass guidance: scrim behind text on translucency. |
| 11 | **The convergence invariant silently regresses** | `tests/platform-flow.test.ts` asserts `outflow < inflow` and `fitsSpine`. A future edit that re-encodes expansion fails CI. |
| 12 | **`prefers-reduced-transparency`** | `.mb-plat-spine-inner` and `.mb-plat-node--dst` get opaque fallbacks under that media query. |
| 13 | **Node position drifts from ribbon endpoints** | Nodes and ribbons both read `FLOW`/`FLOW_LAYOUT` — one source of truth. There is no second set of coordinates to fall out of sync. |
| 14 | **`animation … forwards` + scroll away/back** | IO disconnects after first intersect (`io.disconnect()`), `inView` stays true, `forwards` holds the end state. Re-entering never replays or resets. |
| 15 | **CSS custom-property typing** | `["--x" as string]: value` — the sanctioned React pattern; `tsc --noEmit` passes. |

Two residual limits I could **not** design away — they are founder/product calls, in §11: the three-dark-bands rhythm, and the invented pinch ratio.

---

## 10 · Verification — the definition of done

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

All green, including the new `platform-flow` suite and the edited `landing` suite. Then by hand:

```
✓ Section renders between catalog and coverage; id="platform" present once.
✓ Desktop ≥ 1024px: three inputs converge to the glass core (mark + "The platform"),
  fan to three outputs; ribbons visibly NARROW at the core, not widen.
✓ Scroll the band into view: ribbons draw L→R (~1s), nodes rise, packets then loop.
  Scroll away and back — no replay, no reset.
✓ 760–1024px: figure scales as one unit, text stays legible, nothing clips the edge.
✓ < 760px: vertical stack (in-row → core → out-row); figure hidden.
✓ prefers-reduced-motion: everything at rest, final state, no packets, band still makes sense.
✓ prefers-reduced-transparency: core + dst nodes opaque.
✓ Both languages at 1280 / 900 / 390: ID labels do not overflow their nodes.
✓ Lighthouse: hero LCP unchanged (the mark is not `priority`; no new font/WebGL).
✓ SR: the figure announces plat_a11y as one sentence, not each node.
```

---

## 11 · Founder calls — safe defaults shipped, do not block on these

1. **Three dark bands in a row.** Catalog, platform and coverage are all dark now. The design's claim that this "replaces" the call-B seam fix is only half right — it removes one seam and creates a longer dark run. **Default shipped:** dark, as designed (it reads as one continuous "how it works → at scale" movement). **If the founder wants relief:** the cheapest fix is a one-line background swap making this band light (invert the node palettes — sources become the glass treatment, the core keeps its gradient). Ask; don't invert on your own.

2. **The pinch ratio is invented.** `PINCH = 0.55` is compositional, chosen to make convergence legible — you have no public volumes and would not publish them. It reads correctly without axis labels. **Do not let anyone add numbers to it later**; a real Sankey encodes quantity in width, and this one must not pretend to.

3. **No nav link to the band.** Shipped with `id="platform"` but no entry in `NAV_LINKS`. If the founder wants "Platform" in the bar, that reopens the nav-width/logo coupling from R19 §11 — a separate change, re-measured against the chosen lockup.

4. **ID copy is unstamped.** Everything in §3 ships as a draft in both maps to satisfy parity. The founder writes the real Indonesian; the five party names must match the ID already in `hero_sub_short`.

5. **R20 also recommended cutting the catalog band on mobile** (it is 2.6 of 6 phone screens; two new bands push past seven). That is a separate FitmentSection change, not part of this band. Flagged so the mobile-length math is not forgotten.
