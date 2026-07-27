# Handoff: Mobeeli landing page — R16

**Target repo:** `mobeeli-landing-page` (Next.js App Router + TypeScript, Vercel)
**Design source:** the `.dc.html` files bundled in this folder
**Prepared:** 2026-07-26
**Implementation status:** §8 (the scan) is **shipped and live** — `main` @ `2ceb938`. See `design_handback_r16_s8/README.md` in the repo for the verification record.
**→ For the remaining six changes, build from `IMPLEMENTATION-3-to-8.md` in this folder.** It supersedes §§3–7 below with exact values, the three founder decisions resolved, and per-change contract tests. This document remains the reference for *why*; that one is *what to type*.
**Fidelity:** High. Colors, type, spacing and timings below are exact and were read from the running design files.

---

## 0. Read this first

### These HTML files are references, not code to copy

The `.dc.html` files in this folder are **design prototypes**. They are single-file HTML mockups that render the intended result. They are *not* production code, they do not share the repo's component model, and nothing in them should be pasted into `src/`.

Your job is to **reproduce what they show inside the existing Next.js codebase**, using its established patterns: `useT()` for all strings, `landing.css` for all styling, the existing hooks (`useReducedMotion`, `useScrollReveal`, `useGlowCards`, `useOverlaySolid`), `next/image` for all images, CSS custom properties from `globals.css` for all tokens.

Where the mockup uses an inline style, the repo equivalent is a class in `landing.css`. Where the mockup hardcodes English, the repo equivalent is a key in **both** the `en` and `id` maps in `src/lib/i18n/copy.ts`.

### The prototypes contain deliberate placeholder copy

All English copy in the mockups is **UNSTAMPED** — drafted as a proposal, not approved. The founder rules on wording and writes the Indonesian himself. **Do not ship mockup copy.** Where this document specifies a new copy key, add the key with the draft EN string and leave the ID string flagged for the founder. Do not machine-translate.

### Verify before you change

This document cites file paths and line numbers as they were on 2026-07-26. Line numbers drift. **Locate code by the quoted content, not by the line number**, and if what you find does not match what is quoted here, stop and report the discrepancy rather than guessing.

---

## 1. What is being changed and why

Eight problems were diagnosed on the current landing page. All eight were confirmed by reading the source, and each fix below cites the evidence.

| # | Problem | Evidence in repo |
|---|---|---|
| 1 | Band 2's heading is 28px while every other band heading is up to 64px — the hierarchy collapses | `landing.css:742` `.mb-ucat-h2 { font-size: 28px }` overrides `.mb-h2`'s `clamp(38px, 4.8vw, 64px)` at `landing.css:105` |
| 2 | Two catalog stories compete on one page | `FitmentSection.tsx` (the working catalog, `id="how-it-works"`) and `AiCatalogCard.tsx` (a 15s sprite animation) both claim "the catalog" |
| 3 | Three different glass recipes, one of which is dead | `.mb-ucat-card` at `landing.css:844`, the R13 block at `landing.css:2653`, `.mb-fit-protect` at `landing.css:2620` — and the R13 block targets `.mb-cat-card`, a class that was renamed to `.mb-ucat-card` (see the comment at `landing.css:842`), so **it never matches the part cards** |
| 4 | The protection story is buried inside the fitment section | `.mb-fit-protect` is nested in `FitmentSection`; the nav has no anchor for it |
| 5 | The 1.8s scan is an undesigned loading state | `FitmentSection.tsx` sets `isScanning` for `1800`ms; the CSS runs `mb-cat-scan 1.5s infinite linear` (`landing.css:822`) — the periods do not match, so the sweep is cut off mid-pass |
| 6 | Aurora is mounted **three** times with three different intensities | `intensity={0.4}` in `Hero.tsx:32`, `{0.3}` in `FitmentSection.tsx:100`, `{0.28}` in `AiCatalogCard.tsx:258` — three WebGL contexts on one page |
| 7 | Three bands have no `id`, so they cannot be linked or tracked | `UnifyBand`, `AiCatalogCard`, `BuyerStrip` render `<section>` with no `id` |
| 8 | Three font families load where one would do | `layout.tsx` loads Inter + Space Grotesk via `next/font`, while `globals.css:2` already self-hosts Plus Jakarta Sans as a variable font (200–800) |

### Two live bugs found while preparing this handoff

Fix these regardless of what else you implement.

**Bug A — `is-scanning` has no styles.** `FitmentSection.tsx` applies `` className={`mb-cat-car-wrapper ${isScanning ? "is-scanning" : ""}`} ``, but `is-scanning` appears **zero times** in `landing.css`. The class does nothing. Because `.mb-cat-scan-line` carries `animation: mb-cat-scan 1.5s infinite linear` unconditionally, **the scan line sweeps forever**, whether or not a scan is happening. What reads as a "scan animation" today is actually permanent idle motion.

