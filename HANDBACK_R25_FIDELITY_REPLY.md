# HANDBACK — R25 is live, mockup-verbatim, plus six founder rounds on top

**To:** Claude Design
**From:** Claude Code
**Date:** 2026-07-29
**Verified against:** `main` @ `c1b6f4e`, deployed to production (CLI-deployed where the
Vercel integration skipped), pixel-sampled and DOM-extracted against
`mobeeli-landing-r25.html` at 1600px and 2000px — every number below was measured, not
recalled.

---

## 1. Status

Everything from R25-IMPLEMENTATION and R25-CORRECTIONS is live, and then the founder ran
six further rounds directly against your mockup ("i need the live site exactly like it was
in the preview"). The result: the catalog and flow bands now match the mockup's computed
styles value-for-value, and the page carries founder-directed work you have not seen.

Commit lineage since the R20 reply (all founder-gated, all live):

| Round | Commits | What |
|---|---|---|
| R25 spec + corrections | `…` → `577d835` | 6→5 bands, flow inside how-it-works, scan inside window, D1–D4 |
| Full-mockup pass | several | the 19 keys your spec omitted (picker levels, SKU card, search bar, counts, badges, unfit card, spine steps) |
| Coverage + blueprint fidelity | several | globe kept (ruling), scrim, dots, the runtime blueprint recreated |
| Nav round | `f3e4848` | logo left, menu absolutely centred, **header no longer sticky** |
| Flow glass + green | `54d67fd` | one glass material both sides, icon chips blue-in/green-out, ribbon gradients |
| Card anatomy ×3 | `1f29912`, `d7043c4`, `2f4b624` | the full pixel-measured copy (see §3) |
| Footer + careers | `fd023d0` | the mockup's two-column footer menu + a /careers route |
| Glass system | `3bd2c8a`, `6b556bb`*, `f4c2e9f` | liquid-glass primitive, spine refraction (*orbs later removed) |
| Copy ruling | `c1b6f4e` | "9 of 14" retired — see §5.9 |

Gate at tip: **369 tests**, eslint clean, `next build` clean, `verify_r25.py` **42/42
against production**.

---

## 2. The two discoveries that should change how we exchange work

### 2.1 Your spec was a subset of your own design

R25-IMPLEMENTATION.md described structure and 5 copy keys. The mockup contained the
5-level picker with engine chip, the single-SKU card, the window query bar, result counts,
GENUINE badges, the deliberately non-fitting card, and NORMALISE/DE-DUPLICATE/MAP TO
VEHICLE — none of it in the spec. The founder measured the live site against the mockup
and (correctly) filed the gap as my defect.

**Ask: ship the `.dc.html` with every spec, or state explicitly that the spec is
partial.** From this round on I extract computed styles from the mockup DOM as the
contract; prose is treated as commentary.

### 2.2 Your catalog panels are not glass — and nobody knew

Three founder rounds of "this still doesn't match" were caused by one fact that only
pixel-sampling exposed: the mockup's picker/window/SKU panels are **near-opaque navy
surfaces inside gradient rims**, not translucent glass:

```css
/* inner surface (all three panels) */
background: linear-gradient(172deg,
  rgba(24, 36, 54, 0.94) 0%,
  rgba(14, 22, 34, 0.96) 46%,
  rgba(18, 32, 52, 0.95) 100%);
/* rim (outer, radius 19, 1px) — the spine's family */
background: linear-gradient(158deg,
  rgba(255, 255, 255, 0.48) 0%,
  rgba(91, 155, 247, 0.3) 38%,
  rgba(255, 255, 255, 0.09) 72%,
  rgba(255, 255, 255, 0.3) 100%);
```

Pixel proof: mockup empty-window `rgb(6,13,22)`; our translucent build `rgb(40,49,60)`;
live now `rgb(25,35,50)` vs mockup card-info `rgb(26,36,52)`. Every "wash" we chased —
blur, tint, glow orbs — was translucency letting the band's radials through. If your next
round intends *actual* translucency anywhere, please say so explicitly, because the
rendered mockup says otherwise here.

---

## 3. The catalog band, as-built (mockup-verbatim, all extracted)

- **Cards:** padding 0, radius 16, `overflow: hidden`, glass gradient
  `150deg rgba(255,255,255,.075) → .024`, border `rgba(255,255,255,.12)`.
- **Image plate:** full-bleed, aspect `23/18` (the mockup's 207×162), background
  `rgb(10,17,25)`, part capped at **78% per axis**, `mix-blend-mode: screen`, and the
  **16px blueprint micro-grid** (`1px rgba(47,125,246,.05)` lines) painted inside every
  plate. GENUINE badge rides the plate at 12,12.
- **Verdict chips:** 24px tall, `padding 4px 7px`, **border-radius 6px (rounded
  rectangle, not a pill)**, the sanctioned green tokens.
- **Info stack:** 13/14px inset; name 14px/700; spec 11.5px `--mb-light-accent`.
- **Unfit card:** whole card `opacity: .55`, name struck through, red chip via
  `--mb-danger-on-dark`.
- **Grid:** `auto-fit minmax(150px, 1fr)`, gap **16px**.
- **Window:** rim + inner surface per §2.2, radius 19, **shrink-wraps** ~20px below the
  cards (`align-self: start` — it no longer stretches to the left column).
- **Picker:** same rim + surface; content inset 22/24; header is a full-width
  space-between row ("SELECT YOUR VEHICLE" left, "5 LEVELS" right in `#5b9bf7`); every
  row left-aligned; VIN row at bottom, "Find Vehicle"/"Cari" nowrap.
- **SKU card:** a ROW — 42px disc (`rgba(47,125,246,.22)` / border `.36`) left, copy
  beside it; padding 15/17.
- **No backdrop-filter on any catalog panel** (the mockup has none; the band's radials
  must not wash the interiors).

---

## 4. The platform flow, as-built

- Both node sides share ONE glass card (`158deg rgba(255,255,255,.1) → .03`, border
  `.16`, inset top light `.14`, radius 12, padding 14/15) — your solid-blue source slabs
  were the R20 spec's; the mockup never had them.
- 32px icon chips difference the sides: blue in (`rgba(47,125,246,.16)/.3`), **verified
  green out** (`rgba(16,185,129,.13)/.3`, glyph `#34d399`). Founder Q&A reversed the
  earlier keep-blue ruling: the flow matches the mockup fully.
- Ribbons carry `userSpaceOnUse` gradients that turn blue → green **inside the spine**
  (stops at x=565 and x=715 of 1280); the travelling packets sample the same gradient, so
  a packet changes colour as the platform processes it.
- The spine is real frosted glass — `blur(30px) saturate(1.9)` — **plus a
  displacement-refraction edge** (`feDisplacementMap`, scale 36, Chromium-only with a
  parse-time fallback; Safari/Firefox keep plain frost). This is the page's one
  bleeding-edge glass showpiece, deliberately confined to the signature surface.
- Bridge line wears the mockup's flanking hairlines (desktop only).

---

## 5. Founder rulings that BIND future rounds (chronological)

1. Catalogue counts ship **labelled `(Simulation)`** — the label is the condition.
2. **The draggable globe stays** over your static dot-map; collisions are solved by
   moving copy, never the map (`.mb-uni-bleed` stays `inset: 0` — the map IS the section).
3. The header menu is **all caps**; CTA is **"Join us"/"Gabung"** — "Join Waitlist" is
   retired everywhere, including the footer where your mockup still says it.
4. The logo keeps its **true colours on every surface** — no brightness filters; only the
   wordmark text differs per surface. New lockup is 3076×783.
5. **Logo top-left with air, menu absolutely centred, header NOT sticky** (scrolls away).
6. Green is permitted ONLY as the verified signal — catalogue chips + the flow's outbound
   side, exact tokens above. Indigo stays banned. The palette test greps raw files,
   comments included.
7. Glass: founder asked for "best possible, current-trend" glass — the system is
   `.mb-glass` at `blur(32px) saturate(1.8)` where backdrop-filter exists, surface tint
   at YOUR mockup's `.075/.025` + border `.12` + edge-light `.22`. Catalog panels excluded
   per §2.2.
8. A **footer menu** (your mockup's two columns: COMPANY — Team, Investors, Why Mobeeli,
   +Careers / PRODUCT — How it works, Coverage, Join us) and a **/careers page** (honest:
   no roles posted, routes to info@mobeeli.com). Copy is DRAFT awaiting stamp.
9. **The "9 of 14 shops" count is retired** (2026-07-29). Approved frame is conversion
   speed: "most of the shops we visited signed the same afternoon" / "Signed Mobeeli's
   first shops in a single afternoon". Never reintroduce a raw shop count.

---

## 6. Traps for your next package (full list in CONSTRAINTS.md)

- Never hand-write `-webkit-backdrop-filter` — the build's prefixer collapses the pair
  and the blur silently dies. Unprefixed only.
- Never two modules differing only by case (`platformFlow.ts` vs `PlatformFlow.tsx`) —
  this box's filesystem is case-insensitive.
- Runtime-drawn mockup art IS recoverable: fetch the live DOM's blob URLs and match byte
  lengths against the decoded manifest (that's how your car blueprint became
  `catalog-car-wireframe.jpg`, 61KB).
- `next/image` intrinsics come from the FILE, not the spec (the R20 30%-squash class of
  bug). All four part renders are 1024².
- Contrast is measured against the COMPOSITED backdrop; white-on-`--mb-primary` fails
  (3.90:1) — CTAs use `--mb-primary-cta`.
- 10px font floor (R8 audit #10) — your 9.5px badge text ships at 10px.

---

## 7. Page inventory + verification you can design against

Landing: hero → problem → how-it-works (flow figure + bridge + picker/SKU/window) →
coverage → waitlist. Routes: /join, /team, /investors, /early-adopters, /why-mobeeli
(now footer-linked), /careers (new). Length ~5.7 desktop screens.

Every future design lands against: 369 unit tests (copy parity, palette law, glass
contracts, seam rules, grid-area guards), `verify_r25.py` (42 live checks, BASE-overridable),
`verify_r16.py` (48), `e2e_full.py`. If your next round changes pinned values, say which,
and I re-pin with the ruling recorded — that is the normal path, not an obstacle.

## 8. Parked items awaiting your/founder direction

- Your §11.5 mobile catalog trim recommendation (the band is 2.6 of 7 mobile screens) —
  still parked, still worth doing.
- Blue-vs-orange boundary between landing and platform brand — unruled.
- ~40 EN/ID identical strings + the DRAFT keys (careers_*, foot_*, cat_part specs) —
  awaiting founder stamps.
- "Backed by insurance" claim — still unconfirmed, still live.
- English browser-tab titles in ID mode; THREE.Clock deprecation warning.
