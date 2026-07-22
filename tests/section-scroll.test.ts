import { beforeEach, describe, expect, it } from "vitest";

import { SPY_SECTION_IDS } from "@/components/landing/ActiveSectionProvider";
import { NAV_SCROLL_OFFSET, sectionScrollTop } from "@/lib/scroll/sectionScroll";
import {
  isScrollspySuspended,
  resolveActive,
  resumeScrollspy,
  scrollspyArrived,
  spyRootMargin,
  suspendScrollspy,
} from "@/lib/scroll/scrollspy";

describe("nav scroll math (F-001, CHG-piztanza-14)", () => {
  it("uses the approved 84px sticky-nav offset", () => {
    expect(NAV_SCROLL_OFFSET).toBe(84);
  });

  it("top-aligns sections taller than the viewport below the nav", () => {
    expect(sectionScrollTop({ top: 3000, height: 2000, viewportHeight: 800 })).toBe(3000 - 84);
  });

  it("centers sections shorter than the viewport (the #why-now case)", () => {
    // (900 - 300) / 2 = 300px above the section — centered in the viewport.
    expect(sectionScrollTop({ top: 5000, height: 300, viewportHeight: 900 })).toBe(4700);
  });

  it("never lets centering tuck a near-viewport-height section under the nav", () => {
    // Centered offset would be 50px < 84px nav — clamp to the nav offset.
    expect(sectionScrollTop({ top: 5000, height: 800, viewportHeight: 900 })).toBe(5000 - 84);
  });

  it("transitions continuously at exactly viewport height (84px offset)", () => {
    expect(sectionScrollTop({ top: 5000, height: 900, viewportHeight: 900 })).toBe(5000 - 84);
  });

  it("never returns a negative scroll position", () => {
    expect(sectionScrollTop({ top: 40, height: 200, viewportHeight: 900 })).toBe(0);
  });
});

describe("scrollspy (F-001, CHG-piztanza-14)", () => {
  it("tracks exactly the nav-anchored landing sections in band order", () => {
    expect(SPY_SECTION_IDS).toEqual(["problem", "how-it-works", "why-now"]);
  });

  it("builds the spy band root margin below the sticky nav", () => {
    expect(spyRootMargin(NAV_SCROLL_OFFSET)).toBe("-84px 0px -45% 0px");
    expect(spyRootMargin(0)).toBe("-0px 0px -45% 0px");
  });

  const order = SPY_SECTION_IDS;

  it("activates the uppermost visible section", () => {
    expect(resolveActive(order, new Set(["how-it-works"]), null, false)).toBe("how-it-works");
    // Two in the band while scrolling — the earlier band wins.
    expect(resolveActive(order, new Set(["why-now", "how-it-works"]), null, false)).toBe(
      "how-it-works",
    );
  });

  it("keeps the previous section active through the gaps between anchors", () => {
    expect(resolveActive(order, new Set(), "how-it-works", false)).toBe("how-it-works");
  });

  it("clears the active section above the first anchor (back in the hero)", () => {
    expect(resolveActive(order, new Set(), "problem", true)).toBeNull();
  });
});

describe("scrollspy suspension during programmatic scrolls (CHG-piztanza-14)", () => {
  beforeEach(() => {
    resumeScrollspy();
  });

  it("is not suspended at rest", () => {
    expect(isScrollspySuspended()).toBe(false);
    expect(scrollspyArrived(1234)).toBe(false);
  });

  it("suspends until the scroll arrives at the target (2px tolerance)", () => {
    suspendScrollspy(1000);
    expect(isScrollspySuspended()).toBe(true);
    expect(scrollspyArrived(400)).toBe(false); // mid-glide — no hash flicker
    expect(scrollspyArrived(998)).toBe(true);
    expect(scrollspyArrived(1000)).toBe(true);
    expect(scrollspyArrived(1003)).toBe(false);
  });

  it("resumes on demand (arrival or interrupted glide)", () => {
    suspendScrollspy(1000);
    resumeScrollspy();
    expect(isScrollspySuspended()).toBe(false);
  });
});
