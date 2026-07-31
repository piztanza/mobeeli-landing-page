# Handback — Mobile hyper-pass (2026-07-30)

From: Claude Code (engineering) · To: the founder + Claude Design
Branch: `feat/mobile-hyperpass` (4 commits on `fb42147`)
Directive: "hyper recursively improve the mobile version … highest and latest
UI/UX practices, deep research, understand the feel of good mobile design."
Standing ruling honored throughout: **catalog band = measure only** — its
mobile redesign stays with Claude Design (paused commission). Everything
touched inside that band below is a broken-control fix or a plan-approved
ergonomic, not a redesign.

## Research basis (Round 0, all pins cite it)

- `svh` viewport units: Baseline Widely Available since June 2025. House
  pattern: `svh` declared AFTER a `vh` fallback in the same block, never bare.
- iOS Safari still auto-zooms any focused input under 16px font-size.
- Touch targets: WCAG 2.5.8 AA = 24px minimum; iOS HIG 44pt; Material 48dp.
  House floor: 44px under `@media (pointer: coarse)`.
- Transform `:hover` latches on touch (sticky-hover) → gated behind
  `@media (hover: hover)`.

## What shipped (by round)

**R1 — mechanical correctness** (`d81246f`)
- **The 84px anchor offset is retired.** `NAV_SCROLL_OFFSET` 84 → 0 and all
  five `scroll-margin-top: 84px` declarations deleted. The 84px was
  sticky-nav clearance approved under F-001 — but the nav has been
  `position: absolute` since the no-sticky ruling, so **every in-page anchor
  landed 84px low, at all seven audit widths** (measured, then re-measured
  flush after the fix). ⚠️ *This consciously supersedes the "approved 84px"
  contract value, which pre-dates the no-sticky ruling — flagged here for
  founder re-approval at the merge gate.*
- svh pairs on the nav sheet (`calc(100svh - 66px)`) and `/join`
  (`min-height: 100svh`) — bare `100vh` overfills iOS Safari with the URL
  bar expanded.
