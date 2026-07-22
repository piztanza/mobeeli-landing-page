"use client";

import dynamic from "next/dynamic";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";

// 3D map is a client-only island (F-006 ports the indo-globe scene into it).
const IndoGlobe = dynamic(() => import("@/components/three/IndoGlobe"), {
  ssr: false,
  loading: () => null,
});

/** Unify band — dark band with the Indonesia flyover map container (scene ships with F-006). */
export default function UnifyBand() {
  const t = useT();
  const { lang } = useLang();
  const reduced = useReducedMotion();
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
        <div data-rev="2" className="mb-uni-map">
          <div className="mb-uni-scene">
            <IndoGlobe lang={lang} isStatic={reduced} />
          </div>
          <div className="mb-uni-drag">{t("uni_drag")}</div>
        </div>
      </div>
    </section>
  );
}
