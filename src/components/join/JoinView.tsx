"use client";

import Link from "next/link";

import Nav from "@/components/landing/Nav";
import SkipLink from "@/components/landing/SkipLink";
import { langs } from "@/lib/i18n";
import { LanguageProvider, useLang, useT } from "@/lib/i18n/LanguageProvider";

import BrandPanel from "./BrandPanel";
import WaitlistWizard from "./WaitlistWizard";

import "@/components/landing/landing.css";
import "./join.css";

/** Wizard column header — ← Back to Mobeeli + EN/ID pill toggle (S-002). */
function JoinHeader() {
  const { lang, setLang } = useLang();
  const t = useT();
  return (
    <div className="mb-jw-header">
      <Link href="/" className="mb-jw-back-home">
        {t("jw_back_home")}
      </Link>
      <div className="mb-jw-lang-toggle">
        {langs.map((l) => (
          <button
            key={l}
            type="button"
            className={`mb-jw-lang-btn${l === lang ? " is-active" : ""}`}
            aria-pressed={l === lang}
            onClick={() => setLang(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Join Waitlist page (F-007) — full-viewport split per the approved design:
 * dark brand panel + light wizard column (stacks on mobile via auto-fit grid).
 * Below 880px the shared logo + hamburger nav shows above the stack
 * (CHG-piztanza-10); the desktop split stays nav-free as designed.
 */
export default function JoinView() {
  return (
    <LanguageProvider>
      <SkipLink />
      <div className="mb-join-mobilenav">
        <Nav />
      </div>
      <div className="mb-join">
        <BrandPanel />
        <main id="main-content" tabIndex={-1} className="mb-jw-col">
          <JoinHeader />
          <div className="mb-jw-center">
            <WaitlistWizard />
          </div>
        </main>
      </div>
    </LanguageProvider>
  );
}
