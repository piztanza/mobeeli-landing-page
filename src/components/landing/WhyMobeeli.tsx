"use client";

import { useT } from "@/lib/i18n/LanguageProvider";
import AnalogDeathSpiral from "./AnalogDeathSpiral";
import HeroNetworkBackground from "./HeroNetworkBackground";

/** Why Mobeeli — deep-blue band with SVG bezier network header and AnalogDeathSpiral cards. */
export default function WhyMobeeli() {
  const t = useT();
  return (
    <section id="why-now" className="mb-why">
      <HeroNetworkBackground />
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
        <div data-rev="3" className="mb-why-ds-wrap">
          {/* The ported death-spiral section's own heading (was dropped in the
              port, leaving why_ds_title/why_ds_sub orphaned — audit R6). */}
          <h3 className="mb-why-ds-title">{t("why_ds_title")}</h3>
          <p className="mb-why-ds-sub">{t("why_ds_sub")}</p>
          <AnalogDeathSpiral />
        </div>
      </div>
    </section>
  );
}
