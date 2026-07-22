"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { NAV_SCROLL_OFFSET, scrollToSectionId } from "@/lib/scroll/sectionScroll";
import {
  isScrollspySuspended,
  resolveActive,
  resumeScrollspy,
  scrollspyArrived,
  spyRootMargin,
} from "@/lib/scroll/scrollspy";

/** Landing sections with nav anchors, in band order — the spy tracks these. */
export const SPY_SECTION_IDS = ["problem", "how-it-works", "why-now"] as const;

/** How long after the last scroll event an interrupted glide counts as over. */
const SETTLE_MS = 200;

const ActiveSectionContext = createContext<string | null>(null);

/** Id of the section the scrollspy marks active (null off-landing or above the first section). */
export function useActiveSection(): string | null {
  return useContext(ActiveSectionContext);
}

/**
 * Silent scrollspy for the landing page (F-001, CHG-piztanza-14): an
 * IntersectionObserver tracks which anchored section sits in the spy band,
 * publishes it as context state (Nav renders aria-current/data-active — no
 * visible styling yet), and mirrors it into the URL hash via replaceState
 * (no scroll jumps, no history entries). Programmatic scrolls suspend the
 * spy until arrival so the hash never flickers mid-glide. Also replays /#id
 * landings from other pages through the approved scroll math.
 */
export default function ActiveSectionProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Landing on /#id (nav from another page, shared link): after first paint,
  // replace the browser's native anchor jump with the approved scroll math
  // (centered short sections, 84px offset for tall ones) — instantly.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const raf = requestAnimationFrame(() => scrollToSectionId(id, { instant: true }));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const sections = SPY_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const visible = new Set<string>();
    let current: string | null = null;
    let settleTimer = 0;

    const commit = () => {
      if (isScrollspySuspended()) return;
      const beforeFirst =
        visible.size === 0 && sections[0].getBoundingClientRect().top > NAV_SCROLL_OFFSET;
      const next = resolveActive(SPY_SECTION_IDS, visible, current, beforeFirst);
      if (next === current) return;
      current = next;
      setActiveId(next);
      // replaceState only: no scroll jump, no history entry.
      history.replaceState(
        null,
        "",
        next ? `#${next}` : window.location.pathname + window.location.search,
      );
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        commit();
      },
      { rootMargin: spyRootMargin(NAV_SCROLL_OFFSET) },
    );
    for (const el of sections) io.observe(el);

    // Suspended (programmatic) scrolls resume on arrival at the target, or
    // SETTLE_MS after scrolling stops when the user interrupted the glide.
    const onScroll = () => {
      if (!isScrollspySuspended()) return;
      window.clearTimeout(settleTimer);
      if (scrollspyArrived(window.scrollY)) {
        resumeScrollspy();
        commit();
        return;
      }
      settleTimer = window.setTimeout(() => {
        resumeScrollspy();
        commit();
      }, SETTLE_MS);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settleTimer);
      resumeScrollspy();
    };
  }, []);

  return <ActiveSectionContext.Provider value={activeId}>{children}</ActiveSectionContext.Provider>;
}
