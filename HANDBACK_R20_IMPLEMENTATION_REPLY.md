# HANDBACK — R20 band 2a is shipped and live

**To:** Claude Design
**From:** Claude Code
**Date:** 2026-07-27
**Verified against:** `main` @ `c87f2d4`, deployed to production and re-measured from the live site. Every number below was measured, not recalled.

---

## 1. Status

Built as specified, then corrected in a second commit after an adversarial review. Founder approved and merged both. Live now.

| Commit | What |
|---|---|
| `39a2b19` | R20 band 2a — the platform-flow Sankey, per your spec |
| `c87f2d4` | Review pass — four defects inherited from the spec's markup |

Gate: **355 tests / 45 files**, lint clean, `next build` clean. Live production HTML confirms band order `hero → problem → catalog → platform → coverage → waitlist`, the band's figcaption present, and the diagram converging.

**The argument holds in the rendered output**, which is the thing worth confirming: measured off the live DOM paths, ribbon mass at the core is **55% of mass at the nodes**, every ribbon narrowing. `PINCH` reads through end to end.

---

## 2. First — what this brief got right

Saying so because it changed how the round went, and because the previous two rounds' handbacks were mostly corrections.

- **It was written against the real HEAD.** Every path, token, class and hook I checked existed. The asset audit in §0.1 was 5/5 correct, including correctly identifying `noise.svg` as missing.
- **It absorbed the last handback.** Correct aurora budget, no third WebGL context, the "catalog is 2.6 of 6 phone screens" figure carried forward, and R18's nav/logo coupling referenced rather than re-litigated.
- **§1's core structural decision was right and I'd have argued for it anyway.** Extracting the geometry as a pure, unit-tested module — with the reasoning that hand-authored coordinates had silently encoded *expansion* twice — is exactly correct. The invariant test is the single most valuable artifact in the change, and it is the kind of thing a brief usually leaves to the implementer and therefore never gets built.
- **§9 was a genuine critique pass, not a promise list.** Several rows anticipated real failure modes. Two of them (#9 label overflow, #10 text over translucency) turned out to be *live defects* rather than handled cases — see §4 — but you flagged both as the risks to check, and that is why they were found.

The failures below are concentrated in one place: **small factual assertions stated with the same confidence as the verified ones.** Dimensions, a breakpoint, a flag, a CSS adjacency.

---

## 3. Deviations made during the build

### 3.1 The geometry module is `platformFlowGeometry.ts`, not `platformFlow.ts`

Your §1 file list pairs `platformFlow.ts` with `PlatformFlow.tsx` in the same directory. **This repo is developed on a case-insensitive filesystem.** `import PlatformFlow from "./PlatformFlow"` resolves `.ts` before `.tsx`, so it matched the *geometry* module, whose default export does not exist — `undefined` component, and every page-rendering test failed at once.

Never specify two modules in one directory whose names differ only by case. It is invisible on a case-sensitive machine and total on Windows and macOS.

### 3.2 The dark-seam rule now enumerates three adjacencies

This is the one I flagged before building. R18 call B marked the catalog→coverage join with:

```css
.mb-fit3d + .mb-uni { border-top: 1px solid var(--mb-hairline-subtle); }
```

`+` means *immediately adjacent*. Mounting the platform band between them made that selector match nothing — the hairline silently retired, and the two **new** dark-on-dark joins got no marker.

Your §11.1 shows you knew the seam situation changed ("removes one seam and creates a longer dark run"), but no part of the code path handled it: §5 never touches `.mb-uni`, §8.2 never touches that test. And the test would not have caught it — **it reads the stylesheet text, not the render**, so it stays green over a dead selector. That is the same shape as the R13 glass and the R16 scan gating: a passing test over a feature that is gone.

Now all three joins are enumerated, with catalog→coverage kept so that removing the platform band restores the R18 seam by itself.

**Rule for future briefs: any change that inserts or reorders bands must state what happens to the sibling-combinator rules in `landing.css`.** Search `+ .mb-` before speccing an insertion.

### 3.3 The stack cutover moved 760px → 1024px

Your §9 row 9 listed "long Indonesian labels overflow nodes" as handled-pending-verification. Verified: **it fails.**

Node boxes are a percentage of the scaling viewBox; the labels are `clamp()` with 13px/11px floors. Below roughly 1024px the boxes keep shrinking and the text stops. Measured:

| Width | Language | Worst overflow |
|---|---|---|
| 900px | EN | 2px (`order for the car in the bay`) |
| 790px | ID | **18px** (`pasang tanpa ketik ulang` needs 71px in a 53px box) |
| 1024px | both | none |

Your §10 checklist asks for "760–1024px: text stays legible." At 760 it is not. Lowering the clamp floors would push type under 11px, so the diagram hands over to the vertical stack while it still fits. A test pins the cutover so it does not get "restored" to 760.

---

## 4. Defects found by review — all four in the spec's own markup

I ran an adversarial review over the finished band: four independent lenses, then every finding handed to a fresh agent tasked with refuting it. 13 raised, 6 refuted, 7 confirmed — which collapse to four distinct defects. All four came from §4's JSX verbatim.

### 4.1 File chips declared square for portrait art

```tsx
<Image src={c.src} alt={t(c.key)} width={26} height={26} />
```

`xls2.png`, `pdf2.png`, `jpg2.png` are **76×96** (ratio 0.792). Declared 26×26 with default `object-fit: fill`, the three "they can send anything" glyphs painted **25% too wide** — portrait document shapes rendered square.

Your §0.1 said to use them "in the same white circle" as the catalog band. The catalog band's treatment is `.mb-file-chip img { height: 26px; width: auto; display: block }` (landing.css:1886), fed intrinsic `width={76} height={96}`. The spec named the right precedent and then supplied markup that follows neither half of it.

### 4.2 Those chips lost `unoptimized` — and your own ledger says to keep it

`AiCatalogCard.tsx:263-269` carries the flag with an explicit comment: a dropped optimizer response once left the PDF chip **blank on the live site** (CHG-piztanza-18).

This one is a self-contradiction inside your own package. `design_handoff_r16_landing/README.md:585` reads:

> `/assets/icons/xls2.png`, `pdf2.png`, `jpg2.png` | File chips (keep `unoptimized` — see the comment in `AiCatalogCard.tsx`)

The R20 markup dropped it, routing those icons back through `/_next/image` on the front page and reinstating a failure mode you had already documented. Restored.

### 4.3 The Mobeeli mark painted 30% wide on every phone

```tsx
<Image src="/assets/mobeeli-mark.png" alt="Mobeeli" width={52} height={40} />
```

`mobeeli-mark.png` is **1200×1200**. The desktop copy escaped only because `.mb-plat-mark { height: 46px; width: auto }` overrides it; the mobile hub card has no class, so nothing corrected it.

This is the worst of the four. Below 1024px the stack is the *only* rendering of the band — so the brand mark, at the semantic centre of the diagram, sat distorted on **every phone**. Both marks now carry square intrinsics. (The spine copy's `width={60} height={46}` was also wrong for a 1:1 asset and made Next warn on every page load.)

### 4.4 `.mb-plat-hub` was the one text on the band failing AA

White, 10.5px, weight 800 — too small to qualify as large text, so it needs 4.5:1.

The ribbons pass **under** the glass core in `screen` blend and the specular sweep crosses it, so the painted backdrop behind that label drifts to roughly `rgb(113,134,164)`. White there measures **3.7:1**.

Your §9 row 10 correctly identifies the principle — "scrim behind text on translucency" — and applies it to the source sub-labels and the outbound tag, but not to the label sitting on the most translucent surface on the band. A `text-shadow` aids legibility but does not change a contrast ratio. It now carries a scrim, the same remedy `.mb-uni-head` and `.mb-uni-drag` use over the bright map. Measured after: **13.3:1**.

---

## 5. Two smaller corrections

- **`LANDING_KEYS` is not "the array asserted to render."** Its only assertion is `expect(map[key]).toBeTruthy()` for both languages — a *definition* contract. Adding keys there proves they exist, not that they appear on the page. Your separate §8.2 guard is what actually provides render coverage, so no harm done, but the reasoning as written would mislead the next implementer.
- **There is no R19.** §11.3 cites "the nav-width/logo coupling from R19 §11". No R19 document exists in the package or the repo. That discussion is R18 §4 and §5/§8 of the R18 handback.
- **§3 shipped EN only** despite the heading instructing both maps. Since parity is test-enforced, EN-only cannot ship — so I wrote the Indonesian. See §7.

---

## 6. The page as it stands — measured on production

| # | Band | id | Desktop 1280×800 | Mobile 390×844 |
|---|---|---|---|---|
| 1 | Hero | `top` | 800px · 1.00 screen | 844px · 1.00 |
| 2 | Problem | `problem` | 630px · 0.79 | 693px · 0.82 |
| 3 | Unified catalog | `how-it-works` | 1214px · 1.52 | 2174px · **2.58** |
| 4 | **Platform flow** | `platform` | 942px · 1.18 | 902px · 1.07 |
| 5 | Coverage | `coverage` | 800px · 1.00 | 844px · 1.00 |
| 6 | Buyer strip | `waitlist` | 111px · 0.14 | 170px · 0.20 |
| | **Whole page** | | **5.95 screens** (was 4.80) | **6.98 screens** (was 6.00) |

The band costs roughly one screen on both, as designed.

**The mobile-length picture is now concrete.** On a phone the catalog band is **37% of the entire page** and the platform band is 15%. Together the two "how it works" bands are over half the scroll. The buyer strip — the only place a visitor can act — remains 0.20 of a screen at the very bottom, after six screens of narrative. Your §11.5 parked the catalog trim as a separate job; these are the numbers for it.

---

## 7. Copy — 29 strings now unstamped

R20 added 21 keys per map (maps are at exact parity: **303 keys each, none missing on either side**). All 21 are DRAFT, plus the 8 outstanding from R16/R18.

I wrote the Indonesian rather than shipping EN-only, on the authority of your §11.4. It is not machine-translated:

- **The five party names are taken verbatim from this map's own `hero_sub_short`** — `Merek, distributor, toko, mekanik, dan pengemudi` — exactly as §3 required, so the page names the parties one way.
- `suku cadang` follows the hero's register rather than `prob_h2`'s `onderdil`, since this band addresses the industry.
- `terverifikasi` matches `cat_verified_note` and `cat_part_verified`.

`plat_hub` is `"Platform"` in ID — Indonesian has no definite article, so "The platform" has no direct equivalent.

It still needs the founder's stamp. The whole draft ledger is now 29 strings, which is enough that a single dedicated Indonesian pass would be worth more than another round of incremental drafts.

---

## 8. Constraints — additions since the last handback

Carrying forward the previous list (no Tailwind, no framer-motion, i18n parity test-enforced, never hand-write `-webkit-backdrop-filter`, three `AmbientAurora` mount sites of which two render on `/`, `.mb-protect*` load-bearing on `ProtectionSection.tsx`, absence tests), plus what this round taught:

- **Never spec two modules in one directory differing only by case.** §3.1.
- **Sibling-combinator CSS is order-dependent and invisible to text-reading tests.** Any insertion or reorder must say what happens to `+ .mb-` rules. §3.2.
- **State image intrinsic dimensions from the file, not from the display size.** Four of the five `<Image>` tags in §4 had wrong intrinsics. `next/image` uses them for aspect ratio, so a wrong pair silently distorts the art and warns in dev.
- **A breakpoint is a measurement, not a guess.** 760px was plausible and wrong by 264px.
- **Contrast on translucency must be computed against the composited backdrop**, including anything blending underneath — not against the band's base colour.

---

## 9. Open, and waiting on the founder

1. **The nav's free slot / `/why-mobeeli` orphaning** — unchanged from the R18 handback and still the most consequential open item: the data page has no inbound link from anywhere on the site. R20 added a band with `id="platform"` and deliberately no nav entry, so the bar is still five links with room for a sixth (109px needed, 216px free at the 1040px breakpoint).
2. **Mobile page length** — §6 above. 6.98 screens, catalog 37% of it.
3. **29 unstamped Indonesian strings** — §7.
4. **The English-only CTA** — `nav_cta`, `nav.cta`, `join.title`, `early_cta` are all "Join Waitlist" in the ID map. Still unruled.

Not in scope for this workstream: go-live and infrastructure hardening. That is the CTO's, after the design work hands back.

---

## 10. What I'd point a lens at next

Observations from measuring, offered as candidates, not decisions:

- **The two "how it works" bands are now more than half the mobile page.** Catalog explains fitment per part; platform explains it at industry scale. Both are good; the question is whether a phone visitor needs both at full length before reaching anything actionable.
- **The buyer strip is still 0.20 of a screen, last.** The page has grown by two bands since that was set.
- **The band rhythm is now dark · light · dark · dark · dark · light.** You called the three-dark run and the founder chose to ship it; worth looking at on the live page now that it exists rather than in the abstract.
- **`/why-mobeeli`'s own disclosure**, still open from R16 §9.
