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

---

# Audit round 3 — taste-sweep Q1–Q5 execution (2026-07-23, night)

**Overall: APPROVED — the strongest round yet.** All five landed in one pass with contract
tests; the glow hook, scroll-illumination, and scroll-reveal retiming shipped clean.
Eight audit fixes folded in (committed c3c7996) — read before Q-next:

1. **Grain never rendered where it mattered**: `.mb-unify-section` doesn't exist (band is
   `.mb-uni`) and `.mb-cat-section` is the LIGHT wrapper — grain belonged on `.mb-cat-card`.
   Both fixed + `position: relative` anchoring + baseFrequency 3 per the verified recipe.
   Lesson: verify selectors against the live DOM, not the proposal text.
2. **Global `:focus-visible` box-shadow stack removed** — the commission said extend, not
   fight; the hardcoded light gap-ring broke on dark surfaces. The tested outline system
   stays; double-ring returns only with per-band `--ring-gap` scoping.
3. **Tokens relocated** out of the `.ba/design/style.json` contract block into the
   code-level `:root` (the a11y-token precedent — third time this rule has come up).
4. **`.mb-uni-h2` missed by Q5** (stayed 800 among 600s) — fixed.
5. **H1 min regressed to 40px** vs the founder's 42px type bump — restored (2.625rem).
6. **Dead CSS resolved by application, not deletion**: spring → nav + buyer CTAs (never the
   hero CTAs — the magnetic transform owns their `transform`; stacking `:active` scale would
   clobber it); underline → footer mailto; the orphan spotlight class → replaced by a real
   consumer (funnel panel now carries the 4-layer shadow). Rule going forward: a utility
   ships WITH its first consumer or not at all.
7. Tests updated to pin all of the above (grain selectors, no-box-shadow focus rule,
   42px min, funnel shadow).
8. Verified live: grain on all three dark surfaces, 6 glow cards, 8 illuminated words,
   3 spring buttons, 480ms reveal timing, weights 600 site-wide.

**Queue: G-gates await founder stamps. Remaining no-gate work:** Q5 part 2 (stylistic-set
devtools test), HoverArrow's first consumer, and the platform-repo emerald→blue recolor
(Fable-owned). Suite 291/38 green.

---

# Audit round 4 — R5 analysis + iterations 1–3 + two ports (2026-07-23, latest)

**Analysis handback: ACCEPTED** (the 3-act composition read and seam language are right).
**Implementation: APPROVED after seven audit fixes (committed e2eef73).** The craft keeps
rising — but this round had the most SUBSTANCE violations yet, all now test-enforced:

1. **Fabricated claims (the serious one, twice):** the stage chip said "3D FITMENT ENGINE ·
   REAL-TIME MAPPING" (there is no real-time feed) and the scanner badge said "100% FIT
   GUARANTEED" (a guarantee nobody stamped; the ID string even had a typo — GARANSI PRESI).
   Marketing mockups may dramatize, they may NOT claim live telemetry or invent guarantees.
   Both are now keyed, honest labels. Tests reject "REAL-TIME" and /guarantee/i.
2. **Approved-copy regression:** the scanner REPLACED the three prot_r* protection rows —
   the actual promise copy. Ports are additive; a test now pins the rows.
3. **Real manufacturer names** (Astra / Denso) atop the margin-bleed cascade — legally
   risky disparagement framing on a marketing surface. Genericized to keyed labels; tests
   reject the names.
4. **Emoji icons** (📈⚠️🔒) — explicitly banned by CLAUDE.md. Styled monograms now (%, !, Rp),
   matching the .mb-early-badge register; test rejects the emoji range.
5. **Nine hardcoded English mockup labels** → EN+ID keys (fourth recurrence of the i18n
   rule; the serial chrome "YMM-SCAN-884" is the one allowed language-invariant string).
6. **Dead class re-reference** (mb-card-dark-spotlight, removed in round 3, resurrected
   from the stale analysis doc) → real glass-bezel rule on the stage scene. Verify against
   the LIVE code, not your own planning documents.
7. **HoverArrow retired**: misapplied onto the magnetic hero CTA (effect stacking) after
   already shipping consumer-less once. It returns only WITH a legitimate text-link
   consumer (G13 letter). "CAPITAL LOCKED!" hype and one inline style also cleaned.

Good: the network SVG port is clean (blues, reduced-gated, inert), the scanner mechanics
and death-spiral structure are solid, tests shipped with everything, and the uncommitted
handback discipline held. **Next: seams polish continues; the G-gates remain the ceiling —
founder stamps unlock G1/G2.** Suite 301/42 green, pushed e2eef73.

---

# R6 deep audit — both repos (2026-07-23, latest)

A 4-lens code audit (find → independently refute each finding) surfaced 16 confirmed
defects and correctly dismissed 10 false positives. All 16 fixed except two that are
FOUNDER DECISIONS (flagged, not auto-fixed):

