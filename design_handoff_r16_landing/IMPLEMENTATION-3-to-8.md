# R16 §§3–8 — implementation spec for the remaining six changes

> ## ⚠️ SUPERSEDED — 2026-07-27
>
> **Every section of this document describes work that was already shipped when it was written.** `main` @ `b4aa5fb` carries all of R16: §3 type system, band-2 hierarchy, §4 one catalog, §5 disclosure, §6 the glass primitive, §7 the protection band + nav, §8 the scan, plus the aurora unified to 0.35. Gate: 344 tests / 44 files, lint and build clean.
>
> Keep this file for the reasoning only. **Do not build from it.** The authoritative record of what is live is `HANDBACK_R16_IMPLEMENTATION_REPLY.md` on `main`.
>
> Three specific corrections, so nothing here gets copied forward:
>
> 1. **§4.1 would re-break production.** The `-webkit-backdrop-filter` line has been struck from the CSS block below — see the note there. Never hand-write it in this repo.
> 2. **§0 and §7.7 got the nav ruling backwards.** The founder ruled *drop Why Mobeeli, keep Investors*, and the breakpoint stayed at **1040px**. My 1091/1116px measurements were taken on the *proposed* mark-plus-live-text lockup, which is not what is live — production still uses the single baked lockup image, and six links fit 1040px with no scroll. The real finding underneath is recorded in §9.2.
> 3. **§5.4's preferred option is unavailable.** The landing page has no catalogue data source — it is insert-only against a database the platform team owns. The founder deferred the count entirely rather than take the ✓/✕ fallback.

**To:** Claude Code
**From:** Claude Design
**Date:** 2026-07-27
**Companion to:** `README.md` in this folder. That document explains *why*. This one is *what to type*.
**Precedent:** §8 (the scan) shipped from a spec at this level of detail and passed 48/48 browser checks on the first pass. Everything below is written to the same standard — exact values, exact selectors, and the contract test that proves each one landed.

---

## 0. Decisions applied

The three open decisions were put to the founder with visuals (`R16 What's Next.dc.html`). Pending an explicit override, **build to the recommendation** — each is flagged below so a reversal is a small, local edit rather than a rework.

| Decision | Recommendation built to | Reversal cost |
|---|---|---|
| **1 — nav overflow** | Drop Investors from the main nav; raise `NAV_DESKTOP_QUERY` to `1120px` | One array entry + one constant |
| **2 — aurora** | Unify Hero and Fitment to `intensity={0.35}`; shared-context refactor tracked separately | Two literals |
| **3 — `217 → 4`** | Real count queried from the seeded catalog; fall back to the ✓/✕ pair if the query isn't cheap | Delete one element |

### Why 1120 and not 1109

`README.md` §7 says 1109px. **That number is superseded.** I built the four candidate nav bars from the real parts — the actual mark at 42px, the wordmark at 32px Poppins 700, links at 14px/600, the live 26px and 22px gaps — and measured them with `offsetWidth`:

| Bar | Width | vs. repo's 1040 | vs. proposal's 1109 |
|---|---|---|---|
| All seven links | **1200px** | 160 over | 91 over |
| Drop Investors | **1116px** | 76 over | 7 over |
| Drop Why Mobeeli | **1091px** | 51 over | 18 spare |
| All seven, breakpoint 1240 | **1200px** | — | clears |

Two things follow. **Nothing clears 1040 once Protection is added** — the choice was never "drop a link or not", it was "how high does the breakpoint go". And 1109 is 7px short for the recommended option, so it becomes **1120**.

Reproduce the measurement any time — open `R16 What's Next.dc.html` and run:

```js
[...document.querySelectorAll('[data-bar]')].map(e => e.dataset.bar + ' ' + e.offsetWidth)
```

If those numbers disagree with the table, the design file is stale and this spec needs revisiting before you build.

---

## 1. Build order

Each is independently shippable and independently revertable. One PR each.

