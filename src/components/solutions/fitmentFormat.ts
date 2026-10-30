import type { Lang } from "@/lib/i18n";
import { formatDecimal, formatSignedPercent } from "@/lib/i18n/format";

import type { DemoPart } from "./fitmentDemo";
import { OD_TOLERANCE, type Check, type TireSize, type VehicleFitment } from "./fitmentSolver";

/**
 * The explainer's view strings — PURE, so every car × part state the figure can
 * reach unit-tests without a DOM (tests/fitment-format.test.ts).
 *
 * Numbers go through the i18n formatter (the decimal comma in Indonesian, as
 * the ID map already writes "⌀ 54,1 mm"). The unit marks — ×, mm, ET, ″, J, R,
 * ≥, ± — are engineering notation, identical in both languages; the ID map
 * ships them as-is too ("ET 45", "PCD 4 × 100").
 */

/** A wheel has four checks and a tire two or three: the engine table always
 *  reserves four rows, so picking a part never changes its height. */
export const ENGINE_ROWS = 4;

function units(lang: Lang) {
  const n = (v: number) => formatDecimal(lang, v);
  return {
    n,
    pcd: (count: number, mm: number) => `${count} × ${n(mm)}`,
    mm: (v: number) => `${n(v)} mm`,
    wheel: (diameterIn: number, widthIn: number) => `${n(diameterIn)}″ × ${n(widthIn)}J`,
    /** A window of values: "17–18", or the single value when there is one. */
    span: (values: readonly number[]) => {
      const sorted = [...values].sort((a, b) => a - b);
      const [lo, hi] = [sorted[0], sorted[sorted.length - 1]];
      return lo === hi ? n(lo) : `${n(lo)}–${n(hi)}`;
    },
  };
}

/** Tire sizes are integers by construction (235/50 R18): no locale to apply. */
function tireSize(size: TireSize): string {
  return `${size.widthMm}/${size.aspect} R${size.rimIn}`;
}

/** A tire size with its load index appended only when one is on record. */
function withLoad(size: string, loadIndex?: number): string {
  return loadIndex === undefined ? size : `${size} ${loadIndex}`;
}

/** The catalogue record's full line: size, offset and bolt circle for a wheel. */
export function partLine(part: DemoPart, lang: Lang): string {
  const u = units(lang);
  const s = part.spec;
  return s.kind === "wheel"
    ? `${u.wheel(s.diameterIn, s.widthIn)} · ET ${u.n(s.offsetMm)} · ${u.pcd(s.boltCount, s.pcdMm)}`
    : withLoad(tireSize(s.size), s.loadIndex);
}

/** The storefront listing's shorter line: size (and offset for a wheel). The
 *  bolt circle stays on the catalogue record and in the engine's checks. */
export function listingLine(part: DemoPart, lang: Lang): string {
  const u = units(lang);
  const s = part.spec;
  return s.kind === "wheel"
    ? `${u.wheel(s.diameterIn, s.widthIn)} · ET ${u.n(s.offsetMm)}`
    : withLoad(tireSize(s.size), s.loadIndex);
}

/** The vehicle record's OE tire line. */
export function vehicleTireLine(car: VehicleFitment): string {
  return withLoad(tireSize(car.oeTire), car.oeLoadIndex);
}

/** The vehicle record's bolt pattern, bore and offset window. */
export function vehicleSpecs(car: VehicleFitment, lang: Lang) {
  const u = units(lang);
  return {
    pcd: u.pcd(car.boltCount, car.pcdMm),
    bore: u.mm(car.centerBoreMm),
    offset: `ET ${u.span([car.offsetMinMm, car.offsetMaxMm])}`,
  };
}

/**
 * The part's value and the car's window for one check — what the engine
 * compares, and what a rejected listing gives as its reason (the part side).
 * Every check a part kind can produce has its own case: a new check id fails
 * to compile here rather than falling through to the wrong row.
 */
export function checkValues(
  check: Check,
  part: DemoPart,
  car: VehicleFitment,
  lang: Lang,
): readonly [part: string, car: string] {
  const u = units(lang);
  const s = part.spec;
  if (s.kind === "wheel") {
    switch (check.id) {
      case "pcd":
        return [u.pcd(s.boltCount, s.pcdMm), u.pcd(car.boltCount, car.pcdMm)];
      case "bore":
        return [u.mm(s.centerBoreMm), `≥ ${u.mm(car.centerBoreMm)}`];
      case "offset":
        return [`ET ${u.n(s.offsetMm)}`, `ET ${u.span([car.offsetMinMm, car.offsetMaxMm])}`];
      case "rim":
        return [
          u.wheel(s.diameterIn, s.widthIn),
          `${u.span(car.rimDiametersIn)}″ · ${u.span([car.rimWidthMinIn, car.rimWidthMaxIn])}J`,
        ];
      case "diameter":
      case "load":
        throw new Error(`a wheel has no ${check.id} check`);
    }
  }
  switch (check.id) {
    case "rim":
      return [`R${s.size.rimIn}`, `R${u.span(car.rimDiametersIn)}`];
    case "diameter":
      return [formatSignedPercent(lang, check.deviation ?? 0), `±${u.n(OD_TOLERANCE * 100)}%`];
    case "load":
      // The load check only exists when the car's rating is on record.
      return [s.loadIndex === undefined ? "–" : String(s.loadIndex), `≥ ${car.oeLoadIndex}`];
    case "pcd":
    case "bore":
    case "offset":
      throw new Error(`a tire has no ${check.id} check`);
  }
}

/** The checks, padded with empty rows to ENGINE_ROWS. */
export function padRows<T>(checks: readonly T[]): (T | null)[] {
  return [...checks, ...Array.from({ length: ENGINE_ROWS - checks.length }, () => null)];
}
