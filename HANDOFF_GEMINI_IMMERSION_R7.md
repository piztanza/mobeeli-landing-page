# HANDOFF_GEMINI_IMMERSION_R7.md — port the platform's immersive feel onto the landing

Written 2026-07-23 | Branch `feat/r7-immersion` (pushed). Read `CLAUDE.md` +
`HANDBACK_LANDING_VISUAL_POLISH_REPLY.md` first. This brief comes from a deep teardown of the
platform (`mobilee-demo /platform`) + best-in-class research, with exact recipes. Gemini runs
the agentic swarm from THIS document; Fable audits each iteration (uncommitted handback →
audit → founder veto on the preview).

## 0) The strategic decision (why this round exists)

The founder observed the platform "looks and feels so much better" than the landing. Root
cause (verified in code): the platform runs **continuous ambient motion + depth** —
framer-motion physics, a full-screen WebGL aurora backdrop, Lenis smooth scroll, 3D parallax
— while the landing is discrete static CSS sections. The landing feels flatter *because of a
rule Fable imposed*: "pure CSS, no new deps." **That rule is now relaxed for motion**, with
two hard conditions:

1. **No framer-motion.** The landing ships only `three`. Every "port framer-motion physics"
   item is reimplemented in the repo's PROVEN idiom: a `useEffect` + `requestAnimationFrame`
   loop writing CSS custom properties / `transform`, gated on `useReducedMotion()` +
   `matchMedia('(hover: hover)')`. That idiom exists three times already —
   `useMagneticCTA`, `useGlowCards`, `useScrollReveal` — extend it, don't invent.