| # | Change | Depends on | Size |
|---|---|---|---|
| 1 | §3 — type system (7a) | — | S, wide blast radius |
| 2 | Band 2 hierarchy | — | XS |
| 3 | §6 — unified `.mb-glass` | — | S |
| 4 | §5 — disclosure (2b) | — | M |
| 5 | §4 — unmount `AiCatalogCard` + aurora | — | S |
| 6 | §7 — protection band + nav | 3 (uses `.mb-glass`) | L |

Do 1 first — it changes metrics everywhere and you want it settled before anything else moves. Do 6 last.

---

## 2. §3 — Type system (ruling 7a)

Full rationale in `README.md` §3. Recap of the surprise: **Plus Jakarta Sans is already self-hosted in the repo** as a variable font, 200–800 (`globals.css:2`). R7 overrode it with Inter + Space Grotesk via `next/font`. This is a token revert, not a font addition, and it should be a net performance win.

### 2.1 `src/app/globals.css`

```css
/* R16 type system (founder ruling 7a): one family. Plus Jakarta Sans is
   self-hosted above as a variable font (200-800), so display and text are the
   same face at different weights — hierarchy comes from weight and size, not
   from a second family. Drawn by Tokotype for Jakarta. */
--mb-font-text: var(--mb-font);
--mb-font-display: var(--mb-font);
```

Replaces the two `--mb-font-*` declarations in the R7 block (~line 57). **Leave `--mb-font` itself alone** — it is part of the `.ba/design/style.json` contract.

### 2.2 `src/app/layout.tsx`

```diff
-import { Inter, Space_Grotesk } from "next/font/google";
-const fontInter = Inter({ ... });
-const fontSpaceGrotesk = Space_Grotesk({ ... });
-<html lang={DEFAULT_LANG} className={`${fontInter.variable} ${fontSpaceGrotesk.variable}`}>
+<html lang={DEFAULT_LANG}>
```

Rewrite the block comment above the constants — it explains the R7 rationale and will be actively misleading once the constants are gone.

### 2.3 Weight and tracking

| Where | From | To |
|---|---|---|
| `globals.css` — `h1, h2, h3` | `font-weight: 600` | `font-weight: 800` |
| `landing.css:105` — `.mb-h2` | `letter-spacing: -0.024em` | `-0.022em` |
| `.mb-h1` / hero heading | whatever Space-Grotesk-tuned value is there | `-0.022em` |
| Card `h3` rules | `600` | `700` |

> ⚠️ **The `h1, h2, h3` rule is global.** It hits `/team`, `/investors`, `/why-mobeeli`, `/join` and every other route — not just the landing page. Screenshot each before merging. If any needs 600, scope the 800 to `.mb-landing h1, .mb-landing h2, .mb-landing h3` and say so in the PR description rather than reverting silently.

### 2.4 Numerals

`globals.css:80` already routes numeric elements through the display font with `font-feature-settings: "tnum"`. That keeps working (display now = PJS). Two jobs:

1. **Add the new spec classes** to that selector list: `.mb-cat-card-spec` (from §4 below) and `.mb-cat-scan-val` / `.mb-cat-scan-lock` if they aren't already there from the shipped §8.
2. **Tidy the stray blank line** inside the selector list, between `.mb-fitment-label-value,` and `.mb-ds-badge`.

### 2.5 Verify `tnum` survived subsetting

Plus Jakarta Sans ships tabular figures upstream, but a subsetted `.woff2` can drop the feature silently. Run on the built site:

```js
const mk = (feat, txt) => {
  const s = document.createElement('span');
  s.style.cssText = `position:absolute;visibility:hidden;font-family:${getComputedStyle(document.body).fontFamily};font-feature-settings:${feat}`;
  s.textContent = txt;
  document.body.append(s);
  const w = s.getBoundingClientRect().width;
  s.remove();
  return w;
};
({
  narrowNormal: mk('normal', '1111'),
  wideNormal:   mk('normal', '0000'),
  narrowTnum:   mk('"tnum"', '1111'),
  wideTnum:     mk('"tnum"', '0000'),
})
```

