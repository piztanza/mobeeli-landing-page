"use client";

import { useT } from "@/lib/i18n/LanguageProvider";
import type { CopyKey } from "@/lib/i18n";

/**
 * R18 call A: no longer mounted on `/`. Kept deliberately — the CSS below it in
 * landing.css is only legal while these class names appear in a .tsx. If this
 * file is ever deleted, delete the .mb-protect* rules in the same commit.
 *
 * Cut for positioning, not because it was wrong: "we make the aftermarket
 * trustworthy" is the message Otoklix and Bengkel Mania already occupy, so the
 * front page stakes fitment instead. The mechanics move to /platform and the
 * deck; authenticity survives on `/` as one clause (R18 call C).
 *
 * Protection band (R16, founder ruling 1c) — a light band with its own id and
 * nav anchor.
 *
 * Before this, the protection promises lived in a compact strip nested inside
 * the fitment section; R15 replaced that section with the catalog and the strip
 * went with it, leaving `prot_r1/2/3` and `how_s3_t` defined but rendered
 * nowhere. The protection story was silently missing from the page. This band
 * restores it and gives it somewhere to be linked from.
 *
 * Copy is reused in place — no parallel keys were created. The `✓` prefixes were
 * dropped from prot_r* because each promise now carries a real icon.
 */

/** The three promises, paired with their icon. Numerals are tabular (globals). */
const PROMISES: readonly (readonly [key: CopyKey, icon: React.ReactNode])[] = [
  [
    "prot_r1",
    // video evidence — a camera
    <>
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </>,
  ],
  [
    "prot_r2",
    // authenticity — a shield with a check
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </>,
  ],
  [
    "prot_r3",
    // funds released on fit — a lock opening
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </>,
  ],
];

export default function ProtectionSection() {
  const t = useT();

  return (
    <section id="protection" className="mb-section mb-protect">
      <div className="mb-section-inner">
        {/* No eyebrow: R8 retired the per-band kicker so the H2 leads. */}
        <h2 data-rev="0" className="mb-h2 mb-h2--protect">
          {t("how_s3_t")}
        </h2>
        <div className="mb-protect-grid">
          {PROMISES.map(([key, icon], i) => (
            <div key={key} data-rev={String(i)} className="mb-protect-cell">
              <div className="mb-protect-cell-head">
                <svg
                  className="mb-protect-icon"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {icon}
                </svg>
                <span className="mb-protect-num">{`0${i + 1}`}</span>
              </div>
              <h3 className="mb-protect-t">{t(key)}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
