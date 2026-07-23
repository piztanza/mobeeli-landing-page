# HANDOFF_GEMINI_PLATFORM_MINING.md — multi-agent commission: mine /platform for landing-page gold

Written 2026-07-23 | Branch `feat/phase1-a11y` (landing @ founder round 2: Adopters rename,
platform links live, catalog demo back on `/`, full-viewport archipelago, larger type).
Read `CLAUDE.md` + `HANDBACK_LANDING_VISUAL_POLISH_REPLY.md` first — all contracts and the
one-hypothesis-per-iteration protocol stay in force. Founder goal: **make the landing page
amazing and attention-grabbing** for investors and partners.

## 0) Source analysis (already done — build on it, don't redo it)

Fable's deep analysis of `overtakemg-cell/mobilee` `/platform`
(https://mobilee-demo.vercel.app/platform): a B2B partner-acquisition page — hardcoded
mockups, framer-motion 12, Tailwind v4 arbitrary values, R3F canvas; palette is
emerald(#34d399/#10b981) + indigo(#818cf8) on near-black (#030508/#0a0d16) — **zero overlap
with the landing's blue tokens**, so everything borrowed must be recolored to
`--mb-primary #2f7df6 / --mb-deep-blue #1b5fd9 / --mb-light-accent #5b9bf7 / --mb-ink #0d1522`.

**Ranked borrowables** (file paths in the mobilee repo, `src/app/platform/components/`):

| Rank | Element | Source file | Port cost | Landing destination idea |
|---|---|---|---|---|
| 1 | Search-funnel narrowing simulator ("Brake Pads 14,002 → +Toyota 3,012 → +Avanza G 2018 = 4 · EXACT FIT") | `InteractiveAppMockup.tsx` (CatalogMockup) | Low | HowItWorks step-2 card — the single best "why YMM matters" show-don't-tell |
| 2 | HeroBackground SVG network — animated packets on bezier paths, glass nodes | `HeroBackground.tsx` | Low | /why-mobeeli header or hero accent layer (must not fight the Jakarta video) |
| 3 | AnalogDeathSpiral problem cards — margin-cascade graph, glitch scanner, capital bar | `AnalogDeathSpiral.tsx` | Low | /why-mobeeli, above the pain tiles (already EN+ID via lang prop) |
| 4 | GarageOSScanner — CSS phone with sweeping laser + "Verified Authentic" | `GarageOSScanner.tsx` | Low | HowItWorks step-3 (protection) or catalog band accent |
| 5 | InteractiveAppMockup — full 3D-parallax tabbed dashboard | `InteractiveAppMockup.tsx` (595 lines, self-contained) | Medium | A new "the product" band on `/` — biggest wow, biggest weight; needs framer-motion dep decision |
| 6 | EcosystemMarquee — dual-track logo ticker | `EcosystemMarquee.tsx` | Trivial | ONLY with founder-approved partner names — the platform's ticker names real brands (TOYOTA, DENSO, BOSCH…) we may not claim on marketing surfaces. Founder stamp required per name. |

**Constraints on mining:** the landing has NO framer-motion or Tailwind — ports must become
plain CSS/React (or the dep addition must be its own approved iteration). All strings →
`copy.ts` EN+ID. The founder's broad-front-page rule still applies to `/`: the funnel
simulator's counts are fine as *illustrative UI numbers inside a mockup*, but do NOT mirror
the platform's moat copy (7,000+ OE specs / 19,000+ applications / Buy Box ranking / AI
ingestor internals) into landing copy.

## 1) The commission — run a multi-agent swarm, then iterate

**Phase A (swarm analysis):** fan out agents over (a) the six borrowables above in the
mobilee repo, (b) the current landing bands, (c) 3-5 investor-grade reference sites
(Linear, Mercury, Stripe, Vercel, aruna.id). Each agent proposes concrete band-level
adaptations (what, where, recolored how, perf cost, i18n keys needed). Synthesize into a
ranked hypothesis list with effort/impact scores. Deliver as
`HANDBACK_GEMINI_PLATFORM_MINING_ANALYSIS.md` for Fable's audit BEFORE implementing.

**Phase B (execution loop):** one approved hypothesis per iteration, full gate
(`npm test` → `lint` → `build`), Fable audits, founder vetoes on the preview. Already
greenlit from round 1: Hypothesis C (magnetic CTA hover). Priority seed for the list:
borrowable #1 (funnel simulator into step-2) — Fable pre-approves the concept pending
implementation review.

## 2) Stock photography (founder-approved direction, 2026-07-23)

Approved styles (all people-free → free-library safe): **hands + parts detail shots**,
**Jakarta street/city texture**, **clean studio part shots**. NOT approved: people shots
from free libraries (no model releases); a real Senen shopkeeper photo remains a
founder-supplied asset ask.

Curated search queries (Unsplash/Pexels, no attribution required, verify each image's page
for editorial-only flags before use):
- hands: "mechanic hands brake disc", "car parts workbench", "socket wrench close up"
- Jakarta: "jakarta street traffic night", "jakarta motorcycle street", "indonesia city aerial dusk"
- studio: "brake caliper white background", "car spare parts flat lay", "alloy wheel studio"

Rules: web-encode ≤200KB (next/image, explicit sizes, lazy); tone-grade toward the blue/ink
palette (subtle blue duotone keeps cohesion and hides mixed sources); every placement is
its own iteration with founder veto; images never replace the 3D scenes — they support the
Problem band, /why-mobeeli, and /early-adopters cards. **Downloading assets needs the
founder's go-ahead per batch** — list exact URLs in the handback first.

## 3) Platform-repo work queue (Fable owns this — do NOT touch overtakemg-cell/mobilee)

For visibility only; Fable executes next: recolor `/platform` emerald/indigo → landing blue
family; add the founder's **0% commission** mention; **auth-wall `/platform/analytics`**
(currently PUBLIC and leaking funnel/signup telemetry); remove the "Carteria" brand leak
(`merchant.carteria.id/orders/INV-9018A` mock URL + comment in `platform/page.tsx`); verify
`NEXT_PUBLIC_FOUNDER_WHATSAPP` on the Vercel deploy (fallback is a dummy number).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