**Bug B — `mb-cat-scan` has no reduced-motion gate.** `landing.css` has reduced-motion blocks at lines 74, 316, 425, 437, 453, 662, 1028, 1138, 1164, 1368, 1473 — none of them covers `mb-cat-scan`. An infinite animation runs for users who asked for no motion. This is an accessibility defect, not a preference.

---

## 2. Founder rulings being implemented

| Ruling | Decision | Meaning |
|---|---|---|
| **A — catalog** | `1a` | One catalog band. `AiCatalogCard` comes off the landing page. |
| **B — protection** | `1c` | Protection becomes its own band with its own `id` and nav anchor. |
| **C — public surface** | `2b` | No stat tiles, no simulated prices. Part cards carry fitment specs instead. The `217 → 4` filter count stays. |
| **D — scan** | `4a` | Clinical/diagnostic single-pass readout, 1.8s, no looping. |
| **E — identity** | current mark, larger wordmark | Keep the existing logo; the wordmark grows to match the mark's height. |
| **F — type** | `7a` | One family — Plus Jakarta Sans — for display, body and numerals. |

Open items still needing a founder ruling are listed in §9. **Do not invent answers to them.**

---

## 3. Change 1 — Type system (ruling 7a)

This is the highest-leverage change and the lowest-risk, because the font is already in the repo.

### Current state

`globals.css:2` self-hosts Plus Jakarta Sans as a variable font covering weights 200–800:

```css
@font-face {
  font-family: "Plus Jakarta Sans";
  src: url("/fonts/pjs-normal-latin.woff2") format("woff2");
  font-style: normal;
  font-weight: 200 800;
  font-display: swap;
}
```

`globals.css:37` defines `--mb-font: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif` as part of the brand token contract.

A later layer (marked "R7 type system") then **overrides it** at `globals.css:57`:

```css
--mb-font-text: var(--font-inter), system-ui, -apple-system, sans-serif;
--mb-font-display: var(--font-space-grotesk), var(--font-inter), system-ui, -apple-system, sans-serif;
```

…and `layout.tsx` loads both families through `next/font/google`.

### Target state

Point both variables back at the self-hosted family, and stop loading the other two.

**Step 3.1 — `src/app/globals.css`**, replace the two `--mb-font-*` declarations:

```css
/* R16 type system (founder ruling 7a): one family. Plus Jakarta Sans is
   self-hosted above as a variable font (200-800), so display and text are
   the same face at different weights — hierarchy comes from weight and
   size, not from a second family. Drawn by Tokotype for Jakarta. */
--mb-font-text: var(--mb-font);
--mb-font-display: var(--mb-font);
```

**Step 3.2 — `src/app/layout.tsx`**, remove the `next/font/google` import, both font constants, and the `className` on `<html>`:

```tsx
// delete: import { Inter, Space_Grotesk } from "next/font/google";
// delete: const fontInter = ...
// delete: const fontSpaceGrotesk = ...
// change: <html lang={DEFAULT_LANG} className={`${fontInter.variable} ${fontSpaceGrotesk.variable}`}>
// to:     <html lang={DEFAULT_LANG}>
```

Update the block comment above the constants — it currently explains the R7 rationale and will be wrong.

**Step 3.3 — display weight.** `7a` puts the whole hierarchy on weight, so headings move from 600 to 800. In `globals.css`, the `h1, h2, h3` rule currently sets `font-weight: 600`. Change to `800`.

> ⚠️ **This rule is global, not landing-scoped.** It affects `/team`, `/investors`, `/why-mobeeli`, `/join` and every other route. Check each one visually before merging. If any page needs 600, scope the 800 to `.mb-landing h1, .mb-landing h2, .mb-landing h3` instead and say so in the PR.

**Step 3.4 — heading tracking.** `.mb-h2` (`landing.css:105`) uses `letter-spacing: -0.024em`, tuned for Space Grotesk. Plus Jakarta Sans at 800 sets tighter. Change to `-0.022em`. Do the same for the `.mb-h1` / hero heading rule if it carries a Space-Grotesk-tuned value.

**Step 3.5 — numerals.** `globals.css:80` already routes numeric elements through the display font with `font-feature-settings: "tnum"`:

```css
.mb-num-display, .mb-card-part-price, .mb-fitment-label-value, .mb-ds-badge { … }
```

This keeps working (display now = PJS). **Two things to check:**

1. **Confirm the self-hosted PJS subset actually contains `tnum`.** Plus Jakarta Sans ships tabular figures upstream, but a subsetted `.woff2` may have dropped the feature. Test with the probe in §8. If `tnum` is missing, re-subset the font including it — do not fake alignment with letter-spacing.
2. There is a **stray blank line inside that selector list** (between `.mb-fitment-label-value,` and `.mb-ds-badge`). Harmless, but tidy it while you are there.

Add the new spec-line classes from §5 to this selector list.

### What you must NOT do

