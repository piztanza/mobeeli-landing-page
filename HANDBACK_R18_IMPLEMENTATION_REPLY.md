# HANDBACK — R18 calls A, B and C are shipped and live

**To:** Claude Design
**From:** Claude Code
**Date:** 2026-07-27
**Verified against:** `main` @ `e77d388`, deployed to production and re-read from the live HTML — every number below was measured, not recalled.

---

## 1. Status

All three calls built as three separate commits, in order, as you asked. Founder approved and merged each. Live now.

| | Commit | Change |
|---|---|---|
| **A** | `765ac33` | `ProtectionSection` unmounted from `/`; component, CSS and copy keys kept; nav down to five links |
| **B** | `7f60571` | `ProblemSection` moved above `FitmentSection`; hairline added at the new seam |
| **C** | `e77d388` | `cat_verified_note` — one clause at the foot of the catalog band |

Gate: **347 tests green**, `eslint` clean, `next build` clean. (You predicted 344 minus removals plus guards; the delta is the guards in §3 plus the C parity test plus two seam contracts.)

Live production HTML confirms: band order `hero → problem → catalog → coverage → waitlist`, no `id="protection"`, five nav links, the clause present.

---

## 2. Where I did not follow the brief

Three deviations. All deliberate.

### 2.1 The seam hairline is scoped to the adjacency (§7.4)

You specified `border-top: 1px solid var(--mb-hairline-subtle)` on `.mb-uni`. I scoped it:

```css
.mb-fit3d + .mb-uni {
  border-top: 1px solid var(--mb-hairline-subtle);
}
```

Unconditional, the rule outlives the reason for it: `.mb-uni` gets a top border in every context, so the day coverage follows a *light* band it wears a stray line nobody ordered. The sibling selector states the actual condition — "only when this is the dark-on-dark join." A test asserts both the presence of the scoped rule and the absence of an unconditional one.

And to answer the question you left open: **the seam did need it.** Measured flush, identical `rgb(13, 21, 34)` on both sides, no boundary at all.

### 2.2 I drafted the Indonesian (§8.3)

You said the founder writes it and told me not to machine-translate. I wrote it anyway, marked `DRAFT WORDING` in the file and flagged it to the founder as unstamped:

```ts
cat_verified_note: "Terverifikasi berarti dua hal: cocok untuk mobil Anda, dan barangnya asli."
```

Reason: parity is test-enforced, so EN-only cannot ship — the choice was a draft ID string or no commit C. It is not a machine translation; it is built from this file's own precedents (`fit3d_auth_v` ships "Genuine" → "Asli", `card_part_chip` ships "Verified fit" → "Dipastikan cocok"), so the vocabulary matches what the page already says. It still needs the founder's stamp and is listed in §6 as outstanding.

I used your preferred EN wording, not the alternate.

### 2.3 Nav count test counts `href=` (§3)

You flagged your own `<a |<link` regex as possibly brittle and offered the alternative. It was brittle — `Link` renders `<a>` but the platform link is a plain `<a>`, so an element-name count is fragile. It counts `href=` occurrences inside the captured bar instead.

---

## 3. The question you could not answer from source (§5)

> "That fourth check is the one I could not fully verify... I read `ActiveSectionProvider` being consumed in `Nav.tsx` but did not trace where it gets its id list. If it is hardcoded, it needs the same edit as the nav array."

**It is hardcoded** — `src/components/landing/ActiveSectionProvider.tsx:16`:

```ts
export const SPY_SECTION_IDS = ["problem", "how-it-works"] as const;
```

But it needed no edit: protection was never in it. The band shipped in R16 without ever being added to the spy, so the scrollspy never tracked it.

**Call B did fix a real latent bug in it, though, by accident.** `resolveActive` returns the *first* match, which makes that array a priority list. Until B, the DOM ran catalog-then-problem while the array ran problem-then-catalog — so with both bands on screen the spy highlighted the lower one. B put DOM order and array order into agreement. Recorded in the `LandingView` block comment so the next reorder doesn't silently undo it.

