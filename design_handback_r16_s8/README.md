# R16 §8 — the scan choreography: implementation handback

**To:** Claude Design — verification that your R16 §8 spec shipped as ruled.
**From:** Claude (Opus 5), VS Code session, engineer on this repo.
**Against:** `design_handoff_r16_landing/README.md` §8 + `R16 Scan Studio.dc.html` direction **4a**.
**Status:** merged and **live in production** — `main` @ `2ceb938`, Vercel deployment `5610398080` (`success`).
**Verified:** 2026-07-26. Every screenshot in `frames/` is captured from
<https://mobeeli-landing-page.vercel.app>, not from a local build.

This closes R16. §8 was the last open item in your brief.

---

## 0. Verdict

Your spec shipped **as ruled**, with **three deliberate deviations** — one naming choice and
two corrections to the brief's own CSS, both of which would have silently broken the
reduced-motion behaviour. All three are argued in §4. Nothing else was changed, added, or
dropped.

Two of your instructions in particular were treated as hard requirements and are now
test-enforced: every animation gated behind `.is-scanning`, and reduced motion showing the
**finished** reading rather than hiding it.

| | |
|---|---|
| Timing | `SCAN_DURATION_MS = 1800` untouched, as you specified |
| Gate | 340 Vitest / 43 files (was 323) · ESLint clean · `next build` clean |
| Browser | Playwright **54/54** (e2e_full) + **48/48** (verify_r16, was 25) + **19/19** (production smoke) |
| Live | All of the above re-run against production after the merge |

---

## 1. Spec → implementation, line by line

Everything below is read off the **deployed** CSS via `getComputedStyle`, not off the source.

### The three phases

| Phase | Your window | Shipped | Where |
|---|---|---|---|
| Acquire | 0 – 216ms (0–12%) | `0%` opacity 0 → `12%` opacity 1, `translateY(0)` | `landing.css:840` |
| Traverse | 216 – 1314ms (12–73%) | `12%` → `73%`, `translateY(0)` → `translateY(139px)` | same |
| Settle | 1314 – 1800ms (73–100%) | `73%` → `86%` opacity 1 → 0, held to `100%` | same |

Driven by `.mb-cat-car-wrapper.is-scanning .mb-cat-scan-line { animation: mb-cat-scan 1800ms linear 1 forwards }`
(`landing.css:836`). 139px down the 140px frame, as specified.

### The callouts

| Callout | Element | Your delay | Shipped delay | Your duration | Shipped |
|---|---|---|---|---|---|
| 1 `PCD 4 × 100` | dot | 500ms | `0.5s` | 300ms | `0.3s` |
| | leader | 500ms | `0.5s` | 450ms | `0.45s` |
| | value | 550ms | `0.55s` | 500ms | `0.5s` |
| 2 `⌀ 54.1 mm` | dot | 800ms | `0.8s` | 300ms | `0.3s` |
| | leader | 800ms | `0.8s` | 450ms | `0.45s` |
| | value | 850ms | `0.85s` | 500ms | `0.5s` |
| 3 `offset ET 45` | dot | 1020ms | `1.02s` | 300ms | `0.3s` |
| | leader | 1020ms | `1.02s` | 450ms | `0.45s` |
| | value | 1070ms | `1.07s` | 500ms | `0.5s` |
| Lock | — | 1300ms | `1.3s` | 500ms | `0.5s` |

Easing on all four: `cubic-bezier(.2,.7,.2,1)` — confirmed surviving lightningcss minification
(4 occurrences in the production CSS chunk). Rules at `landing.css:940-960`.

### Type

| | Your spec | Shipped |
|---|---|---|
| Callout label | 10.5px / 600 / 0.05em / tabular-nums | `landing.css:893` + `globals.css` tnum list |
| Lock readout | 10px / 600 / 0.09em / uppercase / tabular-nums | `landing.css:927` |

`tabular-nums` is applied by adding `.mb-cat-scan-val` and `.mb-cat-scan-lock-t` to the existing
`font-feature-settings: "tnum"` group in `globals.css` — the repo's established mechanism —
rather than by a local declaration.

### The measurement grid

Shipped verbatim from your snippet (`landing.css:813`), plus `pointer-events: none`. The
`18px 18px` size is yours; note the `.dc.html` prototype used `20px` on its larger frame.

### Keyframes

| Yours | Shipped | Note |
|---|---|---|
| `mb-scan-line` | `mb-cat-scan` | see §4.1 |
| `mb-scan-dot` | `mb-cat-scan-dot` | |
| `mb-scan-leader` | `mb-cat-scan-leader` | |
| `mb-scan-val` | `mb-cat-scan-val` | |
| `mb-scan-lock` | `mb-cat-scan-lock` | |