- Do not add a Google Fonts `<link>`. The repo's `CLAUDE.md` requires self-hosting; a runtime CDN call is a compliance regression and a Jakarta latency regression.
- Do not delete `--mb-font`. It is part of the `.ba/design/style.json` contract block.
- Do not leave `var(--font-inter)` or `var(--font-space-grotesk)` referenced anywhere. Grep for both after the change; an unresolved var silently falls through to the next item in the stack and the failure is invisible in review.

---

## 4. Change 2 — One catalog band (ruling 1a)

**Step 4.1** — In `src/components/landing/LandingView.tsx`, remove `<AiCatalogCard />` from the `<main>` stack and remove its import.

**Step 4.2** — Do **not** delete `AiCatalogCard.tsx`, `catalogLoop.ts`, or the sprite assets. The component is well-built and the founder may want it on `/why-mobeeli` or in the deck. Leave the files in place and update the block comment at the top of `AiCatalogCard.tsx` to record that it is no longer mounted on `/`.

**Step 4.3** — Update the `LandingView.tsx` block comment, which currently documents the band order including "AI catalog demo (dark card, returned to the front page by founder decision 2026-07-23)". The new order is:

```
nav (overlay) → hero → catalog (dark, id="how-it-works") →
problem (light, id="problem") → coverage (dark, id="coverage") →
protection (light, id="protection") → buyer strip (id="waitlist") → footer
```

**Step 4.4 — dead CSS.** `AiCatalogCard`'s styles (`.mb-cat-section`, `.mb-cat-card`, `.mb-cat-stage`, `.mb-sprite*`, `.mb-cat-pill`, `.mb-file-chip*`, `.mb-ai-chip*`, `.mb-cat-h2`, `.mb-cat-p`) stay in `landing.css` since the component still exists. **Do not delete them** — but note that `.mb-cat-card` is now unused on the landing page, which matters for §6.

**Step 4.5 — Aurora.** ⚠️ **Corrected 2026-07-26.** An earlier draft of this document claimed unmounting `AiCatalogCard` leaves a single `AmbientAurora`. That was wrong — I missed `Hero.tsx`. There are **three** mounts:

| Component | Line | Intensity |
|---|---|---|
| `Hero.tsx` | 32 | `0.4` |
| `FitmentSection.tsx` | 100 | `0.3` |
| `AiCatalogCard.tsx` | 258 | `0.28` |

Unmounting `AiCatalogCard` leaves **two** live WebGL contexts, in two adjacent dark bands, at intensities 8% apart — close enough that the difference reads as inconsistency rather than intent. **Diagnosis #6 is therefore not resolved by change 4.** It needs its own decision, and it is a founder/perf call rather than a mechanical fix:

- **(a) One shared context.** Hoist a single `AmbientAurora` to `LandingView` behind both dark bands and let each band mask it. Cheapest at runtime; largest refactor.
- **(b) Keep both, unify the value.** Pick one intensity for both mounts. One-line change; still two contexts.
- **(c) Keep both, make the difference deliberate.** Hero brighter than the catalog band is defensible if it is a stated rule rather than an accident.

My recommendation is (b) at `0.35` as an immediate fix, with (a) tracked separately — two contexts is a real mobile battery and memory cost, but it is not a visual defect once the values agree. **Do not implement any of these without a ruling.**

---

## 5. Change 3 — Disclosure (ruling 2b)

The founder's standing rule: **the landing page is a company profile, not a pitch deck.** It may state what Mobeeli is, who it serves, that the product works, and who is behind it. It may not state catalogue size, fees, unit economics, traction counts, or any simulated figure.

### 5.1 Remove the stat tiles

In `FitmentSection.tsx`, delete the entire `<div className="mb-cat-stats">` block (three `.mb-cat-stat` children).

In `landing.css`, delete `.mb-cat-stats`, `.mb-cat-stat`, `.mb-cat-stat-v`, `.mb-cat-stat-l` (lines 749–773).

In `copy.ts`, delete these six keys from **both** the `en` and `id` maps:

```
cat_unified_stat1_v   cat_unified_stat1_l
cat_unified_stat2_v   cat_unified_stat2_l
cat_unified_stat3_v   cat_unified_stat3_l
```

> The left column of `.mb-fit3d-layout` now contains only the H2. Check the two-column grid still balances; it may want collapsing to a single column with the H2 full-width above the picker. Screenshot before and after at 1280, 1024 and 640.

### 5.2 Replace prices with fitment specs

In `FitmentSection.tsx`, the `parts` array currently carries a `price` string. Replace with a spec copy key:

```tsx
const parts = [
  { key: "cat_part1_name", spec: "cat_part1_spec", img: "/assets/parts/spark-plug.jpg" },
  { key: "cat_part2_name", spec: "cat_part2_spec", img: "/assets/parts/clutch.jpg" },
  { key: "cat_part3_name", spec: "cat_part3_spec", img: "/assets/parts/shock.jpg" },
  { key: "cat_part4_name", spec: "cat_part4_spec", img: "/assets/parts/brake-pad.jpg" },
] as const;
```