`narrowTnum` must equal `wideTnum`. If they differ, the feature is missing from the subset — **re-subset the font including `tnum`.** Do not fake alignment with `letter-spacing`; it breaks at every other size.

### 2.6 Do not

- Add a Google Fonts `<link>`. `CLAUDE.md` requires self-hosting; a runtime CDN call is both a compliance regression and a Jakarta latency regression.
- Leave `var(--font-inter)` or `var(--font-space-grotesk)` referenced anywhere. An unresolved custom property falls through to the next stack item **silently** — it will not error, it will just quietly render in `system-ui`.

### 2.7 Contract tests

```
✓ grep -r "font-inter\|font-space-grotesk" src/ returns nothing
✓ grep -r "fonts.googleapis" src/ returns nothing
✓ network panel on a cold load shows exactly the pjs-*.woff2 files, no others
✓ tnum probe above: narrowTnum === wideTnum
✓ computed font-family on body, h1, .mb-h2 and .mb-cat-card-spec all resolve to
  "Plus Jakarta Sans"
✓ LCP on the hero does not regress vs. the pre-change baseline
```

---

## 3. Band 2 hierarchy

The smallest change in the batch and the most visible.

```diff
 .mb-ucat-h2 {
-  font-size: 28px;
   ...
 }
```

`landing.css:742`. Deleting the override lets `.mb-h2`'s `clamp(38px, 4.8vw, 64px)` through, and band 2's heading finally sits on the same step as every other band.

Check the surrounding rule for anything else tuned to 28px — `line-height`, `letter-spacing`, `max-width`. If `line-height` is a unitless multiplier it will scale correctly; if it is a px value it will look wrong at 64px and needs to go too.

```
✓ .mb-ucat-h2 computed font-size at 1280px viewport === 61.44px (4.8vw)
✓ .mb-ucat-h2 computed font-size at 640px viewport === 38px (clamp floor)
✓ no remaining px line-height on .mb-ucat-h2
```

---

## 4. §6 — Unified `.mb-glass`

Three recipes exist today, one of which has never matched anything. Full detail in `README.md` §6. The critical point, repeated because it will look like a bug when you see it:

> The R13 block targets `.mb-fit3d .mb-cat-card`. That class was renamed to `.mb-ucat-card` (see the comment at `landing.css:842`). **The rule has been matching nothing.** The part cards' current appearance comes from `.mb-ucat-card` at line 844. When you apply `.mb-glass`, **the cards will change** — that is the fix landing, not a regression.

### 4.1 The primitive

Replaces the R13 block at `landing.css:2653`:

```css
/* R16: one glass recipe for every translucent panel on a dark band. Replaces
   the three divergent recipes (.mb-ucat-card, the dead R13 .mb-cat-card block,
   .mb-fit-protect). Do not add a fourth — extend this. */
.mb-glass {
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.075) 0%, rgba(255, 255, 255, 0.025) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--mb-radius-card);
  /* ⚠️ CORRECTED 2026-07-27 — the -webkit- twin that stood here was WRONG and
     would have re-broken production. When both forms are in the source, this
     repo's CSS transform collapses them and emits only the -webkit- one, which
     Chromium does not support, so the blur silently never renders. Declare the
     standard property ALONE and let the build prefix it. This — not only the
     dead selector — is why the R13 glass never applied to anything. The repo
     now has a contract test that fails if -webkit-backdrop-filter appears in
     landing.css at all. */
  backdrop-filter: blur(22px) saturate(1.5);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 20px 46px rgba(3, 8, 16, 0.5);
}

@media (prefers-reduced-transparency: reduce) {
  .mb-glass {
    backdrop-filter: none;
    background: rgba(13, 21, 34, 0.95);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
}
```

