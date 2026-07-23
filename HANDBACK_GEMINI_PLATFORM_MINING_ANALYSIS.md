# HANDBACK_GEMINI_PLATFORM_MINING_ANALYSIS.md — Swarm Analysis & Ranked Mining Hypotheses

**Date:** 2026-07-23  
**Author:** Gemini Swarm Analysis  
**Branch target:** `feat/phase1-a11y` / platform-mining iterations  
**Status:** Phase A Complete — Submitted for Fable Audit & Founder Review  

---

## 1. Executive Summary & Synthesis

Following the commission in [`HANDOFF_GEMINI_PLATFORM_MINING.md`](file:///c:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/HANDOFF_GEMINI_PLATFORM_MINING.md), a multi-agent analysis was conducted across:
1. **The 6 candidate borrowable UI elements** in `overtakemg-cell/mobilee` (`src/app/platform/components/`)
2. **Current landing page structure** (`src/components/landing/`)
3. **Investor-grade reference patterns** (Linear, Stripe, Mercury, Vercel, Aruna.id)

### Key Architectural & Brand Rules Applied:
- **Strict Color Tokens:** Emerald (`#34d399`/`#10b981`) and Indigo (`#818cf8`) from the platform repo are **100% recolored** to Mobeeli blue design system: `--mb-primary` (`#2f7df6`), `--mb-deep-blue` (`#1b5fd9`), `--mb-light-accent` (`#5b9bf7`), `--mb-ink` (`#0d1522`).
- **Zero Heavy Dependencies:** Ports are rebuilt as native React + CSS keyframe/CSS variable components. **Zero Framer Motion or Tailwind dependencies added.**
- **Brand Guardrail:** "Mobilee" and "Carteria" are corrected to **Mobeeli** across all ported elements.
- **Copy Guardrail:** Broad marketing numbers only — internal platform moat numbers (7,000 OE specs, AI ingestor internals) stay off `/`. All user strings mapped to EN + ID in `src/lib/i18n/copy.ts`.
- **Accessibility & Reduced Motion:** All animations check `prefers-reduced-motion` via `useReducedMotion()`.

---

## 2. Analysis of the 6 Platform Borrowables

| Rank | Borrowable Element | Source File & Scope | Porting Strategy | Target Landing Surface | Impact | Effort |
|---|---|---|---|---|---|---|
| **1** | **Search-Funnel Narrowing Simulator** | `InteractiveAppMockup.tsx` (CatalogMockup, L42-118) | Pure CSS `@keyframes` query narrowing animation (`14,002` → `+Toyota 3,012` → `+Avanza G 2018 = 4 EXACT FIT`). Recolor emerald → Mobeeli primary blue pill. | `HowItWorks.tsx` Step-2 card | **High** | **Low** |
| **2** | **HeroBackground SVG Bezier Network** | `HeroBackground.tsx` (L12-85) | Pure SVG `<path>` with CSS `stroke-dasharray`/`stroke-dashoffset` pulse animations. Recolor emerald → 15-25% opacity `--mb-primary`. | `/why-mobeeli` Header / Hero accent | **Medium** | **Low** |
| **3** | **AnalogDeathSpiral Problem Cards** | `AnalogDeathSpiral.tsx` (L200-295) | CSS margin-cascade chart & glitch scanner effect. Recolor to `--mb-ink` background with blue/amber warning indicators. | `/why-mobeeli` Problem grid | **Medium** | **Low-Med** |
| **4** | **GarageOSScanner Phone Sweeper** | `GarageOSScanner.tsx` (L150-190) | Pure CSS phone frame with sweeping blue laser (`@keyframes laser-sweep`) + "Verified Authentic" badge. | `HowItWorks.tsx` Step-3 card | **Medium** | **Low** |
| **5** | **Interactive 3D-Parallax Dashboard** | `InteractiveAppMockup.tsx` (L300-450) | CSS `transform: perspective(1000px) rotateX() rotateY()` driven by rAF mousemove listener + tabbed feature preview. Zero 3D canvas. | Product Showcase Band on `/` | **High** | **Medium** |
| **6** | **EcosystemMarquee Dual Ticker** | `EcosystemMarquee.tsx` (L50-95) | Infinite CSS ticker (`@keyframes marquee`). | Footer / ProofBar | **Low-Med** | **Trivial** (Blocked on founder brand approval) |

---

## 3. Investor-Grade Reference Site Benchmark

- **Linear (`linear.app`):** Subtle border-glow on hover (`box-shadow: 0 0 15px rgba(47,125,246,0.2)`), precision typography, dark surface depth with thin glowing dividers.
- **Stripe (`stripe.com`):** Micro-interactive widget state transitions embedded within step-by-step card layouts.
- **Mercury (`mercury.com`):** High-contrast metric cards with animated count-up / interactive filter toggles.
- **Vercel (`vercel.com`):** Magnetic CTA hovers, zero-layout-shift micro-interactions, dark aesthetic with bright electric focal points.
- **Aruna.id:** B2B supply chain integrity graphics, showing verified trade flow rather than abstract claims.

---

## 4. Ranked Hypotheses for Execution Loop (Phase B)

### 🟢 Hypothesis C — Magnetic CTA Hover (Round 1 Approved Seed)
- **Concept:** Smooth mouse-following magnetic nudge (≤ 3px `translate3d`) on primary (`.mb-btn-primary`) and secondary hero CTA buttons.
- **Constraints:** Active ONLY when `@media (hover: hover)` and `prefers-reduced-motion: no-preference`. Uses rAF lerp; zero layout shift; zero external libraries.
- **Status:** **Greenlit for immediate execution.**

### 🟢 Hypothesis 1 — Search-Funnel Narrowing Simulator in HowItWorks Step 2
- **Concept:** Transform `HowItWorks` Step 2 card from static text rows into a live interactive YMM narrowing simulator showing real-time query resolution (`14,002` parts → `3,012` Toyota → `4` Exact Fit).
- **Recolor:** Emerald → Mobeeli `#2f7df6` / `#5b9bf7` glow pill.
- **Copy (i18n):** EN + ID keys (`how_s2_funnel_q`, `how_s2_funnel_step1`, `how_s2_funnel_step2`, `how_s2_funnel_step3`, `how_s2_funnel_match`).
- **Status:** **Pre-approved by Fable pending implementation review.**

### 🟡 Hypothesis 2 — Linear-Style Reactive Border Glow on Step & Catalog Cards
- **Concept:** CSS custom property `--mouse-x`, `--mouse-y` updated via rAF on mouse pointer over `.mb-step-card` and `.mb-ai-card`, creating a subtle radial light highlight along card borders.
- **Perf:** GPU accelerated, 0 main-thread cost when idle.
- **Status:** **Queued after Hypothesis 1.**

### 🟡 Hypothesis 3 — GarageOS Laser Verification Sweep in HowItWorks Step 3
- **Concept:** Enhance Step 3 (Protection & Guarantee) with a CSS phone wireframe featuring a subtle sweeping blue laser scanner and a "Verified Authentic" check badge.
- **Status:** **Queued for Phase B.**

### 🟡 Hypothesis 4 — Hero SVG Bezier Packet Network on `/why-mobeeli`
- **Concept:** Port `HeroBackground.tsx` as a lightweight SVG background network for the `/why-mobeeli` section header, visualizing real-time supply node connectivity.
- **Status:** **Queued for `/why-mobeeli` update.**

---

## 5. Next Actions & Gate Protocol

1. Deliver this analysis report for Fable audit.
2. Execute **Hypothesis C (Magnetic CTA Hover)** as the first commit iteration.
3. Pass full validation gate (`npm test` → `npm run lint` → `npm run build`).
4. Proceed to **Hypothesis 1 (Funnel Simulator in Step 2)** upon gate confirmation.