The `as const` is load-bearing — it keeps each `spec` a literal `CopyKey` so `t(part.spec)` typechecks without a cast. Keep it.

Replace the price markup:

```tsx
// remove
<div className="mb-cat-card-price">
  {part.price} <span className="mb-sim-tag">{t("cat_sim_tag")}</span>
</div>

// add
<div className="mb-cat-card-spec">{t(part.spec)}</div>
```

New copy keys (EN draft, **UNSTAMPED** — founder to approve and write ID):

```ts
cat_part1_spec: "2NR-VE · 4 per set",
cat_part2_spec: "manual · ⌀ 200 mm",
cat_part3_spec: "rear · gas-filled · ET 45",
cat_part4_spec: "front axle · ceramic · 2NR-VE",
```

New CSS, replacing `.mb-cat-card-price` usage on this card (keep the `.mb-cat-card-price` rule itself — `globals.css` references it and other surfaces may use it):

```css
.mb-cat-card-spec {
  margin-top: 8px;
  font-size: 11.5px;
  letter-spacing: 0.02em;
  color: var(--mb-light-accent);
  font-variant-numeric: tabular-nums;
}
```

Add `.mb-cat-card-spec` to the `globals.css` tnum selector list from §3.5.

### 5.3 Retire the Simulation tag on this surface

With no fabricated figures left in the band, `cat_sim_tag` has nothing to label. Remove `.mb-sim-tag` usage from `FitmentSection.tsx`.

**Keep the `cat_sim_tag` key and the `.mb-sim-tag` class** — grep first; if any other surface still uses them, they stay. If nothing uses them, leave them defined anyway (an unused copy key is harmless and the honesty convention may be needed again).

### 5.4 What stays

- The `217 → 4` filter count — it describes a *search*, not the corpus. **If it is not currently implemented, it is new work; see §9.**
- The five-level picker including engine code. Resolving to submodel and engine is the published standard in mature aftermarkets; the depth of the question is safe to show. The *size of the answer* is not.
- `100,000+ workshops` in the coverage band — a third-party market fact, not a Mobeeli metric. Keep the source attribution.

---

## 6. Change 4 — One glass primitive

Three recipes exist. One is dead. Consolidate to a single class.

**Step 6.1** — Add to `landing.css`, replacing the R13 block at line 2653:

```css
/* R16: one glass recipe for every translucent panel on a dark band.
   Replaces the three divergent recipes (.mb-ucat-card, the R13 .mb-fit3d
   block, .mb-fit-protect). Do not add a fourth — extend this. */
.mb-glass {
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.075) 0%, rgba(255, 255, 255, 0.025) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--mb-radius-card);
  backdrop-filter: blur(22px) saturate(1.5);
  -webkit-backdrop-filter: blur(22px) saturate(1.5);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 20px 46px rgba(3, 8, 16, 0.5);
}

@media (prefers-reduced-transparency: reduce) {
  .mb-glass {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: rgba(13, 21, 34, 0.95);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
}
```

Note the deliberate changes from the R13 recipe: the inset highlight drops from `1px 1px 0 rgba(255,255,255,.4)` to `0 1px 0 rgba(255,255,255,.22)` (the 0.4 highlight reads as a hard white edge on the left, not a light source), and the border softens from `.14` to `.12`.

**Step 6.2** — Apply `mb-glass` in the JSX to: the picker panel (`.mb-cat-ymm`), each part card (`.mb-ucat-card`), and the protection panel if it keeps a glass treatment after §7.

**Step 6.3** — Delete the now-superseded declarations from `.mb-ucat-card` (lines 851–856: the `backdrop-filter`, `background-color`, `box-shadow`) and its `prefers-reduced-transparency` block (lines 859–865). Keep the layout properties (`position`, `border-radius`, `padding`, `display`, `flex-direction`, `gap`).

**Step 6.4 — the dead selector.** The R13 block targets `.mb-fit3d .mb-cat-card`. That class was renamed to `.mb-ucat-card` (see the comment at `landing.css:842`) — so **this rule has been matching nothing on the part cards**. Removing it is safe. But it also means **the part cards have never had the R13 glass treatment the code claims they have**; the visual you see today comes from the `.mb-ucat-card` rule at line 844. Expect the cards to *change appearance* when you apply `mb-glass`. That is the fix landing, not a regression.

This is exactly the failure mode a contract test must catch — see §8.

---

## 7. Change 5 — Protection as its own band (ruling 1c)

**Step 7.1** — Create `src/components/landing/ProtectionSection.tsx`, following the shape of `ProblemSection.tsx` (client component, `useT()`, `data-rev` on revealed children, `mb-section` / `mb-section-inner` wrappers).

Structure, from the mockup:

