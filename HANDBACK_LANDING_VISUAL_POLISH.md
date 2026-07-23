# HANDBACK_LANDING_VISUAL_POLISH.md — Handover, Relentless Audit Protocol & Perfection Roadmap

Written **2026-07-23** | Branch: [`feat/phase1-a11y`](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page) @ `0917c0b`  
**Status**: 265/265 Vitest tests green, ESLint clean (0 errors / 0 warnings), Next.js 16 (Turbopack) production build clean.

---

## 1. Executive Summary & Current State

This handback document establishes the audit protocol and hyper-recursive improvement loop for Mobeeli's landing page redesign. Three visual iterations have been executed, tested, and committed on top of the locked site architecture.

### Repository Status
* **Branch**: `feat/phase1-a11y`
* **Commits Added**:
  1. [`402ce2f`](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page) — `feat(landing): add darkened Jakarta aerial background video loop to Hero (Iteration 1)`
  2. [`6a75c01`](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page) — `feat(landing): adopt brake pad sprite (scn1, parts/pad.png) in AiCatalogCard (Iteration 2)`
  3. [`0917c0b`](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page) — `feat(landing): add dot-grid background pattern to BuyerStrip and utility class (Iteration 3)`
* **Test Gate**: `npm test` → 265/265 passed across 31 test suites.
* **Lint Gate**: `npm run lint` → 0 errors, 0 warnings.
* **Build Gate**: `npm run build` → Production build succeeded cleanly.

---

## 2. Audit Brief for Fable (Claude)

Fable: Your role is to **relentlessly audit** all code, visual aesthetics, micro-interactions, accessibility metrics, and UI/UX design choices made by Gemini. Be unsparing in your technical and creative review.

### Audit Dimensions

> [!IMPORTANT]
> Do not approve changes on code passing alone. Evaluate visual elegance, frame stability, contrast ratios, and emotional resonance.

#### A. Aesthetic & Visual Polish (World-Class Benchmarks)
- **Cinematic Atmosphere (Linear / Stripe level)**: Does the dark hero background video (`jakarta-hero-bg.mp4` at `opacity: 0.28`) maintain readability without visual clutter or color banding?
- **Lighting & Contrast**: Do radial gradients (`rgba(47,125,246,0.16)` and `rgba(18,63,158,0.28)`) feel dynamic and depthful, or do they look flat?
- **Stage Composition**: Does the 6-sprite assembly (`scn1`–`scn6` in `AiCatalogCard.tsx`) balance spatially on desktop (1280px+) and mobile (360px–390px)? Is the new brake pad sprite ([pad.png](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/public/assets/parts/pad.png)) visually cohesive with `disc.png`, `shock.png`, `filter.png`, `plug.png`, and `air.png`?
- **Dot-Grid Texture**: Does the `.mb-bg-grid-dots` pattern on `.mb-buyer` provide tactile engineering precision without causing moiré effects or visual noise?

#### B. Code Quality & Strict Contracts
- **`CLAUDE.md` Compliance**: Zero DDL on Neon DB, copy rules enforced (no exact fees, no competitor names, "Early Adaptors" spelling intact, no emojis).
- **TypeScript Strictness**: Zero `any` casting, clean interfaces for all component props.
- **i18n Ledger**: Both EN and ID copy maps in [src/lib/i18n/copy.ts](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/src/lib/i18n/copy.ts) synchronized.
- **Test Integrity**: All tests in [tests/landing.test.tsx](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/tests/landing.test.tsx) and [tests/catalog-loop.test.tsx](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/tests/catalog-loop.test.tsx) correctly cover DOM structures without masking logic.

#### C. Motion, Performance & Accessibility
- **`useReducedMotion` Gating**: Every video, CSS animation (`@keyframes`), and three.js island properly halts or falls back to static poster images (`jakarta-hero-bg-poster.jpg`) under reduced motion settings.
- **Focus Rings & A11y**: [SkipLink.tsx](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/src/components/landing/SkipLink.tsx) is the first focusable element. Focus ring contrast stays ≥ 3:1 on all surfaces (dark hero, light section bands, overlay nav).
- **Performance Budget**: LCP < 2.5s; video `preload="none"`, muted, looped, `playsInline`; zero main-thread blocking during initial paint.

---

## 3. Iteration Ledger & Technical Rationale

### Iteration 1: Darkened Jakarta Aerial Video Loop
- **File Changes**:
  - [Hero.tsx](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/src/components/landing/Hero.tsx): Added `<div className="mb-hero-bg-media">` with conditional `<video>` (non-reduced) and `<img>` (reduced motion fallback), plus `<div className="mb-hero-bg-scrim">`.
  - [landing.css](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/src/components/landing/landing.css): Added `.mb-hero-bg-media`, `.mb-hero-bg-scrim`, `position: relative` on `.mb-hero`, and `z-index: 1` on `.mb-hero-grid`.
  - Assets: [jakarta-hero-bg.mp4](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/public/veo/jakarta-hero-bg.mp4) (853KB, H.264, 720p 24fps) and [jakarta-hero-bg-poster.jpg](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/public/veo/jakarta-hero-bg-poster.jpg).
