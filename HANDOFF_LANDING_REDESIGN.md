# HANDOFF_LANDING_REDESIGN.md — visual-polish loop for the redesigned landing

Written 2026-07-23, as of branch `feat/phase1-a11y` @ `522eee3` (redesign phases 1–5
complete; suite 265 green, lint clean, build clean). **Read `CLAUDE.md` first** — its hard
rules bind every change below. This document scopes the Gemini agentic-swarm iteration:
**visual polish and media only; structure, routes and copy architecture are locked.**

## 1) Context & goals

Mobeeli's pre-launch landing was restructured to investor-grade cleanliness (founder-approved
plan): full-viewport dark hero with a transparent overlay nav, a slim 5-band front page,
data/stats moved to `/why-mobeeli`, broad copy on the front page (deck thesis, no market
figures, no moat mechanics — founder direction: the tech moat must not be legible from the
marketing site). Your job: make it beautiful — media, texture, motion polish — inside the
locked structure. Inspiration register (founder-reviewed): Linear (dark cinematic), Mercury
(investor minimalism), Stripe (whitespace/confidence), Vercel (show-don't-tell), aruna.id
(Indonesian marketplace credibility).

## 2) Locked decisions — do not change

- **Band order (Variant B, founder-stamped):** Hero (dark, 100svh) → Problem slim (light) →
  UnifyBand/archipelago (dark) → HowItWorks slim (light) → BuyerStrip → Footer.
- **Nav state machine:** `Nav` takes `overlay` (landing only). Transparent at rest
  (`.mb-nav--overlay`), `is-solid` once the hero (`#top`) scrolls past the 66px bar
  (`useOverlaySolid`, IO rootMargin -66px) or while the mobile sheet is open. Both logo
  variants are always in the markup; CSS swaps them (`.mb-nav-logo-blue/-white`).
- **Routes:** `/`, `/join`, `/team`, `/early-adaptors` (+AI catalog), `/investors`,
  `/why-mobeeli` (WhyMobeeli + ProblemStats + SearchComparison + ProofBar; keeps
  `id="why-now"`). Nav "Why now" → `/why-mobeeli`.
- **Front-page copy is broad by founder direction:** `hero_sub_short` (deck thesis line) and
  `how_s2_d_short` (no mapping counts). Do not reintroduce numbers or moat specifics on `/`.

## 3) Contracts (violations = rejected work)

- All user-facing strings in `src/lib/i18n/copy.ts`, **both EN and ID**; additive keys only,
  never edit existing values; every new value needs a founder stamp before merge.
- Copy rules: no exact fee, no marketplace names, "Early Adaptors" spelling, no hype/emoji,
  footer text fixed.
- `globals.css` `:root` tokens are a contract with `.ba/design/style.json` — **additive only**.
  Never hand-edit `.ba/` or `ba-link.json`.
- All motion behind `useReducedMotion` (JS) / `prefers-reduced-motion` gates (CSS); three.js
  scenes stay `dynamic(..., { ssr: false })` client islands; IndoGlobe keeps its in-view mount
  gate (`SCENE_PRELOAD_MARGIN` in `UnifyBand.tsx`).
- A11y system is load-bearing: SkipLink stays the first focusable element; the global
  `:focus-visible` ring (globals.css) must keep ≥3:1 contrast on every surface you restyle;
  no rule may suppress `outline` (tests enforce this for the nav overlay).
- Perf: LCP < 2.5s mobile; the hero H1 is server-rendered and nothing may block it; videos are
  `preload="none"`, muted, looped, `playsInline`, with a static reduced-motion fallback.
- Git: work on branches; **pushing `main` deploys production**; commit author must remain
  `78766430+piztanza@users.noreply.github.com` (repo-local config already set).
- Verification per iteration: `npm test` (265) → `npm run lint` → `npm run build`, then a
  preview walkthrough (keyboard pass, scroll flip, 360px sheet, reduced motion, EN/ID).

## 4) Component / selector inventory

| Band | Component | Key selectors |
|---|---|---|
| Overlay nav | `src/components/landing/Nav.tsx` | `.mb-nav`, `.mb-nav--overlay`, `.is-solid`, `.mb-nav-logo-blue/-white` |
| Hero | `Hero.tsx` | `.mb-hero` (100svh, scrim + radial gradients), `.mb-hero-grid`, `.mb-herocard*`, `.mb-card-video` (unify-graph.mp4) |
| Problem slim | `ProblemSection.tsx` | `.mb-section`, `.mb-quote` (Senen quote) |
| Archipelago | `UnifyBand.tsx` | `.mb-uni`, `.mb-uni-scene` (IndoGlobe island, mount-gated) |
| How it works slim | `HowItWorks.tsx` | `.mb-step-card`, `.mb-ymm-pill`, `.mb-fit-row`, `.mb-prot-row` |
| Buyer strip | `BuyerStrip.tsx` | `.mb-buyer*` |
| Data page bands | `ProblemStats.tsx`, `SearchComparison.tsx`, `ProofBar.tsx`, `WhyMobeeli.tsx` | `.mb-card/.mb-pain-*`, `.mb-cmp*`, `.mb-proof*`, `.mb-why` |
| Skip link / focus | `SkipLink.tsx`, `globals.css` | `.mb-skip-link`, `:focus-visible`, `#main-content` |

Tests that pin the structure: `landing.test.tsx` (band order, absences, broad-copy contract),
`nav-overlay.test.tsx`, `nav-mobile.test.tsx`, `section-pages.test.tsx`, `a11y-skip-focus.test.tsx`,
`seo-meta.test.ts`. Update tests WITH your change only when the change is approved.

## 5) Copy-key ledger (redesign additions)

| Key | EN | Stamp status |
|---|---|---|
| `skip_to_content` | "Skip to content" / ID "Langsung ke konten" | shipped (a11y pass) |
| `hero_sub_short` | deck thesis line ("One platform to unify Indonesia's auto industry — …") | sourced verbatim-adjacent from the founder-approved deck; founder veto pending at preview |
| `how_s2_d_short` | "Every listing is checked for fitment before you ever see it." | founder-directed broadening; veto pending at preview |

## 6) Media plan + asset inventory (the creative loop)

Founder direction: **mixed storytelling — generated illustrations + real photography + 3D +
subtle video; must not look AI-generated.** All clips below are founder-owned (no licensing
risk). ffmpeg 8.1.2 is installed on this machine.

**Asset sources**
- Pitch site: `C:\Users\user\.gemini\antigravity\scratch\mobeeli-site\public\veo\master.mp4`
  (175MB master) and `unify-graph.mp4` (already shipped in this repo's hero card).
- `C:\Users\user\Downloads\` Veo clips (strongest candidates):
  `Jakarta_miniature_aerial_view_4K_202607070216.mp4`, `Wholesale_parts_market_Jakarta_4K_202607070219.mp4`,
  `Hands_verify_wheel_on_car_202607070218.mp4`, `Market_lights_up_verified_teal_202607070220.mp4`,
  `Wheel_settles_onto_car_hub_202607070324.mp4`, `Car_rolls_into_market_street_202607070220.mp4`,
  `Teal_hub_UNIFIED_GRADED.mp4`, `Aerial_view_of_Indonesian_city_202606300121.mp4`.

**Per-slot proposals (iterate visually; founder approves each)**
- Hero background: EITHER keep CSS-only (current scrim + radial gradients) OR a heavily
  darkened Jakarta-aerial loop UNDER the existing gradients (wrap in a div behind
  `.mb-hero-grid`, `object-fit: cover`, opacity ≤ 0.35, reduced-motion → poster frame).
- Problem band: founder-supplied photo of the Senen shop owner beside the quote (**asset ask —
  needs founder shot + consent**); until then stay typographic.
- Archipelago: IndoGlobe IS the media — polish, don't replace.
- HowItWorks step 2: optional `Hands_verify_wheel` micro-clip inside the card; parts sprites
  (`public/assets/parts/*.png`) are the zero-weight alternative. Missing sprite: `parts/pad.png`
  (AiCatalogCard slot 0 auto-adopts it — second asset ask).
- Generated illustration: faint archipelago dot-grid SVG in brand palette for the hero or
  buyer strip background (`rgba(91,155,247,0.06–0.10)`).

**Encode recipe (target ≤ 2–4MB, 720p, silent, loop-clean):**
```bash
ffmpeg -i INPUT.mp4 -an -vf "scale=-2:720,fps=24" -c:v libx264 -profile:v main -crf 28 -movflags +faststart OUTPUT.mp4
```
Add `-t 6` for a 6s loop; check the seam (`-vf "...,loop=..."` or trim to a clean cycle).
Poster frame for reduced motion: `ffmpeg -i OUTPUT.mp4 -frames:v 1 poster.jpg`.

## 7) Iteration protocol (hyper-recursive loop)

1. One visual hypothesis per iteration (e.g. hero background clip at 0.3 opacity).
2. Implement on a branch off `feat/phase1-a11y`; run the full gate; push → Vercel preview.
3. Screenshot desktop 1280 + mobile 390, light thumbs; founder verdict on the preview URL.
4. Rejected → revert; approved → keep and stack the next hypothesis.
5. Never batch unrelated visual changes; the founder must be able to veto line-items.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
