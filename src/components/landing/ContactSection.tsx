"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

/** Approved founder direct-contact addresses (F-009) — moved here from
 * /investors by the founder's 2026-07-29 ruling: the inboxes live on
 * /contact; other surfaces link here instead of listing addresses. */
export const FOUNDER_EMAILS = [
  "matheau@mobeeli.com",
  "hafizh@mobeeli.com",
  "ferdi@mobeeli.com",
] as const;

/**
 * /contact (founder request 2026-07-29) — one public address up front, the
 * founder inboxes beneath. Reuses the investor-card surface so the three
 * "talk to us" pages (/investors, /careers, /contact) read as one system.
 * Copy is DRAFT pending founder stamp.
 */
export default function ContactSection() {
  const t = useT();
  return (
    <section id="contact" className="mb-section">
      <div data-rev="0" className="mb-inv-card">
        <div className="mb-kicker mb-kicker--accent">{t("contact_kicker")}</div>
        <h2 className="mb-inv-h2">{t("contact_h2")}</h2>
        <p className="mb-inv-p">{t("contact_p")}</p>
        <div className="mb-inv-ctas">
          <a className="mb-btn-primary-dark mb-inv-cta" href="mailto:info@mobeeli.com">
            info@mobeeli.com
          </a>
        </div>
        <div className="mb-inv-or">
          <span>{t("contact_direct")}</span>
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