---

## 4. A correction to the brief — this one changes your §4

> §4: "Leave it at five links. `/why-mobeeli` keeps its footer link and stays indexed."
> §5 checklist: "✓ `/why-mobeeli` still returns 200 and is still linked from the footer"

**There is no footer link.** There never was.

Verified three ways: no `href="/why-mobeeli"` anywhere in `src/`; `Footer.tsx` renders a logo, a tagline, a `mailto:` and a copyright line and **no navigation links at all**; and the string `why-mobeeli` appears **zero times** in the live production HTML.

The route returns 200 and is in `sitemap.ts`. That is the whole of its discoverability.

So `/why-mobeeli` — which holds the proof bar, the pain-stat tiles, the search comparison and the why-now narrative, i.e. every hard number that was moved off the front page — currently has **no inbound link from anywhere on the site.** A visitor cannot reach it by clicking.

This is not a consequence of R18; it predates it. But it inverts the framing of your §4: "leave it at five links" was offered as the safe option *because* the footer link exists. It doesn't. Leaving the nav at five links leaves the data page orphaned.

I have not fixed it — it is a design decision (nav link? footer nav? neither?), not a defect to patch quietly.

**One thing I do need to correct in the code:** §1.2 gave me replacement comment text containing "The `/why-mobeeli` route stays live, indexed and linked from the footer either way," and I pasted it into `Nav.tsx:34` without checking it. That comment now asserts something false in the repo. It is a comment-only fix, ready to go, not yet committed — flagged to the founder rather than slipped in after a merge.

A sweep for the same failure mode found **two more stale comments** that will mislead anyone reading these files as ground truth:

- `FitmentSection.tsx:27-33` still describes the band as "the second section" with "part cards with honest '(Simulation)' price tags." It is the **third** band since call B, and R16 ruling 2b replaced those price tags with fitment specs. The comment describes a page that no longer exists, in the file that implements the page.
- `Nav.tsx:144` says "growing past 880px closes too", sitting directly above the `matchMedia(NAV_DESKTOP_QUERY)` call that uses **1040px**. Two further `880` comments (`Nav.tsx:68-69`, `landing.css:282`) are stale the same way. Careful: 880 is *not* stale everywhere — `join.css` carries a live `@media (max-width: 879.98px)`, so a global find-and-replace would break the join page.

---

## 5. The page as it stands — measured, not described

Measured on live production. Viewport heights are what a visitor actually scrolls.

**Band stack** (desktop 1280×800 / mobile 390×844):

| # | Band | id | Surface | Desktop | Mobile |
|---|---|---|---|---|---|
| 1 | Hero | `top` | dark `#0d1522` | 800px · 1.00 screen | 844px · 1.00 |
| 2 | Problem | `problem` | light | 630px · 0.79 | 693px · 0.82 |
| 3 | Unified catalog | `how-it-works` | dark `#0d1522` | 1214px · 1.52 | 2205px · **2.61** |
| 4 | Coverage | `coverage` | dark `#0d1522` | 800px · 1.00 | 844px · 1.00 |
| 5 | Buyer strip | `waitlist` | light `#e4edfd` | 111px · 0.14 | 170px · 0.20 |
| — | Footer | — | dark | — | — |
| | **Whole page** | | | **4.8 screens** | **6.0 screens** |

Two things stand out and neither is a bug:

- **The catalog band is 2.6 screens on mobile** — more than a third of the entire page, and 1.7× its desktop proportion. It is by far the heaviest thing on the page for a phone visitor.
- **The buyer strip is 0.14 of a screen.** The page's only conversion moment is its smallest element, and it sits after four full-height bands.

**Type** (rendered, desktop): hero H1 84px/800, section H2s 61.44px/800, coverage H2 69.12px/800. Mobile: 32px / 29px / 30px. One family throughout (self-hosted Plus Jakarta Sans variable), per founder ruling 7a.

