"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

import type { CopyKey } from "@/lib/i18n";
import { formatDecimal } from "@/lib/i18n/format";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";

import { VEHICLE_DB, asOfLabel, countLabel, type SpecStatus } from "./vehicleDbData";

/** The status legend, in the platform's order: VERIFIED, UNVERIFIED, ESTIMATED. */
const STATUSES: readonly (readonly [status: SpecStatus, label: CopyKey])[] = [
  ["checked", "sol_db_st_checked"],
  ["single", "sol_db_st_single"],
  ["estimated", "sol_db_st_est"],
];

/**
 * The wheel teardown (public/assets/solutions/wheel-teardown.jpg, a Gemini
 * render with its own leader lines painted out) and where each wheel and tire
 * field sits on it, in the image's pixels: `x` is the leader line, `y` the
 * point on the part it starts from. The labels hang at `labelY`, in the white
 * ground under the parts. Names only: the values and their status stay in the
 * record card, so the picture can never show a number the data doesn't.
 */
const WHEEL = { src: "/assets/solutions/wheel-teardown.jpg", w: 1316, h: 648, labelY: 556 };
const WHEEL_PARTS: readonly { x: number; y: number; labels: readonly CopyKey[] }[] = [
  { x: 230, y: 520, labels: ["sol_db_f_tire"] },
  { x: 620, y: 446, labels: ["sol_db_f_rim", "sol_db_f_offset"] },
  { x: 860, y: 368, labels: ["sol_db_f_pcd"] },
  { x: 1215, y: 336, labels: ["sol_db_f_bore"] },
];

/** A status mark: filled (checked against a source), ring (one source) or
 *  dashed ring (estimated). Shape, not colour, carries the state. */
function StatusMark({ status }: { status: SpecStatus }) {
  return <span className={`mb-sol-db-mark is-${status}`} aria-hidden />;
}

/**
 * The Mobeeli Vehicle Database band: the data itself, before the flow that
 * uses it. Left, the five levels from make to model year with their counts and
 * one real path lit through them; right, the record at the end of that path,
 * its wheel and tire values tagged with their status; below, a wheel teardown
 * labelled with those fields. Static on purpose: the
 * fitment-flow band below stays the page's one motion moment. Every value is
 * text, so the figure needs no separate screen-reader summary.
 */
