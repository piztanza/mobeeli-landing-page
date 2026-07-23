"use client";

import { useEffect, type RefObject } from "react";

import { useReducedMotion } from "./useReducedMotion";

/**
 * Staggered scroll-reveal on all [data-rev] descendants — port of the approved
 * design's data-rev pattern (fade + 26px rise, 90ms stagger per rev index,
 * revealed at 8% visibility). Fully disabled under prefers-reduced-motion:
 * elements are never hidden, so content stays visible without JS or motion.
 */
export function useScrollReveal(ref: RefObject<HTMLElement | null>): void {
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced || typeof IntersectionObserver === "undefined") return;

    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-rev]"));
    for (const el of els) {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition =
        "opacity 480ms cubic-bezier(0.19, 1, 0.22, 1), transform 480ms cubic-bezier(0.19, 1, 0.22, 1)";
      el.style.transitionDelay = `${(Number(el.dataset.rev) || 0) * 70}ms`;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.style.opacity = "1";
          el.style.transform = "none";
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    for (const el of els) io.observe(el);

    return () => {
      io.disconnect();
      for (const el of els) {
        el.style.opacity = "";
        el.style.transform = "";
        el.style.transition = "";
        el.style.transitionDelay = "";
      }
    };
  }, [ref, reduced]);
}
