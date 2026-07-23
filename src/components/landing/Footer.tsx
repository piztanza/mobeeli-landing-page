"use client";

import Image from "next/image";

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
                width={2891}
                height={1109}
              />
            </div>
            <div className="mb-footer-tag">{t("foot_tag")}</div>
          </div>
          <div className="mb-footer-social">
            <a href="#" aria-label="LinkedIn">
              in
            </a>
          </div>
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
