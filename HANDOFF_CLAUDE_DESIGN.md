# HANDOFF_CLAUDE_DESIGN.md

**The recursive-improvement loop, handed to Claude Design.**

This is the standing brief for the **Claude Design** loop on the Mobeeli marketing
landing page — the counterpart to the `HANDOFF_GEMINI_*` docs, but for the Claude-side
design pass (the `hallmark` design skill: `audit` / `redesign` / `study`). Read this
top-to-bottom before touching anything. It carries: where the project is right now, the
founder's own directives across every round (so you inherit his voice and standards), the
locked contracts you may not break, the full codebase map, the R8 audit ledger, and the
loop protocol.

Author of this handoff: **Fable (Claude, Opus 4.8)**, engineer + auditor on this repo.
Last updated: **2026-07-23**, immediately after R8 shipped to production.

---

## 0. How to run this loop (read first)

The founder ("Yavet", founder/CEO of Mobeeli) runs a **relentless, hyper-recursive
visual-improvement loop**. Each round:

1. **Audit** the live site against a design-excellence bar (anti-AI-slop, investor-grade).
   Fan out across lenses if useful — typography, color/contrast, hierarchy/space, motion,
   macrostructure/AI-tells, responsive, hero-immersion, copy.
2. **Adversarially verify** every finding against the *actual source* and against the
   **locked contracts in §5**. Kill anything not grounded in the code or that would break a
   contract or a pinned test. A short list of true, contract-safe findings beats a long list
   of maybes.
3. **Present a ranked punch list to the founder** and let him veto line-items. Do **not**
   silently implement — this project is founder-gated. Group by severity; tag each item with
   effort (quick/medium/deep) and which contract/test it touches.
4. **Implement the approved items** in surgical, test-guarded edits. The founder's standing
   instruction for *implementation* is **"use only 1 agent, work hyper meticulously"** — do
   the edits single-threaded and carefully; a swarm is for *analysis*, not for editing the
   same files in parallel (they overlap heavily in `landing.css` / `copy.ts`).
5. **Gate**: `npm test` → `npm run lint` → `npm run build`, all green. Pin every new visual
   behavior with a CSS/DOM contract test (this repo asserts CSS as regex contracts).
6. **Branch → push → Vercel preview → founder reviews → founder merges** via the Run-button
   pattern (see §10). Never push `main` yourself.

The bar the founder set, in his words: **"highest level of visual taste, better than UI/UX
human designers"**, and **"make it look less like AI."** Treat both as hard requirements,
not aspirations.

---

## 1. Where we are right now (post-R8 snapshot)

- **Repo:** `piztanza/mobeeli-landing-page` (private). Local clone:
  `C:\Users\user\.gemini\antigravity\PROJECTS\mobeeli-landing-page`.
- **Production commit:** `9274c94` — *"Merge R8: Claude-design (hallmark) audit polish"*.
- **Deploy topology:** landing repo `main` → **production** `mobeeli-landing-page.vercel.app`
  (will move to `company.mobeeli.com`). Branch pushes → Vercel **preview** (behind Vercel SSO;
  only the founder/team can view). The **platform** repo is separate
  (`overtakemg-cell/mobilee`, local clone `mobilee-platform`) → demo `mobilee-demo.vercel.app`.
- **Health:** 44 test files / **325 tests green**, ESLint clean, `next build` clean.
- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Vitest 4
  (node env, `renderToStaticMarkup` + CSS-contract regexes), three.js client islands
  (`dynamic ssr:false`), next/font self-hosting. **No Tailwind** — a hand-authored CSS design
  system. **No framer-motion** — motion is a custom rAF-writes-a-CSS-var idiom (see §7).
- **Genre (for design grading):** dark-cinematic B2B marketplace. The **dark bands** (hero,
  fitment 3D wheel, archipelago) are *atmospheric* — grain, radial glows, a WebGL backdrop,
  low-key depth are **intentional and correct**, not slop. The **light bands** (problem,
  how-it-works, catalog, buyer strip) are *modern-minimal* — hold them to restraint, real
  hierarchy, honest proof.

