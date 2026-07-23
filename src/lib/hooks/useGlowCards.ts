"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Q1: Cursor-tracked glow-border card system (Linear.app / Raycast style).
 * Attaches a single delegated `pointermove` listener to a section container.
 * Updates `--mx` and `--my` CSS custom properties on all child `.mb-glow-card`
 * elements in `requestAnimationFrame` without React re-renders.
 */
export function useGlowCards<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const sectionEl = ref.current;
    if (!sectionEl || reduced) return;

    const canHover = window.matchMedia("(hover: hover)").matches;
    if (!canHover) return;

    let rafId: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const cards = sectionEl.querySelectorAll<HTMLElement>(".mb-glow-card");
        const clientX = e.clientX;
        const clientY = e.clientY;

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const x = clientX - rect.left;
          const y = clientY - rect.top;
          card.style.setProperty("--mx", `${x.toFixed(1)}px`);
          card.style.setProperty("--my", `${y.toFixed(1)}px`);
        });
      });
    };

    const handlePointerLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      const cards = sectionEl.querySelectorAll<HTMLElement>(".mb-glow-card");
      cards.forEach((card) => {
        card.style.setProperty("--mx", "-9999px");
        card.style.setProperty("--my", "-9999px");
      });
    };

    sectionEl.addEventListener("pointermove", handlePointerMove);
    sectionEl.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      sectionEl.removeEventListener("pointermove", handlePointerMove);
      sectionEl.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [reduced]);

  return ref;
}
