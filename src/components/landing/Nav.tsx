"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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

/** Above this width the desktop nav shows; below it the hamburger sheet takes over (CHG-piztanza-10). */
const NAV_DESKTOP_QUERY = "(min-width: 880px)";

/** EN/ID pill toggle — rendered in the desktop bar and again inside the mobile sheet. */
function LangToggle() {
  const { lang, setLang } = useLang();
  return (
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
  );
}

/**
 * Sticky nav — logo, 6 section links, EN/ID pill toggle, Join Waitlist CTA (F-009: routes to
 * /join). Below 880px the links/toggle/CTA collapse into a hamburger sheet (CHG-piztanza-10):
 * animated icon, body scroll lock, closes on link tap / outside tap / Escape (returning focus
 * to the toggle), aria-expanded + aria-controls wired to the sheet.
 */
export default function Nav() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Body scroll lock while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes and returns focus to the toggle; growing past 880px closes too
  // (so the lock never lingers after a rotate/resize back to desktop).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const desktop = window.matchMedia(NAV_DESKTOP_QUERY);
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  // Focus management: opening moves focus to the first link in the sheet.
  useEffect(() => {
    if (open) sheetRef.current?.querySelector<HTMLElement>("a, button")?.focus();
  }, [open]);

  return (
    <nav className="mb-nav">
      <div className="mb-nav-inner">
        <Link href="/" className="mb-nav-logo" onClick={close}>
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
        <LangToggle />
        <Link href="/join" className="mb-nav-cta">
          {t("nav_cta")}
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className={`mb-nav-burger${open ? " is-open" : ""}`}
          aria-expanded={open}
          aria-controls="mb-nav-sheet"
          aria-label={t(open ? "nav_menu_close" : "nav_menu_open")}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="mb-nav-burger-bar" aria-hidden />
          <span className="mb-nav-burger-bar" aria-hidden />
          <span className="mb-nav-burger-bar" aria-hidden />
        </button>
      </div>
      {open && <div className="mb-nav-backdrop" aria-hidden onClick={close} />}
      <div
        id="mb-nav-sheet"
        ref={sheetRef}
        className={`mb-nav-sheet${open ? " is-open" : ""}`}
        hidden={!open}
      >
        <div className="mb-nav-sheet-links">
          {NAV_LINKS.map(([href, key]) => (
            <Link key={key} href={href} onClick={close}>
              {t(key)}
            </Link>
          ))}
        </div>
        <div className="mb-nav-sheet-foot">
          <LangToggle />
          <Link href="/join" className="mb-nav-cta" onClick={close}>
            {t("nav_cta")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
