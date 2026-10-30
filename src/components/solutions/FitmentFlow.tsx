"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { CopyKey } from "@/lib/i18n";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";

import { DEMO_PARTS, DEMO_VEHICLES, defaultPartFor, type DemoPart } from "./fitmentDemo";
import {
  checkValues,
  listingLine,
  padRows,
  partLine,
  vehicleSpecs,
  vehicleTireLine,
} from "./fitmentFormat";
import { checkPart, type CheckId, type CheckState, type FitResult } from "./fitmentSolver";

/**
 * Run stages. 0 is armed (nothing resolved yet); 1 catalogs standardized;
 * 2 vehicle matched; 3 fit solved; 4 verified in store. The server renders 4 —
 * the complete figure — and only a client with motion allowed ever steps back
 * to 0 to play the sequence forward.
 */
type Stage = 0 | 1 | 2 | 3 | 4;

/** What a run re-plays: a new car re-runs the whole flow; a new part only
 *  re-solves the engine and the garage verdict — the storefront's verdicts
 *  depend on the car alone, so it stays as it is (data-run on the figure). */
type RunKind = "car" | "part";

/** When stages 1–4 land after a full car run starts (ms). Stage 3's rows then
 *  tick on their own CSS stagger inside the 940ms before stage 4. */
export const RUN: readonly (readonly [atMs: number, stage: Stage])[] = [
  [90, 1],
  [760, 2],
  [1440, 3],
  [2380, 4],
];

/** A part pick starts at stage 2: the engine re-checks, then the garage updates. */
export const RESOLVE: readonly (readonly [atMs: number, stage: Stage])[] = [
  [40, 3],
  [900, 4],
];

const STAGE_LABELS: readonly CopyKey[] = ["sol_fx_st1", "sol_fx_st2", "sol_fx_st3", "sol_fx_st4"];

const CHECK_LABEL: Record<CheckId, CopyKey> = {
  pcd: "sol_fx_ck_pcd",
  bore: "sol_fx_ck_bore",
  offset: "sol_fx_ck_offset",
  rim: "sol_fx_ck_rim",
  diameter: "sol_fx_ck_od",
  load: "sol_fx_ck_load",
};

const STATE_LABEL: Record<CheckState, CopyKey> = {
  pass: "sol_fx_pass",
  ring: "sol_fx_ring_short",
  fail: "sol_fx_fail",
};

/* ---------- glyphs (stroke inherits currentColor, like PlatformFlow's) ---------- */

/** A wheel drawn with the part's real bolt count, or a tire in section. */
function PartGlyph({ part, size }: { part: DemoPart; size: number }) {
  const s = part.spec;
  return (
    <svg
      className="mb-sol-glyph"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      aria-hidden
      focusable="false"
    >
      {s.kind === "wheel" ? (
        <>
          <circle cx="12" cy="12" r="10.2" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="7.2" strokeWidth="1" />
          <circle cx="12" cy="12" r="1.9" strokeWidth="1.3" />
          {Array.from({ length: s.boltCount }, (_, i) => {
            const a = (i / s.boltCount) * Math.PI * 2 - Math.PI / 2;
            // Fixed to 2dp so server and client print identical attributes.
            return (
              <circle
                key={i}
                cx={(12 + 4.2 * Math.cos(a)).toFixed(2)}
                cy={(12 + 4.2 * Math.sin(a)).toFixed(2)}
                r="0.95"
                fill="currentColor"
                stroke="none"
              />
            );
          })}
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="9.6" strokeWidth="3" />
          <circle cx="12" cy="12" r="5.2" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="1.6" strokeWidth="1.2" />
        </>
      )}
    </svg>
  );
}

type NodeIcon = "catalog" | "data" | "store";

