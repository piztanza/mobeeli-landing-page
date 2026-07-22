"use client";

import Link from "next/link";

import { langs } from "@/lib/i18n";
import { LanguageProvider, useLang, useT } from "@/lib/i18n/LanguageProvider";

import BrandPanel from "./BrandPanel";
import WaitlistWizard from "./WaitlistWizard";

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
 */
export default function JoinView() {
  return (
    <LanguageProvider>
      <div className="mb-join">
        <BrandPanel />
        <main className="mb-jw-col">
          <JoinHeader />
          <div className="mb-jw-center">
            <WaitlistWizard />
          </div>
        </main>
      </div>
    </LanguageProvider>
  );
}
