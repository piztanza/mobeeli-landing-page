import type { Lang } from "./copy";

/**
 * Hero H1 rotation (F-003) — phrase pairs and timing, VERBATIM from the
 * approved design (Mobeeli Landing.dc.html ROT map + startRotate()).
 */

/** Interval between phrase swaps (design: setInterval 3400ms). */
export const ROTATION_INTERVAL_MS = 3400;
/** Slide/fade transition duration (design: .45s cubic-bezier(.2,.6,.2,1)). */
export const ROTATION_TRANSITION_MS = 450;
/** Delay before the outgoing text is swapped for the next pair (design: 460ms). */
export const ROTATION_SWAP_DELAY_MS = 460;
/** Transition easing for both lines. */
export const ROTATION_EASING = "cubic-bezier(.2,.6,.2,1)";

export type RotationPair = readonly [line1: string, line2: string];

export const ROTATION_PAIRS: Record<Lang, readonly RotationPair[]> = {
  en: [
    ["Every part,", "verified to fit."],
    ["One platform,", "to unify the auto industry."],
    ["Every checkout,", "protected on both sides."],
    ["Every seller,", "keeping more of every sale."],
  ],
  id: [
    ["Setiap suku cadang,", "dipastikan cocok."],
    ["Satu platform,", "menyatukan industri otomotif."],
    ["Setiap checkout,", "aman dua belah pihak."],
    ["Setiap penjual,", "untung lebih tiap transaksi."],
  ],
};