### Current front-page band order (`LandingView.tsx`)
`Nav (overlay)` → **Hero** (dark, full-viewport, rotating H1) → **FitmentSection** (dark,
full-viewport 3D wheel stage with flanking spec cards) → **ProblemSection** (light) →
**UnifyBand** (dark, full-bleed archipelago WebGL map) → **HowItWorks** (light, 3 step cards)
→ **AiCatalogCard** (dark card demo) → **BuyerStrip** → **Footer**.

Data-heavy bands live on their own routes: **`/why-mobeeli`** (proof stats, pain tiles,
search comparison, death-spiral cards), **`/team`**, **`/investors`**, **`/early-adopters`**,
plus `/join` (waitlist wizard) and the security-gated `/deck` flow.

---

## 2. What Mobeeli is (context for taste decisions)

Mobeeli is a pre-launch **auto-parts marketplace for Indonesia** — "trust infrastructure"
that verifies every part fits a buyer's exact vehicle (Year/Make/Model/trim → fitment), so
online parts-buying stops being a guessing game. This landing page is the **investor-facing
marketing site during an active fundraise** (the platform's real GCP prod is hibernated to
save cost; `mobilee-demo.vercel.app` is the demo the landing links to). Every design choice
is judged by one question: **does a sharp investor read this as a serious, well-made company?**