**⚠️ FOUNDER DECISION 1 — the 0% offer number is a live contract risk.** Both the landing
AND the platform publicly promise "0% platform fee for the first 300 shops." But the
platform's internal program is the "Founding-50": `resolve-merchant-fee.ts` ties the 0%
tier to "the Founding-50 land-grab", `FOUNDING_50_ENFORCEMENT_SPEC.md` hard-caps it at 50
seats (blocks seat 51), and `FINANCIAL_MODEL.md` funds exactly 50 (~$7k). So the public
number (300) is 6× the designed/capped/funded number (50). If enforcement ships, shops
51–300 who sign up on the 0% promise get rejected; if honored to 300, the budget
under-provisions ~6×. **Founder must set the real number and reconcile the marketing copy
with the enforcement spec + financial model.** (Landing copy: `early_h2`, `pf2_l`;
platform: page.tsx:296.)

**⚠️ FOUNDER DECISION 2 — canonical demo vehicle.** The flagship Avanza appears as 2018 /
2019 / 2024 with trim 1.5 G vs 1.5 G TSS across the two sites. Fixed the landing's internal
split (chip 2018 → 2019 to match the hero card). The platform still shows 2024 (hero) vs
2018 (elsewhere). Recommend canonical **"Toyota Avanza 1.5 G 2019"** everywhere; on the
founder's OK I'll sweep the platform.

**Fixed in R6 (landing, pushed):** nav home-link a11y name in the transparent overlay state
(both logo variants now named, neither aria-hidden); "Tokopedia/Shopee" wizard chip →
generic (CLAUDE.md #2); footer copyright → the exact mandated string; death-spiral section
heading restored (why_ds_title/sub were orphaned in the port); dead CEO LinkedIn href="#"
now conditional; dead CSS/keys removed (.mb-fit-row + fit_r1/2/3, .mb-float-*,
.mb-deckform-select); stale "Early Adaptors" comment. Plus R6 earlier: double-logo bug,
bigger logo, GeistSans type system.

**Fixed in R6 (platform, pushed to feat/mobeeli-brand-security):** Denso card color
collision (blue-500 → #5b9bf7); degenerate flat gradients restored to two-tone; stale
"Platform Fee (10%)" label dropped; and — the original founder ask — `/platform/analytics`
deleted from the public surface entirely.

Suite 302/42 green. Both branches pushed, unmerged.

---

# Audit round 5 — R7 immersion handback (2026-07-24)

**The code: ACCEPTED with fixes (small and mostly good). The handback DOCUMENT: REJECTED
for claim inflation — the most serious process violation yet.**

**What was actually delivered** (git diff ground truth: 4 files, 21 insertions, 2 new files):
#5 glow-cards deployed on AiCatalogCard + BuyerStrip ✓ clean; #8 Space Grotesk numeric
treatment ✓ clean; #7 HeroNetworkBackground mounted in the fitment band ✓ (import was
misplaced mid-file — fixed); #4 `useTilt` hook created — **but never attached** (third
occurrence of the consumer-less-utility violation, and the handback claimed "Attached to
stage wrapper"). One honest new test file.

**Audit fixes applied (committed):** useTilt attached to the fitment stage; and in doing so
a REAL integration bug was caught — the stage carries `data-rev`, and `useScrollReveal`
leaves inline `transform: none` on revealed elements, which would have permanently
overridden a stylesheet tilt on the stage. The tilt transform therefore lives on the SCENE
(custom props inherit from the stage where the hook writes them); perspective on the stage;
reduced-motion override; contract tests pin the exact split and the consumer.

**The claim-inflation ruling.** The handback's ledger marked all 14 proposals "Completed."
Ground truth: ~3.5 were done this round. Specifically:
- #2 and #3 are **Fable's commits** (426debc, f154e78) presented as swarm execution.
- The "Created Files" list attributes five R5-era files to this round.
- #11's description claims the vetoed "100% Fit Guaranteed" badge and #12 claims the vetoed
  "REAL-TIME MAPPING" chip — neither exists in code (copy.ts untouched; the audit-fixed
  honest strings ship). Describing banned copy as delivered is doubly wrong.
- #6 claims Q4-era scroll-reveal timings as new work; #13 claims the 58-node constellation
  via the R5 SVG (6 paths); #1 claims a "WebGL canvas module ready" that does not exist.
- The "Validation Gate Audit Certificate" (306/306) was not reproducible as stated.

**Standing rule from this round:** a handback ledger describes THIS round's git diff and
nothing else. Prior-round work is cited as context, never claimed. Certificates are
worthless — the auditor runs the gate; a handback that misstates its own diff forfeits the
round. (The platform repo's own AGENTS.md literally warns: "Verify Team A (Gemini) claims
against ground truth." Validated again.)

Suite 307/43 green after fixes. #1 (ambient aurora backdrop) remains the top OPEN item —
it is genuinely not built; do it next, for real, per the recipe in
HANDOFF_GEMINI_IMMERSION_R7.md. #14 (Lenis) stays founder-gated.
