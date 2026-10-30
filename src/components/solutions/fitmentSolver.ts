/**
 * Fitment solver for the /solutions explainer — PURE. No React, no DOM, no
 * side effects, so it unit-tests in isolation and renders identically on the
 * server and the client (no hydration risk). Same discipline as
 * platformFlowGeometry.ts: the figure DERIVES every verdict from the specs
 * below, so a part can never be shown as fitting a car its numbers rule out.
 *
 * The rules are the standard wheel-and-tire ones:
 *   wheel — same bolt count and bolt circle (PCD); a centre bore at least as
 *           large as the hub (larger fits with a hub-centric ring); offset
 *           inside the car's window; a rim diameter and width the car takes.
 *   tire  — a rim size the car takes; overall diameter within ±3% of OE (the
 *           common plus-sizing tolerance); load index at or above OE, which
 *           matters more than usual on heavy EVs.
 * Each dimension is checked against its own window, independently. That is
 * enough for a demonstration; a production solver also checks combinations
 * (width against offset for clearance, a plus-size wheel against the tires
 * that suit it), which windows taken one at a time cannot see.
 * Every check is reported, not just the first failure: the figure shows why.
 */

/** Plus-sizing tolerance on overall diameter, as a fraction of OE. */
export const OD_TOLERANCE = 0.03;

/** Bolt circles and bores are quoted to a tenth of a millimetre; two values
 *  closer than this are the same measurement. */
const MM_EPSILON = 0.05;

export interface TireSize {
  widthMm: number;
  aspect: number;
  rimIn: number;
}

/** What the car accepts — the vehicle data API's side of every check. */
export interface VehicleFitment {
  boltCount: number;
  pcdMm: number;
  centerBoreMm: number;
  offsetMinMm: number;
  offsetMaxMm: number;
  /** Rim diameters the car takes: OE plus the plus-sizes that clear. */
  rimDiametersIn: readonly number[];
  rimWidthMinIn: number;
  rimWidthMaxIn: number;
  /** The OE tire — the reference for overall diameter. */
  oeTire: TireSize;
  /** OE load index, when a source states one. Absent, the load check is
   *  omitted rather than guessed: no Indonesian brochure or spec page found in
   *  the 2026-10-31 research publishes it. */
  oeLoadIndex?: number;
}

export interface WheelSpec {
  kind: "wheel";
  diameterIn: number;
  widthIn: number;
  offsetMm: number;
  boltCount: number;
  pcdMm: number;
  centerBoreMm: number;
}

export interface TireSpec {
  kind: "tire";
  size: TireSize;
  /** A tire that states no rating cannot pass a car that has one. */
  loadIndex?: number;
}

export type PartSpec = WheelSpec | TireSpec;

export type CheckId = "pcd" | "bore" | "offset" | "rim" | "diameter" | "load";

/** "ring" is a pass that needs a hub-centric ring — it fits, with a note. */
export type CheckState = "pass" | "ring" | "fail";

export interface Check {
  id: CheckId;
  state: CheckState;
  /** Signed overall-diameter deviation from OE (diameter check only). */
  deviation?: number;
}

export interface FitResult {
  fits: boolean;
  checks: Check[];
}

/** Overall tire diameter in mm: the rim plus two sidewalls. */
export function overallDiameterMm(size: TireSize): number {
  return size.rimIn * 25.4 + (2 * size.widthMm * size.aspect) / 100;
}

const verdict = (ok: boolean): CheckState => (ok ? "pass" : "fail");

function checkWheel(car: VehicleFitment, wheel: WheelSpec): Check[] {
  const pcd = wheel.boltCount === car.boltCount && Math.abs(wheel.pcdMm - car.pcdMm) < MM_EPSILON;
  const boreGap = wheel.centerBoreMm - car.centerBoreMm;
  const bore: CheckState = boreGap < -MM_EPSILON ? "fail" : boreGap > MM_EPSILON ? "ring" : "pass";
  const offset = wheel.offsetMm >= car.offsetMinMm && wheel.offsetMm <= car.offsetMaxMm;
  const rim =
    car.rimDiametersIn.includes(wheel.diameterIn) &&
    wheel.widthIn >= car.rimWidthMinIn &&
    wheel.widthIn <= car.rimWidthMaxIn;
  return [
    { id: "pcd", state: verdict(pcd) },
    { id: "bore", state: bore },
    { id: "offset", state: verdict(offset) },
    { id: "rim", state: verdict(rim) },
  ];
}

function checkTire(car: VehicleFitment, tire: TireSpec): Check[] {
  const deviation = overallDiameterMm(tire.size) / overallDiameterMm(car.oeTire) - 1;
  const checks: Check[] = [
    { id: "rim", state: verdict(car.rimDiametersIn.includes(tire.size.rimIn)) },
    { id: "diameter", state: verdict(Math.abs(deviation) <= OD_TOLERANCE), deviation },
  ];
  if (car.oeLoadIndex !== undefined) {
    const load = tire.loadIndex !== undefined && tire.loadIndex >= car.oeLoadIndex;
    checks.push({ id: "load", state: verdict(load) });
  }
  return checks;
}

/** Check one catalogue part against one car. Fits only if no check fails. */
export function checkPart(car: VehicleFitment, part: PartSpec): FitResult {
  const checks = part.kind === "wheel" ? checkWheel(car, part) : checkTire(car, part);
  return { fits: checks.every((c) => c.state !== "fail"), checks };
}
