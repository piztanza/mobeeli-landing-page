"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { PLATFORM_URL } from "@/components/landing/Nav";
import type { CopyKey } from "@/lib/i18n";
import { useT } from "@/lib/i18n/LanguageProvider";

import FitmentFlow from "./FitmentFlow";

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

/** What the store build includes, as two whole lists: the store itself, then
 *  running it — the seller tools the platform already has (capability map
 *  against the platform repo, 2026-10-31). */
const BUILD_STORE: readonly CopyKey[] = [
  "sol_build_i1",
  "sol_build_i2",
  "sol_build_i3",
  "sol_build_i4",
  "sol_build_i5",
];

const BUILD_RUNNING: readonly CopyKey[] = [
  "sol_build_i6",
  "sol_build_i7",
  "sol_build_i8",
  "sol_build_i9",
  "sol_build_i10",
];

const BUILD_EXTRAS: readonly CopyKey[] = ["sol_build_e1", "sol_build_e2"];

/** Monthly subscriptions. The API card names the three API services by their
 *  own titles, so the page calls each thing one way throughout. */
const SUBSCRIPTIONS: readonly { title: CopyKey; desc: CopyKey; items: readonly CopyKey[] }[] = [
  {
    title: "sol_sub1_t",
    desc: "sol_sub1_d",
    items: ["sol_sub1_i1", "sol_sub1_i2", "sol_sub1_i3", "sol_sub1_i4"],
  },
  { title: "sol_sub2_t", desc: "sol_sub2_d", items: ["sol_sub2_i1", "sol_sub2_i2", "sol_sub2_i3"] },
  {
    title: "sol_sub3_t",
    desc: "sol_sub3_d",
    items: ["sol_svc3_t", "sol_svc4_t", "sol_svc5_t", "sol_sub3_i4"],
  },
];

/** The price chart: every offering, how it is billed, and its price. No
 *  figures — the build is quoted per store and the rest is "talk to our team"
 *  (founder 2026-10-31), which also keeps CLAUDE.md's no-fee rule. */
const CHART: readonly (readonly [service: CopyKey, billing: CopyKey, price: CopyKey])[] = [
  ["sol_build_t", "sol_bill_once", "sol_build_price"],
  ["sol_sub1_t", "sol_bill_month", "sol_cta_talk"],
  ["sol_sub2_t", "sol_bill_month", "sol_cta_talk"],
  ["sol_svc3_t", "sol_bill_month", "sol_cta_talk"],
  ["sol_svc4_t", "sol_bill_month", "sol_cta_talk"],
  ["sol_svc5_t", "sol_bill_month", "sol_cta_talk"],
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

/** A list of what a plan holds: a check for included, a plus for an extra. */
function PlanList({ items, extra = false }: { items: readonly CopyKey[]; extra?: boolean }) {
  const t = useT();
  return (
    <ul className={`mb-sol-plan-list${extra ? " mb-sol-plan-list--extra" : ""}`}>
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
            {extra ? <path d="M8 3.5v9M3.5 8h9" /> : <path d="m3.5 8.4 2.9 2.9 6-6.3" />}
          </svg>
          {t(key)}
        </li>
      ))}
    </ul>
  );
}

/**
 * /solutions — Mobeeli's SaaS page (2026-10-31, decongested the same day).
 * Four bands in the site's light → dark → light rhythm: a short centred hero;
 * six services in one ruled panel; the dark fitment-flow band (the page's one
 * orchestrated motion moment); and pricing — the one-time store build, three
 * monthly subscriptions and a price chart — closing on the /investors card's
 * pattern. One idea per band, one sentence per service: the first version
 * stacked an index card, a five-panel figure and sixteen capability blurbs,
 * and read as congested.
 */
export default function Solutions() {
  const t = useT();
  return (
    <>
      <section id="solutions" className="mb-sol-hero">
        <div className="mb-sol-hero-inner">
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
            <a href="#pricing" className="mb-sol-textlink mb-link-underline">
              {t("sol_cta_pricing")}
            </a>
          </div>
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

      <section id="pricing" className="mb-sol-pricing" aria-labelledby="mb-sol-price-h">
        <div className="mb-section-inner">
          <header className="mb-sol-head">
            <div data-rev="0" className="mb-kicker">
              {t("sol_price_kicker")}
            </div>
            <h2 id="mb-sol-price-h" data-rev="1" className="mb-h2 mb-sol-h2">
              {t("sol_price_h2")}
            </h2>
            <p data-rev="2" className="mb-sol-head-p">
              {t("sol_price_p")}
            </p>
          </header>

          <div data-rev="0" className="mb-sol-build">
            <div className="mb-sol-build-main">
              <h3 className="mb-sol-build-t">{t("sol_build_t")}</h3>
              <p className="mb-sol-bill">{t("sol_build_billing")}</p>
              <p className="mb-sol-build-price">{t("sol_build_price")}</p>
              <Link href="/contact" className="mb-btn-primary-light mb-btn-spring">
                {t("sol_cta_talk")}
              </Link>
            </div>
            <div className="mb-sol-build-lists">
              <div>
                <h4 className="mb-sol-list-h">{t("sol_build_inc_h")}</h4>
                <div className="mb-sol-build-inc">
                  <PlanList items={BUILD_STORE} />
                  <PlanList items={BUILD_RUNNING} />
                </div>
              </div>
              <div className="mb-sol-build-ext">
                <h4 className="mb-sol-list-h">{t("sol_build_ext_h")}</h4>
                <PlanList items={BUILD_EXTRAS} extra />
              </div>
            </div>
          </div>

          <h3 className="mb-sol-subs-h">{t("sol_sub_h")}</h3>
          <ul data-rev="0" className="mb-sol-subs">
            {SUBSCRIPTIONS.map((sub) => (
              <li key={sub.title} className="mb-sol-sub">
                <h4 className="mb-sol-sub-t">{t(sub.title)}</h4>
                <p className="mb-sol-bill">{t("sol_sub_billing")}</p>
                <p className="mb-sol-sub-d">{t(sub.desc)}</p>
                <PlanList items={sub.items} />
                <Link href="/contact" className="mb-sol-textlink mb-link-underline">
                  {t("sol_cta_talk")}
                </Link>
              </li>
            ))}
          </ul>

          <table className="mb-sol-chart">
            <caption>{t("sol_chart_h")}</caption>
            <thead>
              <tr>
                <th scope="col">{t("sol_chart_col_svc")}</th>
                <th scope="col">{t("sol_chart_col_bill")}</th>
                <th scope="col">{t("sol_chart_col_price")}</th>
              </tr>
            </thead>
            <tbody>
              {CHART.map(([service, billing, price]) => (
                <tr key={service}>
                  <th scope="row">{t(service)}</th>
                  <td>{t(billing)}</td>
                  <td>{t(price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

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