- `<section id="protection" className="mb-section">` — light band
- Eyebrow: `mb-kicker`, uppercase, `--mb-deep-blue`
- H2 using `.mb-h2` (inherits the real scale — **do not add a size override**)
- A lede paragraph, max-width ~620px
- A three-column grid, 1px gaps on a `--mb-border` background, white cells — the three protection promises, each with an inline SVG icon (24×24, `stroke="currentColor"`, `stroke-width="1.5"`, `fill="none"`), a tabular numeral `01`/`02`/`03`, an H3 and a paragraph

**Step 7.2** — Extract the existing protection content out of `FitmentSection`. Remove `.mb-fit-protect` and its children from that component. Remove `.mb-fit-protect`, `.mb-fit-protect-head`, `.mb-fit-protect-title` and the `.mb-step-stack--row` rules from `landing.css` once nothing references them.

**Step 7.3** — Reuse the existing protection copy keys. Grep `copy.ts` for the `prot_` prefix and reuse what is there. **Do not create parallel keys** for strings that already exist — if the wording needs to change, change it in place so EN and ID stay paired.

**Step 7.4** — Mount in `LandingView.tsx` between `UnifyBand` and `BuyerStrip`.

**Step 7.5 — nav.** Add a protection anchor to `NAV_LINKS` in `Nav.tsx`:

```tsx
["/#protection", "nav_protect"],   // new CopyKey: EN "Protection", ID per founder
```

> ⚠️ **This makes seven nav links and they will not fit.** `NAV_DESKTOP_QUERY` is `(min-width: 1040px)`; six links plus the logo, language pill and CTA already fill that bar. See §9 — this needs a ruling, not a guess.

---

## 8. Change 6 — The scan (ruling 4a)

The founder chose **clinical / diagnostic: an instrument reading a vehicle.** Not a decorative sweep — a measurement being taken and reported.

### The timing contract

The existing `setTimeout(..., 1800)` in both `handleYmmChange` and `handleVinSubmit` stays exactly as it is. **The redesign is built to 1800ms so no TypeScript timing changes are needed.** Three phases:

| Phase | Window | What happens |
|---|---|---|
| Acquire | 0 – 216ms (0–12%) | Scan line fades in at the top of the frame |
| Traverse | 216 – 1314ms (12–73%) | Line travels 139px down the 140px frame, near-linear |
| Settle | 1314 – 1800ms (73–100%) | Line fades out; the locked vehicle readout holds |

Three measurement callouts appear *during* the traverse, each as: a 5px dot with a glow, a 1px leader line scaling out from the dot, and a value label fading in. Staggered so the instrument reads one value at a time.

| Callout | Dot at | Leader | Value | Text |
|---|---|---|---|---|
| 1 | 500ms | 500ms | 550ms | `PCD 4 × 100` |
| 2 | 800ms | 800ms | 850ms | `⌀ 54.1 mm` |
| 3 | 1020ms | 1020ms | 1070ms | `offset ET 45` |
| Lock | — | — | 1300ms | `2019 Avanza 1.5 G · 2NR-VE` |

Durations: dot `300ms`, leader `450ms`, value `500ms`, lock `500ms`. Easing for all four: `cubic-bezier(.2,.7,.2,1)`.

### CSS

```css
/* R16: the scan is a single measured pass, not a loop. Runs only while
   .is-scanning is set (1800ms, matching the setTimeout in FitmentSection). */
@keyframes mb-scan-line {
  0%   { transform: translateY(0);     opacity: 0; }
  12%  { transform: translateY(0);     opacity: 1; }
  73%  { transform: translateY(139px); opacity: 1; }
  86%  { transform: translateY(139px); opacity: 0; }
  100% { transform: translateY(139px); opacity: 0; }
}
@keyframes mb-scan-dot    { from { transform: scale(0); opacity: 0 } to { transform: scale(1); opacity: 1 } }
@keyframes mb-scan-leader { from { transform: scaleX(0); opacity: 0 } to { transform: scaleX(1); opacity: 1 } }
@keyframes mb-scan-val    { from { opacity: 0; transform: translateX(-5px) } to { opacity: 1; transform: translateX(0) } }
@keyframes mb-scan-lock   { from { opacity: 0 } to { opacity: 1 } }
```

Add a measurement grid behind the vehicle image:

```css
.mb-cat-car-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(47, 125, 246, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(47, 125, 246, 0.06) 1px, transparent 1px);
  background-size: 18px 18px;
}
```

### Fixing Bug A while you are here

Gate every one of these animations behind `.is-scanning`:

```css
.mb-cat-car-wrapper .mb-cat-scan-line,
.mb-cat-car-wrapper .mb-cat-scan-callout { animation: none; opacity: 0; }
.mb-cat-car-wrapper.is-scanning .mb-cat-scan-line { animation: mb-cat-scan 1800ms linear 1 forwards; }
/* …per-callout rules with the delays from the table above… */
```

