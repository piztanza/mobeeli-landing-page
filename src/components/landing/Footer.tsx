"use client";

import Image from "next/image";
import Link from "next/link";

import { useT } from "@/lib/i18n/LanguageProvider";

/** Dark footer — official white logo variant on the dark surface (per design/style.json). */
export default function Footer() {
  const t = useT();
  return (
    <footer className="mb-footer">
      <div className="mb-footer-inner">
        <div className="mb-footer-top">
          <div>
            <div className="mb-footer-logo">
              <Image
                src="/assets/mobeeli-logo-white.png"
                alt="Mobeeli"
                width={3076}
                height={783}
              />
            </div>
            <div className="mb-footer-tag">{t("foot_tag")}</div>
          </div>
          {/* Social slot removed (audit #7): the dead href="#" "in" anchor read
              as an unfinished placeholder. A real LinkedIn mark returns WITH a
              real founder-supplied URL (see HANDOFF outstanding items). */}
          {/* The R25 mockup's two-column footer menu (founder 2026-07-28).
              Careers joins the Company column — it has no nav slot, so this
              is its inbound link — and Why Mobeeli finally gets one too. The
              join label follows the founder's "Join us" rename, not the
              mockup's "Join waitlist". */}
          <nav className="mb-footer-menu" aria-label={t("foot_menu_a11y")}>
            <div className="mb-footer-col">
              <span className="mb-footer-col-h">{t("foot_col_company")}</span>
              <Link href="/team">{t("nav_team")}</Link>
              <Link href="/investors">{t("nav_inv")}</Link>
              <Link href="/careers">{t("nav_careers")}</Link>
              <Link href="/contact">{t("nav_contact")}</Link>
            </div>
            <div className="mb-footer-col">
              <span className="mb-footer-col-h">{t("foot_col_product")}</span>
              <Link href="/#how-it-works">{t("nav_how")}</Link>
              <Link href="/#coverage">{t("foot_coverage")}</Link>
              <Link href="/join">{t("nav_cta")}</Link>
            </div>
          </nav>
        </div>
        <div className="mb-footer-bottom">
          <div className="mb-footer-contact">
            <a className="mb-link-underline" href="mailto:info@mobeeli.com">
              info@mobeeli.com
            </a>
          </div>
          <div className="mb-footer-copy">{t("foot_copyright")}</div>
        </div>
      </div>
    </footer>
  );
}
