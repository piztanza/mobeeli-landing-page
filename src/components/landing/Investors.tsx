"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

/** Approved investor mailto (F-009) — address and subject are part of the spec. */
export const INVESTOR_MAILTO =
  "mailto:info@mobeeli.com?subject=Mobeeli%20%E2%80%94%20deck%20request";

/** Approved founder direct-contact addresses (F-009). */
export const FOUNDER_EMAILS = [
  "matheau@mobeeli.com",
  "hafizh@mobeeli.com",
  "ferdi@mobeeli.com",
] as const;

/** Investors — dark rounded card with the deck-request mailto and founder emails. */
export default function Investors() {
  const t = useT();
  return (
    <section id="investors" className="mb-section">
      <div data-rev="0" className="mb-inv-card">
        <div className="mb-kicker mb-kicker--accent">{t("inv_kicker")}</div>
        <h2 className="mb-inv-h2">{t("inv_h2")}</h2>
        <p className="mb-inv-p">{t("inv_p")}</p>
        <div className="mb-inv-ctas">
          <a href={INVESTOR_MAILTO} className="mb-btn-primary-dark mb-inv-cta">
            {t("inv_cta")}
          </a>
        </div>
        <div className="mb-inv-or">
          <span>{t("inv_or")}</span>
          <div className="mb-inv-emails">
            {FOUNDER_EMAILS.map((email) => (
              <a key={email} href={`mailto:${email}`}>
                {email}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