---

## 2. Geometry — the one thing I had to derive

**Your reference frame is 440 × 170. The production frame is 280 × 140.** The `.dc.html`
callout coordinates could not be used directly, so I re-derived them. **This is the part most
worth your eye.**

I did *not* scale your pixel positions naively. I noticed the prototype's dot positions encode a
relationship worth preserving: **each dot sits exactly where the scan line is at that dot's own
trigger time.** In your 170px frame:

| Callout | Your dot `top` | As a fraction | Line position at trigger |
|---|---|---|---|
| 1 @ 500ms | 44px | 25.9% | (500−216)/1098 = **25.9%** |
| 2 @ 800ms | 89px | 52.4% | (800−216)/1098 = **53.2%** |
| 3 @ 1020ms | 124px | 72.9% | (1020−216)/1098 = **73.2%** |

So the value lands *as the instrument crosses it* — the whole point of 4a. I recomputed the
positions from the timings rather than from your pixels, so the relationship is exact rather
than approximately preserved:

| Callout | Trigger | Traverse fraction | Shipped `top` |
|---|---|---|---|
| 1 | 500ms | 0.2587 × 139px = 35.9 | **36px** |
| 2 | 800ms | 0.5319 × 139px = 73.9 | **74px** |
| 3 | 1020ms | 0.7322 × 139px = 101.8 | **102px** |

A contract test recomputes all three from the phase boundaries and fails if either side drifts
(`tests/r16-scan-gating.test.ts`, "anchors each dot where the line actually is").

### Horizontal placement

Horizontal anchors are **percentages**, internal offsets are **pixels**:

| Callout | `left` (from your x ÷ 440) | Leader | Value offset |
|---|---|---|---|
| 1 | 9.5% | `left: 5px; width: 74px` origin left | `left: 82px` |
| 2 | 67.7% | `left: -67px; width: 62px` origin **right** | `left: -124px` |
| 3 | 14% | `left: 5px; width: 58px` origin left | `left: 66px` |

Callout 2's leader grows leftward, as in your prototype.

**Why percent-x but px-internals:** below 640px the frame goes `width: 100%`. On a 375px
viewport it measures **327 × 140** — *wider* than the 280px design width, not narrower. Percent
anchors keep the three measurement points spread across the vehicle, while px internals keep
each label at a fixed distance from its own dot, so the label/leader/dot relationship is
invariant across widths. See `frames/07-frame-1400ms-375.jpg` — the leaders connect identically
at 327px and at 280px.

A browser test asserts no callout's bounding box escapes the frame at either 1280 or 375. This
matters because `.mb-cat-car-wrapper` is `overflow: hidden`, so an overflowing label would be
silently **clipped** rather than visibly broken.

---

## 3. Colour

Your prototype's literals map onto existing repo tokens, so tokens were used where one matched
exactly:

| Element | Prototype | Shipped |
|---|---|---|
| Dot / lock dot | `#5b9bf7` | `var(--mb-light-accent)` — *is* `#5b9bf7` |
| Dot glow | `rgba(47,125,246,.8)` | same — `--mb-primary` at 80%, matching the band's existing `rgba(47,125,246,…)` usage |
| Leader | `rgba(91,155,247,.5)` | same |
| Scan line | `#7cb0f9` + `0 0 14px 3px rgba(47,125,246,.65)` | same |
| Value label | `#9dc2fa` | same |
| Lock text | `#c7cfdd` | same |

No emerald/indigo introduced (`#10b981` / `#34d399` / `#818cf8` remain test-forbidden and
absent). Value and lock text carry `text-shadow: 0 1px 3px rgba(0,0,0,.85)` — **an addition,
not in your spec.** The vehicle plate is `mix-blend-mode: screen`, so a label can land on a lit
area of the blueprint; the shadow is invisible on the dark ground and only does work where the
car is bright. Say the word if you want it gone.

---

## 4. The three deviations

### 4.1 Class prefix: `mb-cat-scan-*`, not `mb-scan-*`

Your brief specifies `.mb-scan-callout` / `.mb-scan-lock`. **`.mb-scan-overlay` and
`.mb-scan-laser` already exist in `landing.css`** as dead rules left over from the removed
GarageOS scanner. Landing new work into that namespace would have made the live rules
indistinguishable from the orphans during the dead-CSS sweep that is still outstanding
(~217 lines). The band prefix `mb-cat-scan-*` also keeps clear of `AiCatalogCard`'s `.mb-cat-*`
selectors — the exact collision that had to be untangled in R15.

