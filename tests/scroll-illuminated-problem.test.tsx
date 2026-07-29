import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ProblemSection from "@/components/landing/ProblemSection";
import { copy, t } from "@/lib/i18n";

/**
 * R28 (CD handoff 2026-07-29) SUPERSEDED Proposal Q3's scroll-illuminated
 * headline: the problem band is now three depth planes (ghost numeral /
 * evidence image / overlapping quote) with a plain H2. The Q3 contract this
 * file used to pin — per-word .mb-word-illuminate spans — no longer renders;
 * its CSS remains in landing.css, unmounted not dead, same precedent as
 * prot_r*. What this file pins now is R28's ENGINEERING contract: the three
 * decisions the brief marked as real bugs during design.
 */
const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);

describe("R28 — problem band depth planes", () => {
  const html = renderToStaticMarkup(<ProblemSection />);

  it("renders the approved headline as a plain H2 (Q3 illuminate retired)", () => {
    expect(html).toContain(copy.en.prob_h2);
    expect(html).not.toContain("mb-word-illuminate");
    expect(html).toContain('class="mb-prob-h2"');
  });

  it("the ghost numeral is decoration: aria-hidden, non-interactive", () => {
    expect(html).toMatch(/class="mb-prob-ghost" aria-hidden="true"/);
    expect(landingCss).toMatch(/\.mb-prob-ghost \{[^}]*pointer-events: none;/s);
  });

  it("overlap is grid-track sharing, NOT absolute positioning (brief gotcha 2)", () => {
    // Image spans 1/9, quote spans 8/13 of one explicit row — they share
    // track 8, so the row sizes to the tallest child and the planes cannot
    // collide at any content length. An absolute quote collided at mid
    // widths during design; do not "simplify" back.
    // 2026-07-29 16:26 founder: the image grew a track (1/10); the quote
    // stays at 8/13, so the shared overlap is TWO tracks now.
    expect(landingCss).toMatch(/\.mb-prob-imgwrap \{[^}]*grid-column: 1 \/ 10;[^}]*grid-row: 1;/s);
    expect(landingCss).toMatch(/\.mb-prob-quote \{[^}]*grid-column: 8 \/ 13;[^}]*grid-row: 1;/s);
    expect(landingCss).not.toMatch(/\.mb-prob-quote \{[^}]*position: absolute/s);
  });

  it("the stat chip is a SIBLING of the overflow-hidden card (brief gotcha 3)", () => {
    // Inside the card, the -20px overhang gets clipped by overflow: hidden.
    expect(html).toMatch(/mb-prob-imgcard[\s\S]*?<\/div><div class="mb-prob-chip"/);
  });

  it("the mobile quote is border-box (brief gotcha 1)", () => {
    expect(landingCss).toMatch(
      /@media \(max-width: 979\.98px\) \{[\s\S]*?\.mb-prob-quote \{[^}]*box-sizing: border-box;[^}]*width: calc\(100% - 32px\);/,
    );
  });

  it("carries the COD-mechanism callout in Mobeeli's voice, and links the data page", () => {
    // FOUNDER 2026-07-29: the Senen testimony left the callout (seller
    // grievance in a buyer-pain band; adversarial; unverifiable). The card
    // is Mobeeli-voice mechanism now, so NORMAL i18n applies — the locales
    // must differ. quote_* keys stay defined, dormant (prot_r* precedent).
    expect(html).not.toContain(copy.en.quote_main);
    expect(copy.en.prob_call_h).not.toBe(copy.id.prob_call_h);
    expect(t("en", "quote_main")).toBeTruthy(); // dormant, not deleted
    expect(html).toContain('href="/why-mobeeli"');
    for (const lang of ["en", "id"] as const) {
      expect(t(lang, "prob_lede")).toBeTruthy();
      expect(t(lang, "prob_link")).toBeTruthy();
      expect(t(lang, "prob_badge")).toBeTruthy();
      expect(t(lang, "prob_chip_cap")).toBeTruthy();
      expect(t(lang, "prob_img_alt")).toBeTruthy();
      expect(t(lang, "prob_call_h")).toBeTruthy();
      expect(t(lang, "prob_call_p")).toBeTruthy();
      expect(t(lang, "prob_call_tag")).toBeTruthy();
    }
  });
});
