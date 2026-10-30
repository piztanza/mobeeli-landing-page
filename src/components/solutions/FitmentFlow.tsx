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
 * Run stages. 0 is armed (nothing resolved yet); 1 the car matched; 2 the fit
 * solved; 3 verified in the store. The server renders 3 — the complete figure
 * — and only a client with motion allowed ever steps back to play it forward.
 */
type Stage = 0 | 1 | 2 | 3;

/** What a run re-plays: a new car re-runs the whole flow; a new part only
 *  re-solves the engine — the store's verdicts depend on the car alone, so it
 *  stays as it is (data-run on the figure). */
type RunKind = "car" | "part";

/** When stages 1–3 land after a full car run starts (ms). Stage 2's rows then
 *  tick on their own CSS stagger inside the 800ms before stage 3. */
export const RUN: readonly (readonly [atMs: number, stage: Stage])[] = [
  [90, 1],
  [700, 2],
  [1500, 3],
];

/** A part pick starts at stage 1: the engine re-checks, then the run settles. */
export const RESOLVE: readonly (readonly [atMs: number, stage: Stage])[] = [
  [40, 2],
  [800, 3],
];

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

type NodeIcon = "data" | "store";

function NodeGlyph({ icon }: { icon: NodeIcon }) {
  const paths: Record<NodeIcon, ReactNode> = {
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

/** A panel head: the step number, an icon chip, the title and one line under it.
 *  The numbers are real sequence — the car, then the engine, then the store. */
function NodeHead({
  step,
  icon,
  id,
  title,
  sub,
  out = false,
}: {
  step: number;
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
        <span className="mb-sol-step" aria-hidden>
          {step}
        </span>
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
 * A connector between two panels in the single figure row, drawn in a 100×100
 * box stretched to its grid cell (preserveAspectRatio none; non-scaling-stroke
 * keeps it crisp). The panels sit centred in the row, so the line runs at y=50.
 */
function Connector({ which }: { which: "a" | "b" }) {
  return (
    <div className={`mb-sol-link mb-sol-link--${which}`} aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <path className="mb-sol-link-base" d="M0 50H100" vectorEffect="non-scaling-stroke" />
        <path
          className="mb-sol-link-flow"
          d="M0 50H100"
          pathLength={100}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/**
 * The /solutions fitment-flow explainer (2026-10-31, cut to three panels the
 * same day). (1) The car, as Mobeeli's Indonesian vehicle data describes it;
 * (2) the fitment engine checking the inspected part against it; (3) the store,
 * with the shopper's car in My Garage and a verdict on every part.
 *
 * Interaction: pick a car (re-runs the whole flow), or pick a part in the store
 * (re-solves just the engine). Every verdict is computed by fitmentSolver.ts;
 * every string by fitmentFormat.ts.
 *
 * Motion, progressive-enhancement + in-view gated (PlatformFlow's contract):
 *   • the server renders stage 3 — the whole resolved figure — so no-JS and
 *     reduced-motion visitors get everything, and all state CSS lives inside
 *     `screen and (prefers-reduced-motion: no-preference)`;
 *   • with motion allowed, an IntersectionObserver arms stage 0 while the
 *     figure is off screen and plays the sequence once it is in view;
 *   • under reduced motion the displayed stage is pinned to 3 and every choice
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
  const [stage, setStage] = useState<Stage>(3);
  const [runKind, setRunKind] = useState<RunKind>("car");
  const [live, setLive] = useState(false);
  const shown: Stage = reduced ? 3 : stage;

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
  // (the stacked phone layout) could never show a fixed share of itself at
  // once, and would wait at stage 0 forever. Never under reduced motion — the
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
    play("part", 1, RESOLVE);
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
        <div className="mb-sol-node mb-sol-node--veh mb-glass">
          <NodeHead step={1} icon="data" title={t("sol_fx_veh_t")} sub={t("sol_fx_veh_s")} />
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

        <Connector which="a" />

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
            <h3 className="mb-sol-engine-t">
              <span className="mb-sol-step" aria-hidden>
                2
              </span>
              {t("sol_fx_eng_t")}
            </h3>
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

        <Connector which="b" />

        <div className="mb-sol-node mb-sol-node--store mb-glass">
          <NodeHead
            step={3}
            icon="store"
            id={`${uid}-store`}
            title={t("sol_fx_store_t")}
            sub={t("sol_fx_store_s")}
            out
          />
          <div className="mb-sol-garage-chip">
            <span className="mb-sol-garage-badge">{t("garage_chip_label")}</span>
            <span className="mb-sol-garage-val">
              {carName} <span className="mb-sol-car-y">{vehicle.year}</span>
            </span>
          </div>
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

        <span className="mb-sol-arrow mb-sol-arrow--in" aria-hidden />
        <span className="mb-sol-arrow mb-sol-arrow--out" aria-hidden />
      </div>

      <figcaption className="mb-sol-sr">{t("sol_fx_a11y")}</figcaption>
    </figure>
  );
}
