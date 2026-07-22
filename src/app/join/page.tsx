import { DEFAULT_LANG, t } from "@/lib/i18n";

/**
 * Join Waitlist page — foundation skeleton.
 * The 4-step wizard (F-007) is built as a feature on top of this route.
 */
export default function JoinPage() {
  const lang = DEFAULT_LANG;
  return (
    <main>
      <h1>{t(lang, "join.title")}</h1>
    </main>
  );
}
