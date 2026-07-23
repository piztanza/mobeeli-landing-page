"use client";

import { useEffect, useState } from "react";

/**
 * Overlay-nav state for the landing page: false (transparent) while the hero
 * still sits under the 66px bar, true (solid) once it has scrolled past. SSR
 * renders transparent — the at-rest state at scrollY 0. Falls back to a
 * passive scroll listener when IntersectionObserver is unavailable, and fails
 * solid (always readable) when the hero element is missing.
 */
export function useOverlaySolid(enabled: boolean, heroId = "top"): boolean {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const hero = document.getElementById(heroId);
    if (!hero || typeof IntersectionObserver === "undefined") {
      const update = () => setSolid(hero ? window.scrollY > hero.offsetHeight - 66 : true);
      // First check runs in a frame callback, not the effect body (lint rule).
      const raf = requestAnimationFrame(update);
      window.addEventListener("scroll", update, { passive: true });
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("scroll", update);
      };
    }
    const observer = new IntersectionObserver(([entry]) => setSolid(!entry.isIntersecting), {
      rootMargin: "-66px 0px 0px 0px",
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [enabled, heroId]);
  return solid;
}
