"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { PLATFORM_URL } from "@/components/landing/Nav";
import type { CopyKey } from "@/lib/i18n";
import { useT } from "@/lib/i18n/LanguageProvider";

import FitmentFlow, { VerdictDot } from "./FitmentFlow";

// Not "./solutions.css": a stylesheet named like this module but for case is
// the CONSTRAINTS "Modules" trap in waiting on a case-insensitive filesystem.
import "./solutions-page.css";

type ServiceIcon = "store" | "catalog" | "link" | "plugin" | "data" | "search";

/** The services a parts business can buy today — only what is ready (founder
 *  2026-10-31). Fitment and the vehicle data stay the thread through all six. */
const SERVICES: readonly { title: CopyKey; desc: CopyKey; icon: ServiceIcon }[] = [
  { title: "sol_svc1_t", desc: "sol_svc1_d", icon: "store" },
  { title: "sol_svc2_t", desc: "sol_svc2_d", icon: "catalog" },
  { title: "sol_svc3_t", desc: "sol_svc3_d", icon: "link" },
  { title: "sol_svc4_t", desc: "sol_svc4_d", icon: "plugin" },
  { title: "sol_svc5_t", desc: "sol_svc5_d", icon: "data" },
  { title: "sol_svc6_t", desc: "sol_svc6_d", icon: "search" },
];

/** The hero's sample store: the landing page's own parts cut-outs (680×680
 *  transparent PNGs), named generically. */
const HERO_PARTS: readonly { src: string; name: CopyKey }[] = [
  { src: "/assets/parts/disc.png", name: "sol_art_p1" },
  { src: "/assets/parts/filter.png", name: "sol_art_p2" },
  { src: "/assets/parts/plug.png", name: "sol_art_p3" },
];

/** The store packages, by size (founder 2026-10-31: tiers, never prices). Each
 *  lists only what it adds; the comparison table carries every feature. */
const TIERS: readonly {
  name: CopyKey;
  forWhom: CopyKey;
  /** The package this one builds on; the first lists the full store instead. */
  plusOf?: CopyKey;
  items: readonly CopyKey[];
}[] = [
  {
    name: "sol_tier1_t",
    forWhom: "sol_tier1_for",
    items: ["sol_tier1_cat", "sol_build_i3", "sol_tier1_l3", "sol_build_i5"],
  },
  {
    name: "sol_tier2_t",
    forWhom: "sol_tier2_for",
    plusOf: "sol_tier1_t",
    items: ["sol_tier2_cat", "sol_build_e1", "sol_cmp_terms"],
  },
  {
    name: "sol_tier3_t",
    forWhom: "sol_tier3_for",
    plusOf: "sol_tier2_t",
    items: ["sol_tier3_cat", "sol_svc3_t", "sol_tier3_l3"],
  },
];

/** Monthly subscriptions. Maintenance and SEO come in two levels; the API card
 *  names the three API services by their own titles, so the page calls each
 *  thing one way throughout. */
const SUBSCRIPTIONS: readonly ({ title: CopyKey; desc: CopyKey } & (
  { levels: readonly (readonly [name: CopyKey, desc: CopyKey])[] } | { items: readonly CopyKey[] }
))[] = [
  {
    title: "sol_sub1_t",
    desc: "sol_sub1_d",
    levels: [
      ["sol_sub1_lv1_t", "sol_sub1_lv1_d"],
      ["sol_sub1_lv2_t", "sol_sub1_lv2_d"],
    ],
  },
  {
    title: "sol_sub2_t",
    desc: "sol_sub2_d",
    levels: [
      ["sol_sub2_lv1_t", "sol_sub2_lv1_d"],
      ["sol_sub2_lv2_t", "sol_sub2_lv2_d"],
    ],
  },
  {
    title: "sol_sub3_t",
    desc: "sol_sub3_d",
    items: ["sol_svc3_t", "sol_svc4_t", "sol_svc5_t", "sol_sub3_i4"],
  },
];

/** A comparison cell: included, not included, or a short text of its own. */
type Cell = "yes" | "no" | CopyKey;

/** The package comparison: every store feature the platform already has, then
 *  what the bigger packages add (capability map against the platform repo,
 *  2026-10-31). Stock across branches is only partly built there, so it is "by
 *  arrangement", never a tick. */
const COMPARE: readonly (readonly [feature: CopyKey, starter: Cell, growth: Cell, scale: Cell])[] =
  [
    ["sol_build_i1", "yes", "yes", "yes"],
    ["sol_build_i2", "sol_tier1_cat", "sol_tier2_cat", "sol_tier3_cat"],
    ["sol_build_i3", "yes", "yes", "yes"],
    ["sol_build_i4", "yes", "yes", "yes"],
    ["sol_build_i5", "yes", "yes", "yes"],
    ["sol_build_i6", "yes", "yes", "yes"],
    ["sol_build_i7", "yes", "yes", "yes"],
    ["sol_build_i8", "yes", "yes", "yes"],
    ["sol_build_i9", "yes", "yes", "yes"],
    ["sol_build_i10", "yes", "yes", "yes"],
    ["sol_build_e1", "no", "yes", "yes"],
    ["sol_cmp_terms", "no", "yes", "yes"],
    ["sol_svc3_t", "no", "no", "yes"],
    ["sol_build_e2", "no", "no", "sol_cmp_arr"],
  ];

