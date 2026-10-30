"use client";

import Link from "next/link";

import { PLATFORM_URL } from "@/components/landing/Nav";
import type { CopyKey } from "@/lib/i18n";
import { useT } from "@/lib/i18n/LanguageProvider";

import FitmentFlow from "./FitmentFlow";

// Not "./solutions.css": a stylesheet named like this module but for case is
// the CONSTRAINTS "Modules" trap in waiting on a case-insensitive filesystem.
import "./solutions-page.css";

/** The five places in the fitment flow a product can occupy — the same five
 *  nodes the explainer draws, so each pillar's map glyph points at its node. */
type FlowNode = "cat" | "veh" | "eng" | "store" | "garage";

interface Pillar {
  id: string;
  title: CopyKey;
  short: CopyKey;
  desc: CopyKey;
  audience: CopyKey;
  caps: readonly (readonly [title: CopyKey, desc: CopyKey])[];
  lit: readonly FlowNode[];
}

/** The founder brief's order: the data first, because everything else reads it. */
const PILLARS: readonly Pillar[] = [
  {
    id: "vehicle-data",
    title: "sol_p1_t",
    short: "sol_p1_short",
    desc: "sol_p1_d",
    audience: "sol_p1_for",
    caps: [
      ["sol_p1_c1_t", "sol_p1_c1_d"],
      ["sol_p1_c2_t", "sol_p1_c2_d"],
      ["sol_p1_c3_t", "sol_p1_c3_d"],
      ["sol_p1_c4_t", "sol_p1_c4_d"],
    ],
    lit: ["veh"],
  },
  {
    id: "fitment-search",
    title: "sol_p2_t",
    short: "sol_p2_short",
    desc: "sol_p2_d",
    audience: "sol_p2_for",
    caps: [
      ["sol_p2_c1_t", "sol_p2_c1_d"],
      ["sol_p2_c2_t", "sol_p2_c2_d"],
      ["sol_p2_c3_t", "sol_p2_c3_d"],
      ["sol_p2_c4_t", "sol_p2_c4_d"],
    ],
    lit: ["eng", "garage"],
  },
  {
    id: "catalogs",
    title: "sol_p3_t",
    short: "sol_p3_short",
    desc: "sol_p3_d",
    audience: "sol_p3_for",
    caps: [
      ["sol_p3_c1_t", "sol_p3_c1_d"],
      ["sol_p3_c2_t", "sol_p3_c2_d"],
      ["sol_p3_c3_t", "sol_p3_c3_d"],
      ["sol_p3_c4_t", "sol_p3_c4_d"],
    ],
    lit: ["cat"],
  },
  {
    id: "storefronts",
    title: "sol_p4_t",
    short: "sol_p4_short",
    desc: "sol_p4_d",
    audience: "sol_p4_for",
    caps: [
      ["sol_p4_c1_t", "sol_p4_c1_d"],
      ["sol_p4_c2_t", "sol_p4_c2_d"],
      ["sol_p4_c3_t", "sol_p4_c3_d"],
      ["sol_p4_c4_t", "sol_p4_c4_d"],
    ],
    lit: ["store"],
  },
];

/** Node boxes of the map glyph (viewBox 0 0 88 36): two inputs, the engine, two outputs. */
const MAP_NODES: Record<FlowNode, { x: number; y: number; w: number; h: number }> = {
  cat: { x: 1, y: 4, w: 17, h: 10 },
  veh: { x: 1, y: 22, w: 17, h: 10 },
  eng: { x: 35.5, y: 7, w: 17, h: 22 },
  store: { x: 70, y: 4, w: 17, h: 10 },
  garage: { x: 70, y: 22, w: 17, h: 10 },
};

/**
 * Where a product sits in the fitment flow — a thumbnail of the explainer's
 * own topology with the product's node(s) lit. Information, not ornament: it is
 * how a pillar points back at the figure. Decorative to assistive tech, since
 * the pillar's heading already names the product.
 */
function FlowMap({ lit }: { lit: readonly FlowNode[] }) {
  return (
    <svg className="mb-sol-map" viewBox="0 0 88 36" aria-hidden focusable="false">
      <path
        className="mb-sol-map-link"
        d="M18 9C27 9 26.5 18 35.5 18M18 27C27 27 26.5 18 35.5 18M52.5 18C61.5 18 61 9 70 9M52.5 18C61.5 18 61 27 70 27"
      />
      {(Object.keys(MAP_NODES) as FlowNode[]).map((node) => {
        const box = MAP_NODES[node];
        return (
          <rect
            key={node}
            className={`mb-sol-map-node${lit.includes(node) ? " is-lit" : ""}`}
            x={box.x}
            y={box.y}
            width={box.w}
            height={box.h}
            rx={node === "eng" ? 4 : 2.5}
          />
        );
      })}
    </svg>
  );
}

