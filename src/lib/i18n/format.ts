import type { Lang } from "./copy";

/** Number locale per site language. Indonesian writes the decimal comma, the
 *  same convention the ID map already follows by hand ("⌀ 54,1 mm"). */
const LOCALE: Record<Lang, string> = { en: "en-US", id: "id-ID" };

/** One formatter per language and style, built on first use — a figure prints
 *  dozens of values per render, and a NumberFormat is not free to construct. */
const decimal = new Map<Lang, Intl.NumberFormat>();
const fixed1 = new Map<Lang, Intl.NumberFormat>();

function formatter(
  cache: Map<Lang, Intl.NumberFormat>,
  lang: Lang,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  let f = cache.get(lang);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE[lang], { useGrouping: false, ...options });
    cache.set(lang, f);
  }
  return f;
}

/**
 * A measurement, localized: at most one decimal, no thousands grouping (a
 * spec value is a dimension, not a price). 114.3 → "114.3" / "114,3".
 */
export function formatDecimal(lang: Lang, value: number): string {
  return formatter(decimal, lang, { maximumFractionDigits: 1 }).format(value);
}

/**
 * A ratio as a signed percentage with one decimal: 0.0712 → "+7.1%",
 * -0.0129 → "−1,3%" in Indonesian. The minus is the typographic U+2212, not a
 * hyphen; zero prints unsigned.
 */
export function formatSignedPercent(lang: Lang, ratio: number): string {
  const magnitude = formatter(fixed1, lang, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(ratio * 100));
  if (Math.round(Math.abs(ratio) * 1000) === 0) return `${magnitude}%`;
  return `${ratio > 0 ? "+" : "−"}${magnitude}%`;
}
