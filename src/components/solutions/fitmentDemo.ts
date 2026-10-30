import type { CopyKey } from "@/lib/i18n";

import { checkPart, type PartSpec, type VehicleFitment } from "./fitmentSolver";

/**
 * Sample data for the /solutions explainer, shown under cat_sim_tag.
 *
 * The VEHICLES are real Indonesian-market cars and every number on them is
 * sourced — research notes "Fitment commerce benchmarks for Mobeeli",
 * 2026-10-31 (high = official spec or two agreeing sources):
 *   BYD Atto 3 Superior — 235/50 R18 (and the 17-inch Advanced trim): the
 *     official Indonesian brochure, high. 5 × 114.3 / 60.1 mm: two databases
 *     agree, high. 17×6.5–18×7 at ET40 and the ET38–42 window: database rows
 *     and a hub-ring vendor, medium.
 *   BYD Seal Premium — 235/45 R19: an Indonesian spec page and a database row
 *     agree. 5 × 120 / 64.1 mm: two databases, high. 18×7 / 19×8 / 20×8 at
 *     ET40–45: database rows, medium.
 *   Hyundai Ioniq 5 Prime — 235/55 R19: two Indonesian spec pages, high.
 *     5 × 114.3 / 67.1 mm: two databases, high. 18×7.5–20×8.5 at ET49–54:
 *     database rows, medium.
 * Deliberately absent: OE load indexes (no Indonesian source publishes them,
 * so the solver omits that check rather than guess), and the BYD Dolphin,
 * whose Indonesian bolt pattern the sources contradict.
 *
 * The PARTS are generic, unbranded catalogue items invented for the demo. The
 * figure demonstrates the engine's reasoning on sourced inputs; it is not a
 * fitment recommendation for any real product.
 */

export interface DemoVehicle {
  id: string;
  /** Make, model and trim — a proper noun, identical in both copy maps. */
  name: CopyKey;
  year: number;
  fitment: VehicleFitment;
}

export interface DemoPart {
  id: string;
  name: CopyKey;
  spec: PartSpec;
}

export const DEMO_VEHICLES: readonly DemoVehicle[] = [
  {
    id: "atto3",
    name: "sol_fx_v_atto3",
    year: 2025,
    fitment: {
      boltCount: 5,
      pcdMm: 114.3,
      centerBoreMm: 60.1,
      offsetMinMm: 38,
      offsetMaxMm: 42,
      rimDiametersIn: [17, 18],
      rimWidthMinIn: 6.5,
      rimWidthMaxIn: 7,
      oeTire: { widthMm: 235, aspect: 50, rimIn: 18 },
    },
  },
  {
    id: "seal",
    name: "sol_fx_v_seal",
    year: 2025,
    fitment: {
      boltCount: 5,
      pcdMm: 120,
      centerBoreMm: 64.1,
      offsetMinMm: 40,
      offsetMaxMm: 45,
      rimDiametersIn: [18, 19, 20],
      rimWidthMinIn: 7,
      rimWidthMaxIn: 8,
      oeTire: { widthMm: 235, aspect: 45, rimIn: 19 },
    },
  },
  {
    id: "ioniq5",
    name: "sol_fx_v_ioniq5",
    year: 2025,
    fitment: {
      boltCount: 5,
      pcdMm: 114.3,
      centerBoreMm: 67.1,
      offsetMinMm: 49,
      offsetMaxMm: 54,
      rimDiametersIn: [18, 19, 20],
      rimWidthMinIn: 7.5,
      rimWidthMaxIn: 8.5,
      oeTire: { widthMm: 235, aspect: 55, rimIn: 19 },
    },
  },
];

/**
 * Four catalogue parts chosen so every car shows both outcomes for reasons a
 * buyer would recognise: the wrong bolt circle, an offset outside the car's
 * window, a rim size the car does not take, an overall diameter beyond ±3% —
 * and a hub-centric ring where the bore is larger than the hub. The same
 * 67.1 mm wheel needs a ring on the Atto 3 and none on the Ioniq 5.
 */
export const DEMO_PARTS: readonly DemoPart[] = [
  {
    id: "w18",
    name: "sol_fx_p_w18",
    spec: {
      kind: "wheel",
      diameterIn: 18,
      widthIn: 7,
      offsetMm: 40,
      boltCount: 5,
      pcdMm: 114.3,
      centerBoreMm: 67.1,
    },
  },
  {
    id: "w19",
    name: "sol_fx_p_w19",
    spec: {
      kind: "wheel",
      diameterIn: 19,
      widthIn: 8,
      offsetMm: 45,
      boltCount: 5,
      pcdMm: 120,
      centerBoreMm: 72.6,
    },
  },
  {
    id: "t18",
    name: "sol_fx_p_t18",
    spec: { kind: "tire", size: { widthMm: 235, aspect: 50, rimIn: 18 } },
  },
  {
    id: "t19",
    name: "sol_fx_p_t19",
    spec: { kind: "tire", size: { widthMm: 235, aspect: 55, rimIn: 19 } },
  },
];

/** The part a car opens on: the first one that fits, so the first impression is a verified fit. */
export function defaultPartFor(vehicle: DemoVehicle): string {
  return (DEMO_PARTS.find((p) => checkPart(vehicle.fitment, p.spec).fits) ?? DEMO_PARTS[0]).id;
}