Two product-strategy constraints that shape the design:
- **Moat protection.** The founder deliberately keeps the front page **broad**. The real
  ET/PCD/offset fitment-clearance mechanics are the moat and are **kept off `/`** ("easily
  copyable with AI"). Do not re-expose them on the front page; deep mechanics belong on
  `/why-mobeeli` if anywhere.
- **"Look less like AI."** Repeated across rounds. Generic AI-template rhythm, invented
  metrics, italic headers, redrawn chrome, stock-photo people — all read as AI and are to be
  avoided or removed.

---

## 3. The founder's directives, round by round (his voice — read this)

The founder asked that you know **his previous prompts to Fable**. Here they are, distilled
faithfully so you inherit his priorities and standard. Recurring themes are called out at the
end.

**R1 — Setup / a11y.** Stand up the repo from the CTO handoff; execute the Phase-1
accessibility pass exactly; keep the suite and build green.

**R2 — The redesign directive (the founding brief).**
- "Top section full screen with a transparent header and the logo visible on dark."
- "Across the archipelago / From Sabang to Merauke, one catalog" — move it **nearer the top**,
  give it its **own full section**.
- Front page = **3–4 brief sections**; **shorter words, fewer numbers** (move data to its own
  page). "Do deep online research so it grabs investor attention."
- Media: "I want to use **different elements to tell our goal and story and to make it look
  less like AI** — you can use **video from our pitch deck**." All four media styles welcome
  (illustration + founder photography + existing 3D/typography + subtle background video).
- "Show me **inspiration sites**." "Run a **hyper-recursive research loop**." "**Use 1 agent
  only** to analyze and plan; when we hand off to Gemini we'll engage the agentic swarm."
- Hero copy: *"Can we use **unifying the auto industry**? Is that too big a statement? Deep
  analyze everything and see what's best."*
- Profile/company page: "**keep it broad** so people don't take our idea and tech moat —
  it's easily copyable with AI now."
- Rename **everywhere + the URL**; enlarge **headlines + key copy**; the platform link "needs
  to mention the **0%**"; stock photos = **hands + Jakarta + studio**, **not** SE-Asian people
  (no model releases). "Replace [the Early-Adopters page] with the platform link — I need the
  **catalog demo section on the front page**." Fix "dapters" → "adopters". Platform menu naming
  + **colors must match the landing blue palette**; "take ideas/elements from the platform
  page." "Ask me questions in **multiple choice**."
- Brand ruling: **"Mobilee should be Mobeeli and Carteria should be Mobeeli"** — update the md
  file so this is understood.

**R4 — Broken 3D wheel + font dissatisfaction.**
- "The **font needs improvement** — deeper research, look at the **best companies**."
- The 3D wheel overlay is broken → "**deep analyze**, give it its **own section**, decide the
  placement."
- "**Why is the archipelago visual not the entire section?**"
- "Take the platform's visuals/ideas." "Analyze against the **best sites**, loop relentlessly."
- "Deep audit for **missing requests**." Detailed Gemini handoff with a swarm. "**Use only 1
  agent here and work hyper meticulously.**"

**R5 — Keep iterating.** "Push and keep iterating. Engage **hyper-recursive improvement** in
ideas, visually, context and sections — by researching — and have the **highest level of
visual taste, better than UI/UX human designers**. Take **every little detail** from other
websites, trends and practices. Hand off to Gemini's best agents in swarm."

**R6 — Audit + brand + logo.**
- "`/platform/analytics` shouldn't even exist publicly — why is it there?" (→ removed from the
  public platform).
- "**Still not satisfied with the font.**"
- "Deep audit the **logo on dark + light headers** — the light one has a **double logo**."
  "Make the **logo bigger**."
- "Deep audit **errors + discrepancies** across both repos."
- Decisions: "300 [Early-Adopter shops] is correct"; "2019 Avanza is okay"; English is English,
  Indonesian is Bahasa (keep the EN/ID toggle).

**R7 — "Why does the platform feel so much better?"**
- *"Why does `mobilee-demo.vercel.app/platform` **look and feel so much better** than the
  landing page? How can we further adapt the feel?"* → the answer was continuous ambient
  motion + depth + Space Grotesk; the landing's old "pure-CSS, no-deps" rule was the cap, so we
  relaxed it (still no framer-motion).
- "**Font** — deeper research, best companies." (→ resolved by **matching the platform's type
  system**: Space Grotesk display + Inter body. Font had been reworked 3× and this finally
  satisfied it — treat the font families as **settled**, see §5.)
- "The **3D wheel section needs to be a full section** and the boxes around it **placed
  correctly**." (→ full-viewport stage, 250/1fr/250 flanking grid; R8 rebalanced to 220/1fr/300.)
- "The archipelago visual needs to be **zoomed out a bit and show it going across Java**."
- "Take the platform's visuals." "Analyze vs the best sites in a loop." "Deep audit missing
  requests." "**Use only 1 agent, work hyper meticulously.**" "Keep iterating hyper-recursively."
- **"Should we hand this off to Claude Design?"** → yes.

**R8 — This handoff's round.** "**Same recursive improvement loop but hand this off to Claude
Design.**" → Fable ran the `hallmark audit` (8 lenses, adversarial verify), presented the
32-item punch list, the founder approved the full safe pass + the taste items + all 4 copy
edits, and it shipped to production as `9274c94`. Ledger in §8.

### What the founder cares about most (distilled — optimize for these)
1. **Investor-grade seriousness.** Fundraise context. Nothing that reads unfinished or cheap.
2. **"Look less like AI."** The single most-repeated note. Kill templated rhythm and AI tells.
3. **Immersion / "feel."** He wants the landing to feel as premium and alive as the platform.
   Continuous, tasteful motion and depth — not decoration.
4. **Type is sensitive.** He was dissatisfied 3+ rounds until we matched the platform's fonts.
   Don't relitigate the *families*; refine scale/weight/rhythm within them.
5. **Relentless, detail-obsessed iteration.** "Take every little detail from the best sites."
6. **Brand + honesty discipline** (see §5). He personally rules on brand and copy.
7. **Founder-gated, meticulous, single-threaded implementation.** He reviews the preview and
   clicks merge. He values verify-don't-assume and exact-scope changes.

---

## 4. Reference: the sites/standards the founder benchmarks against

From the redesign research (see `HANDOFF_LANDING_REDESIGN.md` for the full digest): Linear
(dark cinematic hero, ruthless brevity), Mercury/Stripe/Vercel (investor-grade minimalism,
show-don't-tell), Airbnb (the product interaction *is* the homepage → our FitmentWheel), The
Browser Company / Ghost (progressive scroll narrative), Aruna.id (Indonesian marketplace
credibility), Supabase (own a distinctive color), web.auto (award-grade automotive minimal).
And — critically — **the Mobeeli platform itself** (`mobilee-demo.vercel.app/platform`) is the
founder's north star for "feel."

---

## 5. Locked contracts — do NOT break these (a fix that violates any is invalid)

These are enforced by tests and/or `CLAUDE.md`. A proposed change that trips one must be
dropped or reworked.

1. **i18n.** ALL user-facing strings live in `src/lib/i18n/copy.ts` as **EN + ID** maps
   (`CopyKey = keyof en`). Never hardcode copy in a component. New copy = additive key in
   **both** languages, **founder-stamped**. Key parity is tested.
2. **Brand.** **"Mobeeli" is the only brand name.** Never "Mobilee" or "Carteria" in copy. (The
   `mobilee-demo.vercel.app` string in the nav is the literal *domain*, not a brand error.)
   Spelling is **"Early Adopters"** (route `/early-adopters`, 308 redirect from `/early-adaptors`).
3. **No fee / no marketplaces / no fabrication.** Never state Mobeeli's fee/commission. Never
   name real marketplaces (Tokopedia/Shopee/…). No real manufacturer names as if partners
   (Astra/Denso). No emoji, no hype. **No fabricated claims:** the strings `REAL-TIME` and
   anything matching `/guarantee/i` are **vetoed**; every number is real or labeled
   "Simulasi/Simulation".
4. **Footer** is exactly: `Mobeeli — Jakarta, Indonesia`.
5. **Color.** Emerald/indigo/green are **banned** — hex `#10b981` / `#34d399` / `#818cf8` must
   never appear. The verified/success/"good" semantic is the **blue family**
   (`--mb-light-accent #5b9bf7`, `--mb-deep-blue`). Red (`--mb-danger #b91c1c`, and the
   dark-card `--mb-danger-on-dark #f87171`) is **pain-stats/errors only**. The hex tokens are
   locked to `.ba/design/style.json` — **do not "convert to OKLCH"**, that breaks the contract.
6. **Type families are settled** (founder-final after 3 rounds): **Space Grotesk** (display) +
   **Inter** (body), self-hosted via next/font, matching the platform. Refine scale / weight /
   measure / tracking — do **not** change the families. Plus Jakarta Sans remains only as a
   legacy fallback token.
7. **Motion.** Everything gated by `useReducedMotion`. three.js scenes stay
   `dynamic({ ssr:false })`. **No framer-motion / no new deps** (Lenis is founder-gated).
   Motion is the **rAF-writes-a-CSS-var idiom** (see §7). **Critical trap:** `useScrollReveal`
   leaves an inline `transform: none` on `[data-rev]` elements after reveal, so a *stylesheet*
   transform on a `[data-rev]` element is permanently dead — put such transforms on a child, or
   drive them from a hook.
8. **Focus system.** `:focus-visible { outline: 2px solid var(--mb-focus-ring); outline-offset:
   2px; }` is canonical. **Nothing may stack onto it** (no box-shadow ring). Never animate the
   ring's appearance.
9. **Tokens.** `.ba/` and the `globals.css` `:root` *contract* block (`--mb-primary` etc.) are
   **additive-only** vs `.ba/design/style.json`. Code-level tokens (fonts, dark-material, motion,
   the R8 `--mb-ease-standard` / `--mb-danger-on-dark`) go in the **separate** code-level `:root`,
   never inside the contract block.
10. **Utilities ship with a consumer.** No dead selectors/utilities (an unused one gets removed
    in audit — e.g. HoverArrow was retired twice).
11. **Git/deploy.** Commit author must be `78766430+piztanza@users.noreply.github.com` (repo-local
    config — don't override; **Vercel blocks other authors**). **Pushing `main` = production** —
    work on branches; **never merge to main yourself** (the founder clicks Run; see §10).
12. **Env quirks.** Windows CRLF — **never reformat whole files**, edits are surgical (use
    `prettier --end-of-line auto` if you must). Use `npm ci`. The browser preview pane is usually
    hidden → screenshots fail and rAF/IntersectionObserver don't fire (`document.hidden`), so
    rAF/observer-driven behavior can't be behavior-verified live — **verify by construction +
    tests**. Resize the pane to 1280 for desktop-layout checks.

---

## 6. The design system (what you're working within)

- **Fonts:** `--mb-font-display: var(--font-space-grotesk), …` (headings, numerics),
  `--mb-font-text: var(--font-inter), …` (body/UI). Set in `layout.tsx` + routed in
  `globals.css`. Numeric data uses a Space-Grotesk + `tnum` treatment (`.mb-num-display`,
  `.mb-card-part-price`, `.mb-fitment-label-value`, `.mb-funnel-num`, `.mb-ds-badge`, and R8
  added `tabular-nums` to `.mb-proof-v` / `.mb-pain-stat`).
- **Palette (hex, locked):** primary `#2f7df6`, deep-blue `#1b5fd9`, light-accent `#5b9bf7`,
  tint `#e4edfd`, ink `#0d1522`, page `#f5f7fa`, surface `#fff`, danger `#b91c1c`,
  danger-on-dark `#f87171`. Dark-material depth tokens `--mb-ink-dp1/2/3`, hairlines, and
  `--mb-shadow-linear-4layer`.
- **Motion tokens:** `--mb-ease-entrance` (cubic-bezier .19,1,.22,1), `--mb-ease-standard`
  (cubic-bezier .2,.6,.2,1 — R8 consolidation token), `--mb-ease-spring-btn` (a `linear()`
  spring), `--mb-duration-entrance 480ms`, `--mb-stagger-entrance 70ms`.
- **Motion idiom (no framer-motion):** hooks write CSS custom properties inside a
  `requestAnimationFrame`, gated on `useReducedMotion()` and (where relevant) `(hover: hover)`:
  `useGlowCards` (`--mx/--my` cursor glow), `useTilt` (`--tilt-rx/--tilt-ry` pointer parallax),
  `useMagneticCTA` (±3px translate), `useOverlaySolid` (nav transparent→solid via
  IntersectionObserver), `useScrollReveal` (`[data-rev]` staggered rise — see the §5.7 trap).
  R8 moved `will-change` **into** the tilt/magnetic hooks (promoted on interaction, cleared on
  leave) — no idle compositor layers.
- **Grain / glow:** film-grain `::after` on `.mb-hero / .mb-fit3d / .mb-uni / .mb-cat-card`;
  radial-glow recipes on the dark bands (R8 **differentiated the geometry** across them so no
  two share the same recipe).

---

## 7. Codebase map (where things live)

```
src/app/                 layout.tsx (fonts, metadata, JSON-LD) · globals.css (tokens, base, a11y)
                         page.tsx (landing) · why-mobeeli/ · team/ · investors/ · early-adopters/
                         join/ · deck*/ (HMAC-gated) · sitemap.ts · robots · api/*
src/components/landing/   LandingView.tsx (band order) · Nav.tsx · Hero.tsx · HeroRotator.tsx
                         FitmentSection.tsx · ProblemSection.tsx · UnifyBand.tsx · HowItWorks.tsx
                         AiCatalogCard.tsx · BuyerStrip.tsx · Footer.tsx · WhyMobeeli.tsx
                         AnalogDeathSpiral.tsx · SkipLink.tsx · ActiveSectionProvider.tsx
                         landing.css  ← the main stylesheet (~2600 lines; all band styles)
src/components/three/     FitmentWheel.tsx (+fitment-wheel.css) · IndoGlobe.tsx · HeroNetworkBackground
src/components/join/      JoinView.tsx · join.css
src/lib/hooks/            useReducedMotion · useScrollReveal · useGlowCards · useTilt
                         useMagneticCTA · useOverlaySolid
src/lib/i18n/             copy.ts (EN+ID maps — the ONLY place for user-facing strings) · rotation.ts
src/lib/                  seo.ts · db/ (insert-only, shared platform Postgres — NEVER run DDL)
tests/                    44 files; CSS asserted as regex contracts + renderToStaticMarkup DOM checks
.ba/ , ba-link.json       pipeline metadata — do not hand-edit or delete (CLAUDE.md §6)
```

**Sibling docs to read:** `CLAUDE.md` (the hard rules, canonical), `HANDOFF.md` (ops:
env vars, Vercel/DNS, Resend, outstanding work), `HANDOFF_LANDING_REDESIGN.md` (the master
redesign brief + inspiration digest), `HANDOFF_GEMINI_IMMERSION_R7.md` (14 ranked immersion
recipes — **#1 ambient WebGL aurora backdrop is still unbuilt**; #14 Lenis is founder-gated),
`HANDBACK_LANDING_VISUAL_POLISH_REPLY.md` (Fable's audit-verdict ledger, rounds 1–5).

---

## 8. R8 audit ledger (what just shipped, what's deferred, what's open)

**Method:** 8 design lenses (typography, color/contrast, hierarchy, motion,
macrostructure/AI-tells, responsive, hero-immersion, copy) → each finding adversarially
verified against source + the §5 contracts → deduped, globally ranked → 32-item punch list →
founder approved the full safe pass + the 6 taste items + all 4 copy edits. **Verdict: 0
critical · 6 major · 26 minor.** Gate at merge: 325 tests, lint, build. R8 contracts pinned in
`tests/hallmark-r8-polish.test.tsx`.

**Shipped — majors:** retired the repeated eyebrow kicker on the front-page narrative bands
(Problem, How-it-works keep only their H2; Fitment "Verified to fit" + Unify "Across the
archipelago" retain theirs) · fixed 2 WCAG AA contrast failures (`.mb-early-note` → `--mb-muted`,
`.mb-footer-copy` → `--mb-dark-muted`) · unified the H2 heads at weight 600 (killed a phantom
800 that faux-bolds Space Grotesk) · interpolated the overlay-nav `backdrop-filter` so the blur
cross-fades instead of popping · added the `html,body { overflow-x: clip }` mobile belt ·
de-guaranteed the ID fitment chip ("Dijamin" → "Dipastikan cocok").

**Shipped — minors/taste:** dead footer social link removed · why-Mobeeli measure capped ·
Georgia quote-mark → display face · 9.5px labels → 11px · section-head gap unified 48→44 ·
mobile lang toggles → 44px touch floor · dead base `box-shadow` dropped · archipelago drag hint
scrimmed · hero CTA no longer wraps at 320px · headings harden against long-word overflow ·
`tnum` on the loudest stats · funnel chip drops `transition: all` for enumerated props ·
`--mb-ease-standard` + `--mb-danger-on-dark` consolidation tokens · radial-glow geometry
differentiated across the dark bands · pressed states on the non-magnetic buttons · **WCAG 2.2.2
headline pause control** (hidden until focus) · `will-change` moved into the hooks · fitment
rails rebalanced 220/1fr/300 · ID locale slips (founders→founder, 19,4%) · EN "Blind RMA
Nightmare" realigned to "The Counterfeit Injection" · solid nav lightly retinted.

**Deferred with rationale (candidates to revisit):**
- **#31 px type-scale tokenization** — the half-pixel body/label cluster (13.5/11.5/12.5/14.5/
  16.5px) reads slightly generated in the *source*, but zero user-visible effect and a full
  sweep changes dozens of sizes on a live page for no visual gain. Only the user-visible part
  (9.5px→11px) shipped. A dedicated, deliberate type-scale-ladder pass could still be greenlit.
- **#29 "How it works" 3-card grid restraint** — left as-is; the audit's own verifier put it in
  "already excellent" (the YMM-pill / funnel-simulator / scanner interiors genuinely
  differentiate it), and a structural change risked the §5.7 `[data-rev]` transform trap.

**OPEN — needs the founder (not a design call):**
- **#32 "backed by insurance" copy** — `early_f2_d` / `jw_ben2_s` promise fraud protection
  "backed by video evidence **and insurance**" (ID: "…dan asuransi"). Whether an insurer is
  actually in place is a business fact — **untouched, pending the founder's answer.** If not in
  place, drop "and insurance" / "dan asuransi" from both keys.

---

## 9. Next-loop candidates (where Claude Design should look next)

Ranked by likely impact on the founder's north star ("feel like the platform, look less like AI,
investor-grade"):

1. **Ambient WebGL aurora backdrop** (`HANDOFF_GEMINI_IMMERSION_R7.md` #1) — genuinely **not
   built yet**. The single biggest "feel" lever: a slow, low-contrast generative backdrop behind
   the dark bands, in the rAF-CSS-var / three-island idiom (no framer-motion). This is the most
   direct answer to "why does the platform feel better."
2. **Scroll-choreography polish** — the reveal/stagger is functional but even; a more
   intentional, varied entrance rhythm (respecting the `[data-rev]` trap and reduced-motion)
   would lift perceived craft. Lenis smooth-scroll is the obvious enabler but is **founder-gated**
   (adds a dep) — ask before reaching for it.
3. **Hero type & rhythm** — within the locked families, a deliberate scale ladder and tighter
   optical rhythm on the hero + section heads (the R8 #26 rhythm fix was a start).
4. **Real founder photography / Senen shopkeeper credibility card** — approved *in principle*
   but blocked on a **real** founder-supplied photo + consent (a generated "shopkeeper" is
   fabricated social proof — hard no). Stock people are out (no model releases).
5. **`/why-mobeeli` depth** — the data page can carry more of the moat story than `/` and is the
   right home for any richer fitment/PCD demo.
6. **A `hallmark study` pass on the platform** — extract the platform's DNA (type pairing,
   motion cadence, depth) formally and port the transferable parts to the landing.

Always run these through the §0 loop: audit → verify → **founder-gate** → implement → test → preview → merge.

---

## 10. The founder Run-button merge protocol (exact)

You **cannot** merge to `main` (the auto-mode classifier blocks it; that's by design — the merge
is the founder's approval gate). The proven path:

1. Fable/Claude does the work on a branch, gates it green, pushes → Vercel preview.
2. The founder reviews the preview (Vercel-SSO-protected; he's logged in).
3. Fable checks out `main`, `pull --ff-only`, confirms a clean merge, and presents **Run-button
   blocks** — **one `git` command per fenced ```bash block, NO `&&`** (the founder's buttons
   execute in **PowerShell 5.1**, where `&&` is a parse error and the button silently no-ops).
   Author is already `piztanza` via repo-local config (required or Vercel blocks the deploy).
4. The founder clicks the merge block, then the push block. Production deploys on the push.
5. Verify: `gh api repos/piztanza/mobeeli-landing-page/deployments` → status `success`, then a
   WebFetch smoke-test of `mobeeli-landing-page.vercel.app` (correct headings, no banned strings,
   exact footer, no horizontal scroll).

Gate commands (must all pass before presenting buttons):
```bash
npm test
```
```bash
npm run lint
```
```bash
npm run build
```

---

## 11. Standing outstanding items (from HANDOFF.md — not design, but context)

Domain `company.mobeeli.com` + Search Console + Resend domain verify; **rotate `RESEND_API_KEY`**
(was once pasted in a chat); replace the placeholder WhatsApp `6281234567890`; add Yavet's photo +
LinkedIn (the conditional render makes the link auto-appear once a URL exists — the CEO couldn't
register an account yet); infra renames flagged not done (`mobilee-demo` domain,
`mobilee_demo_session` cookie, `/logos/mobilee-logo.png`). These are the CTO/founder's; note them,
don't action them without a request.

---

*Loop owner: the founder (Yavet). Auditor/engineer: Fable (Claude). Every visual change is
founder-gated on the Vercel preview before it reaches production. Keep the bar where he set it —
better than a human designer, and nothing that reads like AI.*
