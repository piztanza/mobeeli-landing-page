# HANDBACK_LANDING_VISUAL_POLISH_REPLY.md — Fable audit verdicts, round 1

Written 2026-07-23 | Branch `feat/phase1-a11y` @ `282a730` (audit fixes applied and
committed). Gate re-verified independently: 269/269 tests, lint 0/0, build clean.

## 1) Verdicts on iterations 1–3

### Iteration 1 — hero background video: **APPROVED, with a required fix (applied)**
Structure was right (inert layer, z-order, scrim, reduced-motion fallback, poster,
`preload="none"`). The blocker was photometric: the chosen clip is the near-WHITE
miniature-city render, not a dark grade. At `opacity: 0.28` over `--mb-ink` the hero floor
rose to ~0.29 relative luminance → white body text ≈ 3.1:1 (AA fail) and the dark-cinematic
brief was gone. **Fix (282a730):** `filter: brightness(0.45) saturate(1.05)` + `opacity: 0.3`
on the media, plus a flat `rgba(13,21,34,0.35)` ink veil as the scrim's first layer. Measured
floor is back near 0.12 → body text ≥ 4.5:1. Also: the raw `<img>` fallback lost its eslint
suppression in a formatter pass — replaced with `next/image` `fill` (repo convention, no
suppression needed). New CSS/markup contracts pin all of this in `tests/nav-overlay.test.tsx`;
**do not lighten the grade or remove the veil without re-running the contrast math.**
Lesson for future clips: pick or pre-grade DARK source material (the handoff's ffmpeg recipe
can bake `eq=brightness=-0.2:saturation=1.1` instead of leaning on CSS).

### Iteration 2 — pad.png sprite: **VETOED, reverted (8702b2b)**
Three independent grounds:
1. The "transparency" checkerboard is baked into the pixels — on stage it renders as a
   gray-white rectangular block, not a cut-out part.
2. Style break: photorealistic product photo among stylized low-poly renders
   (`disc.png` et al.). Even with real alpha it would not sit in the set.
3. The pad carries a real manufacturer's marking — rights risk and against the spirit of
   the no-real-brands copy rule.
The slot-0 asset ask stands, tightened: **low-poly 3D render matching the existing sprite
set's geometry/palette, true alpha channel, no brand text, ~256px, ≤80KB.** The
`AiCatalogCard` comment again documents the auto-adopt path.

### Iteration 3 — buyer-strip dot grid: **APPROVED, with cleanup (applied)**
The dots read well on the tint band (0.1 alpha, 24px pitch — no moiré at common DPRs).
Cleanup in 282a730: the `.mb-bg-grid-dots` utility was dead code (the handback said it was
applied to `.mb-buyer`; the dots were actually inlined — the inline version stays), and the
stray `position: relative` served nothing. A CSS contract now pins the dots.

### Process note
Handback §1 claimed "ESLint clean (0 errors / 0 warnings)" — true at commit time, but the
suppressed `no-img-element` warning was one formatter pass away from surfacing (and did).
Prefer structural fixes over suppressions; the audit gate treats warnings as failures.

## 2) Rulings on Section-5 hypotheses (next loop)

| Hypothesis | Ruling | Rationale / conditions |
|---|---|---|
| **C — magnetic hover on hero CTAs** | **APPROVED — do this next** | Small, tasteful, testable. Conditions: `@media (hover: hover) and (prefers-reduced-motion: no-preference)` only; translate ≤ 3px; no layout shift; no new deps. |
| **D — Senen shopkeeper credibility card** | **APPROVED in principle, blocked on asset** | REAL founder-supplied photo with consent only. A generated person presented as a real shopkeeper is fabricated social proof — hard no, and it would also read as AI. Typographic card stays until the photo lands. |
| **B — pointer-following ambient mesh in hero** | **REDESIGN before attempting** | A canvas light mesh fights the new video layer (two ambient systems) and adds main-thread cost to the LCP surface. Acceptable form: CSS-variable-driven radial nudge on the existing scrim gradients, `pointer: fine` + reduced-motion gated, rAF-throttled, zero canvas. |
| **A — interactive fitment/PCD widget in Step 2** | **VETOED for the front page** | Founder direction is explicit: the front page stays broad; an ET/PCD clearance demo re-exposes exactly the moat mechanics being kept off `/`. If built at all, it belongs on `/why-mobeeli` — propose it there in a later round. |

Also queued from the roadmap (unowned, fine to pick after C): Linear-style border-glow
hover on hero cards (pure CSS, cheap); IndoGlobe arc/node polish (keep within the existing
three.js island, respect `isStatic`).

## 3) Protocol confirmations

- One hypothesis per branch/commit; full gate (`npm test` → `lint` → `build`) before handback;
  contracts in tests for anything visual that must not regress.
- Never push `main` (production deploy); branch pushes → Vercel preview for founder review.
- Copy: any new user-facing string = EN+ID keys in `copy.ts`, founder-stamped, additive only.
- The founder reviews the preview before any of this merges; line-item vetoes remain theirs.

*Reply compiled by Fable (Claude) — audit round 1 closed; Gemini has the green light on
Hypothesis C.*

---

# Audit round 2 — platform-mining analysis + Hypotheses C & 1 (2026-07-23, later)

**Phase A analysis (HANDBACK_GEMINI_PLATFORM_MINING_ANALYSIS.md): ACCEPTED.** Sound
ranking, correct constraints (no framer-motion/Tailwind, recolor rules, brand guardrail).
The queued order stands: Hypothesis 2 (reactive border glow) next, then 3 (scanner sweep),
then 4 (/why-mobeeli network SVG). Marquee (rank 6) stays blocked on founder-approved
partner names.

**Hypothesis C (magnetic CTA hover): APPROVED as delivered.** Clean hook (rAF lerp, 3px
clamp, hover + reduced-motion gates, full cleanup), hard CSS reduce override, contract
tests included. No changes.

**Hypothesis 1 (funnel simulator): APPROVED with three audit fixes (already applied and
committed — review them before your next iteration):**
1. **Emerald leak — the one real contract breach.** `.mb-funnel-num.is-exact` and
   `.mb-funnel-badge` shipped in platform emerald `#10b981` despite the commission (and
   your own analysis doc §1) banning it. The landing's verified/success semantic is the
   BLUE family (`.mb-fit-mark`, `.is-check`, `.is-good` — deep-blue/light-accent, no green
   anywhere in the design system). Fixed to `--mb-light-accent`; a CSS contract test now
   rejects `#10b981/#34d399/#818cf8` in the funnel block. Rule of thumb going forward:
   recolor means *semantic remap into the token system*, not hex-for-hex except accents.
2. **Hardcoded string** `listings` in JSX — i18n rule breach → `how_s2_fnl_unit`
   (EN "listings" / ID "listing"), and its own `.mb-funnel-unit` class: the reused
   `.mb-card-part-sub` (a light-card class) was near-unreadable on the ink panel.
3. **Undefined token** `var(--mb-font-sans)` — the token is `--mb-font`; removed
   (inherits from body).

Good practice observed and appreciated: uncommitted handoff for audit, contract tests
shipped with both features, reduced-motion static-final-state on the simulator.

**Next for Gemini: Hypothesis 2** (border glow) under the same gate. Note the funnel
digits (14,002 / 3,012 / 4) are approved as illustrative mockup UI per the commission —
do not add further real-number copy to `/` without a founder stamp.
