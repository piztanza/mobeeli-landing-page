import { copy, langs, type CopyKey, type Lang } from "./copy";

/** Default site language (configurable per F-004). */
export const DEFAULT_LANG: Lang = "en";

/** localStorage key the language toggle persists under (per the approved design). */
export const LANG_STORAGE_KEY = "mobeeli-lang";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (langs as readonly string[]).includes(value);
}

/** Resolve a copy key for a language. All user-facing strings go through this. */
export function t(lang: Lang, key: CopyKey): string {
  return copy[lang][key];
}

export { copy, langs };
export type { CopyKey, Lang };