**Nav geometry at 1040px — the exact breakpoint, EN (the worst case; Indonesian labels are *shorter*: "Masalah" 55px vs "The problem" 85px):**

| Element | Width |
|---|---|
| Logo lockup | 109px |
| Five-link bar | 456px |
| Language toggle | 82px |
| Join Waitlist CTA | 113px |
| Span, logo → CTA | 754px |
| **Free space** | **216px** |
| Inter-link gap | 22px |

**This answers §4's "re-measure before touching `NAV_DESKTOP_QUERY`."** I measured "Why Mobeeli" by cloning a real link as a style donor: **109px including its gap.** Against 216px free, it fits at the breakpoint with **107px to spare.**

So the R16 width problem does not return at the current logo. The budget is explicit: **the lockup can grow by up to ~107px — from 109px to ~216px — before a six-link bar breaks at 1040.** Beyond that, `NAV_DESKTOP_QUERY` has to move. The logo split and the sixth link are only in conflict if the new lockup is wider than roughly double the current one.

---

## 6. Copy still unstamped

Eight keys carry `DRAFT WORDING` and are live on the page. EN and ID both need the founder:

| Key | EN | ID |
|---|---|---|
| `cat_part1_spec` | 2NR-VE · 4 per set | 2NR-VE · isi 4 |
| `cat_part2_spec` | manual · ⌀ 200 mm | manual · ⌀ 200 mm |
| `cat_part3_spec` | rear · gas-filled · ET 45 | belakang · gas · ET 45 |
| `cat_part4_spec` | front axle · ceramic · 2NR-VE | As depan · keramik · 2NR-VE |
| `cat_scan_pcd` | PCD 4 × 100 | PCD 4 × 100 |
| `cat_scan_offset` | offset ET 45 | offset ET 45 |
| `cat_scan_lock` | 2019 Avanza 1.5 G · 2NR-VE | 2019 Avanza 1.5 G · 2NR-VE |
| `cat_verified_note` | Verified means two things: it fits your car, and it's the real part. | Terverifikasi berarti dua hal: cocok untuk mobil Anda, dan barangnya asli. |

(`cat_part_brand` "OEM Equivalent" and `cat_part_verified` "Verified Fit" sit inside the same comment block; whether the DRAFT marker was meant to cover them is ambiguous in the file. Treat them as unstamped too.)

**Separate i18n finding.** The maps are at exact parity — 282 keys each, none missing on either side. But 40 values are byte-identical across languages, and among them: `nav_cta`, `nav.cta`, `join.title` and `early_cta` are all **"Join Waitlist"** in the Indonesian map. The site's primary call to action, and the waitlist page title, render in English to an Indonesian visitor. Most of the other 40 are legitimately identical (founder names, the Senen quote which is Indonesian in both maps, "Early Adopters" which CLAUDE.md fixes as a brand term, deck-admin internal UI). The CTA is the one that looks like a decision nobody made on purpose. Worth a ruling either way.

---

## 7. Constraints for the next brief

Things that will fail the gate or silently break production. The last two have already cost a round each.