> **Namespace:** use the `mb-cat-scan-*` prefix, **not** `mb-scan-*`. `.mb-scan-overlay` (`landing.css:2697`) and `.mb-scan-laser` (`landing.css:2704`) already exist as dead rules from the removed GarageOS scanner. Landing new work in that namespace makes live rules indistinguishable from orphans during the outstanding dead-CSS sweep.

Delete the old `.mb-cat-scan-line` rule (`landing.css:815`) and the `@keyframes mb-cat-scan` (line 825) — the infinite sweep goes away entirely.

### Fixing Bug B while you are here

```css
@media (prefers-reduced-motion: reduce) {
  /* (0,3,0) — must match the gated rules' specificity, or cancelling does not cancel */
  .mb-cat-car-wrapper.is-scanning .mb-cat-scan-line { animation: none; opacity: 0; }
  .mb-cat-car-wrapper.is-scanning .mb-cat-scan-dot,
  .mb-cat-car-wrapper.is-scanning .mb-cat-scan-leader,
  .mb-cat-car-wrapper.is-scanning .mb-cat-scan-val,
  .mb-cat-car-wrapper.is-scanning .mb-cat-scan-lock { animation: none; }
  /* (0,2,0) — beats the base rules, holds the reading at rest too */
  .mb-cat-car-wrapper .mb-cat-scan-dot,
  .mb-cat-car-wrapper .mb-cat-scan-leader,
  .mb-cat-car-wrapper .mb-cat-scan-val,
  .mb-cat-car-wrapper .mb-cat-scan-lock { opacity: 1; }
}
```

> ⚠️ **Two traps in this block, both corrected above after implementation review.**
>
> **Specificity.** A media query adds no specificity. A `.mb-cat-car-wrapper .mb-cat-scan-dot` reset is (0,2,0) and loses to the gated `.mb-cat-car-wrapper.is-scanning .mb-cat-scan-dot` at (0,3,0) — so the full stagger keeps running for exactly the users who asked for no motion, and because the elements are also forced to `opacity: 1` the failure is near-invisible in review. Match the `.is-scanning` selector when cancelling animation; use the shorter selector only for the `opacity` hold.
>
> **Do not write `transform: none`.** `.mb-cat-scan-val` carries `translateY(-50%)` to centre each label on its 1px leader; `transform: none` drops that and pushes all three labels down half a line. Instead author each keyframe's `to` state to equal the element's resting style — `translate(0, -50%)` for the value, `scale(1)` for the dot, `scaleX(1)` for the leader — so reduced motion only ever raises `opacity` and there is no transform to unwind.

Reduced motion shows the **finished** reading — all callouts and the lock, immediately, no travel. The user gets the information without the motion. That is the correct reduced-motion behavior for a state change; hiding the result would be wrong.

> Prefer the CSS gate over `useReducedMotion()` here. The hook is for JS-driven animation; this is declarative and the media query is both simpler and impossible to desync from the React state.

---

## 9. Open items — need a founder ruling, do not guess

1. ~~**Nav overflow.**~~ **Resolved — see `IMPLEMENTATION-3-to-8.md` §0 and §7.7.** Measuring the real bars changed the answer: nothing clears 1040px once Protection is added, so the question was never whether to drop a link. Drop Investors, raise the breakpoint to **1120px** (not the 1109px quoted in §7 below — that figure is superseded).

2. ~~**The `217 → 4` filter count.**~~ **Resolved — see `IMPLEMENTATION-3-to-8.md` §5.4.** Real count from the seeded catalog, no honesty label needed because it is true. If the query is not cheap at build time, fall back to the ✓/✕ pair — do not invent numbers.

3. **The five-level picker.** The mockup shows Year / Make / Model / Trim / **Engine** (`2NR-VE`). The repo has **four** selects — there is no engine level, and `trim` values are like `"1.5 G CVT"`. Adding engine is real work: new select, new state, garage string format change, and the `mobeeli_garage` localStorage value changes shape. **Migration matters** — existing visitors have a 4-part string saved. Decide whether to migrate, ignore, or version the key.

4. **The logo.** The repo ships `/assets/mobeeli-logo-blue.png` and `-white.png` at 2891×1109 — single images with mark and wordmark baked in. "Bigger wordmark" cannot be done by scaling that file. Two routes: (a) commission a new lockup PNG at the revised proportions; (b) split into a mark-only image plus live text. The mockup uses (b) with a mark cropped from a founder-supplied file. (b) is better — crisper at every size, themeable, and the wordmark can be Plus Jakarta Sans 800 so the logo joins the type system. **But it needs the founder's eye on whether PJS matches the logo's actual letterforms.** Do not ship a cropped asset without approval.

5. **`/why-mobeeli` disclosure.** That route is public, indexed and sitemapped, and carries the seller-fee range from the founder's own June field survey. Trimming the front page achieves little if the data sits one click away. Three options were put to the founder: leave it public, round the figure, or de-sitemap the route. **Unresolved.**

