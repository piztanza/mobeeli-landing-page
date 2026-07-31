import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Mobile-pass contracts (2026-07-30) — CSS-text pins for the guarantees the
 * mobile hyper-pass shipped. Research basis (Round 0, cited so future edits
 * know what they are arguing with):
 *   - svh/dvh: Baseline Widely Available since June 2025 — the repo pairs
 *     svh AFTER a vh fallback in the same block, never bare svh.
 *   - iOS Safari still auto-zooms any focused input under 16px font-size.
 *   - Touch targets: WCAG 2.5.8 AA is a 24px minimum; iOS HIG asks 44pt,
 *     Material 48dp — 44px is the house floor under pointer:coarse.
 *   - Transform hovers stick on touch (tap latches :hover until the next
 *     tap) — they must live under @media (hover: hover).
 */

const landingCss = readFileSync(
  new URL("../src/components/landing/landing.css", import.meta.url),
  "utf8",
);
const globalsCss = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const joinCss = readFileSync(new URL("../src/components/join/join.css", import.meta.url), "utf8");

describe("dead 84px anchor offset stays dead", () => {
  it("no stylesheet reintroduces scroll-margin-top: 84px", () => {
    // The nav is position:absolute (founder no-sticky ruling) — the old
    // sticky-nav clearance made every anchor land 84px low.
    expect(landingCss).not.toContain("scroll-margin-top: 84px");
    expect(globalsCss).not.toContain("scroll-margin-top: 84px");
    // /join is the exception and MUST keep a scoped offset: its <Nav /> sits
    // in .mb-join-mobilenav { position: sticky } below 880px, so a flush skip
    // target parked 67px of <main> behind that bar. Blanket-banning
    // scroll-margin-top here (as this pin first did) is what shipped that
    // regression — the rule is "no offset where nothing is pinned", not
    // "no offsets".
    expect(joinCss).toMatch(
      /@media \(max-width: 879\.98px\) \{[^@]*\.mb-join #main-content \{\s*scroll-margin-top: 67px;/s,
    );
  });
});

describe("iOS viewport units (svh pairs, never bare svh)", () => {
  it("the nav sheet pairs 100svh after the 100vh fallback", () => {
    expect(landingCss).toMatch(
      /\.mb-nav-sheet \{[^}]*max-height: calc\(100vh - 66px\);[^}]*max-height: calc\(100svh - 66px\);/s,
    );
  });

  it("/join pairs 100svh after the 100vh fallback", () => {
    expect(joinCss).toMatch(/\.mb-join \{[^}]*min-height: 100vh;[^}]*min-height: 100svh;/s);
  });
});

