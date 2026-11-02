import type { ReactNode } from "react";

export type RowGlyphName =
  | "store"
  | "catalog"
  | "car"
  | "wheel"
  | "bag"
  | "clipboard"
  | "ticket"
  | "truck"
  | "bars"
  | "team"
  | "calendar"
  | "invoice"
  | "link"
  | "pins";

/** One literal subject per feature, on a 24-unit grid inside a 3–21 frame so
 *  every glyph carries the same optical weight. Outlines only: no fills. */
const GLYPHS: Record<RowGlyphName, ReactNode> = {
  store: (
    <>
      <path d="M3.5 9.5h17l-1.6-5H5.1z" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  catalog: (
    <>
      <path d="M6 3.5h8.5L18 7v13.5H6z" />
      <path d="M14.5 3.5V7H18" />
      <path d="M9 11h6M9 14h6M9 17h3.5" />
    </>
  ),
  car: (
    <>
      <path d="M3.5 15.5V13l1.8-1 2.4-4h8.6l2.4 4 1.8 1v2.5" />
      <path d="M8.8 15.5h6.4" />
      <circle cx="7" cy="16" r="1.8" />
      <circle cx="17" cy="16" r="1.8" />
    </>
  ),
  wheel: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10V6M13.9 11.4l3.8-1.2M13.2 13.6l2.3 3.2M10.8 13.6l-2.3 3.2M10.1 11.4 6.3 10.2" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12.5H6z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  clipboard: (
    <>
      <path d="M8 4.5H6.5A1.5 1.5 0 0 0 5 6v13.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H16" />
      <rect x="8.5" y="3" width="7" height="3" rx="1" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" />
    </>
  ),
  ticket: (
    <>
      <path d="M3.5 7.5h17v3a1.5 1.5 0 0 0 0 3v3h-17v-3a1.5 1.5 0 0 0 0-3z" />
      <path d="M14.5 8.5v7" strokeDasharray="1.4 2" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6.5h11V16H3z" />
      <path d="M14 9.5h3.5l3 3V16H14" />
      <circle cx="7" cy="17.5" r="1.7" />
      <circle cx="17" cy="17.5" r="1.7" />
    </>
  ),
  bars: (
    <>
      <path d="M4 20.5h16" />
      <rect x="5.5" y="12" width="3" height="8.5" rx=".6" />
      <rect x="10.5" y="7" width="3" height="13.5" rx=".6" />
      <rect x="15.5" y="10" width="3" height="10.5" rx=".6" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <circle cx="16.5" cy="9.5" r="2.4" />
      <path d="M16 14.6c2.6 0 4.5 2.1 4.5 4.9" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
      <path d="m9.5 14.6 1.8 1.8 3.4-3.4" />
    </>
  ),
  invoice: (
    <>
      <path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z" />
      <path d="M9 8h6M9 11.5h6M9 15h3" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" />
      <path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" />
    </>
  ),
  pins: (
    <>
      <path d="M8.5 20.5S4 15.9 4 12a4.5 4.5 0 0 1 9 0c0 3.9-4.5 8.5-4.5 8.5z" />
      <circle cx="8.5" cy="12" r="1.4" />
      <path d="M17 17.5s-3.3-3.3-3.3-6a3.3 3.3 0 0 1 6.6 0c0 2.7-3.3 6-3.3 6z" />
      <circle cx="17" cy="11.5" r="1" />
    </>
  ),
};

/**
 * The comparison table's row glyphs (2026-11-03): small single-weight line
 * icons, drawn as one family, muted so the blue ticks stay the table's only
 * signal colour. Decorative — each row's header names the feature.
 */
export default function RowGlyph({ name }: { name: RowGlyphName }) {
  return (
    <svg
      className="mb-sol-row-i"
      data-glyph={name}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[name]}
    </svg>
  );
}