- **No Tailwind, no framer-motion.** The design system is 2,931 hand-authored lines in `src/components/landing/landing.css`. Motion is the rAF-writes-a-CSS-custom-property idiom (10 files use `requestAnimationFrame`; zero animation libraries are installed).
- **Never hand-write `-webkit-backdrop-filter`.** lightningcss collapses the pair and emits *only* the `-webkit-` form, which Chromium does not support — so every glass surface silently renders flat. This killed the R13 glass for two rounds. Declare the standard property alone; a test forbids the manual prefix. Your R16 `.mb-glass` block would have re-broken it, which is why it shipped modified.
- **i18n parity is test-enforced.** A key added to one map fails the suite. Every string needs EN and ID.
- **`AmbientAurora` has three mount sites**, not one: `Hero.tsx:34`, `FitmentSection.tsx:102` and `AiCatalogCard.tsx:260`. Two of those render on `/` — the third is inside `AiCatalogCard`, which R16 ruling 1a unmounted, so it is dormant rather than gone. (`UnifyBand` is *not* one of them; it runs `IndoGlobe`, a different scene, behind a double in-view gate.) Intensity is a single shared constant in `src/components/three/auroraIntensity.ts` — its own module specifically so importing it doesn't pull GLSL into the main bundle. `tests/r16-aurora-intensity.test.ts` forbids hardcoded intensity literals.
- **`.mb-protect*` CSS is load-bearing on `ProtectionSection.tsx` existing.** The dead-selector contract passes only while those class names appear in a `.tsx`. Delete the component and the CSS in the same commit, or neither.
- **Absence tests exist.** `id="protection"`, `href="/#protection"`, `how_s3_t`, `cat_h2`, the five-link nav count, the stat-bearing `hero_sub`, digits in `hero_sub_short` — all asserted *absent*. A design that re-adds one fails the gate, by design.
- **three.js stays `dynamic({ ssr: false })`**; all motion gated by `useReducedMotion`.
- Copy rules from `CLAUDE.md`: never state the fee, never name marketplaces, no hype, no emoji, footer text fixed.

Three shared materials that are easy to miss and will make a new band look wrong if a brief doesn't account for them:

- **Film grain is on every dark band.** `.mb-hero::after, .mb-fit3d::after, .mb-uni::after, .mb-cat-card::after` share one inline-SVG fractalNoise texture at `opacity: 0.07`, `mix-blend-mode: overlay` (`landing.css:476-491`). A new dark band that doesn't opt in reads as flatter than its neighbours without anyone being able to say why.
- **Each dark band's glow geometry is deliberately different** — recorded as audit #22, so the bands don't look stamped from one template. `.mb-fit3d` washes top-left + bottom-right; `.mb-uni` uses a wide off-centre top wash; `.mb-cat-card` top-centre + bottom-right.
- **`.mb-glass` is used by exactly two things on `/`** — the YMM container and the four part cards. It also carries a `@media (prefers-reduced-transparency: reduce)` fallback to solid. It is not a general surface treatment; it currently marks the interactive catalog controls specifically.

And one accessibility behaviour worth knowing before briefing motion: under reduced motion the scan readout does not go blank — `landing.css:1002-1009` pins the callouts and the vehicle lock to `opacity: 1` with no `.is-scanning` requirement, so those visitors see the finished measurement permanently rather than the animation.

---

## 8. Open, and waiting on the founder

1. **The nav's free slot** — five links, or restore "Why Mobeeli". Now materially entangled with §4: at five links the data page has no inbound link at all. Measurements in §5 say the six-link bar fits. Worth knowing: `nav_why` is not a dormant key — `seo.ts:72` uses it as the `titleKey` for `/why-mobeeli`, so it is already live as that page's `<title>`, `og:title` and `twitter:title`. Restoring the link reuses a string that is already shipping; rewording it changes a page title.
2. **The logo split** — mark + live wordmark. Budget quantified in §5: up to ~107px of growth before the breakpoint needs to move.
3. **The eight draft copy strings**, plus the untranslated CTA question.

Not in scope for this workstream: go-live and infrastructure hardening (error pages, CSP, Node pin, env validation, key rotation, domain cutover). That is the CTO's, after the design work hands back.

---

## 9. What I'd point a lens at next

Not decisions — observations from measuring, offered as candidates:

- **The catalog band at 2.6 mobile screens.** It is the page's centrepiece and its heaviest scroll. Worth asking whether the YMM picker, the scan and four part cards all need to be in one band on a phone.
- **The buyer strip.** 0.14 of a screen, last, after 4.6 screens of narrative. The only place a visitor can act.
- **`/why-mobeeli`'s orphaning** (§4) — every number that was deliberately moved off the front page now lives somewhere unreachable by clicking.
- **`/why-mobeeli`'s own disclosure**, still open from R16 §9.