describe("no-zoom inputs (CHG-piztanza-10, 16px floor on focusables)", () => {
  it("picker controls reach 16px on mobile, scoped (0,2,0) past the later 13px base", () => {
    expect(landingCss).toMatch(
      /\.mb-cat-panels \.mb-ymm-select,\s*\.mb-cat-panels \.mb-vin-input \{\s*font-size: 16px;/s,
    );
  });
});

describe("touch floor (pointer: coarse)", () => {
  it("the coarse-pointer block gives picker controls a 44px min-height", () => {
    expect(landingCss).toMatch(
      /@media \(pointer: coarse\) \{\s*\.mb-ymm-select,\s*\.mb-vin-btn,\s*\.mb-garage-clear \{\s*min-height: 44px;/s,
    );
  });
});

describe("part-card grid on phones (founder ruling 2026-07-31)", () => {
  it("shows two cards per row below 600px, not one", () => {
    // This deliberately overrides the contract's 184px column minimum: auto-fit
    // honouring that floor is what collapsed the grid to a single card per row.
    expect(landingCss).toMatch(
      /@media \(max-width: 600px\) \{\s*\.mb-cat-grid \{\s*grid-template-columns: repeat\(2, 1fr\);/s,
    );
  });

  it("keeps the fit chips on one line at the narrowest width", () => {
    // At 320px a two-up card is ~115px wide and the chips no longer fit the
    // mockup's 14px inset — "Does not fit" wrapped to two lines, which reads
    // as broken on a label. Measured fix: 10px inset + 6px chip padding +
    // nowrap. ID's "Terverifikasi" is the widest string at 98px and clears it.
    expect(landingCss).toMatch(
      /@media \(max-width: 359\.98px\) \{[^@]*\.mb-cat-grid \.mb-cat-verified \{[^}]*white-space: nowrap;/s,
    );
  });
});

describe("touch floor must not overlap its neighbours", () => {
  it("footer column links pull back at most half the column gap", () => {
    // .mb-footer-col is a flex column with gap: 10px, so a link's negative
    // margin is subtracted at BOTH ends of each gap: separation = 10 + 2*m.
    // The first version shipped -6px, i.e. a 2px OVERLAP between adjacent hit
    // areas (measured on prod: gaps -2,-2,-2) — a boundary tap hit the wrong
    // link, the exact failure a touch floor exists to prevent. -5px is the
    // zero-separation value; anything below it overlaps again.
    expect(landingCss).toMatch(/\.mb-footer-col a \{\s*padding: 8px 0;\s*margin: -5px 0;/s);
  });
});

describe("hover discipline on touch", () => {
  it("the part-card lift only runs where hover is real", () => {
    expect(landingCss).toMatch(
      /@media \(hover: hover\) \{\s*\.mb-ucat-card:not\(\.is-unfit\):hover \{[^}]*transform: translateY\(-3px\);/s,
    );
    // Exactly two occurrences: the gated lift and its reduced-motion `none`
    // companion (which must stay LATER in source to win for users with both
    // media active). A third, un-gated copy would re-break touch.
    expect(landingCss.match(/\.mb-ucat-card:not\(\.is-unfit\):hover/g)).toHaveLength(2);
  });
});

describe("fluid rhythm (clamp maxes = the old fixed desktop values)", () => {
  it("container pad and section rhythm compress on phones only", () => {
    expect(globalsCss).toContain("--mb-container-pad: clamp(18px, 5vw, 24px);");
    expect(globalsCss).toContain("--mb-section-y: clamp(56px, 12vw, 96px);");
  });
});

describe("picker ergonomics at phone widths", () => {
  it("goes single-column under 480 and steps the 10px micro-labels to 11px", () => {
    expect(landingCss).toMatch(
      /@media \(max-width: 479\.98px\) \{\s*\.mb-ymm-picker \{\s*grid-template-columns: 1fr;/s,
    );
    expect(landingCss).toMatch(
      /\.mb-ymm-field-label,\s*\.mb-sim-tag,\s*\.mb-ds-cod-label,\s*\.mb-ds-cod-lock,\s*\.mb-cat-scan-lock-t \{\s*font-size: 11px;/s,
    );
  });
});

describe("press feedback (house :active pattern)", () => {
  it("the VIN button joins the translateY(1px) group with its reduced-motion out", () => {
    expect(landingCss.match(/\.mb-vin-btn:active/g)?.length).toBe(2);
  });

  it("the contact send button's :active carries a reduced-motion companion", () => {
    expect(landingCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\.mb-ctform-send:active \{\s*transform: none;/s,
    );
  });
});

describe("breakpoint alignment (the 1024–1039 sliver)", () => {
  it("no content cutover sits at 1023.98 — the nav's hamburger cut is 1039.98", () => {
    // proof-grid and PlatformFlow used to switch 16px before the nav did,
    // showing mobile chrome over desktop content between 1024 and 1039.
    // (Pin the media-query form — comments may cite 1023.98 as history.)
    expect(landingCss).not.toContain("@media (max-width: 1023.98px)");
    expect(landingCss).toContain("@media (max-width: 1039.98px)");
  });
});

describe("footer behaves at odd widths", () => {
  it("footer columns wrap instead of squeezing", () => {
    expect(landingCss).toMatch(/\.mb-footer-menu \{[^}]*flex-wrap: wrap;/s);
  });
});
