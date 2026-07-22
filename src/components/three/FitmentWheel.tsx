"use client";

import type { Lang } from "@/lib/i18n";

export interface FitmentWheelProps {
  lang: Lang;
  /** Render the static seated state (reduced motion). */
  isStatic?: boolean;
}

/**
 * <FitmentWheel> — client-only island for the 3D hero fitment scene (F-002).
 * Foundation placeholder: the three.js port of fitment-3d.js lands with F-002.
 * Must be loaded via next/dynamic (ssr: false) and deferred until in view.
 */
export default function FitmentWheel({ lang, isStatic = false }: FitmentWheelProps) {
  return <div data-component="fitment-wheel" data-lang={lang} data-static={isStatic || undefined} />;
}
