"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

const MAX_TRANSLATE_PX = 3;

/**
 * Magnetic CTA hover effect (Hypothesis C):
 * - Gentle pointer-following shift (max ±3px) on hovered CTA buttons/links.
 * - Enforces @media (hover: hover) and prefers-reduced-motion check.
 * - Resets on pointer leave without layout shift.
 */
export function useMagneticCTA<T extends HTMLElement = HTMLAnchorElement>() {
  const ref = useRef<T | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    // Verify pointer hover capabilities
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (!canHover) return;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.15;
        const deltaY = (e.clientY - centerY) * 0.15;

        const clampX = Math.max(-MAX_TRANSLATE_PX, Math.min(MAX_TRANSLATE_PX, deltaX));
        const clampY = Math.max(-MAX_TRANSLATE_PX, Math.min(MAX_TRANSLATE_PX, deltaY));

        el.style.transform = `translate3d(${clampX.toFixed(2)}px, ${clampY.toFixed(2)}px, 0px)`;
      });
    };

    const handleMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = "translate3d(0px, 0px, 0px)";
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.style.transform = "";
    };
  }, [reduced]);

  return ref;
}