const FAQ: readonly (readonly [question: CopyKey, answer: CopyKey])[] = [
  ["sol_faq1_q", "sol_faq1_a"],
  ["sol_faq2_q", "sol_faq2_a"],
  ["sol_faq3_q", "sol_faq3_a"],
  ["sol_faq4_q", "sol_faq4_a"],
  ["sol_faq5_q", "sol_faq5_a"],
];

/** Line icons on the 24-unit grid, stroke from currentColor (PlatformFlow's set). */
function ServiceGlyph({ icon }: { icon: ServiceIcon }) {
  const paths: Record<ServiceIcon, ReactNode> = {
    store: (
      <>
        <path d="M4 9h16v11H4z" />
        <path d="M4 9 6 4h12l2 5" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
    catalog: (
      <>
        <path d="M8 3.5h9.5l2.5 2.5v13.5H8z" />
        <path d="M17.5 3.5V6H20" />
        <path d="M4.5 7v13.5h12" />
        <path d="M11 10h6M11 13.5h6M11 17h3.5" />
      </>
    ),
    link: (
      <>
        <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
        <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
      </>
    ),
    plugin: (
      <>
        <path d="M9 3v5M15 3v5" />
        <path d="M6 8h12v3a6 6 0 0 1-12 0z" />
        <path d="M12 17v4" />
      </>
    ),
    data: (
      <>
        <ellipse cx="12" cy="5.8" rx="7" ry="2.6" />
        <path d="M5 5.8v12.4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V5.8" />
        <path d="M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4.2-4.2" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {paths[icon]}
    </svg>
  );
}

/** A list of what a plan holds, each line with a check. */
function PlanList({ items }: { items: readonly CopyKey[] }) {
  const t = useT();
  return (
    <ul className="mb-sol-plan-list">
      {items.map((key) => (
        <li key={key}>
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            focusable="false"
          >
            <path d="m3.5 8.4 2.9 2.9 6-6.3" />
          </svg>
          {t(key)}
        </li>
      ))}
    </ul>
  );
}

/**
 * The hero's sample store: the store UI as the explainer draws it — My Garage,
 * search, part tiles with their verdicts — around the landing page's parts
 * cut-outs, with one floating card. A single image to a screen reader (a named
 * role="img"; the composite inside is hidden), and tagged as a sample on screen.
 * Static: the explainer below is the page's one motion moment.
 */
function HeroArt() {
  const t = useT();
  return (
    <div data-rev="2" className="mb-sol-art" role="img" aria-label={t("sol_art_label")}>
      <div className="mb-sol-art-win" aria-hidden="true">
        <div className="mb-sol-art-bar">
          <span className="mb-sol-art-dots">
            <span />
            <span />
            <span />
          </span>
          <span className="mb-sol-art-tag">{t("sol_art_tag")}</span>
        </div>
        <div className="mb-sol-art-garage">
          <span className="mb-sol-garage-badge">{t("garage_chip_label")}</span>
          <span className="mb-sol-art-car">{t("sol_art_car")}</span>
        </div>
        <div className="mb-sol-art-search">
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            focusable="false"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" />
          </svg>
          {t("sol_art_search")}
        </div>
        <ul className="mb-sol-art-grid">
          {HERO_PARTS.map((part) => (
            <li key={part.src} className="mb-sol-art-tile">
              {/* Intrinsic 680×680 from the files (CONSTRAINTS: never the
                  display size); CSS paints them into the tile. */}
              <Image
                className="mb-sol-art-img"
                src={part.src}
                alt=""
                width={680}
                height={680}
                sizes="(max-width: 639.98px) 30vw, 160px"
              />
              <span className="mb-sol-art-name">{t(part.name)}</span>
              <span className="mb-sol-chip">
                <VerdictDot state="fit" />
                {t("cat_part_verified")}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-sol-art-float" aria-hidden="true">
        <VerdictDot state="fit" />
        {t("sol_art_check")}
      </div>
    </div>
  );
}

/** One comparison cell: a tick or a dash with its word for screen readers, or
 *  a short text of its own. */
function CompareCell({ cell }: { cell: Cell }) {
  const t = useT();
  if (cell === "yes" || cell === "no") {
    return (
      <>
        <svg
          className={cell === "yes" ? "mb-sol-cmp-yes" : "mb-sol-cmp-no"}
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          focusable="false"
        >
          {cell === "yes" ? <path d="m3.5 8.4 2.9 2.9 6-6.3" /> : <path d="M4.5 8h7" />}
        </svg>
        <span className="mb-sol-sr">{t(cell === "yes" ? "sol_cmp_yes" : "sol_cmp_no")}</span>
      </>
    );
  }
  return <>{t(cell)}</>;
}

/**
 * /solutions — Mobeeli's SaaS page (2026-10-31). Five bands in the site's
 * light → dark → light rhythm: a split hero with a sample store; six services
 * in one ruled sheet; the dark fitment-flow band (the page's one orchestrated
 * motion moment); packages — three store tiers by size, monthly subscriptions
 * with levels and a comparison table, never a price (founder, 2026-10-31); and
 * an FAQ closing on the /investors card's pattern.
 */
export default function Solutions() {
  const t = useT();
  return (
    <>
      <section id="solutions" className="mb-sol-hero">
        <div className="mb-sol-hero-inner">
          <div className="mb-sol-hero-copy">
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
              <a href="#packages" className="mb-sol-textlink mb-link-underline">
                {t("sol_cta_packages")}
              </a>
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      <section id="services" className="mb-sol-services" aria-labelledby="mb-sol-svc-h">
        <div className="mb-section-inner">
          <header className="mb-sol-head">
            <div data-rev="0" className="mb-kicker">
              {t("sol_svc_kicker")}
            </div>
            <h2 id="mb-sol-svc-h" data-rev="1" className="mb-h2 mb-sol-h2">
              {t("sol_svc_h2")}
            </h2>
          </header>
          <ul data-rev="2" className="mb-sol-svc-grid">
            {SERVICES.map((s) => (
              <li key={s.title} className="mb-sol-svc">
                <span className="mb-sol-svc-i">
                  <ServiceGlyph icon={s.icon} />
                </span>
                <h3 className="mb-sol-svc-t">{t(s.title)}</h3>
                <p className="mb-sol-svc-d">{t(s.desc)}</p>
              </li>
            ))}
          </ul>
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

      <section id="packages" className="mb-sol-packages" aria-labelledby="mb-sol-pkg-h">
        <div className="mb-section-inner">
          <header className="mb-sol-head">
            <div data-rev="0" className="mb-kicker">
              {t("sol_pkg_kicker")}
            </div>
            <h2 id="mb-sol-pkg-h" data-rev="1" className="mb-h2 mb-sol-h2">
              {t("sol_pkg_h2")}
            </h2>
            <p data-rev="2" className="mb-sol-head-p">
              {t("sol_pkg_p")}
            </p>
          </header>

          <ul data-rev="0" className="mb-sol-tiers">
            {TIERS.map((tier) => (
              <li key={tier.name} className="mb-sol-tier">
                <h3 className="mb-sol-tier-t">{t(tier.name)}</h3>
                <p className="mb-sol-tier-for">{t(tier.forWhom)}</p>
                <p className="mb-sol-bill">{t("sol_tier_bill")}</p>
                <p className="mb-sol-list-h">
                  {tier.plusOf
                    ? t("sol_tier_plus").replace("{tier}", t(tier.plusOf))
                    : t("sol_tier_base")}
                </p>
                <PlanList items={tier.items} />
                <Link href="/contact" className="mb-btn-primary-light mb-btn-spring">
                  {t("sol_cta_talk")}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mb-sol-pkg-note">{t("sol_pkg_note")}</p>

          <h3 className="mb-sol-subs-h">{t("sol_sub_h")}</h3>
          <ul data-rev="0" className="mb-sol-subs">
            {SUBSCRIPTIONS.map((sub) => (
              <li key={sub.title} className="mb-sol-sub">
                <h4 className="mb-sol-sub-t">{t(sub.title)}</h4>
                <p className="mb-sol-bill">{t("sol_sub_billing")}</p>
                <p className="mb-sol-sub-d">{t(sub.desc)}</p>
                {"levels" in sub ? (
                  <dl className="mb-sol-levels">
                    {sub.levels.map(([name, desc]) => (
                      <div key={name}>
                        <dt>{t(name)}</dt>
                        <dd>{t(desc)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <PlanList items={sub.items} />
                )}
                <Link href="/contact" className="mb-sol-textlink mb-link-underline">
                  {t("sol_cta_talk")}
                </Link>
              </li>
            ))}
          </ul>

          <table className="mb-sol-compare">
            <caption>{t("sol_cmp_h")}</caption>
            <thead>
              <tr>
                <th scope="col">{t("sol_cmp_col")}</th>
                {TIERS.map((tier) => (
                  <th key={tier.name} scope="col">
                    {t(tier.name)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([feature, ...cells]) => (
                <tr key={feature}>
                  <th scope="row">{t(feature)}</th>
                  {cells.map((cell, i) => (
                    <td key={TIERS[i].name}>
                      <CompareCell cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="faq" className="mb-sol-faq" aria-labelledby="mb-sol-faq-h">
        <div className="mb-section-inner">
          <div className="mb-sol-faq-grid">
            <h2 id="mb-sol-faq-h" data-rev="0" className="mb-h2 mb-sol-h2 mb-sol-faq-h2">
              {t("sol_faq_h2")}
            </h2>
            <div data-rev="1" className="mb-sol-faq-list">
              {FAQ.map(([question, answer]) => (
                <details key={question} className="mb-sol-faq-item">
                  <summary className="mb-sol-faq-q">{t(question)}</summary>
                  <p className="mb-sol-faq-a">{t(answer)}</p>
                </details>
              ))}
            </div>
          </div>

          <div data-rev="0" className="mb-sol-cta">
            <div>
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