2. **`three` is fine (already a dep). Lenis is the ONLY item that adds a package** (#14) →
   founder-gated; everything else works on native scroll.

Already DONE this round (Fable, on this branch): font system now matches the platform
(**Space Grotesk display + Inter body** — `--mb-font-display` is already Space Grotesk); and
the archipelago camera is zoomed out to show the Java corridor (#3 below — shipped, fog
pushed out too). So Gemini starts at #1, #2, #4+.

## 1) Platform immersion teardown (exact recipes)

**A1 — Ambient WebGL backdrop (the biggest lever).** `PlatformCanvas.tsx` →
`webgl/canvas/{Scene,Background,Network,Particles}.tsx`. `dynamic(ssr:false)`, early-returns
if `prefersReducedMotion() || !webglSupported()` (opaque bg is the fallback — no canvas
mounts). A rAF loop writes a shared `scrollState` (`progress = clamp(scrollY/(scrollH-innerH),0,1)`,
`velocity` decays to 0 at rest) and `pointermove` writes `pointerState` (NDC −1..1). Canvas:
`fixed inset:0 z-0 pointer-events:none aria-hidden`, `dpr={[1,1.5]}`, error-boundary → DOM
fallback. **Background shader** = full-screen quad, 2-octave simplex, colors
`#030508/#2f7df6/#1b5fd9`, `intensity = pow(n,2.1)*rad*(0.36+0.4*uVelocity)`, vignette
`1−0.28*length(p)`, glow center chases cursor; uniforms lerp per frame (`0.06/0.08/0.05` —
this smoothing IS the "buttery" feel). **Network** = 58 nodes on an ellipsoid shell
(deterministic seed 1337), edges `#1b5fd9` additive opacity 0.09, 26 pulses lerp
`#2f7df6→#5b9bf7`. **Particles** = 110 pts, `#1b5fd9` opacity 0.26, drift with progress.

**A2 — framer-motion physics.** 3D mouse-tilt dashboard (`InteractiveAppMockup.tsx`):
`perspective:2000px`, spring `{damping:40,stiffness:200,mass:1}`, `rotateX ±15°`,
`rotateY ±15°`, floating widgets at `translateZ 80/120/140px`. Scroll hero (`page.tsx`):
`heroY 0→40%`, `heroOpacity 1→0` over scroll `[0,0.3]`.

**A3 — Lenis** (`SmoothScroll.tsx`): `{duration:1.1, smoothWheel:true, touchMultiplier:1.6}`,
skipped under reduced-motion, try/catch → native.

**A4 — glow/mesh/blur system.** Mesh orbs `blur-[150px] mix-blend-screen`; card "premium
glass" = `bg-[#0f172a]/80 backdrop-blur-3xl border-slate-700/60 shadow-[0_60px_120px_rgba(0,0,0,0.8)]
ring-1 ring-white/5` + glossy top hairline. ⚠️ Any `#1e3a8a` indigo / `#38bdf8` sky / cyan /
amber in ported code → remap to brand blues.

**A5 — Space Grotesk** on data only (prices, spec values, SKU/OE, stat figures, step badges),
`font-feature-settings:"tnum"`. Already wired as `--mb-font-display`.

## 2) Best-in-class research (one inevitable technique each)

1. **Stripe** — warped fBm mesh gradient (3-octave simplex, UV pre-warped by sin/cos, ~10KB) —
   the platform's `Background.tsx` already is this; it's the port target.
2. **Linear** — atmospheric near-black + cursor-tracked spotlight card borders (`radial-gradient(200px at var(--mx) var(--my))`) — the landing ALREADY has this as `.mb-glow-card`, under-deployed.
3. **Vercel** — animate the wrapper transform (`will-change:transform`), never gradient color
   stops; real bg image over CSS masks to dodge banding.
4. **igloo.inc** (Awwwards SOTD) — one continuous camera drifting between scenes vs cuts —
   maps to the platform's `scrollState.progress`-driven rotation.
5. **Framer/Cursor** — 3 layers at different `translateZ` in one `perspective`, tilt ±6–12° on
   pointer, lerp 0.08–0.15.
6. **Gojek** — quiet always-on ambient loop + geography-as-emotion → the archipelago flyover IS
   the "built for Indonesia" hook; keep it slow and always-on.

## 3) Ranked port spec (the execution payload)

Global constraints per item: copy in `src/lib/i18n` EN+ID; `useReducedMotion()` gate; **brand
blues only** (strip cyan/#38bdf8/amber/#1e3a8a → `#2f7df6`/`#1b5fd9`/`#5b9bf7`); brand =
"Mobeeli"; hero H1 server-rendered first; ambient canvas always `dynamic(ssr:false)` + static
fallback.

| # | Proposal | Surface | Dep | Effort | Wow |
|---|---|---|---|---|---|
| 1 | **Ambient WebGL aurora backdrop** — port `Background.tsx` verbatim into new `AmbientBackdrop.tsx` (`dynamic ssr:false`, fixed `inset:0 z:-1`), behind the dark bands only; port `scrollState`/`pointerState` + rAF driver. IO-gate on hero so it never hits LCP; reduced-motion/no-WebGL → nothing (bands keep their radial-gradient bg). | whole-page | three | med | 9 |
| 2 | **⭐ Fitment wheel → full-viewport stage, boxes AROUND it (founder ask i)** | fitment | none | med | 9 |
| 3 | **⭐ Archipelago zoom to Java corridor (founder ask ii) — DONE by Fable** (`applyCam` 3.6/2.6→4.3/3.3, fog 6.5→7.2). Gemini: visual-verify only. | archipelago | none | trivial | 6 |
| 4 | **Pointer-parallax 3D tilt on the fitment stage** — new `useTilt` (rAF-CSS-var, clone of `useMagneticCTA`), `perspective:1600px`, `rotateX/Y ±9°`, cards at `translateZ 40/70/110px` in a `preserve-3d` wrapper. | fitment | none | low-med | 8 |
| 5 | **Deploy the cursor-spotlight glow-border on ALL dark cards** — `.mb-glow-card`/`useGlowCards` exists, only on fitment cards; add to HowItWorks, AiCatalogCard, BuyerStrip. | multiple | none | trivial | 6 |
| 6 | **Scroll-linked hero rise+fade** — rAF writes `--hero-y`/`--hero-op` on a WRAPPER (not the H1/LCP node), `translateY 0→40%` + `opacity 1→0` over `[0,0.3]`. | hero | none | low | 6 |
| 7 | **Mount the already-built `HeroNetworkBackground`** — it exists, recolored, framer-motion-free, but is NOT in `LandingView`. Drop behind the fitment/hero seam, `opacity 0.5`, radial-reveal mask. | fitment/hero | none | trivial | 6 |
| 8 | **Space Grotesk numeric treatment on all data** (`.mb-card-part-price`, `.mb-fitment-label-value`, stats) + `"tnum"`. | whole-page | none | trivial | 4 |
| 9 | **Static CSS mesh-glow orbs behind dark bands** (2/band, `#2f7df6`/`#1b5fd9` @10%, `blur(130-150px)`, `mix-blend:screen`) — cheap complement/fallback for #1. | hero/fitment/unify | none | trivial | 5 |
| 10 | **Extend `useMagneticCTA` to all primary CTAs** (BuyerStrip, HowItWorks). | whole-page | none | trivial | 4 |
| 11 | **Escrow-style progress stepper** in How-It-Works — `scaleX 0→0.5→1` fill on IO, nodes light `#5b9bf7` glow. Reimplement framer `animate` as CSS class toggle. | how-it-works | none | med | 6 |
| 12 | **Floating mono telemetry tags** on dark bands — Space Grotesk 9px pills, `mb-pulse` dot, gentle `translateY ±6px` keyframe; copy keyed EN+ID. | fitment/hero | none | low | 5 |
| 13 | **Network constellation layer** on the #1 canvas (`variant="full"`, 58 nodes, recolor `#38bdf8`→`#5b9bf7`), desktop + hero only. | hero backdrop | three | high | 8 |
| 14 | **Lenis smooth-scroll** — ⚠️ ADDS `lenis` dep → FOUNDER-GATED. #1 works on native scroll without it. | whole-page | +lenis | low | 5 |

### #2 fitment full-section spec (founder ask, detailed)
1. `.mb-fit3d` → full-viewport like `.mb-uni` (`min-height:100vh/100svh; display:flex; align-items:center`); stage height `min(78svh,720px)`, `.mb-fit3d-stage` max-width `1060px→min(1180px,92vw)`.
2. The 3 spec labels (`FITMENT_LABEL_ANCHORS` PCD/bore/auth) already project from wheel-local to screen each frame using `host.clientWidth/Height` — they auto-reflow to the bigger stage, **zero code change**; just nudge `.mb-fitment-vignette` stop `55%→62%`.
3. Move `.mb-herocard`s from docked-below (`flex margin-top:-40px`) to `position:absolute` children of the stage: part card `top:6% left:3%`, fit pill `bottom:7% left:50% translateX(-50%)` (clear of the auth label ~80%h), video `top:8% right:3%`. Keep the `fitment-first-loop` staggered reveal.
4. `FitmentWheel` `CAM_CLOSE (1.4,0.8,9.0)→(1.4,0.9,10.2)` for margin around the orbiting labels.
5. `@media (max-width:639.98px)` → cards revert to `position:static` stacked (absolute-around only ≥640px).

### Execution order
Founder asks first (#2; #3 verify), then #1 → #4, then trivial no-dep multipliers (#5,#7,#8,#9,#10), then #6,#11,#12, then #13/#14 opt-in. Key files: `FitmentSection.tsx`, `landing.css` (`.mb-fit3d*/.mb-uni*/.mb-glow-card*/.mb-herocard`), `FitmentWheel.tsx`, `IndoGlobe.tsx`, `HeroNetworkBackground.tsx`→`LandingView.tsx`, new `AmbientBackdrop.tsx`+`scrollState/pointerState`, new `useTilt.ts`, `copy.ts` (EN+ID telemetry strings).

## 4) Protocol (enforced — a red suite is a returned iteration)
One proposal per iteration; uncommitted handback for Fable's audit; full gate
(`npm test`→`lint`→`build`); contracts in tests for anything that must not regress. The
recurring rules (now all test-enforced): verify selectors vs the LIVE DOM; code-level tokens
never in the `.ba` contract `:root`; nothing stacks onto `:focus-visible`; a utility ships
WITH its first consumer; every number real or labeled Simulasi; no emerald/indigo/green
(that's the platform's OLD palette); ports ADD, never replace approved copy; no fabricated
telemetry/guarantees. Never push `main`; branch pushes → Vercel preview for founder review.

Sources: Stripe gradient teardown (kevinhufnagl), Linear DESIGN.md, learnui mesh-gradient,
Vercel design guidelines, igloo.inc WebGL breakdown, metabole immersive examples, Framer
cursor-reactive, Gojek design.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
