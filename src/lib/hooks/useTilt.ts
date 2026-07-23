"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

const MAX_TILT_DEG = 9;

/**
 * 3D Pointer-Parallax Tilt Hook (R7 Proposal #4):
 * Updates --tilt-rx and --tilt-ry CSS custom properties on pointer movement over container.
 * Enforces @media (hover: hover) and prefers-reduced-motion check.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const canHover = window.matchMedia("(hover: hover)").matches;
    if (!canHover) return;

    let rafId: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
        const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

        const tiltRx = (-normY * MAX_TILT_DEG).toFixed(2);
        const tiltRy = (normX * MAX_TILT_DEG).toFixed(2);

        el.style.setProperty("--tilt-rx", `${tiltRx}deg`);
        el.style.setProperty("--tilt-ry", `${tiltRy}deg`);
      });
    };

    const handlePointerLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.style.setProperty("--tilt-rx", "0deg");
      el.style.setProperty("--tilt-ry", "0deg");
    };

    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
      el.style.removeProperty("--tilt-rx");
      el.style.removeProperty("--tilt-ry");
    };
  }, [reduced]);

  return ref;
}