6. **Where `AiCatalogCard` goes.** Unmounted from `/` but not deleted. It has no home yet.

7. ~~**Aurora — three mounts, two after change 4.**~~ **Resolved — see `IMPLEMENTATION-3-to-8.md` §6.2.** Unify both survivors to `0.35` behind an exported constant; the shared-context refactor is tracked as separate performance work.

8. **`text-shadow` on the scan labels.** The implementation added `text-shadow: 0 1px 3px rgba(0,0,0,.85)` to the value and lock text, which was not in this brief. The reasoning is sound — the vehicle plate is `mix-blend-mode: screen`, so a label can land on a lit area of the blueprint, and the shadow only does work where the car is bright. **I accept it.** Recorded here so it is not mistaken for drift later.

---

## 10. Verification — run all of these

The user asked for meticulous error checking. Treat this as the definition of done.

### Build gates

```bash
npm run lint
npx tsc --noEmit
npm run build
```

All three must pass clean. `tsc` in particular catches the `as const` / `CopyKey` mistakes that §5.2 can introduce.

### Contract tests to write

These exist because §6 uncovered a rule that had been silently matching nothing. A test that pins a selector proves nothing if the selector is dead.

1. **No dead selectors.** For every class targeted in `landing.css`, assert it appears in at least one `.tsx` file. Run it as a script over the repo; fail on any orphan. This would have caught `.mb-fit3d .mb-cat-card` on the day it broke.
2. **No orphan classes.** The inverse: every `className` literal in `src/components/landing/*.tsx` resolves to a rule in `landing.css`.
3. **i18n parity.** Every key in the `en` map exists in `id` and vice versa. Every `CopyKey` referenced by a `t()` call exists in both. Fail on any mismatch — this is the test that catches a removed stat key lingering in `id`.
4. **Scan timing.** Assert the CSS animation duration for `mb-scan-line` equals the `setTimeout` constant in `FitmentSection.tsx`. Extract `1800` to an exported constant and have both sides reference it, so the test is meaningful rather than two hardcoded numbers that agree today.
5. **Reduced motion.** With `prefers-reduced-motion: reduce`, assert no element in the fitment band has a running animation. Playwright can emulate this directly.
6. **Reduced transparency.** With `prefers-reduced-transparency: reduce`, assert `.mb-glass` computes `backdrop-filter: none` and an opaque background.

### The tnum probe

Run in a browser on the built site to confirm the self-hosted subset really has tabular figures:

```js
const mk = (feat) => {
  const s = document.createElement('span');
  s.style.cssText = `position:absolute;visibility:hidden;font-family:${getComputedStyle(document.body).fontFamily};font-feature-settings:${feat}`;
  s.textContent = '1111';
  document.body.append(s);
  const w = s.getBoundingClientRect().width;
  s.remove();
  return w;
};
// '1111' vs '0000' must be equal width when tnum is active
console.log({ normal: mk('normal'), tnum: mk('"tnum"') });
```

Compare the rendered width of `1111` against `0000` with and without `"tnum"`. If the two are identical widths **without** the feature, the font is already tabular by default and you are fine. If they differ **with** `"tnum"` applied, the feature is missing from the subset — re-subset the font.

### Visual checks

Screenshot every band at **1280, 1109, 1040, 768 and 375**. The 1109 and 1040 widths matter specifically: the nav breakpoint sits at 1040, and the enlarged logo lockup narrows the margin. Confirm the bar does not wrap or overlap at any width between 1040 and 1280.

Check both languages at every width. Indonesian headlines run roughly 15–25% longer than English — the `cat_unified_h2` ID string is materially longer than the EN one and will wrap differently under an 800-weight face.

Check the light bands and dark bands separately after the font-weight change; 800 on a light background reads heavier than 800 on dark.

### Performance

The font change should be a net **win** — three families down to one, and no `next/font` build step for Inter/Space Grotesk. Confirm it:

- LCP on the hero should not regress. Measure before and after.
- Check the network panel: exactly two font files should load (`pjs-normal-latin.woff2`, and `pjs-italic-latin.woff2` only if italic is actually used). If you see Inter or Space Grotesk files, a variable reference survived somewhere.
- No layout shift from the swap — `font-display: swap` is already set and the fallback stack is `system-ui`.

### Manual pass

- Tab through the whole page. Focus rings visible on every interactive element (`:focus-visible` is wired globally in `globals.css`).
- Open the mobile sheet, confirm body scroll lock, Escape closes and returns focus to the burger.
- Set a vehicle via the picker, then via the plate field. Confirm the scan runs **once**, the readout lands, and the garage chip persists across a reload.
- Clear the garage. Confirm the picker returns.
- Load with `prefers-reduced-motion: reduce`. Confirm nothing in the fitment band moves, and the scan result is shown at rest.

---

## 11. Design tokens

All of these already exist in `globals.css`. **Use the variables, not the literals** — the hex values are listed only so you can verify a match.

