"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { useOverlaySolid } from "@/lib/hooks/useOverlaySolid";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { langs, type CopyKey } from "@/lib/i18n";
import { useLang, useT } from "@/lib/i18n/LanguageProvider";
import { scrollToSectionId } from "@/lib/scroll/sectionScroll";

import { useActiveSection } from "./ActiveSectionProvider";

/** The live platform's partner pitch + registration surface (founder decision
 *  2026-07-23: the Early Adopters nav slot points straight at the platform). */
/* Founder 2026-07-28: the Early Adopters nav link goes STRAIGHT to signup, not
   to the platform's front door — the nav entry is a call to action, and the
   extra hop was losing people. The hero CTA already pointed here. */
/* Founder 2026-07-28 (later): Early Adopters signup moved to the company
   portal — every Early Adopters entry point (this nav slot, the hero CTA, and
   the Early Adopters section CTA) now routes to company.mobeeli.com/join. */
export const PLATFORM_URL = "https://company.mobeeli.com/join";

// Landing anchors are /#id links so they resolve from every page, not just /
// (CHG-piztanza-09); Team and Investors live on their own routes; the Early
// Adopters slot is an external platform link.
/**
 * R16 ruling 1c added a Protection anchor and, to fit it against the 1040px
 * breakpoint, the founder dropped "Why Mobeeli" from the bar. R18 call A cuts
 * the protection band, so the anchor goes with it — leaving FIVE links and a
 * free slot. Whether "Why Mobeeli" returns to that slot is an open founder
 * call, NOT an automatic revert: see the note in the R18 handoff.
 *
 * CORRECTED 2026-07-28: the R18 brief's original wording here claimed the
 * /why-mobeeli route is "linked from the footer". It is not, and never was —
 * the footer renders a logo, a tagline, a mailto and a copyright line, no nav
 * links. The route is live and in sitemap.ts, but it has NO inbound link from
 * any page; a visitor can only reach it by typing the URL. That orphaning is
 * the open item, and it is why the free-slot question matters.
 */
const NAV_LINKS: readonly (readonly [href: string, key: CopyKey])[] = [
  ["/#problem", "nav_problem"],
  ["/#how-it-works", "nav_how"],
  [PLATFORM_URL, "nav_early"],
  ["/team", "nav_team"],
  ["/investors", "nav_inv"],
];

/** Above this width the desktop nav shows; below it the hamburger sheet takes over (CHG-piztanza-10, R10-F). */
export const NAV_DESKTOP_QUERY = "(min-width: 1040px)";

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
 * Sticky nav — logo, 5 section links, EN/ID pill toggle, "Join us" CTA (F-009: routes to
 * /join). Below 1040px (NAV_DESKTOP_QUERY — the 880px in older comments was a
 * previous breakpoint) the links/toggle/CTA collapse into a hamburger sheet (CHG-piztanza-10):
 * animated icon, body scroll lock, closes on link tap / outside tap / Escape (returning focus
 * to the toggle), aria-expanded + aria-controls wired to the sheet.
 *
 * On the landing page the /#id anchors scroll programmatically (CHG-piztanza-14) — a re-click
 * on the same item always scrolls back, short sections center in the viewport, reduced motion
 * jumps instantly — and the scrollspy's active section carries aria-current/data-active (no
 * visible styling yet). From other pages the links navigate to /#id as before.
 *
 * With `overlay` (landing page only) the bar starts transparent over the dark full-viewport
 * hero — white links/burger, white logo variant — and turns solid once the hero scrolls past
 * (useOverlaySolid); the open mobile sheet forces solid so the bar never sits transparent
 * over its own white sheet.
 */
export default function Nav({ overlay = false }: { overlay?: boolean }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const solid = useOverlaySolid(overlay);
  const activeId = useActiveSection();
  const reduced = useReducedMotion();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  const onSectionClick = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
      close();
      // Modified/secondary clicks and non-landing pages fall through to the Link navigation.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.location.pathname !== "/") return;
      if (!document.getElementById(id)) return;
      event.preventDefault();
      // Next frame: the sheet's body scroll lock must release before the glide starts.
      requestAnimationFrame(() => scrollToSectionId(id, { instant: reduced }));
    },
    [close, reduced],
  );

  // One markup for desktop bar and mobile sheet: /#id anchors get the programmatic
  // scroll + scrollspy state; route links just close the sheet (a no-op on desktop);
  // external links (the platform) open in a new tab.
  const sectionLink = ([href, key]: readonly [href: string, key: CopyKey]) => {
    if (href.startsWith("http")) {
      return (
        <a key={key} href={href} target="_blank" rel="noreferrer" onClick={close}>
          {t(key)}
        </a>
      );
    }
    const id = href.startsWith("/#") ? href.slice("/#".length) : null;
    return (
      <Link
        key={key}
        href={href}
        aria-current={id !== null && id === activeId ? "location" : undefined}
        data-active={id !== null && id === activeId ? "true" : undefined}
        onClick={id === null ? close : (event) => onSectionClick(event, id)}
      >
        {t(key)}
      </Link>
    );
  };

  // Body scroll lock while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes and returns focus to the toggle; growing past the desktop
  // breakpoint (NAV_DESKTOP_QUERY, 1040px — not the 880px this comment used to
  // claim) closes too, so the lock never lingers after a rotate/resize.
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
    <nav
      className={`mb-nav${overlay ? " mb-nav--overlay" : ""}${
        overlay && (solid || open) ? " is-solid" : ""
      }`}
    >
      <div className="mb-nav-inner">
        <Link href="/" className="mb-nav-logo" onClick={close}>
          <Image
            className="mb-nav-logo-blue"
            src="/assets/mobeeli-logo-blue.png"
            alt="Mobeeli"
            width={2891}
            height={1109}
          />
          {/* Both variants carry the accessible name: only ONE is ever in the
              a11y tree (the hidden one is display:none), so the home link is
              always named — including the transparent overlay state where the
              white variant is the visible one (a11y fix, R6). */}
          <Image
            className="mb-nav-logo-white"
            src="/assets/mobeeli-logo-white.png"
            alt="Mobeeli"
            width={2891}
            height={1109}
          />
        </Link>
        <div className="mb-nav-links">{NAV_LINKS.map(sectionLink)}</div>
        <div className="mb-nav-spacer" />
        <LangToggle />
        <Link href="/join" className="mb-nav-cta mb-btn-spring">
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
        <div className="mb-nav-sheet-links">{NAV_LINKS.map(sectionLink)}</div>
        <div className="mb-nav-sheet-foot">
          <LangToggle />
          <Link href="/join" className="mb-nav-cta mb-btn-spring" onClick={close}>
            {t("nav_cta")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
