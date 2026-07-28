"use client";

import Image from "next/image";
import Link from "next/link";

import { useT } from "@/lib/i18n/LanguageProvider";
import type { CopyKey } from "@/lib/i18n";

const BENEFITS: readonly (readonly [glyph: string, title: CopyKey, sub: CopyKey])[] = [
  ["AI", "jw_ben1_t", "jw_ben1_s"],
  ["✓", "jw_ben2_t", "jw_ben2_s"],
  ["Rp", "jw_ben3_t", "jw_ben3_s"],
];

/**
 * Dark brand panel (left half of S-002): white logo, 0%-offer chip, H1, sub,
 * 3 benefit rows, trust line, floating disc/plug sprites (paused under
 * prefers-reduced-motion via CSS).
 */
export default function BrandPanel() {
  const t = useT();
  return (
    <aside className="mb-jw-brand">
      <Image
        src="/assets/parts/disc.png"
        alt=""
        width={680}
        height={680}
        className="mb-jw-sprite mb-jw-sprite--disc"
        aria-hidden
      />
      <Image
        src="/assets/parts/plug.png"
        alt=""
        width={680}
        height={680}
        className="mb-jw-sprite mb-jw-sprite--plug"
        aria-hidden
      />
      <Link href="/" className="mb-jw-brand-logo">
        <Image src="/assets/mobeeli-logo-white.png" alt="Mobeeli" width={3076} height={783} />
      </Link>
      <div className="mb-jw-brand-mid">
        <div className="mb-jw-offer">{t("jw_offer")}</div>
        <h1 className="mb-jw-h1">{t("jw_left_h")}</h1>
        <p className="mb-jw-sub">{t("jw_left_sub")}</p>
        <div className="mb-jw-bens">
          {BENEFITS.map(([glyph, title, sub]) => (
            <div key={title} className="mb-jw-ben">
              <span className="mb-jw-ben-badge" aria-hidden>
                {glyph}
              </span>
              <div>
                <div className="mb-jw-ben-t">{t(title)}</div>
                <div className="mb-jw-ben-s">{t(sub)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-jw-trust">{t("jw_trust")}</div>
    </aside>
  );
}
