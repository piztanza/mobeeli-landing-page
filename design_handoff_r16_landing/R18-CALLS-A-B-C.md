# R18 Calls A, B and C — cut the protection band, reorder, and one clause

**To:** Claude Code
**From:** Claude Design
**Date:** 2026-07-27
**Verified against:** `main` @ `b4aa5fb` — every path, line and assertion below was read from the repo, not recalled.
**Founder ruling:** all three R18 calls approved. **A** §§1–3, **B** §7, **C** §8. Build them as three commits in that order, not one.

---

## What this is

Three changes to the front page, ruled together:

| | Change | Size |
|---|---|---|
| **A** | Unmount `ProtectionSection` from `/`. Keep the component, its CSS and its copy keys. | 2 files + 4 test files |
| **B** | Move `ProblemSection` above `FitmentSection`. | 1 line + 1 test |
| **C** | Add one clause carrying authenticity, subordinate to the fitment claim. | 1 key pair + 1 element |

The reasoning is in `R18 Front Page Decision.dc.html`; the short version is that trust is the one message in this market that is already taken — Otoklix raised $10M to say it — and the front page should stake the fitment claim instead, which nobody else is claiming.

**Commit them separately.** A is a deletion, B is a reorder, C adds copy. Bundled together, a revert takes all three; separately each is independently reversible, and B in particular changes how the whole page reads and deserves its own look.

A is a deletion, so its risk is not in the source. **It is in the tests.** Four test files assert the band exists. Miss one and the gate goes red; miss the intent and someone re-adds the band in three months. Both are addressed below.

---

## 1. Source changes

### 1.1 `src/components/landing/LandingView.tsx`

Remove the import and the mount:

```diff
-import ProtectionSection from "./ProtectionSection";
```

```diff
       <ProblemSection />
       <UnifyBand />
-      <ProtectionSection />
       <BuyerStrip />
```

Update the band-order block comment — it currently documents the protection band as part of the stack:

```
 * Landing page (F-001) — the band stack, alternating dark/light (R18):
 * nav (overlay) → hero (dark, full viewport) → catalog (dark, id="how-it-works")
 * → problem (light, id="problem") → coverage (dark, id="coverage") →
 * buyer strip (id="waitlist") → footer.
 *
 * R18 call A: ProtectionSection is no longer mounted here. Not because the
 * protection story is weak — counterfeits are estimated at 30%+ of parts sold —
 * but because "we make the aftermarket trustworthy" is the message Otoklix
 * ($10M Series A, 900+ workshops) and Bengkel Mania already occupy. The front
 * page stakes fitment, which nobody else is claiming. The mechanics move to
 * /platform and the deck. Component KEPT, same as AiCatalogCard under 1a.
```

Keep the existing R16 ruling 1a paragraph about `AiCatalogCard` — it is still accurate and now has a sibling.

### 1.2 `src/components/landing/Nav.tsx`

```diff
 const NAV_LINKS: readonly (readonly [href: string, key: CopyKey])[] = [
   ["/#problem", "nav_problem"],
   ["/#how-it-works", "nav_how"],
-  ["/#protection", "nav_protect"],
   [PLATFORM_URL, "nav_early"],
   ["/team", "nav_team"],
   ["/investors", "nav_inv"],
 ];
```

The block comment above it explains the R16 ruling 1c seven-link squeeze. Replace it:

```
/**
 * R16 ruling 1c added a Protection anchor and, to fit it against the 1040px
 * breakpoint, the founder dropped "Why Mobeeli" from the bar. R18 call A cuts
 * the protection band, so the anchor goes with it — leaving FIVE links and a
 * free slot. Whether "Why Mobeeli" returns to that slot is an open founder
 * call, NOT an automatic revert: see the note in the R18 handoff. The
 * /why-mobeeli route stays live, indexed and linked from the footer either way.
 */
```

Also update the component's own doc comment, which says "logo, 6 section links" — it is 5 now.

### 1.3 `src/components/landing/ProtectionSection.tsx` — keep, comment only

Do **not** delete this file. Two reasons, and the second is load-bearing:

1. Same precedent as `AiCatalogCard` under ruling 1a — the work is good and may earn a home on `/platform`.
2. **The dead-selector contract test.** `.mb-protect*` rules stay in `landing.css`; that test passes only because these class names still appear in a `.tsx`. Delete the component and you must delete the CSS in the same commit or the gate goes red.

Add to the top of its block comment:

```
 * R18 call A: no longer mounted on `/`. Kept deliberately — the CSS below it in
 * landing.css is only legal while these class names appear in a .tsx. If this
 * file is ever deleted, delete the .mb-protect* rules in the same commit.
```

### 1.4 `src/components/landing/landing.css` — comment only

No rules change. Update the header comment at the `/* ---------- protection band (R16) ---------- */` marker to record that the band is unmounted, so the next person reading it doesn't hunt for it on the page.

### 1.5 `src/lib/i18n/copy.ts` — no change

`nav_protect`, `prot_r1`, `prot_r2`, `prot_r3` and `how_s3_t` all **stay in both maps.**

I checked why this is safe rather than assuming it: `LANDING_KEYS` in `tests/landing.test.tsx` is an **i18n completeness contract** — it asserts each key exists and is truthy in both languages, not that it renders. `prot_r1/2/3` are in that array and will keep passing untouched. `nav_protect` is not in the array at all.

An unused copy key costs nothing, keeps EN/ID paired, and means restoring the band is a mount, not a translation round.

---

## 2. Test changes — all four files

These will fail on the source change alone. Fix them in the same commit.

### 2.1 `tests/landing.test.tsx` — three assertions

**a. The band-order test** (`"renders the R16 band order — catalog second, protection fifth"`):

```diff
       t("en", "uni_h2"), // coverage / archipelago (dark, id="coverage")
-      t("en", "how_s3_t"), // protection (light, id="protection") — R16 ruling 1c
       t("en", "buyer_line"), // buyer strip (id="waitlist")
```

Rename it — the title asserts a fact that is no longer true:

```js
it("renders the R18 band order — catalog second, no protection band", () => {
```

**b. The band-id test** (`"gives every band an id, and drops the second competing catalog"`):

```diff
-    for (const id of ["how-it-works", "problem", "coverage", "protection", "waitlist"]) {
+    for (const id of ["how-it-works", "problem", "coverage", "waitlist"]) {
```

**c. The nav-href test** (`"points the nav links at the routes, /#id anchors and the external platform"`):

```diff
       "/#how-it-works",
-      "/#protection",
       "https://mobilee-demo.vercel.app/platform",
```

### 2.2 `tests/nav-mobile.test.tsx`

```diff
-/** The 6 nav links + Join CTA every viewport must offer (CHG-piztanza-10). */
+/** The 5 nav links + Join CTA every viewport must offer (CHG-piztanza-10, R18 call A). */
 const NAV_HREFS = [
   "/#problem",
   "/#how-it-works",
-  "/#protection",
   "https://mobilee-demo.vercel.app/platform",
```

### 2.3 `tests/section-pages.test.tsx`

```diff
         "/#how-it-works",
-        "/#protection",
         "https://mobilee-demo.vercel.app/platform",
```

### 2.4 `tests/r16-protection-band.test.tsx` — keep the file, strip the page assertions

This file does two different jobs and only one of them is now false. The component-level assertions (renders three promises, both languages, three icons) are still valid and still worth keeping — the component still exists and should still work when it is mounted somewhere.

Remove only the assertions about the **live page**:

- `expect(page).toContain('id="protection"')` — the `band` half of that same assertion stays.
- In `"anchors protection and keeps Investors"`: drop `expect(page).toContain('href="/#protection"')`. If the Investors half of that test is the only thing left, keep it and rename the test to `"keeps Investors in the nav"`.
- The `nav_protect` truthiness loop can stay — the key is still defined and still paired.

Rename the file's block comment to record the arc honestly: the band fixed a real hole in R16 (those keys were rendering nowhere), and R18 removed it from `/` for positioning reasons, not because it was wrong.

Consider renaming the file `protection-band.test.tsx` — it is no longer an R16-ruling test.

---

## 3. Add one regression guard

The failure mode this change invites is silent re-addition. Add to `tests/landing.test.tsx`:

