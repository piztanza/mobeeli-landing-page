"use client";

import Image from "next/image";
import Link from "next/link";

import { langs, type CopyKey } from "@/lib/i18n";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";

// Landing anchors are /#id links so they resolve from every page, not just /
// (CHG-piztanza-09); Team, Early Adaptors and Investors live on their own routes.
const NAV_LINKS: readonly (readonly [href: string, key: CopyKey])[] = [
  ["/#problem", "nav_problem"],
  ["/#how-it-works", "nav_how"],
  ["/#why-now", "nav_why"],
  ["/early-adaptors", "nav_early"],
  ["/team", "nav_team"],
  ["/investors", "nav_inv"],
];

/** Sticky nav — logo, 6 section links, EN/ID pill toggle, Join Waitlist CTA (F-009: routes to /join). */
export default function Nav() {
  const { lang, setLang } = useLang();
  const t = useT();
  return (
    <nav className="mb-nav">
      <div className="mb-nav-inner">
        <Link href="/" className="mb-nav-logo">
          <Image src="/assets/mobeeli-logo-blue.png" alt="Mobeeli" width={2891} height={1109} />
        </Link>
        <div className="mb-nav-links">
          {NAV_LINKS.map(([href, key]) => (
            <Link key={key} href={href}>
              {t(key)}
            </Link>
          ))}
        </div>
        <div className="mb-nav-spacer" />
        <div className="mb-lang-toggle">
          {langs.map((l) => (
            <button
              key={l}
              type="button"
              className={`mb-lang-btn${l === lang ? " is-active" : ""}`}
              aria-pressed={l === lang}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <Link href="/join" className="mb-nav-cta">
          {t("nav_cta")}
        </Link>
      </div>
    </nav>
  );
}
