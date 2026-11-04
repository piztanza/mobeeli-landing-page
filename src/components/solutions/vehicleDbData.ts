import { t, type CopyKey, type Lang } from "@/lib/i18n";
import { formatCount } from "@/lib/i18n/format";

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
 * The SAMPLE is the snapshot's own 2024 Toyota Avanza 1.5 G / G TSS row (Gen 3,
 * W101, 2NR-VE, 1,496 cc, CVT, FWD, petrol). Its rim row (5 × 100, ⌀ 54.1 mm,
 * ET 45, 16 × 6J) and tire row (195/60 R16) were relabelled ESTIMATED on
 * 2026-10-28 ("synthesized, not transcribed"), so the card shows that status.
 * The 5 × 100 bolt pattern also matches the 2026-10-31 fitment research. Load
 * index and speed rating stay off: filled on every row, checked on none.
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
    { label: "sol_db_r5", count: { kind: "span", from: 1970, to: 2026 }, sample: 2024 },
  ] satisfies readonly DbLevel[],
  ymm: { kind: "atLeast", value: 7000 } satisfies Count,
  electricModels: { kind: "atLeast", value: 100 } satisfies Count,
  sample: {
    year: 2024,
    engineCc: 1496,
    wheel: {
      boltCount: 5,
      pcdMm: 100,
      centerBoreMm: 54.1,
      offsetMm: 45,
      rimDiameterIn: 16,
      rimWidthIn: 6,
      status: "estimated" as SpecStatus,
    },
    tire: { widthMm: 195, aspect: 60, rimIn: 16 },
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
