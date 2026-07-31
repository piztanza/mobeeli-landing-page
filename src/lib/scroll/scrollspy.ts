/*
 * Scrollspy primitives (F-001, CHG-piztanza-14) — the pure logic behind the
 * IntersectionObserver spy that silently tracks the active landing section
 * (see ActiveSectionProvider). Kept DOM-free so the selection and suspension
 * rules stay unit-testable in the node test environment.
 */

/**
 * Bottom slice of the viewport excluded from the spy band, so a section only
 * counts as active once it reaches the upper part of the screen rather than
 * the moment its first pixel enters from below.
 */
const SPY_BOTTOM_EXCLUSION = "45%";

/**
 * IntersectionObserver rootMargin for the spy band: inset from the top by
 * `navOffsetPx`, above the bottom exclusion. The only caller passes
 * NAV_SCROLL_OFFSET, which is 0 since the nav stopped reserving clearance —
 * the parameter stays so a future pinned header only has to set one number.
 */
export function spyRootMargin(navOffsetPx: number): string {
  return `-${navOffsetPx}px 0px -${SPY_BOTTOM_EXCLUSION} 0px`;
}

/**
 * Pick the active section: the first (uppermost) visible section in band
 * order wins; in the gaps between anchored sections the previous choice
 * sticks, except above the first section where nothing is active.
 */
export function resolveActive(
  order: readonly string[],
  visible: ReadonlySet<string>,
  previous: string | null,
  beforeFirst: boolean,
): string | null {
  for (const id of order) {
    if (visible.has(id)) return id;
  }
  return beforeFirst ? null : previous;
}

/*
 * Suspension — programmatic scrolls (nav clicks, /#id landings) suspend the
 * spy so the hash never flickers through the sections the glide crosses.
 * Module-level so the scroller (sectionScroll) and the spy
 * (ActiveSectionProvider) share one flag.
 */
let suspendedTargetY: number | null = null;

/** Suspend the spy until the window arrives at `targetY` (or scrolling stops). */
export function suspendScrollspy(targetY: number): void {
  suspendedTargetY = targetY;
}

export function isScrollspySuspended(): boolean {
  return suspendedTargetY !== null;
}

/** True once a suspended scroll has reached its target (within `epsilonPx`). */
export function scrollspyArrived(currentY: number, epsilonPx = 2): boolean {
  return suspendedTargetY !== null && Math.abs(currentY - suspendedTargetY) <= epsilonPx;
}

export function resumeScrollspy(): void {
  suspendedTargetY = null;
}
