import { describe, expect, it } from "vitest";

import { langs, t } from "@/lib/i18n";
import {
  ROTATION_INTERVAL_MS,
  ROTATION_PAIRS,
  ROTATION_SWAP_DELAY_MS,
  ROTATION_TRANSITION_MS,
} from "@/lib/i18n/rotation";

describe("hero rotation config (F-003)", () => {
  it("rotates every ~3.4s with the approved transition timing", () => {
    expect(ROTATION_INTERVAL_MS).toBe(3400);
    expect(ROTATION_TRANSITION_MS).toBe(450);
    expect(ROTATION_SWAP_DELAY_MS).toBe(460);
    // the outgoing slide must finish before the text swap…
    expect(ROTATION_SWAP_DELAY_MS).toBeGreaterThanOrEqual(ROTATION_TRANSITION_MS);
    // …and swap + incoming slide must fit inside one interval
    expect(ROTATION_SWAP_DELAY_MS + ROTATION_TRANSITION_MS).toBeLessThan(ROTATION_INTERVAL_MS);
  });

  // H1 height reservation moved from a fixed min-height to per-pair sizers
  // (CHG-piztanza-18) — covered by tests/responsive-visual-fixes.test.tsx.

  it("has the four approved phrase pairs in both languages", () => {
    for (const lang of langs) {
      expect(ROTATION_PAIRS[lang], `pairs for '${lang}'`).toHaveLength(4);
      for (const [line1, line2] of ROTATION_PAIRS[lang]) {
        expect(line1.trim()).not.toBe("");
        expect(line2.trim()).not.toBe("");
      }
    }
    expect(ROTATION_PAIRS.en).toEqual([
      ["Every part,", "verified to fit."],
      ["One platform,", "to unify the auto industry."],
      ["Every checkout,", "protected on both sides."],
      ["Every seller,", "keeping more of every sale."],
    ]);
    expect(ROTATION_PAIRS.id).toEqual([
      ["Setiap suku cadang,", "dipastikan cocok."],
      ["Satu platform,", "menyatukan industri otomotif."],
      ["Setiap checkout,", "aman dua belah pihak."],
      ["Setiap penjual,", "untung lebih tiap transaksi."],
    ]);
  });

  it("starts on the foundation hero copy in every language", () => {
    for (const lang of langs) {
      expect(ROTATION_PAIRS[lang][0][0]).toBe(t(lang, "hero.line1"));
      expect(ROTATION_PAIRS[lang][0][1]).toBe(t(lang, "hero.line2"));
    }
  });
});
