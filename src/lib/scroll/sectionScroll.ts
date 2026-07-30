/*
 * Programmatic section scrolling (F-001, CHG-piztanza-14) — nav anchors no
 * longer rely on native hash scrolling (which ignores a re-click on the same
 * hash): every anchor click and /#id landing scrolls through here instead.
 * The scroll math is a pure function so it stays unit-testable.
 */

import { suspendScrollspy } from "./scrollspy";

/**
 * RETIRED to 0 (mobile pass 2026-07-30): the 84px value was the sticky-nav
 * clearance approved under F-001 — but the nav has been position:absolute
 * since the founder's no-sticky ruling (2026-07-28, .mb-nav--overlay), so
 * every anchor was landing 84px low, measured at all seven audit widths.
 * The constant stays exported: the scrollspy root margin derives from it.
 */
export const NAV_SCROLL_OFFSET = 0;

/**
 * Document scroll position for a section: sections shorter than the viewport
 * are centered vertically; taller sections top-align flush with the viewport
 * (nothing overlays the top any more). Never negative.
 */
export function sectionScrollTop(section: {
  top: number;
  height: number;
  viewportHeight: number;
}): number {
  const { top, height, viewportHeight } = section;
  const offset =
    height <= viewportHeight
      ? Math.max(NAV_SCROLL_OFFSET, (viewportHeight - height) / 2)
      : NAV_SCROLL_OFFSET;
  return Math.max(0, top - offset);
}

/**
 * Scroll the window to the section with `id` using the approved math, update
 * the URL hash via replaceState (no history entry, no native re-jump), and
 * suspend the scrollspy for the ride. Returns false when the id is not on
 * the page. `instant` jumps without animation (reduced motion, page load).
 */
export function scrollToSectionId(id: string, options?: { instant?: boolean }): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const top = Math.min(
    maxTop,
    sectionScrollTop({
      top: rect.top + window.scrollY,
      height: rect.height,
      viewportHeight: window.innerHeight,
    }),
  );
  // Suspend the spy until arrival (no hash flicker) — unless already there.
  if (Math.abs(top - window.scrollY) > 1) suspendScrollspy(top);
  window.scrollTo({ top, behavior: options?.instant ? "instant" : "smooth" });
  history.replaceState(null, "", `#${id}`);
  return true;
}
