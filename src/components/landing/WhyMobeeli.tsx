"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

/** Why Mobeeli — deep-blue band. */
export default function WhyMobeeli() {
  const t = useT();
  return (
    <section id="why-now" className="mb-why">
      <div className="mb-why-inner">
        <div data-rev="0" className="mb-kicker mb-kicker--sky">
          {t("why_kicker")}
        </div>
        <h2 data-rev="1" className="mb-h2">
          {t("why_h2")}
        </h2>
        <p data-rev="2" className="mb-why-p">
          {t("why_p")}
        </p>
      </div>
    </section>
  );
}