Two deliberate departures from the R13 values: the inset highlight drops from `1px 1px 0 rgba(255,255,255,.4)` to `0 1px 0 rgba(255,255,255,.22)` — at 0.4 with a horizontal offset it reads as a hard white edge down the left side rather than a light source — and the border softens from `.14` to `.12`.

### 4.2 Apply

Add `mb-glass` to the picker panel (`.mb-cat-ymm`) and each part card (`.mb-ucat-card`).

### 4.3 Strip the superseded declarations

From `.mb-ucat-card` (lines ~851–856), delete `backdrop-filter`, `background-color`, `box-shadow`, and its `prefers-reduced-transparency` block (~859–865). **Keep** `position`, `border-radius`, `padding`, `display`, `flex-direction`, `gap` — those are layout, not surface.

### 4.4 Contract tests

```
✓ .mb-glass rule count in landing.css === 1
✓ every element with class mb-glass computes an identical backdrop-filter string
✓ under prefers-reduced-transparency: reduce, .mb-glass computes
  backdrop-filter: none AND an opaque background-color
✓ no remaining rule in landing.css targets .mb-cat-card inside .mb-fit3d
✓ dead-selector sweep (see §8) passes
```

---

## 5. §5 — Disclosure (ruling 2b)

Standing rule: **the landing page is a company profile, not a pitch deck.** It may say what Mobeeli is, who it serves, that the product works, and who is behind it. It may not say catalogue size, fees, unit economics, traction counts, or any simulated figure.

### 5.1 Remove the stat tiles

- **JSX** — delete the whole `<div className="mb-cat-stats">` block from `FitmentSection.tsx` (three `.mb-cat-stat` children).
- **CSS** — delete `.mb-cat-stats`, `.mb-cat-stat`, `.mb-cat-stat-v`, `.mb-cat-stat-l` (lines 749–773).
- **Copy** — delete six keys from **both** `en` and `id`: `cat_unified_stat{1,2,3}_v`, `cat_unified_stat{1,2,3}_l`.

The left column of `.mb-fit3d-layout` now holds only the H2. Check the two-column grid still balances — it may want collapsing to one column with the H2 full-width above the picker. Screenshot at 1280, 1024, 640.

### 5.2 Prices → fitment specs

```tsx
const parts = [
  { key: "cat_part1_name", spec: "cat_part1_spec", img: "/assets/parts/spark-plug.jpg" },
  { key: "cat_part2_name", spec: "cat_part2_spec", img: "/assets/parts/clutch.jpg" },
  { key: "cat_part3_name", spec: "cat_part3_spec", img: "/assets/parts/shock.jpg" },
  { key: "cat_part4_name", spec: "cat_part4_spec", img: "/assets/parts/brake-pad.jpg" },
] as const;
```

The `as const` is load-bearing — it keeps each `spec` a literal `CopyKey` so `t(part.spec)` typechecks without a cast.

```diff
-<div className="mb-cat-card-price">
-  {part.price} <span className="mb-sim-tag">{t("cat_sim_tag")}</span>
-</div>
+<div className="mb-cat-card-spec">{t(part.spec)}</div>
```

```css
.mb-cat-card-spec {
  margin-top: 8px;
  font-size: 11.5px;
  letter-spacing: 0.02em;
  color: var(--mb-light-accent);
  font-variant-numeric: tabular-nums;
}
```

New keys — **EN drafts, UNSTAMPED. Founder approves wording and writes ID. Do not machine-translate.**

```ts
cat_part1_spec: "2NR-VE · 4 per set",
cat_part2_spec: "manual · ⌀ 200 mm",
cat_part3_spec: "rear · gas-filled · ET 45",
cat_part4_spec: "front axle · ceramic · 2NR-VE",
```

Keep the `.mb-cat-card-price` rule itself — `globals.css` references it and other surfaces may use it. Only the usage on this card goes.

### 5.3 Retire the Simulation tag on this surface

