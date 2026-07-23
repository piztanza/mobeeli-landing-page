# HANDOFF_GEMINI_IMMERSIVE_R5.md — swarm commission: whole-page immersion on top of R4

Written 2026-07-23 (late) | Branch `feat/immersive-r4` (pushed; preview per commit).
Read first: `CLAUDE.md`, `HANDOFF_GEMINI_TASTE_SWEEP.md` (the 18-proposal book — still the
recipe source), `HANDBACK_LANDING_VISUAL_POLISH_REPLY.md` (audit ledger: recurring-rule
violations are now test-enforced). All contracts hold. One iteration per handback; Fable audits.

## 1) R4 state (what just changed — study before touching)

- **Fitment band `#fitment`** — NEW: the 3D wheel left the hero for its own dark stage
  (`FitmentSection.tsx`, `.mb-fit3d*`); part/fit/video cards dock in a wrapping flex row
  (glow-fill carried over). The absolute card overlay is gone at every viewport and tests
  forbid its return.
- **Hero is type-focused and centered** over the Jakarta aerial (Linear-form).
- **Archipelago is full-bleed**: `.mb-uni-bleed` fills the band, bottom dissolve mask,
  pointer-inert copy overlay with scrim. The framed 1060px map is history.
- **Font system**: Inter (next/font, build self-hosted) for text/UI; Plus Jakarta Sans stays
  display. Vitest stubs next/font (`tests/stubs/next-font-google.ts`).
- Band order: hero → fitment → problem → archipelago → how-it-works → catalog → buyer.
- Platform repo branch `feat/mobeeli-brand-security` now ALSO carries the full
  emerald→indigo→blue recolor (28 files) — unmerged; merging = demo deploy (founder/CTO).

## 2) The swarm mission (founder directive: relentless immersive-design loop)

Run a multi-agent research + synthesis pass with fresh eyes on the WHOLE page as one
composition, not bands in isolation. Lenses to fan out: (a) scroll choreography end-to-end —
does the dark→dark hero→fitment opening read as one act? where does pacing sag?; (b) the
best immersive product sites of 2026 (fetch live: linear, vercel, raycast, resend, stripe,
apple product pages, awwwards SOTD winners) — extract what makes them feel *inevitable*,
not decorated; (c) transitions BETWEEN bands (seams, dissolves, color hand-offs — we have
one dissolve now; a seam language should be systemic); (d) the fitment band's presentation —
the wheel now has a stage; propose the lighting/framing/caption treatment that makes it the
"they really built this" moment; (e) mobile immersion (the whole story at 390px). Synthesize
into ranked hypotheses with recipes, THEN handback for audit before implementing.

## 3) Founder-authorized platform ports (execute after the analysis handback)

The founder has authorized taking platform visuals into the landing. Priority queue:
1. **HeroBackground SVG bezier network** → `/why-mobeeli` header (recipe in TASTE_SWEEP #2;
   recolor to blue during port; the platform source is already blue post-recolor).
2. **AnalogDeathSpiral problem cards** → `/why-mobeeli` above the pain tiles (EN+ID via
   its lang prop pattern → our copy.ts keys).
3. **GarageOSScanner laser sweep** → how-it-works step-3 card.
4. CatalogGridMockup ideas (the platform's product-card grid with photo backgrounds) —
   analysis only for now: real part photos need founder-approved assets.
Constraints per port: no framer-motion (rebuild as CSS/React), strings to copy.ts EN+ID,
brand text = Mobeeli, no moat numbers on `/`.

## 4) OUTSTANDING-ASKS LEDGER (deep audit of every founder request — the honest list)

| # | Ask | State | Blocked on |
|---|---|---|---|
| 1 | Stock photos (hands/Jakarta/studio styles approved) | NOT yet sourced/placed | Founder must approve a download batch — swarm: produce the exact-URL shortlist per slot |
| 2 | Platform branch merge (rename+0%+recolor+**analytics leak fix**) | Pushed, UNMERGED — the leak is still live on the demo | Founder/CTO merges `feat/mobeeli-brand-security` → main (deploys demo) |
| 3 | G1 simulator personas + real counts | gated | Founder confirms vehicles/parts/counts map to real catalog rows |
| 4 | G2 Indonesian-primary signage lockup | gated | Founder brand call |
| 5 | G3 residue: Sabang/Merauke pulse markers + corridor arcs (full-bleed is DONE) | gated | Corridor cities; Simulasi labeling |
| 6 | G4 kinetic H1 ticker | gated | Colloquial Bahasa register + noun list |
| 7 | G6 buyer strip rebuild | gated | 2nd real shopkeeper quote + official +62 number |
| 8 | G7 /join queue mechanics · G8 batch meter | gated | Truthful window; real 50-slot cap decision |
| 9 | G9 catalog bento · G10 scrollytelling · G13 investor letter | gated | Micro-proof cells; pacing approval; founder writes letter |
| 10 | G11 trust chrome · G12 testimonial anatomy | gated | PT entity + address; shopkeeper photo + consent |
| 11 | CTO HANDOFF.md ops items (domain company.mobeeli.com, Search Console, Resend domain verify, ROTATE RESEND_API_KEY, WhatsApp placeholder, Yavet photo + LinkedIn) | untouched — ops/founder side | Founder/CTO; the WhatsApp env check also applies to the platform Vercel project |
| 12 | Veo media beyond the hero (per-section clips) | not placed | Founder verdict per slot on the preview; encode recipes in HANDOFF_LANDING_REDESIGN.md |
| 13 | Q5 pt2 (PJS stylistic sets) + HoverArrow first consumer | small, ungated | Next no-gate iterations |

Everything else the founder asked across the session is shipped and live or on the pushed
branches (verified against the full conversation).

## 5) Protocol (unchanged, now with teeth)

Uncommitted handback → Fable audits → founder vetoes on the preview. Selectors verified
against the live DOM; code-level tokens never in the contract `:root`; nothing stacks onto
`:focus-visible`; a utility ships WITH its first consumer; every number real or labeled
Simulasi. These are all enforced by tests now — a red suite is a returned iteration.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