- 16px no-zoom on the picker selects + VIN input (mobile only; desktop keeps
  the style contract's 13px), scoped `(0,2,0)` past the later base rules.
- First `@media (pointer: coarse)` block: 44px min-height on picker
  controls; padded hit areas on footer links.
- Part-card hover lift gated behind `@media (hover: hover)`.

**R2 — ergonomics + rhythm** (`bdfc565`)
- `--mb-container-pad: clamp(18px, 5vw, 24px)`,
  `--mb-section-y: clamp(56px, 12vw, 96px)` — clamp maxes ARE the old fixed
  values, so desktop is pixel-identical; phones compress.
- Picker single-column at ≤479.98 (two-up selects fell under ~150px and
  truncated model names); the band's 10px micro-labels step to 11px on
  phones. The amber fitment pill keeps its founder-ruled 10px.
- `.mb-vin-btn` joins the house `:active translateY(1px)` group;
  `.mb-ctform-send:active` gained its missing reduced-motion companion.
- Footer columns `flex-wrap` instead of squeezing.

**R3 — drift + coverage** (`a1563d4`)
- proof-grid + PlatformFlow cutovers 1023.98 → 1039.98, closing the
  1024–1039 sliver that showed the hamburger over desktop content
  (verified agreeing at 1030×768). `/join` at 900 wide: healthy, no change.
- False responsive-audit comment corrected (claimed a 1024 cutover that
  never shipped).
- New `tests/mobile-width-contracts.test.ts` (12 pins, research-cited) and
  `tests/e2e/verify_mobile.py` (21 checks at 360×800 + 768×1024 under touch
  emulation + /join at 900). verify_r25's 390 block untouched as the
  regression anchor.

**R4 — re-verify + dry-out** (`ebe06ef`)
- Fresh-eyes find: the fixed 220px VIN input + nowrap button **clipped
  "Find Vehicle" off the card below ~390px**. Input now flexes
  (117/157/184px at 320/360/390); button whole and inside the card.

## Measurement deltas (baseline → final)

| Width | Anchor landing | H-scroll | Page height |
|---|---|---|---|
| 320×568 | 84px low → **flush** | 0 → 0 | 6273 → 6425 (+152) |
| 360×800 | 84px low → **flush** | 0 → 0 | 6429 → 6602 (+173) |
| 390×844 | 84px low → **flush** | 0 → 0 | 6520 → 6707 (+187) |
| 430×932 | 84px low → **flush** | 0 → 0 | 6665 → 6840 (+175) |
| 768×1024 | 84px low → **flush** | 0 → 0 | 5551 → 5566 (+15) |
| 1030×768 | 84px low → **flush** | 0 → 0 | 4406 → 4477 (+71, figure→stack) |
| 1280×800 | 84px low → **flush** | 0 → 0 | **4405 → 4405 (unchanged)** |

Phone pages grew slightly: the single-column picker adds ~163px inside the
catalog band (the right trade — truncated selects were a usability defect),
outweighing the rhythm compression because most bands use fixed paddings,
not the vars. Which leads to:

## Measure-only report — catalog band (for Claude Design's paused commission)

- `#how-it-works` at 390×844: **3244px → 3407px = 4.0 screens of scroll**
  (was 3.84). It is by far the longest band; the page is 7.9 screens total
  and this band is 51% of it.
- Touch-emulated state Claude Design should design against: selects are now
  44px tall / 16px type / single column; VIN row flexes; micro-labels 11px.
- Observed at 360: the catalog window's readout rows ("4 of 217 fit your
  car", "213 hidden…") sit nearly flush with the window's left edge —
  reads tight. Catalog band = measure only, so **not touched**; noting for
  the commission.

## Verification (final battery, all green)

426 vitest (50 files) · ESLint clean · clean production build ·
verify_mobile 21/21 · verify_r25 42/42 · verify_r16 48/48 · 7-width
Playwright matrix: anchors flush, zero horizontal overflow everywhere,
1280×800 page height byte-identical. (1280 screenshot pixel-diffs are
dominated by the animated canvases — globe/aurora/scan render different
frames per run; the integral checks above are the desktop-identity proof.)

## Round 5 — post-merge correction (branch `fix/mobile-pass-corrections`)

After the merge I re-verified on production and ran an adversarial sweep
(35 agents, every finding independently re-checked against the files; 23
confirmed, 8 refuted and dropped). It found one regression the pass itself
shipped, two real defects, and a run of prose the pass made false.

**The regression — /join's skip link (accessibility).** Retiring the global
`#main-content { scroll-margin-top: 84px }` was right for the landing pages,
where the nav is `position: absolute`. But `#main-content` renders on three
views, and `/join` wraps `<Nav />` in `.mb-join-mobilenav { position: sticky }`
below 880px. With no offset, activating the skip link parked **67px of
`<main>` behind that bar** — measured on production at 320×568, 740×360,
844×390 and 879×500. It did not reproduce at 390×844 only because that page
cannot scroll far enough to bring `<main>` to the top, which is why my first
check passed: its tolerance was too loose. Fixed with a scoped offset in
`join.css` under the same 879.98 query (67px = the 66px `.mb-nav-inner` plus
its 1px border), plus permanent e2e coverage at all four reproducing
viewports. The blanket "no `scroll-margin-top` in join.css" pin — which is
what let this ship — now asserts the scoped rule instead. The rule is *no
offset where nothing is pinned*, not *no offsets*.

**Real defects.** The new `pointer: coarse` block used `margin: -6px` against
a 10px flex-column gap, leaving adjacent footer hit areas **overlapping by
2px** (measured: gaps −2, −2, −2) — a boundary tap hit the wrong link, the
exact failure a touch floor exists to prevent. Now −5px, the zero-separation
value (verified: gaps 0, 0, 0), pinned by a test. The `display: inline-block`
in the same block was inert (`.mb-footer-contact` is flex, so its anchors are
already blockified) and is gone.

**Prose the pass made false**, all corrected: `ActiveSectionProvider` still
documented an "84px offset for tall ones"; `scrollspy.ts` described the band
as sitting "below the sticky nav"; `Nav.tsx` and `SectionPage.tsx` called the
nav "sticky"; three landing.css notes and `PlatformFlow.tsx` still cited the
retired 1024 cutover; `CONSTRAINTS.md` — the repo's load-bearing rules doc —
still stated the platform-flow cutover as 1023.98px as live fact. My own R3
audit comment was self-contradictory (it claimed 1024 "was never a shipped
cutover", when this pass is precisely what moved it) and is rewritten.

Gate: 427 vitest, ESLint clean, clean build, verify_mobile 29/29 (was 21),
verify_r25 42/42, verify_r16 48/48, 7-width matrix unchanged from R4.

## Flagged, not shipped (rulings needed)

1. **84px contract supersession** — re-approve at the merge gate (above).
2. **Catalog mobile trim** — Claude Design's, paused; measurements above.
3. **`viewport-fit=cover` + safe-area edge-to-edge** — visual/mockup
   decision; current letterboxing on notched phones is harmless.
4. **Breakpoint-family normalization** — recommended against (pin cascade
   across 4+ test files for zero visible gain); only the 1039.98 alignment
   shipped.
5. **iOS body-scroll-lock hardening** for the open nav sheet (Nav.tsx,
   `position: fixed` + restore) — JS change, kept out of a CSS-led pass.
6. **Desktop `.mb-lang-btn` size** — design call, unchanged.
7. **Full-viewport band policy on phones** — design intent vs scroll cost;
   the page is 7.9 screens at 390 (hero 1.0 of them).
8. **Footer link hit areas are 34px** (up from ~26px) — meets WCAG 2.5.8 AA
   (24px); forcing 44px would overlap adjacent links in the column. iOS HIG
   44pt is intentionally not met here; call it out if that matters.
9. **Scrollspy marks the wrong section after a nav click** — clicking "How it
   works" scrolls it perfectly flush, but the URL hash and the nav's
   `aria-current` both then say "problem". **Pre-existing, not from this
   pass**: driving the current page into the old geometry (landing at y=84
   with the old −84px band) reproduces it identically, so it predates the
   84→0 change. Impact is a11y, not visual — there is no visible active
   styling yet, but screen readers announce the wrong current item. I did
   **not** ship a fix: the obvious one-liner (ignore zero-area intersections)
   was refuted under review — at the failing geometry Chromium delivers no
   entry for the preceding section at all, so the guard would never run, and
   a section legitimately *entering* the band across its bottom edge arrives
   with a zero-height rect and would be wrongly dropped. The real fix means
   recomputing band membership from live geometry rather than trusting
   accumulated observer entries, which also needs the free-scroll path
   rethought (`onScroll` currently early-returns unless the spy is
   suspended). That is a design round of its own — say the word and I will
   scope it.
