"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

import type { CopyKey } from "@/lib/i18n";
import { formatDecimal } from "@/lib/i18n/format";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";

import {
  VEHICLE_DB,
  asOfLabel,
  countLabel,
  diameterChange,
  type SpecStatus,
} from "./vehicleDbData";

/** The status legend, in the platform's order: VERIFIED, UNVERIFIED, ESTIMATED. */
const STATUSES: readonly (readonly [status: SpecStatus, label: CopyKey])[] = [
  ["checked", "sol_db_st_checked"],
  ["single", "sol_db_st_single"],
  ["estimated", "sol_db_st_est"],
];

/**
 * The wheel teardown (public/assets/solutions/wheel-teardown.jpg, 1200×460, a
 * Gemini render, 2026-11-06: tire, six-spoke rim, slotted disc with caliper and
 * hub on one axle line, all facing outboard, sized to scale) and where each
 * wheel and tire field sits on it, in the image's pixels. Numbered left to
 * right, the way a parts diagram keys its callouts; the rows beside it use the
 * same numbers. Center bore points at the rim's center hole, offset at its
 * barrel, bolt pattern at the hub, whose five studs are the pattern.
 */
const WHEEL = { src: "/assets/solutions/wheel-teardown.jpg", w: 1200, h: 460 };
const WHEEL_PINS: readonly { field: CopyKey; x: number; y: number }[] = [
  { field: "sol_db_f_tire", x: 115, y: 140 },
  { field: "sol_db_f_rim", x: 475, y: 105 },
  { field: "sol_db_f_bore", x: 558, y: 225 },
  { field: "sol_db_f_offset", x: 685, y: 315 },
  { field: "sol_db_f_pcd", x: 1075, y: 225 },
];

/** A status mark: filled (checked against a source), ring (one source) or
 *  dashed ring (estimated). Shape, not colour, carries the state. */
function StatusMark({ status }: { status: SpecStatus }) {
  return <span className={`mb-sol-db-mark is-${status}`} aria-hidden />;
}

/**
 * The Mobeeli Vehicle Database band: the data itself, before the flow that
 * uses it. Across the top, the five levels from make to model year with their
 * counts and one real path lit through them; below, the record that path ends
 * at, as one sheet: its vehicle fields, then its wheel and tire values beside
 * the parts they measure, keyed by number, so a reader never has to match a
 * picture to a table somewhere else; each stock value sits beside an example
 * upgrade, ending with the overall diameter and its change. Static on purpose:
 * the fitment-flow band below stays the page's one motion moment. Every value
 * is text, so the panel needs no separate screen-reader summary.
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
    ["sol_db_f_drive", t("sol_db_v_rwd")],
    ["sol_db_f_fuel", t("sol_db_v_petrol")],
    ["sol_db_f_market", t("sol_db_v_market")],
  ];
  // Engineering notation as the explainer writes it (fitmentFormat.ts): the
  // unit marks are the same in both languages, the decimal mark is not.
  type Wheel = {
    boltCount: number;
    pcdMm: number;
    centerBoreMm: number;
    offsetMm: number;
    rimDiameterIn: number;
    rimWidthIn: number;
  };
  type Tire = { widthMm: number; aspect: number; rimIn: number };
  const specValues = (w: Wheel, ty: Tire): Partial<Record<CopyKey, string>> => ({
    sol_db_f_tire: `${ty.widthMm}/${ty.aspect} R${ty.rimIn}`,
    sol_db_f_rim: `${n(w.rimDiameterIn)}″ × ${n(w.rimWidthIn)}J`,
    sol_db_f_bore: `${n(w.centerBoreMm)} mm`,
    sol_db_f_offset: `ET ${n(w.offsetMm)}`,
    sol_db_f_pcd: `${w.boltCount} × ${n(w.pcdMm)}`,
  });
  const stockValues = specValues(wheel, tire);
  const upgradeValues = specValues(sample.upgrade.wheel, sample.upgrade.tire);
  const od = diameterChange(lang);
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
            <dl className="mb-sol-db-rows mb-sol-db-veh-rows">
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

            <div className="mb-sol-db-wheel">
              <div className="mb-sol-db-wheel-art">
                <Image
                  className="mb-sol-db-wheel-img"
                  src={WHEEL.src}
                  alt={t("sol_db_whl_alt")}
                  width={WHEEL.w}
                  height={WHEEL.h}
                  sizes="(max-width: 1039px) 100vw, 760px"
                />
                {WHEEL_PINS.map((pin, i) => (
                  <span
                    key={pin.field}
                    className="mb-sol-db-pin"
                    data-part={i + 1}
                    style={
                      {
                        "--x": `${(pin.x / WHEEL.w) * 100}%`,
                        "--y": `${(pin.y / WHEEL.h) * 100}%`,
                      } as CSSProperties
                    }
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                ))}
              </div>

              <div className="mb-sol-db-wheel-spec">
                <h4 className="mb-sol-db-group">{t("sol_db_card_whl")}</h4>
                <table className="mb-sol-db-wheel-rows">
                  <thead>
                    <tr>
                      <td />
                      <th scope="col">
                        <span className="mb-sol-db-colh">
                          <StatusMark status={wheel.status} />
                          {t("sol_db_stock")}
                        </span>
                        <span className="mb-sol-sr"> ({t(wheelStatus[1])})</span>
                      </th>
                      <th scope="col">{t("sol_db_upgrade")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WHEEL_PINS.map((pin, i) => (
                      <tr key={pin.field} data-part={i + 1}>
                        <th scope="row">
                          <span className="mb-sol-db-key" aria-hidden>
                            {i + 1}
                          </span>
                          {t(pin.field)}
                        </th>
                        <td>{stockValues[pin.field]}</td>
                        <td>{upgradeValues[pin.field]}</td>
                      </tr>
                    ))}
                    <tr className="mb-sol-db-od">
                      <th scope="row">
                        <span className="mb-sol-db-key is-blank" aria-hidden />
                        {t("sol_db_f_od")}
                      </th>
                      <td>{od.stock}</td>
                      <td>
                        {od.upgrade}
                        <span className="mb-sol-db-delta">{od.change}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="mb-sol-db-upg-note">{t("sol_db_upg_note")}</p>

                <div className="mb-sol-db-legend">
                  <p>{t("sol_db_legend")}</p>
                  <ul>
                    {STATUSES.map(([status, label]) => (
                      <li
                        key={status}
                        className={status === wheel.status ? "is-current" : undefined}
                      >
                        <StatusMark status={status} />
                        {t(label)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        </div>

        <p className="mb-sol-db-scope">{t("sol_db_scope").replace("{date}", asOfLabel(lang))}</p>
      </div>
    </section>
  );
}
