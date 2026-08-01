"use client";

import type { CopyKey } from "@/lib/i18n";
import { useT } from "@/lib/i18n/LanguageProvider";

/* Reading order, not key order: what you send us, then what we keep, then
   your rights. b7 (launch notifications) was added after b6 and slots in
   with the other capture blocks. */
const BLOCKS: readonly { h: CopyKey; p: CopyKey }[] = [
  { h: "privacy_b1_h", p: "privacy_b1_p" },
  { h: "privacy_b2_h", p: "privacy_b2_p" },
  { h: "privacy_b3_h", p: "privacy_b3_p" },
  { h: "privacy_b7_h", p: "privacy_b7_p" },
  { h: "privacy_b4_h", p: "privacy_b4_p" },
  { h: "privacy_b5_h", p: "privacy_b5_p" },
  { h: "privacy_b6_h", p: "privacy_b6_p" },
];

/**
 * /privacy (founder 2026-07-30) — the transparency page the cookie analysis
 * pointed at: the ePrivacy exemption expects disclosure of the two on-device
 * preferences, and UU PDP expects a notice for what the forms collect. Every
 * factual claim here is pinned by tests/cookieless-contract.test.ts — if the
 * code stops being true to this page, the suite fails. Copy is DRAFT pending
 * founder/legal review.
 */
export default function PrivacySection() {
  const t = useT();
  return (
    <section id="privacy" className="mb-priv">
      <div className="mb-priv-container">
        <div className="mb-priv-kicker">{t("privacy_kicker")}</div>
        <h2 className="mb-priv-h2">{t("privacy_h2")}</h2>
        <p className="mb-priv-lede">{t("privacy_lede")}</p>
        {BLOCKS.map(({ h, p }, i) => (
          <div key={h} className="mb-priv-block" data-rev={i % 3}>
            <h3 className="mb-priv-b-h">{t(h)}</h3>
            <p className="mb-priv-b-p">
              {t(p)}
              {h === "privacy_b6_h" && (
                <>
                  {" "}
                  <a href="mailto:info@mobeeli.com">info@mobeeli.com</a>
                </>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