| Token | Value | Use |
|---|---|---|
| `--mb-primary` | `#2f7df6` | CTAs, accent fills |
| `--mb-deep-blue` | `#1b5fd9` | Eyebrows on light bands |
| `--mb-light-accent` | `#5b9bf7` | Eyebrows and specs on dark bands |
| `--mb-tint` | `#e4edfd` | Buyer strip background |
| `--mb-ink` | `#0d1522` | Dark band background, body text on light |
| `--mb-bg` | `#f5f7fa` | Light band background |
| `--mb-surface` | `#ffffff` | Cards on light bands |
| `--mb-border` | `#e3e7ee` | Hairlines on light bands |
| `--mb-muted` | `#636e7e` | Body text on light bands |
| `--mb-muted-2` | `#8b95a4` | Labels on dark bands |
| `--mb-dark-muted` | `#a9b4c6` | Body text on dark bands |
| `--mb-radius-card` | `18px` | Panels, cards |
| `--mb-radius-pill` | `999px` | Chips, buttons |
| `--mb-container-max` | `1280px` | Band inner width |
| `--mb-container-pad` | `24px` | Band inner padding |
| `--mb-section-y` | `96px` | Band vertical rhythm |
| `--mb-ease-standard` | `cubic-bezier(0.2, 0.6, 0.2, 1)` | Default easing |

**Type scale after 7a** — one family, hierarchy by weight and size:

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Hero H1 | `clamp(2.75rem, 6.6vw, 5.25rem)` | 800 | `-0.022em` |
| Band H2 | `clamp(38px, 4.8vw, 64px)` | 800 | `-0.022em` |
| Card H3 | `23px` | 700 | `-0.015em` |
| Lede | `19px` / 1.65 | 400 | — |
| Body | `15.5px` / 1.7 | 400 | — |
| Eyebrow | `12.5px` | 800 | `0.14em`, uppercase |
| Spec / numeral | `11.5px` | 600 | `0.02em`, `tabular-nums` |

The scan's callout labels are `10.5px / 600 / 0.05em / tabular-nums`; the lock readout is `10px / 600 / 0.09em / uppercase / tabular-nums`.

---

## 12. Assets

All already in `public/assets/` — no new assets required except the logo question in §9.4.

| Path | Used by |
|---|---|
| `/assets/mobeeli-logo-white.png`, `-blue.png` | `Nav.tsx` (2891×1109) |
| `/assets/fitment/catalog-car-poster.jpg` | Scan frame |
| `/assets/parts/spark-plug.jpg`, `clutch.jpg`, `shock.jpg`, `brake-pad.jpg` | Part cards |
| `/assets/icons/xls2.png`, `pdf2.png`, `jpg2.png` | File chips (keep `unoptimized` — see the comment in `AiCatalogCard.tsx`) |
| `/assets/veo/jakarta-hero-bg-poster.jpg` | Hero background |
| `/fonts/pjs-normal-latin.woff2`, `pjs-italic-latin.woff2` | The whole type system after 7a |

---

## 13. Files in this bundle

| File | What it is |
|---|---|
| `Mobeeli Landing — R16 Proposal.dc.html` | **The target.** Full page with every ruling applied. Two live switches let you compare: disclosure (`current` / `2a` / `2b` / `2c`) and logo direction. |
| `Mobeeli Landing — Current.dc.html` | Today's page, rebuilt from the repo source. Use it for honest before/after — it is a recreation, not a screenshot. |
| `R16 Before & After.dc.html` | Every change at real scale, side by side. |
| `R16 Decisions.dc.html` | The reasoning behind each ruling, including the disclosure argument in §5. |
| `R16 Scan Studio.dc.html` | Four scan directions; `4a` is the chosen one and its timings are exact. |
| `R16 Identity.dc.html` | Logo diagnosis and directions — context for §9.4. |
| `R16 Type System.dc.html` | The ten type systems and why `7a` won. Includes measured EN→ID line-count behavior. |
| `R16 Wordmark Fonts.dc.html` | Wordmark-specific specimens. |

Open any of them in a browser — they are self-contained apart from the `assets/` folder alongside them.

---

## 14. Suggested order of work

Each step is independently shippable and independently revertable. Do not batch them into one PR.

1. **Bugs A and B** (§1) — smallest, highest urgency, no design dependency.
2. **Type system** (§3) — token-level, touches every page, wants its own review.
3. **Band 2 hierarchy** — delete the `font-size: 28px` from `.mb-ucat-h2`. One line, immediately visible.
4. **Disclosure** (§5) — content-only, no structural risk.
5. **Glass primitive** (§6) — do this before the new band so protection can use it.
6. **Unmount AiCatalogCard** (§4).
7. **Protection band** (§7) — blocked on the nav ruling in §9.1.
8. **Scan redesign** (§8) — largest CSS surface, do it last when everything around it is stable.
