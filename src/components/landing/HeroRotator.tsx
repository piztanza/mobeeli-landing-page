"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";
import {
  ROTATION_INTERVAL_MS,
  ROTATION_PAIRS,
  ROTATION_SWAP_DELAY_MS,
} from "@/lib/i18n/rotation";

/**
 * Hero H1 rotation (F-003) — cycles the four approved phrase pairs per
 * language every ~3.4s with the design's two-line slide transition.
 * Every pair is also rendered as an invisible grid-stacked sizer, so the H1
 * always reserves exactly the tallest pair's height at the current width
 * (CHG-piztanza-18) — zero rotation layout shift at every breakpoint without
 * a hardcoded min-height. Rotation is paused under prefers-reduced-motion.
 *
 * A visually-hidden-until-focus pause control (audit #24, WCAG 2.2.2) lets a
 * keyboard user stop the moving headline even without the OS reduced-motion
 * setting; it flips the same `paused` branch the reduced-motion path uses.
 */
export default function HeroRotator() {
  const { lang } = useLang();
  const t = useT();
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [paused, setPaused] = useState(false);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (reduced || paused) return;
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
  }, [reduced, paused]);

  const pairs = ROTATION_PAIRS[lang];
  const [line1, line2] = pairs[idx % pairs.length];
  // Under reduced motion or when paused the interval never runs; also neutralize
  // any in-flight transition phase so the current pair renders at rest.
  const effectivePhase = reduced || paused ? "idle" : phase;
  const lineClass = `mb-rot-line${effectivePhase === "out" ? " is-out" : ""}${effectivePhase === "in" ? " is-entering" : ""}`;

  return (
    <>
      <h1 data-rev="1" className="mb-hero-h1">
        {pairs.map(([s1, s2]) => (
          <span key={s1} className="mb-hero-h1-sizer" aria-hidden>
            <span className="mb-rot-line">{s1}</span>
            <span className="mb-rot-line">{s2}</span>
          </span>
        ))}
        <span className="mb-hero-h1-live">
          <span key={`l1-${idx}`} className={lineClass}>
            {line1}
          </span>
          <span key={`l2-${idx}`} className={`${lineClass} mb-rot-line2`}>
            {line2}
          </span>
        </span>
      </h1>
      {/* Reduced-motion users never see a moving headline, so the control stays
          out of their tab order entirely; everyone else gets it on focus. */}
      {!reduced && (
        <button
          type="button"
          className="mb-hero-pause"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
        >
          {paused ? t("hero_resume") : t("hero_pause")}
        </button>
      )}
    </>
  );
}