- **Rationale**: Gives subtle motion and Indonesian context to the dark viewport hero while preserving full contrast for the H1 headline and CTA buttons via overlay scrims.

### Iteration 2: Catalog Brake Pad Sprite (`pad.png`)
- **File Changes**:
  - Assets: Generated and optimized [pad.png](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/public/assets/parts/pad.png) (62KB PNG, 256x256).
  - [AiCatalogCard.tsx](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/src/components/landing/AiCatalogCard.tsx): Added `scn1` with `/assets/parts/pad.png`, `.mb-sprite--pad`, and `ENTER_OFFSETS[0]` into `SPRITES`.
  - [catalog-loop.test.tsx](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/tests/catalog-loop.test.tsx): Updated SSR assertion to include `scn1`.
- **Rationale**: Completes the full 6-sprite stage loop designed in the original spec (slots 0 through 5).

### Iteration 3: Dot-Grid Background Texture
- **File Changes**:
  - [landing.css](file:///C:/Users/user/.gemini/antigravity/PROJECTS/mobeeli-landing-page/src/components/landing/landing.css): Added `.mb-bg-grid-dots` utility class and updated `.mb-buyer` background.
- **Rationale**: Adds subtle engineering depth to the buyer conversion strip without increasing asset payload.

---

## 4. Hyper-Recursive Perfection Roadmap (World-Class Benchmarks)

To take Mobeeli from "great" to "world-class investor-grade landing page", we benchmark against five design leaders:

| Exemplar | Key Aesthetic Trait | Proposed Mobeeli Adaptation |
|---|---|---|
| **Linear** | Dark cinematic aura, glowing borders, precise typography | Add subtle border glow transitions (`border-color: rgba(91,155,247,0.3)`) on hero card hover states. |
| **Stripe** | Multi-layered ambient lighting, dynamic mesh gradients | Implement interactive canvas cursor light tracking behind the `FitmentWheel` scene. |
| **Vercel** | Crisp high-contrast typography, zero-friction micro-interactions | Add subtle keyboard shortcut indicators (`⌘K` / `Shift+?`) for instant nav search / deck access. |
| **Apple / Lusion** | Physics-based micro-motion & smooth WebGL shader passes | Polish `IndoGlobe` three.js arc connections with pulsing light nodes and particle depth. |
| **Aruna.id** | Authentic Indonesian operational trust & local human touch | Introduce a photography card in the Problem section featuring an authentic Jakarta automotive shop owner. |

---

## 5. Candidate Hypotheses for Next Iteration Loop

The following hypotheses are ready for Fable's review and incremental execution:

### Hypothesis A: Interactive Wheel Offset & PCD Fitment Visualizer Widget
* **Concept**: Add a lightweight, interactive fitment slider widget inside the `HowItWorks` Step 2 card (`.mb-step-card`). Users can drag offset (ET20–ET45) and PCD values to see real-time visual clearance check ticks.
* **Impact**: Demonstrates product utility instantly ("show, don't tell").

### Hypothesis B: Ambient Glow Mesh & Interactive Pointer Depth in Hero
* **Concept**: Add a subtle pointer-following ambient canvas light mesh behind `.mb-hero-grid` that subtly shifts radial gradients with mouse movement.
* **Impact**: Gives the dark hero section dynamic, modern depth reminiscent of Stripe/Linear.

### Hypothesis C: Micro-Interactions & Magnetic Hover Polish
* **Concept**: Apply subtle spring magnetic translation (`transform: translate3d(...)`) on `.mb-btn-primary-dark` and `.mb-btn-ghost-dark` buttons on hover.
* **Impact**: Elevates tactile feedback for desktop interactions.

### Hypothesis D: Senen Shopkeeper Human Credibility Card
* **Concept**: Upgrade the typographic quote card in `ProblemSection.tsx` with a high-resolution photo of Pak Senen (shop owner) with an ambient teal verification badge.
* **Impact**: Connects high-tech infrastructure with real-world Indonesian market credibility.

---

## 6. Handover Protocol for Gemini & Fable Loop

1. **Fable's Audit Phase**:
   - Review code diffs across `Hero.tsx`, `AiCatalogCard.tsx`, `landing.css`, and `tests/`.
   - Inspect preview screenshots / local dev server at `http://localhost:3000`.
   - Issue approvals or line-item vetoes.

2. **Gemini's Execution Phase**:
   - Pick the approved next single hypothesis from Section 5.
   - Implement on a clean git branch off `feat/phase1-a11y`.
   - Run the full test gate (`npm test` → `npm run lint` → `npm run build`).
   - Commit cleanly and push to Vercel preview.

3. **Reconciliation**:
   - Repeat until every surface on `/`, `/why-mobeeli`, `/early-adaptors`, `/team`, and `/investors` reaches absolute UI/UX perfection.

---

*Handback document compiled for Fable (Claude) & Gemini pair engineering.*