```js
it("keeps the protection band off the front page (R18 call A)", () => {
  expect(html).not.toContain('id="protection"');
  expect(html).not.toContain('href="/#protection"');
  expect(html).not.toContain(esc(t("en", "how_s3_t")));
});
```

And, since the nav count is the thing most likely to drift as slots free up:

```js
it("keeps the desktop nav at five links (R18 call A freed a slot)", () => {
  const bar = html.match(/<div class="mb-nav-links">.*?<\/div>/s)?.[0] ?? "";
  expect((bar.match(/<a |<link/g) ?? []).length).toBe(5);
});
```

Check that second one against how the links actually serialise before committing it — `Link` renders as `<a>`, but the exact match depends on the surrounding markup, and a brittle regex is worse than no test. If it is awkward, count `href=` occurrences within the captured bar instead.

---

## 4. Consequence that needs a founder call — do not decide it yourself

**The nav has a free slot.** "Why Mobeeli" was dropped from the bar under R16 ruling 1c *specifically* to make room for Protection. Protection is now gone. That does not automatically mean Why Mobeeli returns — it means someone has to choose:

- **Leave it at five links.** A shorter bar, more room for the logo, and the front page stays focused. `/why-mobeeli` keeps its footer link and stays indexed.
- **Restore Why Mobeeli.** Back to six links, back to the R16 width problem, and it re-touches the logo coupling below.

**And it moves the logo question.** The six-link bar fits the 1040px breakpoint today only because the baked lockup image is narrow. At five links there is genuinely more headroom — which makes this the cheapest moment to split the logo into mark + live wordmark, the change the founder has been asking for. **Re-measure the bar against the chosen lockup before touching `NAV_DESKTOP_QUERY`.** Do not assume the extra slot covers it.

Flag both to the founder; build neither on your own.

---

## 5. Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

Expected: **344 tests still green**, minus the assertions removed above, plus the guards added in §3.

Then confirm by hand:

```
✓ / renders five content bands: hero, catalog, problem, coverage, waitlist
✓ no #protection anchor in the DOM and no protection link in the desktop bar
✓ no protection link in the mobile sheet either — same NAV_LINKS array feeds both
✓ the scrollspy does not throw on a missing #protection target
  (ActiveSectionProvider tracks section ids; confirm it reads them from the DOM
   rather than a hardcoded list — if it holds a list, protection must come out of it)
✓ .mb-protect* rules still present in landing.css AND the dead-selector test passes
✓ /why-mobeeli still returns 200 and is still linked from the footer
```

That fourth check is the one I could not fully verify from source — I read `ActiveSectionProvider` being consumed in `Nav.tsx` but did not trace where it gets its id list. If it is hardcoded, it needs the same edit as the nav array.

---

## 6. Commit 1 (A) is done at this point

Stop here, run the gate, and look at the page before starting B.

---

## 7. Call B — move the problem above the catalog

### 7.1 Why

The live page answers before it asks. `FitmentSection` is band 2 and `ProblemSection` is band 3, so the Senen quote — the only human voice on the page — lands *after* the solution it exists to motivate. Moving it up costs one line and changes how the whole page reads.

### 7.2 `src/components/landing/LandingView.tsx`

```diff
             <Hero />
+            <ProblemSection />
             <FitmentSection />
-            <ProblemSection />
             <UnifyBand />
             <BuyerStrip />
```

Band-order comment becomes:

```
 * nav (overlay) → hero (dark, full viewport) → problem (light, id="problem")
 * → catalog (dark, id="how-it-works") → coverage (dark, id="coverage") →
 * buyer strip (id="waitlist") → footer.
 *
 * R18 call B: the problem leads. The Senen quote motivates the catalog band, so
 * it has to precede it — before this it sat behind the demo it sets up.
```

### 7.3 `tests/landing.test.tsx` — the band-order array

Swap the two entries you are left with after §2.1a:

```diff
       t("en", "hero_chip"), // hero (dark, full viewport)
+      t("en", "quote_main"), // the problem, slim (light, id="problem")
       t("en", "cat_unified_h2"), // unified catalog (dark, id="how-it-works")
-      t("en", "quote_main"), // the problem, slim (light, id="problem")
       t("en", "uni_h2"), // coverage / archipelago (dark, id="coverage")
```

And rename it once more — by now the title has been wrong twice:

