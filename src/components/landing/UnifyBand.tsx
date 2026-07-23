"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";

// 3D map is a client-only island (F-006 ports the indo-globe scene into it).
const IndoGlobe = dynamic(() => import("@/components/three/IndoGlobe"), {
  ssr: false,
  loading: () => null,
});

/** Preload margin: start loading the scene this far before it scrolls in. */
const SCENE_PRELOAD_MARGIN = "600px 0px";

/**
 * Unify band — dark band with the Indonesia flyover map container (scene
 * ships with F-006). The band sits third on the redesigned landing, so the
 * three.js chunk is mount-gated until the band nears the viewport — it must
 * never compete with hero hydration (LCP budget).
 */
export default function UnifyBand() {
  const t = useT();
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const [sceneReady, setSceneReady] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sceneReady) return;
    const el = mapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // No observer available: mount on the next frame (never synchronously).
      const raf = requestAnimationFrame(() => setSceneReady(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSceneReady(true);
      },
      { rootMargin: SCENE_PRELOAD_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sceneReady]);

  return (
    <section className="mb-uni">
      <div className="mb-uni-inner">
        <div className="mb-uni-head">
          <div data-rev="0" className="mb-kicker mb-kicker--accent">
            {t("uni_kicker")}
          </div>
          <h2 data-rev="1" className="mb-uni-h2">
            {t("uni_h2")}
          </h2>
          <p data-rev="2" className="mb-uni-p">
            {t("uni_p")}
          </p>
        </div>
        <div data-rev="2" className="mb-uni-map" ref={mapRef}>
          <div className="mb-uni-scene">
            {sceneReady ? <IndoGlobe lang={lang} isStatic={reduced} /> : null}
          </div>
          <div className="mb-uni-drag">{t("uni_drag")}</div>
        </div>
      </div>
    </section>
  );
}
