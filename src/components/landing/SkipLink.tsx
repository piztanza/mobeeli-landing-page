"use client";

import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * Skip-to-content link — rendered as the first focusable element of every
 * page view, visually hidden until keyboard-focused (.mb-skip-link in
 * globals.css). Targets the page's <main id="main-content" tabIndex={-1}>.
 * The click handler moves focus without writing #main-content into the URL,
 * so the landing scrollspy's hash replay never re-runs it on reload; the
 * href stays as a no-JS fallback.
 */
export default function SkipLink() {
  const t = useT();
  return (
    <a
      className="mb-skip-link"
      href="#main-content"
      onClick={(e) => {
        const main = document.getElementById("main-content");
        if (!main) return;
        e.preventDefault();
        main.focus({ preventScroll: true });
        main.scrollIntoView({ block: "start" });
      }}
    >
      {t("skip_to_content")}
    </a>
  );
}
