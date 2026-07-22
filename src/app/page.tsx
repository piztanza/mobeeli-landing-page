import { DEFAULT_LANG, t } from "@/lib/i18n";

/**
 * Landing page — server-rendered shell.
 * Foundation skeleton: the full 13-section stack (F-001), 3D hero (F-002),
 * rotator (F-003) etc. are built as individual features on top of this.
 */
export default function LandingPage() {
  const lang = DEFAULT_LANG;
  return (
    <main>
      <h1>
        <span>{t(lang, "hero.line1")}</span> <span>{t(lang, "hero.line2")}</span>
      </h1>
      <a href="/join">{t(lang, "nav.cta")}</a>
    </main>
  );
}
