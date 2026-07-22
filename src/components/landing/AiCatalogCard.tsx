"use client";

import Image from "next/image";

import type { CopyKey } from "@/lib/i18n";
import { useT } from "@/lib/i18n/LanguageProvider";

// Part sprites in the design's stage positions. The brake-pad sprite (scn1,
// parts/pad.png) has no supplied asset yet — its slot ships with the F-005
// animation loop, which owns this whole stage.
const SPRITES: readonly { name: CopyKey; src: string; pos: string }[] = [
  { name: "scn2", src: "/assets/parts/filter.png", pos: "mb-sprite--filter" },
  { name: "scn3", src: "/assets/parts/plug.png", pos: "mb-sprite--plug" },
  { name: "scn4", src: "/assets/parts/disc.png", pos: "mb-sprite--disc" },
  { name: "scn5", src: "/assets/parts/shock.png", pos: "mb-sprite--shock" },
  { name: "scn6", src: "/assets/parts/air.png", pos: "mb-sprite--air" },
];

const FILE_CHIPS = [
  { src: "/assets/icons/xls2.png", alt: "Excel file" },
  { src: "/assets/icons/pdf2.png", alt: "PDF file" },
  { src: "/assets/icons/jpg2.png", alt: "Photo file" },
] as const;

/**
 * AI catalog showcase — dark rounded card. This change ships the styled
 * static container in the design's assembled state (sprites at rest, pill and
 * "catalog assembled" chip visible); the ~15s animation loop is F-005.
 */
export default function AiCatalogCard() {
  const t = useT();
  return (
    <section className="mb-cat-section">
      <div data-rev="0" className="mb-cat-card">
        <div className="mb-cat-head">
          <div className="mb-file-chips">
            {FILE_CHIPS.map((chip) => (
              <div key={chip.src} className="mb-file-chip">
                <Image src={chip.src} alt={chip.alt} width={76} height={96} />
              </div>
            ))}
          </div>
          <div className="mb-ai-chip">
            <span className="mb-dot mb-pulse mb-pulse--ai" aria-hidden />
            <span className="mb-ai-chip-text">{t("cat_ai_done")}</span>
          </div>
        </div>
        <div className="mb-cat-stage" aria-hidden>
          {SPRITES.map((sprite) => (
            <div key={sprite.name} className={`mb-sprite ${sprite.pos}`}>
              <Image src={sprite.src} alt={t(sprite.name)} width={680} height={680} />
            </div>
          ))}
          <div className="mb-cat-pill">{t("cat_pill")}</div>
        </div>
        <div className="mb-cat-copy">
          <h2 data-rev="1" className="mb-cat-h2">
            {t("cat_h2")}
          </h2>
          <p data-rev="2" className="mb-cat-p">
            {t("cat_p")}
          </p>
        </div>
      </div>
    </section>
  );
}