/**
 * /solutions — what Mobeeli provides (2026-10-31). Three bands in the site's
 * light → dark → light rhythm: the intro with a product index, the dark
 * fitment-flow band (the page's one orchestrated motion moment), and the four
 * pillars closing on a dark CTA card (the /investors card's pattern).
 *
 * The pillars are typographic rows under a ruled head — the /contact page's
 * "what happens next" vocabulary — not another set of cards: the glass and the
 * motion are spent on the explainer, and everything around it stays quiet.
 */
export default function Solutions() {
  const t = useT();
  return (
    <>
      <section id="solutions" className="mb-sol-intro">
        <div className="mb-sol-intro-grid">
          <div className="mb-sol-intro-main">
            <div data-rev="0" className="mb-kicker">
              {t("sol_kicker")}
            </div>
            <h1 data-rev="1" className="mb-sol-h1">
              {t("sol_h1")}
            </h1>
            <p data-rev="2" className="mb-sol-lede">
              {t("sol_lede")}
            </p>
            <div data-rev="3" className="mb-sol-ctas">
              <Link href="/contact" className="mb-btn-primary-light mb-btn-spring">
                {t("sol_cta_talk")}
              </Link>
              <a href="#fitment-flow" className="mb-sol-textlink mb-link-underline">
                {t("sol_cta_flow")}
              </a>
            </div>
          </div>
          <nav data-rev="2" className="mb-sol-index" aria-labelledby="mb-sol-index-h">
            <h2 id="mb-sol-index-h" className="mb-sol-index-h">
              {t("sol_index_h")}
            </h2>
            <ul className="mb-sol-index-list">
              {PILLARS.map((p) => (
                <li key={p.id}>
                  <a href={`#${p.id}`} className="mb-sol-index-row">
                    <FlowMap lit={p.lit} />
                    <span className="mb-sol-index-t">{t(p.title)}</span>
                    <span className="mb-sol-index-s">{t(p.short)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section id="fitment-flow" className="mb-sol-flow" aria-labelledby="mb-sol-flow-h">
        <div className="mb-sol-flow-inner">
          <header className="mb-sol-flow-head">
            <div data-rev="0" className="mb-kicker mb-kicker--sky">
              {t("sol_flow_kicker")}
            </div>
            <h2 id="mb-sol-flow-h" data-rev="1" className="mb-h2 mb-sol-flow-h2">
              {t("sol_flow_h2")}
            </h2>
            <p data-rev="2" className="mb-sol-flow-p">
              {t("sol_flow_p")}
            </p>
          </header>
          <FitmentFlow />
        </div>
      </section>

      <section className="mb-sol-pillars" aria-labelledby="mb-sol-pillars-h">
        <div className="mb-section-inner">
          <header className="mb-sol-pillars-head">
            <div data-rev="0" className="mb-kicker">
              {t("sol_pillars_kicker")}
            </div>
            <h2 id="mb-sol-pillars-h" data-rev="1" className="mb-h2 mb-sol-pillars-h2">
              {t("sol_pillars_h2")}
            </h2>
            <p data-rev="2" className="mb-sol-pillars-p">
              {t("sol_pillars_p")}
            </p>
          </header>

          {PILLARS.map((p) => (
            <article key={p.id} id={p.id} className="mb-sol-pillar" aria-labelledby={`${p.id}-t`}>
              <div data-rev="0" className="mb-sol-pillar-head">
                <FlowMap lit={p.lit} />
                <h3 id={`${p.id}-t`} className="mb-sol-pillar-t">
                  {t(p.title)}
                </h3>
                <p className="mb-sol-pillar-d">{t(p.desc)}</p>
                <p className="mb-sol-pillar-for">
                  <span className="mb-sol-pillar-for-l">{t("sol_for_label")}</span> {t(p.audience)}
                </p>
              </div>
              <ul data-rev="1" className="mb-sol-caps">
                {p.caps.map(([capT, capD]) => (
                  <li key={capT} className="mb-sol-cap">
                    <h4 className="mb-sol-cap-t">{t(capT)}</h4>
                    <p className="mb-sol-cap-d">{t(capD)}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <div data-rev="0" className="mb-sol-cta">
            <div className="mb-sol-cta-copy">
              <h2 className="mb-sol-cta-h">{t("sol_cta_h")}</h2>
              <p className="mb-sol-cta-p">{t("sol_cta_p")}</p>
            </div>
            <div className="mb-sol-cta-btns">
              <Link href="/contact" className="mb-btn-primary-dark mb-btn-spring">
                {t("sol_cta_talk")}
              </Link>
              {/* Every Early Adopters entry point routes to the company portal
                  signup (founder 2026-07-28) — the same constant the nav uses. */}
              <a href={PLATFORM_URL} className="mb-btn-ghost-dark">
                {t("hero_cta_shops")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
