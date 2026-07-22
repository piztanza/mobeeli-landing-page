"use client";

import type { Lang } from "@/lib/i18n";

export interface IndoGlobeProps {
  lang: Lang;
  /** Render without camera drift/animation (reduced motion). */
  isStatic?: boolean;
}

/**
 * <IndoGlobe> — client-only island for the Indonesia flyover map (F-006).
 * Foundation placeholder: the three.js port of indo-globe.js lands with F-006.
 * Must be loaded via next/dynamic (ssr: false) and deferred until in view.
 */
export default function IndoGlobe({ lang, isStatic = false }: IndoGlobeProps) {
  return <div data-component="indo-globe" data-lang={lang} data-static={isStatic || undefined} />;
}