With no fabricated figures left in the band, `cat_sim_tag` has nothing to label. Remove `.mb-sim-tag` usage from `FitmentSection.tsx`.

**Grep before deleting the key or the class.** If another surface uses them they stay. If nothing does, leave them defined anyway — an unused copy key costs nothing and the honesty convention may be needed again.

### 5.4 The `217 → 4` count — decision 3

Not currently in the repo; it exists only in the proposal, so it is new work either way. Built to the recommendation: **real count, queried from the seeded catalog.**

```tsx
<div className="mb-cat-filter-count">
  <span className="mb-cat-filter-before">{totalCount}</span>
  <span className="mb-cat-filter-arrow" aria-hidden="true">→</span>
  <span className="mb-cat-filter-after">{fitCount}</span>
</div>
```

```css
.mb-cat-filter-count {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-variant-numeric: tabular-nums;
}
.mb-cat-filter-before {
  font-size: 34px;
  font-weight: 800;
  color: #5f6c7e;
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}
.mb-cat-filter-arrow { font-size: 18px; color: #5f6c7e; }
.mb-cat-filter-after { font-size: 34px; font-weight: 800; color: #fff; }
```

Rules for the numbers:

- **Real** means a genuine count of listings answering "brake pad" against a genuine count that fits a 2019 Avanza 1.5 G, resolved at build time from the seeded database.
- It needs **no honesty label**, because it is true. That is the whole point — it is a statement about *one search*, not about the size of your corpus, so it discloses nothing 2b was protecting.
- **If the query can't be run cheaply at build time, do not invent numbers.** Fall back to the ✓/✕ pair alone (which already exists in the band). Ship the fallback and flag it; that is a better outcome than an unlabelled fabrication, which is exactly what 2b removed.
- Accessibility: the arrow is decorative. Give the container an `aria-label` that reads as a sentence — `"217 listings match brake pad; 4 fit your vehicle"` — so a screen reader doesn't announce "217 arrow 4".

### 5.5 What stays

- The five-level picker **including the engine code**. Resolving to submodel and engine is the published standard in mature aftermarkets — the depth of the question is safe to show; the size of the answer is not. (Note: the repo currently has **four** selects. Adding engine is out of scope for this batch — see `README.md` §9.3.)
- `100,000+ workshops` in the coverage band — a third-party market fact with a source, not a Mobeeli metric.

### 5.6 Contract tests

```
✓ no element in the fitment band renders a string matching /Rp\s?[\d.]/
✓ no element in the fitment band renders the text "(Simulation)"
✓ mb-cat-stats, mb-cat-stat, mb-cat-stat-v, mb-cat-stat-l appear zero times in
  both landing.css and src/**/*.tsx
✓ i18n parity: en and id key sets are identical (this catches a removed stat key
  lingering in one map)
✓ every t() call site resolves to a key present in both maps
✓ if the filter count ships: its two numbers come from the data layer, not
  literals in JSX — assert by grepping for hardcoded 217 / 4 in the component
```

---

## 6. §4 — Unmount `AiCatalogCard`, and the aurora

### 6.1 Unmount

Remove `<AiCatalogCard />` and its import from `LandingView.tsx`.

**Do not delete the component, `catalogLoop.ts`, or the sprite assets.** It is well-built and may move to `/why-mobeeli` or the deck. Update its top-of-file block comment to record that it is no longer mounted on `/`.

Its CSS stays in `landing.css` since the component still exists — but note `.mb-cat-card` is now unused on the landing page, which is what §4 above depends on.

Update the `LandingView.tsx` band-order comment:

```
nav (overlay) → hero → catalog (dark, id="how-it-works") →
problem (light, id="problem") → coverage (dark, id="coverage") →
protection (light, id="protection") → buyer strip (id="waitlist") → footer
```

### 6.2 Aurora — decision 2

`README.md` §4.5 originally claimed this unmount resolves the aurora inconsistency. **That was my error** — I missed `Hero.tsx`. There are three mounts:

| Component | Line | Intensity |
|---|---|---|
| `Hero.tsx` | 32 | `0.4` |
| `FitmentSection.tsx` | 100 | `0.3` |
| `AiCatalogCard.tsx` | 258 | `0.28` |

Unmounting the demo card leaves **two** live WebGL contexts in adjacent dark bands, 8% apart — close enough to read as an accident rather than a decision.

Built to the recommendation: **unify both survivors to `0.35`.**

```diff
-<AmbientAurora intensity={0.4} />   // Hero.tsx:32
+<AmbientAurora intensity={0.35} />
-<AmbientAurora intensity={0.3} />   // FitmentSection.tsx:100
+<AmbientAurora intensity={0.35} />
```

Better still, export the constant so a third value can't drift in:

```ts
// src/components/three/AmbientAurora.tsx
export const AURORA_INTENSITY = 0.35;
```

The single-shared-context refactor is a real win on a mid-range Android in Jakarta, but it is a **performance** problem, not a design one. It gets its own measured piece of work — do not smuggle it into this batch.

### 6.3 Contract tests

```
✓ AiCatalogCard is not imported anywhere under src/app or LandingView
✓ AmbientAurora mount count on / === 2
✓ every AmbientAurora intensity prop on / is the same value
✓ grep for a numeric literal passed to intensity= returns nothing (all references
  go through AURORA_INTENSITY)
```

---

## 7. §7 — Protection as its own band, and the nav

The largest change. `README.md` §7 describes it loosely; this section replaces that description with exact values, read from `Mobeeli Landing — R16 Proposal.dc.html`.

### 7.1 Extract from `FitmentSection`

Remove `.mb-fit-protect` and its children from `FitmentSection.tsx`. Once nothing references them, remove `.mb-fit-protect`, `.mb-fit-protect-head`, `.mb-fit-protect-title` and the `.mb-step-stack--row` rules from `landing.css`.

### 7.2 `src/components/landing/ProtectionSection.tsx`

Follow the shape of `ProblemSection.tsx`: client component, `useT()` for every string, `data-rev` on revealed children, `mb-section` / `mb-section-inner` wrappers.

Structure and exact values:

| Element | Spec |
|---|---|
| `<section>` | `id="protection"`, light band, `scroll-margin-top: 84px` |
| Eyebrow | `.mb-kicker`, `12.5px / 800 / 0.14em`, uppercase, `var(--mb-deep-blue)` |
| H2 | `.mb-h2` — **no size override**. Inherits `clamp(38px, 4.8vw, 64px)`, weight 800 after 7a |
| Lede | `19px / 1.65`, `var(--mb-muted)`, `max-width: 620px` |
| Header container | `max-width: 820px` |
| Grid | 3 columns, `gap: 1px`, `background: var(--mb-border)`, `border: 1px solid var(--mb-border)`, `border-radius: 2px`, `margin-top: 64px` |
| Cell | `background: var(--mb-surface)`, `padding: 36px 32px 40px`, flex column, `gap: 16px` |
| Icon | 22×22 SVG, `fill="none"`, `stroke="currentColor"` (cell sets `var(--mb-deep-blue)`), `stroke-width="1.5"`, round caps and joins |
| Numeral | `12px / 700`, `var(--mb-muted-2)`, `font-variant-numeric: tabular-nums` |
| Cell H3 | `23px`, `line-height: 1.2`, `letter-spacing: -0.015em`, weight 700, `var(--mb-ink)` |
| Cell body | `15.5px / 1.7`, `var(--mb-muted)`, `text-wrap: pretty` |

The grid must collapse to one column below the tablet breakpoint the other three-up grids on the page use — match it, don't invent a new one.

### 7.3 Icons

Three, inline SVG, 24×24 viewBox. **Do not substitute an icon font or redraw these** — they are simple geometric primitives, which is why they're specified as paths rather than described:

