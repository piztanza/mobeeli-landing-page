/**
 * i18n copy maps — the ONLY place user-facing strings may live (EN + ID).
 *
 * Foundation note: this map holds the skeleton's minimal strings, taken
 * verbatim from the approved design (Mobeeli Landing.dc.html TXT maps).
 * The full approved key set ships with the i18n feature (F-004).
 */

export const langs = ["en", "id"] as const;
export type Lang = (typeof langs)[number];

const en = {
  "meta.title": "Mobeeli — Every part, verified to fit.",
  "nav.cta": "Join Waitlist",
  "hero.line1": "Every part,",
  "hero.line2": "verified to fit.",
  "join.title": "Join Waitlist",
} as const satisfies Record<string, string>;

export type CopyKey = keyof typeof en;

const id: Record<CopyKey, string> = {
  "meta.title": "Mobeeli — Setiap suku cadang, dipastikan cocok.",
  "nav.cta": "Join Waitlist",
  "hero.line1": "Setiap suku cadang,",
  "hero.line2": "dipastikan cocok.",
  "join.title": "Join Waitlist",
};

export const copy: Record<Lang, Record<CopyKey, string>> = { en, id };
