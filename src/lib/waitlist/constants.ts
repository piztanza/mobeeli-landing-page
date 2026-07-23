/**
 * Wizard option values from the approved Join Waitlist design. These are DATA
 * values (submitted verbatim and rendered untranslated by the design's script),
 * not copy — translated labels (pickCity/cityOther/pickVolume) live in the
 * i18n maps as jw_* keys.
 */

/** Tool chips shown on step 4/4 for GARAGE only. */
export const GARAGE_TOOLS = [
  "Excel",
  "Buku Manual",
  "Scanner",
  // Generic per CLAUDE.md rule #2 — never name specific marketplaces
  // (was "Tokopedia/Shopee").
  "Marketplace Online",
  "WhatsApp Order",
  "Custom POS",
  "None",
] as const;

/** City <select> values on step 3/4; "Other" renders via jw_cityOther. */
export const CITY_OPTIONS = [
  "Jakarta",
  "Tangerang",
  "Bekasi",
  "Depok",
  "Bogor",
  "Bandung",
  "Surabaya",
  "Semarang",
  "Medan",
  "Other",
] as const;

/** Monthly order volume <select> options: [value, label]. */
export const VOLUME_OPTIONS = [
  ["<10", "<10"],
  ["10-50", "10–50"],
  ["50-200", "50–200"],
  ["200+", "200+"],
] as const;

/**
 * Provenance tag written to partner_signups.source for every lead from this
 * site — distinguishes landing leads from the platform's own LANDING_PLATFORM.
 */
export const LEAD_SOURCE = "LANDING_MOBEELI_COM";
