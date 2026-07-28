"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { CopyKey } from "@/lib/i18n/copy";
import { useT } from "@/lib/i18n/LanguageProvider";

// NOT "./platformFlow" — this repo is developed on a case-insensitive
// filesystem, where that specifier resolves .ts before .tsx and so matches THIS
// file, yielding an undefined default export at the LandingView mount. The
// geometry module is named …Geometry precisely so no two modules here differ
// only by case.
import { FLOW, FLOW_LAYOUT, FLOW_VIEW } from "./platformFlowGeometry";

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

/** Vertical position of each inbound file chip, as % of the figure height. */
const IN_CHIP_TOP_PCT = [8.6, 40.4, 74.5];

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
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[icon]}
    </svg>
  );
}

/**
 * Platform-flow figure (R20 2a, embedded by R25) — the industry-scale half of
 * the "how it works" band: three inputs converge through one verified core and
 * fan back out to three outputs.
 *
 * R25: this is no longer its own <section>. It is a figure INSIDE
 * FitmentSection, above the picker, so the diagram's output hands straight to
 * the per-part demonstration instead of ending on an abstract caption. It
 * therefore has no kicker, no H2 and no lede of its own — the band has one
 * headline. plat_kicker / plat_h2 / plat_p are deliberately KEPT in copy.ts
 * (same precedent as prot_r*): LANDING_KEYS is an existence contract, not a
 * render contract, so they keep passing, EN and ID stay paired, and restoring a
 * standalone band is a mount rather than a translation round.
 *
 * The filename is load-bearing. The geometry module is `platformFlowGeometry`
 * rather than `platformFlow` because this repo is developed on a
 * case-insensitive filesystem, where "./PlatformFlow" resolves .ts before .tsx
 * and would match it. Do not rename either file.
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="mb-plat-fig-wrap">
      <figure
        className={`mb-plat-fig ${js ? "mb-plat--js" : ""}`}
        ref={ref}
        data-inview={inView ? "true" : undefined}
      >
        {/* ---- desktop: the Sankey ---- */}
        <div className="mb-plat-figure" aria-hidden>
          <svg
            className="mb-plat-svg"
            viewBox={`0 0 ${FLOW_VIEW.w} ${FLOW_VIEW.h}`}
            preserveAspectRatio="xMidYMid meet"
          >
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

          <svg
            className="mb-plat-svg mb-plat-svg--packets"
            viewBox={`0 0 ${FLOW_VIEW.w} ${FLOW_VIEW.h}`}
            preserveAspectRatio="xMidYMid meet"
          >
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
              style={{
                top: `${IN_CHIP_TOP_PCT[i]}%`,
                ["--label-delay" as string]: c.delay,
              }}
            >
              <span className="mb-plat-chip-disc">
                {/* Intrinsic 76×96, not 26×26 — these are portrait document
                      glyphs and declaring them square stretches them 25%. The
                      display size comes from CSS, as with .mb-file-chip img.
                      unoptimized for the same reason AiCatalogCard gives: they
                      are 1–2 KB, the optimizer saves nothing, and a dropped
                      optimizer response once left the PDF chip blank on the
                      live site (CHG-piztanza-18). */}
                <Image src={c.src} alt={t(c.key)} width={76} height={96} unoptimized />
              </span>
            </span>
          ))}

          {/* outbound "verified" tag */}
          <span
            className="mb-plat-inlabel mb-plat-outlabel"
            style={{ ["--label-delay" as string]: "0.58s" }}
          >
            {t("plat_out")}
          </span>

          {/* source nodes */}
          {SOURCES.map((p, i) => (
            <div
              key={p.t}
              className="mb-plat-node mb-plat-node--src"
              style={{
                ...nodeStyle(FLOW.nodes[i].topPct, FLOW.nodes[i].heightPct, FLOW_LAYOUT.srcLeftPct),
                ["--node-delay" as string]: p.delay,
              }}
            >
              <PartyGlyph icon={p.icon} />
              <span className="mb-plat-node-t">{t(p.t)}</span>
              <span className="mb-plat-node-s">{t(p.s)}</span>
            </div>
          ))}

          {/* spine — the verified core */}
          <div
            className="mb-plat-spine"
            style={{
              left: `${FLOW.spine.leftPct}%`,
              width: `${FLOW.spine.widthPct}%`,
              top: `${FLOW.spine.topPct}%`,
              height: `${FLOW.spine.heightPct}%`,
            }}
          >
            <div className="mb-plat-spine-inner">
              <span className="mb-plat-noise" />
              <span className="mb-plat-spec" />
              <span className="mb-plat-spine-body">
                {/* mobeeli-mark.png is 1200×1200. Declaring 60×46 makes Next
                      warn on every load that one dimension was modified without
                      the other; the square intrinsic keeps the ratio honest and
                      .mb-plat-mark still sets the painted height. */}
                <Image
                  className="mb-plat-mark"
                  src="/assets/mobeeli-mark.png"
                  alt="Mobeeli"
                  width={46}
                  height={46}
                />
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
              style={{
                ...nodeStyle(FLOW.nodes[i].topPct, FLOW.nodes[i].heightPct, FLOW_LAYOUT.dstLeftPct),
                ["--node-delay" as string]: p.delay,
              }}
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
            {/* Square, like its desktop twin. The spec declared 52×40 for a
                  1:1 asset and gave this copy no class to correct it, so the
                  brand mark painted 30% wide — on EVERY phone, since the stack
                  is the only rendering of this band below 1024px. */}
            <Image src="/assets/mobeeli-mark.png" alt="Mobeeli" width={40} height={40} />
            <span className="mb-plat-hub">{t("plat_hub")}</span>
          </div>
          {/* --out, not :last-of-type. Both arrows are <span>, and the hub card
              between them contains one too, so a type-based selector is a trap
              waiting for the next markup change. */}
          <span className="mb-plat-arrow mb-plat-arrow--out" />
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
  );
}
