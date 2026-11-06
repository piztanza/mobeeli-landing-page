import { t, type CopyKey, type Lang } from "@/lib/i18n";
import { formatCount, formatDecimal } from "@/lib/i18n/format";

import { overallDiameterMm } from "./fitmentSolver";

/**
 * The Mobeeli Vehicle Database band's data (name: founder, 2026-11-04).
 *
 * COUNTS come from the platform's committed snapshot of the demo database
 * (overtakemg-cell/mobilee prisma/data/snapshots, exported 2026-10-29; the
 * production seed by founder decision of 2026-10-28). Every vehicle row there
 * is region "ID". The raw totals overstate — one row is one variant in one
 * model year, and the generation and model tables carry same-name duplicates —
 * so each count is rounded DOWN to what is safe to publish: 78 makes, about 700
 * models (702 raw), 1,000+ generations (1,108 raw), 1,800+ variants, model years
 * 1970–2026, 7,000+ year-make-model combinations (7,180), 100+ electric models
 * (110). Research: "Fitment database showcase and naming" (2026-11-04).
 *
 * The SAMPLE (founder, 2026-11-06) is the snapshot's own 2025 Toyota GR86 row
 * (id 258c5b0a…: ZN8, 2.4 GR86 (M/T & A/T), FA24D, 2,387 cc, A/T, RWD, petrol),
 * the car the front page's teardown shows. Its stock rim row (18 × 7.5J, ET 48,
 * 5 × 100, ⌀ 56.1 mm) and tire row (215/40 R18) were relabelled UNVERIFIED on
 * 2026-10-28 ("portal-only, one publisher"), so the card says "One source".
 * The UPGRADE is the founder's example aftermarket set, 18 × 8.5J ET 45 with
 * 245/35 R18, shown beside the stock values; it is not database data, and the
 * page names no wheel maker. Overall diameters come from fitmentSolver's own
 * formula: 629.2 mm stock, 628.7 mm upgraded, −0.5 mm (−0.08%). Load index and
 * speed rating stay off: filled on every row, checked on none.
 *
 * Refresh before relying on newer numbers: a read-only re-run of the platform's
 * scripts/snapshot-live-state.ts against the demo database.
 */

/** A published count: exact, "about n", or "n+" (rounded down), or a span. */
export type Count =
  | { kind: "exact"; value: number }
  | { kind: "about"; value: number }
  | { kind: "atLeast"; value: number }
  | { kind: "span"; from: number; to: number };

/** The status a wheel or tire value carries on the platform (VERIFIED,
 *  UNVERIFIED, ESTIMATED), worded on the page without the word "verified". */
export type SpecStatus = "checked" | "single" | "estimated";

export interface DbLevel {
  label: CopyKey;
  count: Count;
  /** The sample record's value at this level — a proper noun or a year. */
  sample: CopyKey | number;
}

export const VEHICLE_DB = {
  /** The snapshot the counts come from. */
  asOf: { year: 2026, month: 10 },
  levels: [
    { label: "sol_db_r1", count: { kind: "exact", value: 78 }, sample: "sol_db_v_make" },
    { label: "sol_db_r2", count: { kind: "about", value: 700 }, sample: "sol_db_v_model" },
    { label: "sol_db_r3", count: { kind: "atLeast", value: 1000 }, sample: "sol_db_v_gen" },
    { label: "sol_db_r4", count: { kind: "atLeast", value: 1800 }, sample: "sol_db_v_variant" },
    { label: "sol_db_r5", count: { kind: "span", from: 1970, to: 2026 }, sample: 2025 },
  ] satisfies readonly DbLevel[],
  ymm: { kind: "atLeast", value: 7000 } satisfies Count,
  electricModels: { kind: "atLeast", value: 100 } satisfies Count,
  sample: {
    year: 2025,
    engineCc: 2387,
    wheel: {
      boltCount: 5,
      pcdMm: 100,
      centerBoreMm: 56.1,
      offsetMm: 48,
      rimDiameterIn: 18,
      rimWidthIn: 7.5,
      status: "single" as SpecStatus,
    },
    tire: { widthMm: 215, aspect: 40, rimIn: 18 },
    /** The founder's example aftermarket set, set beside the stock values. */
    upgrade: {
      wheel: {
        boltCount: 5,
        pcdMm: 100,
        centerBoreMm: 56.1,
        offsetMm: 45,
        rimDiameterIn: 18,
        rimWidthIn: 8.5,
      },
      tire: { widthMm: 245, aspect: 35, rimIn: 18 },
    },
  },
} as const;

/** A count as the page prints it: "78", "about 700", "1,000+", "1970–2026". */
export function countLabel(lang: Lang, count: Count): string {
  switch (count.kind) {
    case "exact":
      return formatCount(lang, count.value);
    case "atLeast":
      return `${formatCount(lang, count.value)}+`;
    case "about":
      return t(lang, "sol_db_about").replace("{n}", formatCount(lang, count.value));
    case "span":
      // Years, not counts: never grouped.
      return `${count.from}–${count.to}`;
  }
}

const MONTH_YEAR = {
  en: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
  id: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }),
} satisfies Record<Lang, Intl.DateTimeFormat>;

/** The snapshot month: "October 2026" / "Oktober 2026". */
export function asOfLabel(lang: Lang): string {
  const { year, month } = VEHICLE_DB.asOf;
  return MONTH_YEAR[lang].format(new Date(Date.UTC(year, month - 1, 15)));
}

const PERCENT_2 = {
  en: new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  id: new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
} satisfies Record<Lang, Intl.NumberFormat>;

/** A signed value with the typographic minus (U+2212); zero prints unsigned. */
function signed(value: number, magnitude: string): string {
  return value > 0 ? `+${magnitude}` : value < 0 ? `−${magnitude}` : magnitude;
}

/**
 * The overall tire diameter, stock and upgraded, and the change between them:
 * "629.2 mm", "628.7 mm", "−0.5 mm (−0.08%)". Two decimals on the percentage,
 * because a change this small rounds to nothing at one.
 */
export function diameterChange(lang: Lang): { stock: string; upgrade: string; change: string } {
  const stock = Math.round(overallDiameterMm(VEHICLE_DB.sample.tire) * 10) / 10;
  const upgrade = Math.round(overallDiameterMm(VEHICLE_DB.sample.upgrade.tire) * 10) / 10;
  const mm = Math.round((upgrade - stock) * 10) / 10;
  const pct = (upgrade / stock - 1) * 100;
  const pctText = PERCENT_2[lang].format(Math.abs(pct));
  return {
    stock: `${formatDecimal(lang, stock)} mm`,
    upgrade: `${formatDecimal(lang, upgrade)} mm`,
    change: `${signed(mm, `${formatDecimal(lang, Math.abs(mm))} mm`)} (${signed(pct, `${pctText}%`)})`,
  };
}
