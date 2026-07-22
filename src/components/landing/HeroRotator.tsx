"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useLang } from "@/lib/i18n/LanguageProvider";
import {
  HERO_H1_MIN_HEIGHT_EM,
  ROTATION_INTERVAL_MS,
  ROTATION_PAIRS,
  ROTATION_SWAP_DELAY_MS,
} from "@/lib/i18n/rotation";

/**
 * Hero H1 rotation (F-003) — cycles the four approved phrase pairs per
 * language every ~3.4s with the design's two-line slide transition.
 * Min-height is reserved so swapping pairs never shifts layout, and the
 * rotation is paused entirely under prefers-reduced-motion.
 */
export default function HeroRotator() {
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const swapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setPhase("out");
      swapTimer.current = setTimeout(() => {
        setIdx((i) => i + 1);
        setPhase("in");
      }, ROTATION_SWAP_DELAY_MS);
    }, ROTATION_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(swapTimer.current);
    };
  }, [reduced]);

  const pairs = ROTATION_PAIRS[lang];
  const [line1, line2] = pairs[idx % pairs.length];
  // Under reduced motion the interval never runs; also neutralize any
  // in-flight transition phase so the current pair renders at rest.
  const effectivePhase = reduced ? "idle" : phase;
  const lineClass = `mb-rot-line${effectivePhase === "out" ? " is-out" : ""}${effectivePhase === "in" ? " is-entering" : ""}`;

  return (
    <h1 data-rev="1" className="mb-hero-h1" style={{ minHeight: `${HERO_H1_MIN_HEIGHT_EM}em` }}>
      <span key={`l1-${idx}`} className={lineClass}>
        {line1}
      </span>
      <span key={`l2-${idx}`} className={`${lineClass} mb-rot-line2`}>
        {line2}
      </span>
    </h1>
  );
}