```html
<!-- 01 video-evidence: camera body + lens barrel -->
<rect x="2" y="6" width="13" height="12" rx="2"></rect>
<path d="M15 10.5 22 7v10l-7-3.5z"></path>

<!-- 02 authenticity: shield + check -->
<path d="M12 3 4 6.2v5.3c0 4.6 3.3 8.4 8 9.5 4.7-1.1 8-4.9 8-9.5V6.2z"></path>
<path d="m9 12 2.2 2.2L15.5 10"></path>

<!-- 03 funds held: strongbox + dial -->
<rect x="3" y="7" width="18" height="12" rx="2"></rect>
<circle cx="12" cy="13" r="2.6"></circle>
<path d="M7 7V5.5h10V7"></path>
```

### 7.4 Copy

**Reuse existing keys wherever they exist.** Grep `copy.ts` for the `prot_` prefix first. If wording needs to change, change it **in place** so EN and ID stay paired — do not create parallel keys.

Where a key doesn't exist, these are the drafts. **EN only, UNSTAMPED.**

| Slot | Draft |
|---|---|
| Eyebrow | Protected on both sides |
| H2 | Funds release when the part fits — not just when it ships. |
| Lede | The shop in Senen wasn't penalised for selling a bad part. They were penalised because nobody could prove what happened. That's the part we built. |
| 01 title | Video-evidence resolution |
| 01 body | Unboxing on camera settles the argument. No more "he said, she said" deciding whether a shop stays open. |
| 02 title | Authenticity verification |
| 02 body | Counterfeit parts are checked before they reach a buyer — not disputed after they've failed on the road. |
| 03 title | Funds release when the part fits |
| 03 body | Money is held until the part is confirmed on the car. The buyer isn't gambling and the seller isn't waiting. |

The lede deliberately answers the Senen quote in band 2. If the founder rewrites that quote, this line has to move with it — they are a pair, not two independent strings.

### 7.5 Buyer strip

Folds into the foot of this band rather than standing alone:

```css
margin-top: 96px;
background: var(--mb-tint);
background-image: radial-gradient(rgba(91, 155, 247, 0.1) 1.2px, transparent 1.2px);
background-size: 24px 24px;
padding: 34px 24px;
```

Full-bleed via negative inline margins matching `--mb-container-pad`. Content is centered, wrapping, `gap: 18px`: a `16.5px / 700` line in `#123f9e`, then a pill button — `1.5px solid var(--mb-deep-blue)`, `14px / 800`, `padding: 11px 22px`, `border-radius: var(--mb-radius-pill)`.

### 7.6 Mount

In `LandingView.tsx`, between `UnifyBand` and `BuyerStrip`.

### 7.7 Nav — decision 1

```diff
 const NAV_LINKS = [
   ["/#problem", "nav_problem"],
   ["/#how-it-works", "nav_how"],
+  ["/#protection", "nav_protect"],
   ["/#why", "nav_why"],
   ["/#early", "nav_early"],
   ["/#team", "nav_team"],
-  ["/investors", "nav_investors"],
 ] as const;
```

```diff
-const NAV_DESKTOP_QUERY = "(min-width: 1040px)";
+// R16: measured — the seven-item bar with the enlarged lockup is 1116px wide.
+// See design_handoff_r16_landing/IMPLEMENTATION-3-to-8.md §0.
+const NAV_DESKTOP_QUERY = "(min-width: 1120px)";
```

New key `nav_protect` — EN "Protection", ID per founder.

Investors keeps its **footer link** and the **hero's secondary button**. It is a destination people arrive looking for, not one they browse to, and it is the only one of the six that isn't part of the product story. Verify both survive — losing the nav link and the footer link together would be a real regression.

### 7.8 Contract tests

