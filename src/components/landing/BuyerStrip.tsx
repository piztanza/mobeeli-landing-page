"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

/** Approved buyer mailto (F-009) — address and subject are part of the spec. */
export const BUYER_MAILTO =
  "mailto:info@mobeeli.com?subject=Notify%20me%20at%20launch%20%E2%80%94%20buyer";

/** Buyer strip — tinted band with the "get notified" mailto CTA. */
export default function BuyerStrip() {
  const t = useT();
  return (
    <section className="mb-buyer">
      <div className="mb-buyer-inner">
        <div className="mb-buyer-line">{t("buyer_line")}</div>
        <a href={BUYER_MAILTO} className="mb-buyer-cta">
          {t("buyer_cta")}
        </a>
      </div>
    </section>
  );
}