export default function VehicleDatabase() {
  const t = useT();
  const { lang } = useLang();
  const n = (v: number) => formatDecimal(lang, v);
  const { sample } = VEHICLE_DB;
  const { wheel, tire } = sample;

  const vehicleRows: readonly (readonly [label: CopyKey, value: string])[] = [
    ["sol_db_f_gen", t("sol_db_v_gen")],
    ["sol_db_f_chassis", t("sol_db_v_chassis")],
    ["sol_db_f_variant", t("sol_db_v_variant")],
    ["sol_db_f_trans", t("sol_db_v_trans")],
    ["sol_db_f_drive", t("sol_db_v_fwd")],
    ["sol_db_f_fuel", t("sol_db_v_petrol")],
    ["sol_db_f_market", t("sol_db_v_market")],
  ];
  // Engineering notation as the explainer writes it (fitmentFormat.ts): the
  // unit marks are the same in both languages, the decimal mark is not.
  const wheelRows: readonly (readonly [label: CopyKey, value: string])[] = [
    ["sol_db_f_pcd", `${wheel.boltCount} × ${n(wheel.pcdMm)}`],
    ["sol_db_f_bore", `${n(wheel.centerBoreMm)} mm`],
    ["sol_db_f_offset", `ET ${n(wheel.offsetMm)}`],
    ["sol_db_f_rim", `${n(wheel.rimDiameterIn)}″ × ${n(wheel.rimWidthIn)}J`],
    ["sol_db_f_tire", `${tire.widthMm}/${tire.aspect} R${tire.rimIn}`],
  ];
  const wheelStatus = STATUSES.find(([status]) => status === wheel.status)!;

  return (
    <section id="vehicle-database" className="mb-sol-db" aria-labelledby="mb-sol-db-h">
      <div className="mb-section-inner">
        <header className="mb-sol-head">
          <div data-rev="0" className="mb-kicker">
            {t("sol_db_kicker")}
          </div>
          <h2 id="mb-sol-db-h" data-rev="1" className="mb-h2 mb-sol-h2">
            {t("sol_db_h2")}
          </h2>
          <p data-rev="2" className="mb-sol-head-p">
            {t("sol_db_p")}
          </p>
        </header>

        <div data-rev="2" className="mb-sol-db-fig">
          <div className="mb-sol-db-ladder">
            <h3 className="mb-sol-db-h3">{t("sol_db_ladder")}</h3>
            <ol className="mb-sol-db-rungs">
              {VEHICLE_DB.levels.map((level) => (
                <li key={level.label} className="mb-sol-db-rung">
                  <span className="mb-sol-db-node" aria-hidden />
                  <span className="mb-sol-db-label">{t(level.label)}</span>
                  <span className="mb-sol-db-count">{countLabel(lang, level.count)}</span>
                  <span className="mb-sol-db-path">
                    <span className="mb-sol-sr">{t("sol_db_eg")} </span>
                    {typeof level.sample === "number" ? String(level.sample) : t(level.sample)}
                  </span>
                </li>
              ))}
            </ol>
            <ul className="mb-sol-db-facts">
              <li>{t("sol_db_types")}</li>
              <li>{t("sol_db_ev").replace("{n}", countLabel(lang, VEHICLE_DB.electricModels))}</li>
              <li>{t("sol_db_ymm").replace("{n}", countLabel(lang, VEHICLE_DB.ymm))}</li>
            </ul>
          </div>

          <article className="mb-sol-db-card" aria-labelledby="mb-sol-db-card-t">
            <div className="mb-sol-db-card-top">
              <h3 id="mb-sol-db-card-t" className="mb-sol-db-card-t">
                {`${t("sol_db_v_make")} ${t("sol_db_v_model")} ${sample.year}`}
              </h3>
              <span className="mb-sol-db-tag">{t("sol_db_card_tag")}</span>
            </div>

            <h4 className="mb-sol-db-group">{t("sol_db_card_veh")}</h4>
            <dl className="mb-sol-db-rows">
              {vehicleRows.slice(0, 3).map(([label, value]) => (
                <div key={label}>
                  <dt>{t(label)}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div>
                <dt>{t("sol_db_f_engine")}</dt>
                <dd>
                  <span>{t("sol_db_v_engine")}</span>, <span>{`${n(sample.engineCc)} cc`}</span>
                </dd>
              </div>
              {vehicleRows.slice(3).map(([label, value]) => (
                <div key={label}>
                  <dt>{t(label)}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mb-sol-db-group-row">
              <h4 className="mb-sol-db-group">{t("sol_db_card_whl")}</h4>
              <span className="mb-sol-db-status">
                <StatusMark status={wheel.status} />
                {t(wheelStatus[1])}
              </span>
            </div>
            <dl className="mb-sol-db-rows">
              {wheelRows.map(([label, value]) => (
                <div key={label}>
                  <dt>{t(label)}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mb-sol-db-legend">
              <p>{t("sol_db_legend")}</p>
              <ul>
                {STATUSES.map(([status, label]) => (
                  <li key={status} className={status === wheel.status ? "is-current" : undefined}>
                    <StatusMark status={status} />
                    {t(label)}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>

        <figure data-rev="0" className="mb-sol-db-wheel">
          <div
            className="mb-sol-db-wheel-art"
            style={{ "--label-y": `${(WHEEL.labelY / WHEEL.h) * 100}%` } as CSSProperties}
          >
            <Image
              className="mb-sol-db-wheel-img"
              src={WHEEL.src}
              alt={t("sol_db_whl_alt")}
              width={WHEEL.w}
              height={WHEEL.h}
              sizes="(max-width: 1340px) 100vw, 1280px"
            />
            <svg
              className="mb-sol-db-wheel-lines"
              viewBox={`0 0 ${WHEEL.w} ${WHEEL.h}`}
              aria-hidden
              focusable="false"
            >
              {WHEEL_PARTS.map((p) => (
                <g key={p.x}>
                  <line x1={p.x} y1={p.y} x2={p.x} y2={WHEEL.labelY - 10} />
                  <circle cx={p.x} cy={p.y} r={5} />
                </g>
              ))}
            </svg>
            <ul className="mb-sol-db-wheel-parts">
              {WHEEL_PARTS.map((p) => (
                <li key={p.x} style={{ "--x": `${(p.x / WHEEL.w) * 100}%` } as CSSProperties}>
                  {p.labels.map((label) => (
                    <span key={label}>{t(label)}</span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
          <figcaption className="mb-sol-db-wheel-cap">{t("sol_db_whl_cap")}</figcaption>
        </figure>

        <p className="mb-sol-db-scope">{t("sol_db_scope").replace("{date}", asOfLabel(lang))}</p>
      </div>
    </section>
  );
}
