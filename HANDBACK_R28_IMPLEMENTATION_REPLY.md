# HANDBACK — R28 is live, then the founder rebuilt its centrepiece twice

**To:** Claude Design
**From:** Claude Code
**Date:** 2026-07-29
**Re:** your `handoff_r28_problem_section` bundle + `R25-FIDELITY-REPLY.md`
**Verified against:** `main` @ `5eda67c`, deployed to production; every number below
measured on the built page or extracted from files, not recalled.

---

## 1. Status — what shipped since your package arrived (all founder-gated, all live)

| Commit | What |
|---|---|
| `e11054b` | **R28 built hi-fi** from your reference render: ghost 217, evidence card on the 22px dot grid, quote card, stat chip. Your QA checklist passed numerically: overlap 107px (~one track) at 1440, chip overhang exactly 20px, mid-width clearance 101px, mobile overlap exactly 46px, ghost+chip hidden ≤979, no sideways scroll. All three of your "real bug" gotchas are honoured AND pinned by a rewritten contract test (grid-track sharing, chip-as-sibling, mobile border-box) so nobody can "simplify" them away. |
| `54ebd60` | **Founder replaced your exploded-car render** (see §3.1). |
| `f2ab8e0` | **Founder retired the Senen testimony from the callout** (see §3.2). This is the big one for your next round. |
| `5eda67c` | **Founder grew the teardown a track** (see §3.3). |

Gate at tip: **373 tests**, eslint clean, `next build` clean, `verify_r25` 42/42 and
`verify_r16` 48/48 **against production**.

Also from your fidelity reply, actioned:
- **Spine halo check (your §1 caveat):** performed at 1600px against the screen-blended
  blueprint layer. **No halo.** Your artifact does not reproduce in our build — the
  founder-ruled frost + refraction stand unchanged.
- **Precedence adopted** exactly as you framed it: founder ruling → mockup → prose.
- **Plate aspect:** the founder approved the rendered 23/18 twice, so per precedence the
  ruling wins — **keep 23/18, please update your mockup's authored `3/2`.**

## 2. Not yet built from your package — queued, not forgotten

- **The 9-item catalog reconciliation sweep** (badge 9px, grid minmax 184, picker padding
  20, sku-disc 40 + its own `158deg rgba(30,44,66,.92)` surface, panel edge-light `.4`,
  edgelight bleed layers, window-bar 13/17, window-body 18/18/22, the result sweep) and
  **adoption of `R25-STYLE-CONTRACT.json` under `design/` with the contract test**. The
  founder has been directing the problem band; this sweep is next when they say go.
- **Panel grain (feTurbulence 2.4 / .15 overlay):** still to be evaluated in CSS where —
  unlike your prototyping runtime — the SVG attributes survive. Your caveat is noted.
- **Mobile catalog trim:** the founder ruled **"pause this"** — do not design it yet.
- **Insurance claim:** put to the founder; the ruling is still pending (the question got
  displaced by a folder mix-up). It remains live and remains on the honesty list.

## 3. The founder's three rounds on YOUR problem section — update your mockup to match

The R28 composition (depth planes, grid-track sharing) survived all three rounds intact.
The content and proportions did not:

### 3.1 The image is no longer your `exploded-car.png`

The founder supplied a **landscape full-teardown render** (their own generation, source
2816×1536). Shipped as `public/assets/exploded-car.jpg`, 2000×1091, 281KB, white ground
flattened. Consequences, all measured:

- The image card tightened `clamp(430,42vw,540)` → then re-grew with §3.3 to
  **`clamp(380px, 40vw, 520px)`** — sized so the contained 1.833:1 image nearly fills it
  instead of floating in dead plate.
- **`mix-blend-mode: multiply` on the img** melts the render's white ground into the
  plate so your 22px dot grid reads THROUGH the image — the light-surface analogue of the
  catalog plates' screen blend. Use this trick in your own comps.
- Mobile: card aspect follows the image (`2000/1091`); with the much shorter landscape
  card the founder-approved quote overlap is **-28px, not your -46px** (46 covered ~25%
  of the image).

### 3.2 The callout is no longer a quotation — at all

Founder, verbatim: *"this call out needs to say something else, deep analyze and deep
reason to see what would be best to replace this with."* The analysis that drove the
replacement, so your future comps aim at the same target:

- The testimony was **seller-grievance inside a buyer-pain band** (headline, lede, image
  and chip all argue buyer fitment confusion; the quote pivoted to a shop being punished).
- *"The platform penalized me"* is **adversarial toward unnamed incumbents**, and a
  shop-closure story is the wrong emotional register for an investor-facing page.
- It was an **extreme anecdote a reader cannot verify** — the same credibility class as
  the flagged insurance claim. And testimony cannot be softened without falsifying it, so
  the content had to change, not the wording.
- The one thing worth keeping was the **COD reality** — the local mechanism that makes
  fitment existential in Indonesia and that no foreign competitor's page can say.

The card now (Mobeeli voice, DRAFT pending stamp):

```
2×                                ← the 44px mark slot; a quote mark would be
                                    dishonest typography on a non-quote
A wrong part ships twice: out to the buyer, and back — unpaid.
In a cash-on-delivery market, a part that doesn't fit is refused at the
door. The shop pays the shipping both ways, and the car is still up on
the lift.
INDONESIA'S PARTS TRADE RUNS ON COD   ← the attribution slot, now a tag
```

Semantics followed: `<figure>/<blockquote>` → `<aside>/<p>`; the support line lost the
italic (it signified "translation of the quote"); normal i18n applies again (EN ≠ ID,
pinned by test). `quote_main/quote_en/quote_by` stay **defined, dormant** — prot_r*
precedent — so a future testimony slot is a mount, not a translation round.

**Standing implication for your designs:** quote/testimony cards on this page need
either verifiable, register-appropriate testimony, or they should be mechanism cards.
The founder has now rejected borrowed-credibility content twice ("9 of 14", Senen).

### 3.3 The teardown grew a track — your one-track-overlap QA is superseded

Founder: image span **`grid-column: 1/10`** (9 of 12 tracks); quote stays 8/13; so the
shared-track overlap is now **TWO tracks (~213px at 1440)** — the callout sits ON the
teardown. Card measured 960×520 at 1440. Chip overhang still 20px; quote still
vertically centred; the engineering principle (row sizes to tallest child, planes cannot
collide) still holds and is still pinned. Your QA line "overlap ≈ one grid track" should
read "two" in the next mockup revision.

## 4. Copy ledger (all DRAFT pending founder stamp unless noted)

- New this round: `prob_lede`, `prob_link`, `prob_badge`, `prob_chip_n/of/cap`,
  `prob_img_alt` (R28) · `prob_call_h/p/tag` (the callout) — EN+ID.
- Dormant: `quote_main/en/by` (testimony), `cat_window_title`, `prob_t*` tiles
  (on /why-mobeeli), `plat_kicker/h2/p`, prot_r*, `how_kicker`.
- STAMPED by ruling: "Join us"/"Gabung"; the conversion-speed traction frame ("most of
  the shops we visited signed the same afternoon") — never reintroduce a raw shop count.

## 5. Asset + register state

- `public/assets/exploded-car.jpg` (2000×1091) replaced your `exploded-car.png` —
  retire it from the bundle or mark it superseded.
- Your `R25-STYLE-CONTRACT.json` will enter the repo under `design/` with the
  reconciliation sweep (§2) — re-generate it for the problem band's new values when you
  update the mockup, and keep annotating hooks; the 23 you added are exactly what makes
  contract-first rounds possible.
- The full register lives in the repo root (`HANDBACK_*`, `HANDOFF_*`); this file is
  `HANDBACK_R28_IMPLEMENTATION_REPLY.md`.

## 6. What the next design round starts from

Landing bands, live: **hero → problem (R28, as amended §3) → how-it-works (R25
catalog+flow, opaque panels + rims, verified-green outbound, spine refraction) →
coverage (draggable globe, full-bleed) → waitlist → footer (two-column menu +
Careers)**. Routes: /join, /team, /investors, /early-adopters, /why-mobeeli, /careers.

Open design questions on the board, in the founder's queue: the blue-vs-orange platform
boundary (your call that it is the largest inconsistency stands), the EN/ID stamping
pass, the insurance ruling, your parked mobile catalog trim.

Protocol, confirmed working this round: your `.dc.html` + generated contract, my
extraction + measured QA, founder ruling → mockup → prose. The R28 build went from
bundle to production in one pass with zero fidelity rounds — that is the template.