```
✓ #protection exists in the DOM and is reachable from the nav anchor
✓ .mb-h2 inside #protection has no font-size override — computed size equals
  the same element's size in #problem at the same viewport
✓ the nav bar's scrollWidth <= its clientWidth at exactly 1120px viewport width
✓ at 1119px the burger is shown; at 1120px the desktop bar is shown
✓ an Investors link exists in the footer AND in the hero
✓ the three-up grid collapses to one column at the same breakpoint as the other
  three-up grids on the page
✓ i18n parity holds after adding nav_protect and any prot_* keys
```

---

## 8. Verification across the whole batch

### Build gates

```bash
npm run lint
npx tsc --noEmit
npm run build
```

All three clean. `tsc` in particular catches the `as const` / `CopyKey` mistakes §5.2 can introduce.

### Standing contract tests

Write these once; they protect every future change. They exist because §6 uncovered a rule that had been silently matching nothing for months — **a test that pins a selector proves nothing if the selector is dead.**

1. **No dead selectors** — every class targeted in `landing.css` appears in at least one `.tsx`. This is the one that would have caught `.mb-fit3d .mb-cat-card` on the day it broke.
2. **No orphan classes** — the inverse: every `className` literal resolves to a rule.
3. **i18n parity** — `en` and `id` key sets identical; every `t()` argument present in both.
4. **Reduced motion** — under `prefers-reduced-motion: reduce`, no element in the fitment band has a running animation.
5. **Reduced transparency** — under `prefers-reduced-transparency: reduce`, `.mb-glass` computes `backdrop-filter: none` and an opaque background.

### Visual

Screenshot **every band** at **1280, 1120, 1119, 1040, 768, 375**. The 1120/1119 pair is the nav breakpoint boundary — the bar must not wrap at 1120 and must be a burger at 1119.

Both languages at every width. Indonesian headlines run 15–25% longer, and I measured the effect under an 800-weight face: **every candidate gained a line in ID.** `cat_unified_h2` is materially longer in ID and will wrap differently once band 2's heading is at full scale.

Light and dark bands separately after the weight change — 800 on a light background reads heavier than 800 on dark.

### Manual

- Tab the whole page. Focus rings visible everywhere (`:focus-visible` is wired globally).
- Mobile sheet: body scroll lock, Escape closes, focus returns to the burger.
- Set a vehicle by picker, then by plate. Scan runs **once**, readout lands, garage chip persists across reload.
- Clear the garage; picker returns.
- `prefers-reduced-motion: reduce`: nothing in the fitment band moves, and the scan result is visible at rest.

---

## 9. Still needs a founder ruling — do not guess

Carried forward from `README.md` §9, minus the three resolved above.

1. **Five-level picker.** Repo has four selects; the design shows five with an engine code. New select, new state, garage string format change, and `mobeeli_garage` in localStorage changes shape — **existing visitors have a 4-part string saved.** Migrate, ignore, or version the key. Out of scope for this batch.
2. **Logo — and it now gates the nav breakpoint.** `/assets/mobeeli-logo-{blue,white}.png` are 2891×1109 with mark and wordmark baked together. "Bigger wordmark" can't be done by scaling that file. Either commission a new lockup at the revised proportions, or split into mark-only image + live text (the design mockups use the split, with PJS 800 as the wordmark).

   **The coupling, which this document originally buried in §0:** the six-link bar fits 1040px *today* because the baked lockup is narrow. Measured on the proposed mark-plus-live-text lockup, the same six links run past it. **The moment the logo splits, `NAV_DESKTOP_QUERY` has to move** — so the logo decision and the nav breakpoint are one decision, not two. Re-measure against the chosen lockup before touching the constant.
3. **`/why-mobeeli` disclosure.** Public, indexed, sitemapped, and carrying the seller-fee range from the founder's own June field survey. Trimming the front page achieves little if the data is one click away. Leave public / round the figure / de-sitemap — unresolved.
4. **Where `AiCatalogCard` lives now.** Unmounted, not deleted, no home yet.
5. **Copy stamping.** Every EN string in §5.2 and §7.4 is a draft. Founder approves and writes ID.