Keyframe `mb-cat-scan` (not `mb-scan-line`) additionally preserved the existing R16 batch-1
timing contract test verbatim, so the CSS↔TypeScript binding never lapsed during the change.

### 4.2 Reduced motion needed the `.is-scanning` selector — the brief's would not have worked

Your snippet:

```css
@media (prefers-reduced-motion: reduce) {
  .mb-cat-car-wrapper .mb-scan-callout,
  .mb-cat-car-wrapper .mb-scan-lock { animation: none; opacity: 1; transform: none; }
}
```

**A media query adds no specificity.** `.mb-cat-car-wrapper .mb-scan-callout` is (0,2,0); the
rule it must override — `.mb-cat-car-wrapper.is-scanning .mb-cat-scan-dot` — is (0,3,0). The
gated rule wins, and **the full stagger would have kept running for exactly the users who asked
for no motion.** Since the elements would also be forced to `opacity: 1`, the failure would have
been near-invisible in review: the reading looks correct, it just animates.

Shipped (`landing.css:987`), split by what each part needs to beat:

```css
@media (prefers-reduced-motion: reduce) {
  .mb-cat-car-wrapper.is-scanning .mb-cat-scan-line { animation: none; opacity: 0; }
  /* (0,3,0) — matches the gated rules, so cancelling actually cancels */
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

Tested per element, and separately in a real browser
(`document.getAnimations()` → 0 running under `reduced_motion="reduce"`).

### 4.3 `transform: none` would have shifted every label off its leader

Also from your snippet. `.mb-cat-scan-val` carries `transform: translateY(-50%)` to centre each
label on its 1px leader line; `transform: none` would have dropped that and pushed all three
labels down by half a line.

Instead, **each keyframe's `to` state is authored to equal the element's resting style** —
`translate(0, -50%)` for the value, `scale(1)` for the dot, `scaleX(1)` for the leader — so the
reduced-motion block only ever has to raise `opacity` and there is no transform to unwind. A
test asserts `transform: none` never appears on a scan selector inside a reduced-motion block.

---

## 5. Copy

Four strings were needed. Per your note, existing keys were reused rather than duplicated.

| Slot | Key | EN | ID |
|---|---|---|---|
| Callout 1 | `cat_scan_pcd` *(new)* | `PCD 4 × 100` | `PCD 4 × 100` |
| Callout 2 | **`fit3d_bore_v`** *(reused)* | `⌀ 54.1 mm` | `⌀ 54,1 mm` |
| Callout 3 | `cat_scan_offset` *(new)* | `offset ET 45` | `offset ET 45` |
| Lock | `cat_scan_lock` *(new)* | `2019 Avanza 1.5 G · 2NR-VE` | `2019 Avanza 1.5 G · 2NR-VE` |

`fit3d_bore_v` was already stamped and matches the required text exactly, so callout 2 uses it
directly — which also inherits the ID comma decimal for free. Verified live in Bahasa:
`frames/06-frame-1400ms-bahasa.jpg` renders `⌀ 54,1 mm`.

`fit3d_pcd_v` is `4 × 100`, not `PCD 4 × 100`, so callout 1 is a new key rather than a
composition — assembling it from a key plus a hardcoded `PCD` would have put a user-facing
string in a component, which the i18n contract forbids.

The ID for the other three is deliberate, not lazy: `PCD`, `ET` and the engine code `2NR-VE` are
used as-is in Indonesian workshop parlance, and `cat_part3_spec` already ships `ET 45` untranslated
in the ID map. All three new keys are marked **DRAFT — founder to confirm** in `copy.ts`,
alongside the `cat_partN_spec` drafts from batch 2.

### One honesty decision you should know about

The readout is **static** — it reports the same illustrative Avanza regardless of what the
picker is set to. This was deliberate:

- PCD, bore and ET are Avanza-specific geometry. Making the *lock* dynamic while the
  *measurements* stay fixed would assert Avanza geometry **for a Honda Xpander** — a specific,
  false claim, worse than the current generic one.
- The catalogue cards above already behave this way (`cat_part1_spec` is `2NR-VE` for every
  selection), so the whole band stays one coherent vehicle.
- Real per-model geometry is a business fact nobody has stamped, and inventing it is off the
  table.

Flagged to the founder as an open decision. Wiring it up needs real fitment data.

---

## 6. Accessibility

The readout layer is `aria-hidden`. It lives in the DOM **permanently at opacity 0**, so an
exposed layer would announce three measurements and a vehicle lock to a screen reader at all
times, including at rest, on a band the user has not interacted with. The authoritative result
stays fully in the accessible tree: the garage chip above and the four "Verified Fit" badges
below.

Reduced motion still shows the complete reading visually — per your ruling, and because
withholding the answer from users who asked for no motion would be the wrong fix.

The CSS media query drives the gate, not `useReducedMotion()` — per your note, and a test
asserts the hook is not imported into this component so a second source of truth cannot appear.

---

## 7. Visual evidence — all captured from live production

Screenshots are slower than an 1800ms pass, so racing a real scan captures noise. Each frame
below was captured deterministically: apply `.is-scanning` directly (React never re-renders, so
the class sticks), then pause every animation inside the frame and set its `currentTime` — which
includes the delay, so one value reproduces the exact frame at time *T*.

| File | What it shows |
|---|---|
| `frames/01-band-at-rest-1280.jpg` | Band 2 in context, idle |
| `frames/02-frame-at-rest.jpg` | **Bug A:** grid only. No line, no callouts, no lock |
| `frames/03-frame-0300ms.jpg` | Acquire — line at the top, nothing else yet |
| `frames/03-frame-0620ms.jpg` | Callout 1 arriving |
| `frames/03-frame-0900ms.jpg` | Line mid-traverse at ~87px; callout 2 arriving |
| `frames/03-frame-1150ms.jpg` | Callouts 1–2 held, 3 arriving |
| `frames/03-frame-1400ms.jpg` | All three read; lock arriving |
| `frames/03-frame-1750ms.jpg` | Settle — line gone, full reading holds |
| `frames/04-band-scanning-1280.jpg` | The pass in band context |
| `frames/05-frame-reduced-motion.jpg` | **Bug B:** the finished reading, held at rest, zero motion |
| `frames/06-frame-1400ms-bahasa.jpg` | ID — `⌀ 54,1 mm` comma decimal |
| `frames/07-frame-1400ms-375.jpg` | 327 × 140 frame; anchors and leaders hold |
| `frames/08-band-scanning-375.jpg` | Mobile band context |

Regenerate the whole set against live production:

```bash
python design_handback_r16_s8/capture.py design_handback_r16_s8/frames
```

Re-run the post-deploy check (19 assertions, live, read-only — it touches no API route):

```bash
python tests/e2e/smoke_prod_r16_s8.py
```

Or read the delays straight off the live site:

```js
[...document.querySelectorAll('.mb-cat-scan-val')].map(e => getComputedStyle(e).animationDelay)
// during a scan: ["0.55s", "0.85s", "1.07s"]
```

---

## 8. Test coverage added

`tests/r16-scan-gating.test.ts` grew from 5 tests to 22. The ones worth knowing:

- **The gating sweep is generic, not enumerated.** It walks every rule whose selector mentions
  the scan, and fails on any carrying an `animation` without `.is-scanning`. Naming selectors
  individually would not catch a *new* element added later — which is precisely how Bug A
  happened.
- **It refuses to go vacuous.** It asserts it found at least as many animated scan rules as
  there are animated elements, so a rename cannot turn the sweep into a green no-op. This is the
  R13 lesson applied — `.mb-fit3d .mb-cat-card` was asserted to exist, did exist, and matched
  nothing in the DOM for months.
- **Every class is asserted in the rendered markup**, not only in the stylesheet.
- **The dot anchors are recomputed** from the phase timings rather than hardcoded twice.
- **Nothing outlives the pass** — every callout's delay + duration ≤ 1800ms, and the lock lands
  on exactly 1800ms.

`tests/e2e/verify_r16.py` grew from 25 checks to 48, adding computed delay/duration/easing per
element, the reading landing on schedule, the frame idle after the scan, overflow at 1280 and
375, and the reduced-motion readout.

---

## 9. Open — not mine to decide

1. **The three draft strings** need a founder stamp (§5).
2. **Static vs. dynamic readout** (§5) — needs real per-model fitment data.
3. **`217 → 4` filter count**, your §9.2 — still not implemented, still needs the
   real-or-illustrative ruling.
4. **The `text-shadow` on labels** (§3) is my addition. Yours to veto.
5. Your **§4.5 remains wrong** and is unaddressed: unmounting `AiCatalogCard` leaves **two**
   WebGL contexts, not one — `Hero.tsx` (0.4) and `FitmentSection.tsx` (0.3). Your diagnosis #6
   is not resolved.

Everything else in R16 is shipped.
