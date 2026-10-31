import type { ReactNode } from "react";

export type DuoIconName =
  "store" | "catalog" | "link" | "plugin" | "data" | "search" | "starter" | "growth" | "scale";

/** A small side-view car, for the plugin and the data badge: body, the line
 *  between the wheels, and two wheels. `x`/`y` place its rear bottom corner. */
function Car({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0v-3l2.8-3.4h7.4l2.8 3.4h1v3" />
      <path d="M3.9 0h5.6" strokeWidth="1.5" />
      <circle cx="2.2" cy=".3" r="1.7" strokeWidth="1.5" />
      <circle cx="11.2" cy=".3" r="1.7" strokeWidth="1.5" />
    </g>
  );
}

/**
 * Each icon on a 48-unit grid: its second-tone fills (with `paper` for a shape
 * that sits in front of another), then its outlines. Lines are drawn after
 * every fill, so an outline never runs behind a paper shape — the shapes are
 * placed so none has to.
 */
const ICONS: Record<DuoIconName, { fill: ReactNode; line: ReactNode }> = {
  // Dedicated auto store: a shopfront, a wheel in its window.
  store: {
    fill: (
      <>
        <path d="M7 11h34l-2.5 8h-29z" />
        <rect x="12" y="24" width="13" height="10" rx="1.5" />
      </>
    ),
    line: (
      <>
        <path d="M9.5 19v21.5h29V19" />
        <path d="M7 11h34l-2.5 8h-29z" />
        <path d="M15.5 11l1.25 8M24 11v8M32.5 11l-1.25 8" strokeWidth="1.6" />
        <rect x="12" y="24" width="13" height="10" rx="1.5" />
        <circle cx="18.5" cy="29" r="3.2" strokeWidth="1.5" />
        <circle cx="18.5" cy="29" r=".9" fill="currentColor" stroke="none" />
        <path d="M29 40.5V28.5a1.5 1.5 0 0 1 1.5-1.5h3.5a1.5 1.5 0 0 1 1.5 1.5v12" />
        <path d="M6 40.5h36" />
      </>
    ),
  },
  // Catalog setup: a spreadsheet behind, a checked parts list in front.
  catalog: {
    fill: (
      <>
        <rect x="8" y="7" width="20" height="27" rx="2.5" />
        <rect className="mb-sol-duo-paper" x="19" y="15" width="21" height="26" rx="2.5" />
      </>
    ),
    line: (
      <>
        <path d="M28 15V9.5A2.5 2.5 0 0 0 25.5 7h-15A2.5 2.5 0 0 0 8 9.5v22A2.5 2.5 0 0 0 10.5 34H19" />
        <path d="M8 13.5h11M8 20h11M8 26.5h11M13.5 7v27" strokeWidth="1.5" />
        <rect x="19" y="15" width="21" height="26" rx="2.5" />
        <path d="M23 22l1.5 1.5 3-3M23 28l1.5 1.5 3-3M23 34l1.5 1.5 3-3" strokeWidth="1.8" />
        <path d="M30.5 22h6M30.5 28h6M30.5 34h4" strokeWidth="1.8" />
      </>
    ),
  },
  // Brand catalog connections: two catalogs joined by a link.
  link: {
    fill: (
      <>
        <rect x="6" y="10" width="15" height="20" rx="2.5" />
        <rect className="mb-sol-duo-paper" x="27" y="18" width="15" height="20" rx="2.5" />
      </>
    ),
    line: (
      <>
        <rect x="6" y="10" width="15" height="20" rx="2.5" />
        <path d="M10 10v20M13 16h5M13 20h5M13 24h3" strokeWidth="1.6" />
        <rect x="27" y="18" width="15" height="20" rx="2.5" />
        <path d="M31 18v20M34 24h5M34 28h5M34 32h3" strokeWidth="1.6" />
        <path d="M21 20c3.5 0 2.5 8 6 8" />
        <circle cx="21" cy="20" r="1.7" fill="currentColor" stroke="none" />
        <circle cx="27" cy="28" r="1.7" fill="currentColor" stroke="none" />
      </>
    ),
  },
  // Fitment search plugin: a puzzle piece carrying a car, with a verified tick.
  plugin: {
    fill: (
      <>
        <path d="M10 17h7.5a3.5 3.5 0 1 1 7 0H32v7.5a3.5 3.5 0 1 1 0 7V39H10z" />
        <circle className="mb-sol-duo-paper" cx="37" cy="11" r="4.5" />
      </>
    ),
    line: (
      <>
        <path d="M10 17h7.5a3.5 3.5 0 1 1 7 0H32v7.5a3.5 3.5 0 1 1 0 7V39H10z" />
        <Car x={14} y={33} />
        <circle cx="37" cy="11" r="4.5" />
        <path d="M35 11l1.4 1.4 2.8-2.8" strokeWidth="1.8" />
      </>
    ),
  },
  // Vehicle data API: a database, with a car on a badge in front.
  data: {
    fill: (
      <>
        <ellipse cx="20" cy="12" rx="11" ry="4" />
        <rect className="mb-sol-duo-paper" x="24" y="28" width="18" height="12" rx="3" />
      </>
    ),
    line: (
      <>
        <ellipse cx="20" cy="12" rx="11" ry="4" />
        <path d="M9 12v20c0 2.2 4.9 4 11 4 1.5 0 2.8-.1 4-.3M31 12v16" />
        <path d="M9 22c0 2.2 4.9 4 11 4s11-1.8 11-4" strokeWidth="1.6" />
        <rect x="24" y="28" width="18" height="12" rx="3" />
        <Car x={27.3} y={36.2} />
      </>
    ),
  },
  // SEO and AI SEO: a magnifier over result lines, an answer bubble beside it.
  search: {
    fill: (
      <>
        <circle cx="19" cy="21" r="10" />
        <path
          className="mb-sol-duo-paper"
          d="M32 5h9a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-5.5L32 19.5V16a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z"
        />
      </>
    ),
    line: (
      <>
        <circle cx="19" cy="21" r="10" />
        <path d="M26.3 28.3 35 37" strokeWidth="4.5" />
        <path d="M14 18h10M14 22.5h7" strokeWidth="1.8" />
        <path d="M32 5h9a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-5.5L32 19.5V16a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z" />
        <path d="M36.5 7.6l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9z" fill="currentColor" stroke="none" />
      </>
    ),
  },
  // Starter: one small storefront.
  starter: {
    fill: (
      <>
        <path d="M11 13h26l-2 7H13z" />
        <rect x="15" y="25" width="8" height="7" rx="1.2" />
      </>
    ),
    line: (
      <>
        <path d="M13 20v19h22V20" />
        <path d="M11 13h26l-2 7H13z" />
        <path d="M19.7 13l.6 7M28.3 13l-.6 7" strokeWidth="1.6" />
        <rect x="15" y="25" width="8" height="7" rx="1.2" />
        <path d="M26 39v-8.8a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2V39" />
        <path d="M9 39h30" />
      </>
    ),
  },
  // Growth: a storefront with a workshop wrench beside it.
  growth: {
    fill: (
      <>
        <path d="M4 13h25l-2 7H6z" />
        <rect x="8.5" y="25" width="7" height="6" rx="1.2" />
        <path
          transform="translate(4 0) rotate(45 33 31)"
          d="M31.3 20.77V25h3.4v-4.23A5.5 5.5 0 0 1 34.8 31.2V40a1.8 1.8 0 0 1-3.6 0v-8.8A5.5 5.5 0 0 1 31.3 20.77z"
        />
      </>
    ),
    line: (
      <>
        <path d="M6 20v18h21V20" />
        <path d="M4 13h25l-2 7H6z" />
        <path d="M12.3 13l.7 7M20.7 13l-.7 7" strokeWidth="1.6" />
        <rect x="8.5" y="25" width="7" height="6" rx="1.2" />
        <path d="M18.5 38v-7.8a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2V38" />
        <path d="M3 38h25" />
        <path
          transform="translate(4 0) rotate(45 33 31)"
          d="M31.3 20.77V25h3.4v-4.23A5.5 5.5 0 0 1 34.8 31.2V40a1.8 1.8 0 0 1-3.6 0v-8.8A5.5 5.5 0 0 1 31.3 20.77z"
        />
      </>
    ),
  },
  // Scale: a distribution warehouse with a roll-up door.
  scale: {
    fill: (
      <>
        <path d="M6 19 24 8l18 11z" />
        <rect x="17" y="26" width="14" height="14" />
      </>
    ),
    line: (
      <>
        <path d="M6 19 24 8l18 11" />
        <path d="M9 17.2V40h30V17.2" />
        <circle cx="24" cy="15" r="1.8" strokeWidth="1.5" />
        <path d="M17 40V26h14v14" />
        <path d="M17 29.5h14M17 33h14M17 36.5h14" strokeWidth="1.5" />
        <path d="M5 40h38" />
      </>
    ),
  },
};

/**
 * The /solutions duotone icons — interim, drawn in code on 2026-10-31 until the
 * commissioned set lands (see the illustration brief). A tint disc, then the
 * second-tone fills, then deep-blue outlines; every colour comes from
 * solutions-page.css, so a section can re-tone them. Decorative: the card's
 * own heading names what each shows.
 */
export default function DuoIcon({ name, size = 48 }: { name: DuoIconName; size?: number }) {
  const icon = ICONS[name];
  return (
    <svg
      className="mb-sol-duo"
      data-icon={name}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden
      focusable="false"
    >
      <circle className="mb-sol-duo-bg" cx="26" cy="27" r="19" />
      <g className="mb-sol-duo-fill">{icon.fill}</g>
      <g
        className="mb-sol-duo-line"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon.line}
      </g>
    </svg>
  );
}