function NodeGlyph({ icon }: { icon: NodeIcon }) {
  const paths: Record<NodeIcon, ReactNode> = {
    catalog: (
      <>
        <path d="M8 3.5h9.5l2.5 2.5v13.5H8z" />
        <path d="M17.5 3.5V6H20" />
        <path d="M4.5 7v13.5h12" />
        <path d="M11 10h6M11 13.5h6M11 17h3.5" />
      </>
    ),
    data: (
      <>
        <ellipse cx="12" cy="5.8" rx="7" ry="2.6" />
        <path d="M5 5.8v12.4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V5.8" />
        <path d="M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6" />
      </>
    ),
    store: (
      <>
        <path d="M4 9h16v11H4z" />
        <path d="M4 9 6 4h12l2 5" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
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

function NodeHead({
  icon,
  id,
  title,
  sub,
  out = false,
}: {
  icon: NodeIcon;
  id?: string;
  title: string;
  sub: string;
  out?: boolean;
}) {
  return (
    <div className="mb-sol-nh">
      <span className={`mb-sol-nh-i${out ? " mb-sol-nh-i--out" : ""}`}>
        <NodeGlyph icon={icon} />
      </span>
      <h3 id={id} className="mb-sol-nh-t">
        {title}
      </h3>
      <p className="mb-sol-nh-s">{sub}</p>
    </div>
  );
}

/** The verdict disc: a check on a pass, a cross on a fail (colour from CSS). */
function VerdictDot({ state }: { state: CheckState | "fit" | "unfit" }) {
  const bad = state === "fail" || state === "unfit";
  return (
    <span className={`mb-sol-dot${bad ? " is-bad" : ""}`} aria-hidden>
      <svg viewBox="0 0 12 12" width="8" height="8" fill="none" stroke="#fff" strokeWidth="2">
        {bad ? <path d="m3 3 6 6M9 3l-6 6" /> : <path d="m2.5 6.2 2.3 2.3 4.7-4.9" />}
      </svg>
    </span>
  );
}

/**
 * A connector between two grid cells, drawn in a 100×100 box stretched to the
 * cell (preserveAspectRatio none; the stroke stays crisp via non-scaling-stroke).
 * Rows are equal height (1fr 1fr), so a panel's centre sits at y=50 of its
 * cell and the engine's centre at the row boundary (y=0 or y=100).
 */
function Connector({ which, d }: { which: "a" | "b" | "c" | "d"; d: string }) {
  return (
    <div className={`mb-sol-link mb-sol-link--${which}`} aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <path className="mb-sol-link-base" d={d} vectorEffect="non-scaling-stroke" />
        <path
          className="mb-sol-link-flow"
          d={d}
          pathLength={100}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/**
 * The /solutions fitment-flow explainer (2026-10-31). Manufacturer catalogs and
 * the Indonesian vehicle data API feed the fitment engine, which checks every
 * catalogue part against the chosen car; the live storefront then shows only
 * what fits and My Garage carries the verdict for the part being inspected.
 *
 * Interaction: pick a car (re-runs the whole flow), or pick a storefront part
 * (re-solves just that part: the engine and the garage verdict). Every verdict
 * is computed by fitmentSolver.ts; every string by fitmentFormat.ts.
 *
 * Motion, progressive-enhancement + in-view gated (PlatformFlow's contract):
 *   • the server renders stage 4 — the whole resolved figure — so no-JS and
 *     reduced-motion visitors get everything, and all state CSS lives inside
 *     `screen and (prefers-reduced-motion: no-preference)`;
 *   • with motion allowed, an IntersectionObserver arms stage 0 while the
 *     figure is off screen and plays the sequence once it is in view;
 *   • under reduced motion the displayed stage is pinned to 4 and every choice
 *     resolves instantly — the timers are never started.
 * The rendered stage, not a timer, drives every state: data-stage and data-run
 * on the figure.
 */
export default function FitmentFlow() {
  const t = useT();
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const uid = useId();
  const figRef = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);

  const [vehicleId, setVehicleId] = useState(DEMO_VEHICLES[0].id);
  const [partId, setPartId] = useState(() => defaultPartFor(DEMO_VEHICLES[0]));
  const [stage, setStage] = useState<Stage>(4);
  const [runKind, setRunKind] = useState<RunKind>("car");
  const [live, setLive] = useState(false);
  const shown: Stage = reduced ? 4 : stage;

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const play = useCallback(
    (kind: RunKind, from: Stage, steps: readonly (readonly [number, Stage])[]) => {
      clearTimers();
      if (reduced) return;
      setLive(true);
      setRunKind(kind);
      setStage(from);
      for (const [at, next] of steps) {
        timers.current.push(window.setTimeout(() => setStage(next), at));
      }
    },
    [clearTimers, reduced],
  );

  const run = useCallback(() => play("car", 0, RUN), [play]);

  // First run on arrival. Off screen, the figure is armed at stage 0; once it
  // reaches the upper three quarters of the viewport, it plays. A pixel-edge
  // margin rather than an area threshold: a figure taller than the viewport
  // (the stacked phone layout) could never show 20% of itself at once, and
  // would have waited at stage 0 forever. Never under reduced motion — the
  // effect does not even observe.
  useEffect(() => {
    const el = figRef.current;
    if (reduced || !el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          run();
        } else {
          setStage(0);
        }
      },
      { rootMargin: "0px 0px -25% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, run]);

  useEffect(() => clearTimers, [clearTimers]);

  const vehicle = DEMO_VEHICLES.find((v) => v.id === vehicleId) ?? DEMO_VEHICLES[0];
  const results: { part: DemoPart; result: FitResult }[] = DEMO_PARTS.map((part) => ({
    part,
    result: checkPart(vehicle.fitment, part.spec),
  }));
  const fitCount = results.filter((r) => r.result.fits).length;
  const inspected = results.find((r) => r.part.id === partId) ?? results[0];
  const ring = inspected.result.checks.some((c) => c.state === "ring");
  const carName = t(vehicle.name);
  const car = vehicle.fitment;
  const specs = vehicleSpecs(car, lang);

  const chooseVehicle = (id: string) => {
    const next = DEMO_VEHICLES.find((v) => v.id === id);
    if (!next) return;
    setVehicleId(id);
    setPartId(defaultPartFor(next));
    run();
  };

  const choosePart = (id: string) => {
    setPartId(id);
    play("part", 2, RESOLVE);
  };

  return (
    <figure
      ref={figRef}
      className="mb-sol-fig"
      data-stage={shown}
      data-run={runKind}
      data-live={live && !reduced ? "" : undefined}
    >
      <div className="mb-sol-fig-bar">
        <div className="mb-sol-cars" role="radiogroup" aria-labelledby={`${uid}-cars`}>
          <span id={`${uid}-cars`} className="mb-sol-cars-l">
            {t("sol_fx_try")}
          </span>
          {DEMO_VEHICLES.map((v) => (
            <span key={v.id} className="mb-sol-car">
              <input
                type="radio"
                className="mb-sol-radio"
                id={`${uid}-car-${v.id}`}
                name={`${uid}-car`}
                checked={v.id === vehicleId}
                onChange={() => chooseVehicle(v.id)}
              />
              <label htmlFor={`${uid}-car-${v.id}`} className="mb-sol-car-l">
                {/* The spaces between the label's parts keep its accessible
                    name readable ("BYD Seal Premium 2025", not "…Premium2025");
                    flex and grid layout ignore them visually. */}
                {t(v.name)} <span className="mb-sol-car-y">{v.year}</span>
              </label>
            </span>
          ))}
        </div>
        <div className="mb-sol-fig-tools">
          <span className="mb-sol-sim">
            {t("sol_fx_sample")} {t("cat_sim_tag")}
          </span>
          {!reduced && (
            <button type="button" className="mb-sol-replay" onClick={run}>
              <svg
                viewBox="0 0 24 24"
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
                <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
                <path d="M3.5 4v4.5H8" />
              </svg>
              {t("sol_fx_replay")}
            </button>
          )}
        </div>
      </div>

      <div className="mb-sol-fig-grid">
        <div className="mb-sol-node mb-sol-node--cat mb-glass">
          <NodeHead icon="catalog" title={t("sol_fx_cat_t")} sub={t("sol_fx_cat_s")} />
          <ul className="mb-sol-recs">
            {DEMO_PARTS.map((p, i) => (
              <li
                key={p.id}
                className={`mb-sol-rec${p.id === inspected.part.id ? " is-current" : ""}`}
                style={{ "--i": i } as CSSProperties}
              >
                <PartGlyph part={p} size={18} />
                <span className="mb-sol-rec-n">{t(p.name)}</span>
                <span className="mb-sol-rec-s">{partLine(p, lang)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-sol-node mb-sol-node--veh mb-glass">
          <NodeHead icon="data" title={t("sol_fx_veh_t")} sub={t("sol_fx_veh_s")} />
          <div className="mb-sol-vrec">
            <div className="mb-sol-vrec-name">
              <span>{carName}</span>
              <span className="mb-sol-vrec-y">{vehicle.year}</span>
            </div>
            <dl className="mb-sol-vspecs">
              <div>
                <dt>{t("sol_fx_ck_pcd")}</dt>
                <dd>{specs.pcd}</dd>
              </div>
              <div>
                <dt>{t("sol_fx_ck_bore")}</dt>
                <dd>{specs.bore}</dd>
              </div>
              <div>
                <dt>{t("sol_fx_ck_offset")}</dt>
                <dd>{specs.offset}</dd>
              </div>
              <div>
                <dt>{t("sol_fx_v_tire")}</dt>
                <dd>{vehicleTireLine(car)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <Connector which="a" d="M0 50C55 50 45 100 100 100" />
        <Connector which="b" d="M0 50C55 50 45 0 100 0" />

        <div className="mb-sol-engine mb-glass">
          <div className="mb-sol-engine-head">
            {/* mobeeli-mark.png is 1200×1200: a square intrinsic keeps the
                ratio honest (the R20 lesson); CSS sets the painted size. */}
            <Image
              className="mb-sol-engine-mark"
              src="/assets/mobeeli-mark.png"
              alt=""
              width={40}
              height={40}
            />
            <h3 className="mb-sol-engine-t">{t("sol_fx_eng_t")}</h3>
          </div>
          <p className="mb-sol-engine-checking">
            {t("sol_fx_eng_checking")} <strong>{t(inspected.part.name)}</strong>{" "}
            <span className="mb-sol-engine-spec">{partLine(inspected.part, lang)}</span>
          </p>
          <table className="mb-sol-checks">
            <thead>
              <tr>
                <th scope="col">
                  <span className="mb-sol-sr">{t("sol_fx_col_check")}</span>
                </th>
                <th scope="col">{t("sol_fx_col_part")}</th>
                <th scope="col">{t("sol_fx_col_car")}</th>
                <th scope="col">
                  <span className="mb-sol-sr">{t("sol_fx_col_result")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {padRows(inspected.result.checks).map((check, i) => {
                // Pad rows hold the table at four rows, so a tire (two or three
                // checks) does not shrink the engine and shift the stacked
                // layout under the reader's finger. Hidden, and out of the
                // accessibility tree.
                if (check === null) {
                  return (
                    <tr key={`pad-${i}`} className="mb-sol-check-pad" aria-hidden>
                      <td colSpan={4}>&nbsp;</td>
                    </tr>
                  );
                }
                const [partValue, carValue] = checkValues(check, inspected.part, car, lang);
                return (
                  <tr
                    key={check.id}
                    className={`mb-sol-check is-${check.state}`}
                    style={{ "--i": i } as CSSProperties}
                  >
                    <th scope="row">{t(CHECK_LABEL[check.id])}</th>
                    <td className="mb-sol-check-part">{partValue}</td>
                    <td>{carValue}</td>
                    <td className="mb-sol-check-state">
                      <VerdictDot state={check.state} />
                      <span className="mb-sol-sr">{t(STATE_LABEL[check.state])}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mb-sol-verdict">
            <span className={`mb-sol-chip${inspected.result.fits ? "" : " is-unfit"}`}>
              <VerdictDot state={inspected.result.fits ? "fit" : "unfit"} />
              {t(inspected.result.fits ? "cat_part_verified" : "cat_chip_unfit")}
            </span>
            {ring && <span className="mb-sol-verdict-note">{t("sol_fx_ring_note")}</span>}
          </div>
        </div>

        <Connector which="c" d="M0 100C55 100 45 50 100 50" />
        <Connector which="d" d="M0 0C55 0 45 50 100 50" />

        <div className="mb-sol-node mb-sol-node--store mb-glass">
          <NodeHead
            icon="store"
            id={`${uid}-store`}
            title={t("sol_fx_store_t")}
            sub={t("sol_fx_store_s")}
            out
          />
          <div className="mb-sol-tiles" role="radiogroup" aria-labelledby={`${uid}-store`}>
            {results.map(({ part, result }) => {
              const why = result.checks.find((c) => c.state === "fail");
              return (
                <span key={part.id} className="mb-sol-tile-w">
                  <input
                    type="radio"
                    className="mb-sol-radio"
                    id={`${uid}-part-${part.id}`}
                    name={`${uid}-part`}
                    checked={part.id === inspected.part.id}
                    onChange={() => choosePart(part.id)}
                  />
                  <label
                    htmlFor={`${uid}-part-${part.id}`}
                    className={`mb-sol-tile${result.fits ? "" : " is-unfit"}`}
                  >
                    <PartGlyph part={part} size={26} />
                    <span className="mb-sol-tile-n">{t(part.name)}</span>{" "}
                    <span className="mb-sol-tile-s">{listingLine(part, lang)}</span>{" "}
                    <span className={`mb-sol-chip${result.fits ? "" : " is-unfit"}`}>
                      <VerdictDot state={result.fits ? "fit" : "unfit"} />
                      {t(result.fits ? "cat_part_verified" : "cat_chip_unfit")}
                    </span>{" "}
                    {why && (
                      <span className="mb-sol-tile-why">
                        {t(CHECK_LABEL[why.id])} {checkValues(why, part, car, lang)[0]}
                      </span>
                    )}
                  </label>
                </span>
              );
            })}
          </div>
          {/* Names the car and the hidden parts: the Atto 3 and the Seal both
              come to "2 of 4", and a live region that does not change says
              nothing when the reader switches between them. */}
          <p className="mb-sol-count" aria-live="polite">
            {t("sol_fx_count")
              .replace("{fit}", String(fitCount))
              .replace("{total}", String(results.length))
              .replace("{car}", carName)
              .replace("{hidden}", String(results.length - fitCount))}
          </p>
        </div>

        <div className="mb-sol-node mb-sol-node--garage mb-glass">
          <div className="mb-sol-garage-chip">
            <span className="mb-sol-garage-badge">{t("garage_chip_label")}</span>
            <span className="mb-sol-garage-val">
              {carName} <span className="mb-sol-car-y">{vehicle.year}</span>
            </span>
          </div>
          <div className="mb-sol-pdp">
            <PartGlyph part={inspected.part} size={36} />
            <div className="mb-sol-pdp-body">
              <div className="mb-sol-pdp-n">{t(inspected.part.name)}</div>
              <div className="mb-sol-pdp-s">{partLine(inspected.part, lang)}</div>
              <div className={`mb-sol-pdp-verdict${inspected.result.fits ? "" : " is-unfit"}`}>
                <VerdictDot state={inspected.result.fits ? "fit" : "unfit"} />
                {t(inspected.result.fits ? "sol_fx_garage_fit" : "sol_fx_garage_unfit").replace(
                  "{car}",
                  carName,
                )}
              </div>
              {ring && <div className="mb-sol-pdp-note">{t("sol_fx_ring_note")}</div>}
            </div>
          </div>
        </div>

        <span className="mb-sol-arrow mb-sol-arrow--in" aria-hidden />
        <span className="mb-sol-arrow mb-sol-arrow--out" aria-hidden />
      </div>

      <ol className="mb-sol-rail">
        {STAGE_LABELS.map((key, i) => (
          <li key={key} className={`mb-sol-rail-step${shown > i ? " is-done" : ""}`}>
            <span className="mb-sol-rail-n">{i + 1}</span>
            {t(key)}
          </li>
        ))}
      </ol>

      <figcaption className="mb-sol-sr">{t("sol_fx_a11y")}</figcaption>
    </figure>
  );
}