```js
it("renders the R18 band order — problem second, catalog third, no protection band", () => {
```

Nothing else changes. The nav anchors are `/#id` links resolved at click time, so reordering the sections does not touch `Nav.tsx`, and the scrollspy reads whatever is in the DOM.

### 7.4 One visual consequence — look at it before you commit

The band rhythm changes, and the comment claiming “alternating dark/light” was already only roughly true:

| | Sequence |
|---|---|
| Live today | dark · **dark** · light · dark · light |
| After A | dark · **dark** · light · dark |
| After A + B | dark · light · **dark · dark** |

The dark-on-dark seam does not disappear — it moves from *hero → catalog* to *catalog → coverage*.

That is a net improvement and it is the main reason to do B beyond the narrative one: today a visitor gets two full dark screens back to back on arrival, which is heavy. Afterwards the light problem band breaks that run at the entry point, and the remaining seam sits lower down between two bands that are already visually distinct (aurora and part cards vs. the archipelago map).

**But check the seam.** With no light band between them, `FitmentSection` and `UnifyBand` may run together with nothing marking the boundary. If they do, add a hairline — `border-top: 1px solid var(--mb-hairline-subtle)` on `.mb-uni` — rather than changing either band's background. Screenshot the join at 1280 and 375 before deciding; it may not need anything.

---

## 8. Call C — one clause for authenticity

### 8.1 What it has to do, and not do

Counterfeits are estimated at over 30% of parts sold in Indonesia, and 45% of consumers say they avoid independent garages for fear of non-genuine parts. That is a market condition, not a footnote — saying nothing about it is a real omission.

But a *band* about trust puts Mobeeli on Otoklix's message. So the clause has one job: **make authenticity a property of the word “verified,” not a second feature.** Verification is the noun; fit and authenticity are its two outputs. That keeps trust subordinate to the fitment thesis instead of competing with it.

### 8.2 Placement

In `FitmentSection`, as a single line at the foot of the band — after the part cards, before the band closes. **Not** in the hero: `hero_sub_short` is already carrying the whole positioning line, and there is a test asserting it contains no digits and stays broad. Do not touch it.

### 8.3 Copy — UNSTAMPED

EN draft. **The founder approves the wording and writes the Indonesian** — do not machine-translate, and do not ship EN-only against test-enforced parity.

```ts
cat_verified_note: "Verified means two things: it fits your car, and it's the real part.",
```

Alternate if that reads too neat:

```ts
cat_verified_note: "Every listing is checked twice — that it fits, and that it's genuine.",
```

I prefer the first. It takes a word already in the hero and gives it more weight, rather than introducing a new claim.

### 8.4 Markup and CSS

```tsx
<p className="mb-cat-verified-note">{t("cat_verified_note")}</p>
```

```css
/* R18 call C: authenticity as a property of "verified", not a second feature.
   One line, deliberately — a trust BAND would put us on a competitor's message. */
.mb-cat-verified-note {
  margin: 28px 0 0;
  max-width: 46ch;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--mb-dark-muted);
  text-wrap: pretty;
}
```

`--mb-dark-muted` because this sits on the dark catalog band. Do not accent it, do not give it an icon, do not put it in a box — the moment it looks like a feature callout it stops being a clause and starts being the band we just removed.

### 8.5 Tests

- Add `cat_verified_note` to `LANDING_KEYS` in `tests/landing.test.tsx` so parity is enforced.
- Assert it renders inside the catalog band, not the hero:

```js
it("carries authenticity as one clause in the catalog band (R18 call C)", () => {
  expect(html).toContain(esc(t("en", "cat_verified_note")));
  // It must NOT have grown into a band of its own.
  expect(html).not.toContain('id="protection"');
});
```

---

## 9. What is NOT in this change

- **Restoring “Why Mobeeli” to the nav.** The slot is free after A — see §4. Founder call, not automatic.
- **The logo split and the breakpoint.** §4 explains why A is the cheapest moment for it, but it needs its own measurement pass.
- **The R17 protection band designs.** Three directions for a fuller band, now parked. Still valid if the band returns on `/platform`.
- **Anything about `/why-mobeeli`'s own disclosure.** Still open from R16 §9.
