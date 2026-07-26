# HANDOFF_CLAUDE_DESIGN.md — v2

**The recursive-improvement loop, handed back to Claude Design.**
**Supersedes v1 (post-R8 snapshot @ `9274c94`), which is now factually wrong — see §12.**

Standing brief for the **Claude Design** loop on the Mobeeli marketing landing page, and the
source of truth for what **Gemini** is allowed to do next. Read top to bottom before touching
anything.

- **Written:** 2026-07-25 · **Author:** Fable (Claude, Opus 5) — engineer + auditor on this repo
- **Verified against:** `main` @ **`0bf6422`** ("Merge R15: unified catalog (salvaged)") — **live in
  production**, deploy green
- **Method:** 7 parallel subsystem analyses of the actual source (page structure, design system,
  copy/i18n, tests, motion/perf, infra, docs), 87 issues found, every claim citing `file:line`.
  Where this doc and any other doc disagree, **this doc and the source win**.

---

## 0. How to run this loop

The founder (Yavet, founder/CEO) runs a relentless, hyper-recursive improvement loop. Each round:

1. **Audit** the live site against an investor-grade, anti-AI-slop bar.
2. **Adversarially verify** every finding against the *actual source* and the locked contracts in
   §6. Kill anything not grounded in code. A short list of true findings beats a long list of maybes.
3. **Present a ranked punch list to the founder** — do not silently implement. This project is
   founder-gated.
4. **Implement approved items** single-threaded and meticulously ("use only 1 agent, work hyper
   meticulously" — his standing instruction for *implementation*; swarms are for *analysis*).
5. **Gate:** `npm test` → `npm run lint` → `npm run build`, all green, **plus a contract test for
   every new visual guarantee**.
6. **Branch → push → Vercel preview → founder reviews → founder merges** (§11). Never push `main`.

His bar, in his words: **"highest level of visual taste, better than UI/UX human designers"** and
**"make it look less like AI."** Both are hard requirements.

---

## 1. Where the product actually stands (post-R15)

- **Repo:** `piztanza/mobeeli-landing-page` (private). Local: `C:\Users\user\.gemini\antigravity\PROJECTS\mobeeli-landing-page`
- **Production commit:** `0bf6422` → `mobeeli-landing-page.vercel.app` (moving to `company.mobeeli.com`)
- **Gate at this commit:** **41 test files / 301 Vitest tests pass**, ESLint clean (0 warnings),
  `next build` clean. (An out-of-repo Playwright run of 54 E2E checks also passes — but see §5, it is
  **not committed**, so treat "54/54" as unverifiable from this repo.)
- **Stack:** Next.js 16.2.11 (App Router, Turbopack), React 19.2.8, TS strict, Vitest 4, zod 4,
  three 0.185, Drizzle + Neon, Resend. **No Tailwind** (hand-authored CSS). **No framer-motion.**
- **Genre:** dark-cinematic B2B marketplace, investor-facing during an active fundraise. The **dark
  bands are atmospheric on purpose** (grain, radial glows, WebGL) — that is not slop. The **light
  bands are modern-minimal** — hold them to restraint and honest proof.

### The page as it renders today (`/`)

| # | Band | Component | id | Surface |
|---|---|---|---|---|
| — | Nav (overlay) + SkipLink | `Nav overlay` | — | transparent → solid on scroll |
| 1 | **Hero** — rotating H1, full viewport | `Hero` | `#top` | dark `--mb-ink` |
| 2 | **Unified catalog** — vehicle picker + 4 part cards | `FitmentSection` | `#how-it-works` | dark, full viewport |
| 3 | **The problem** — illuminated H2 + Senen quote | `ProblemSection` | `#problem` | light |
| 4 | **Archipelago** — full-bleed WebGL map | `UnifyBand` | *(none)* | dark, full viewport |
| 5 | **AI catalog demo** — sprite orbit loop | `AiCatalogCard` | *(none)* | light wrapper / dark card |
| 6 | **Buyer capture** — inline email | `BuyerStrip` | *(none)* | light tint |
| — | Footer (outside `<main>`) | `Footer` | — | dark |

**Routes:** `/`, `/join`, `/team`, `/early-adopters`, `/investors`, `/why-mobeeli`, `/deck`
(token-gated), `/deck-admin` (secret-gated) + 4 API routes (`waitlist`, `notify`, `deck-request`,
`deck-file`). Sitemap indexes 6.

**Band 2 in detail** (this is the round's centrepiece, and where most open issues live):
left column = H2 `cat_unified_h2` + three stat tiles (7,000+ / 19,000+ / ~500, each labelled
"(Simulation)"); right column = a glass picker panel (plate/VIN form + 4 YMM selects) beside a
280×140 car image with a sweeping scan line, above a 2×2 grid of four part cards (real photos,
prices, "(Simulation)" tags, and a "✓ Verified Fit" badge that appears once a vehicle is saved).
Selecting a vehicle persists it to `localStorage["mobeeli_garage"]` after an 1800 ms fake scan; a
"My Garage" chip with a Clear button then replaces the picker.

---

## 2. What changed since v1 — read this before designing anything

**NEW since the last design brief:**
- **`AmbientAurora`** — a full-screen WebGL fragment-shader backdrop. **This was v1's #1
  "not built yet" recommendation. It is built and mounted three times** (Hero 0.4, FitmentSection
  0.3, AiCatalogCard 0.28). Do not re-propose it.
- **R15 unified catalog** in band 2, with the localStorage "garage" — the site's only stateful feature.
- **Liquid glass** (blur 22px + saturate + specular inset) on the picker panel and part cards, with a
  `prefers-reduced-transparency` fallback.
- Nav desktop breakpoint moved **880px → 1040px**; type scale bumped (hero H1 up to 84px).

**GONE — do not reference, style, or "fix" these; they do not exist:**
- ❌ The **3D fitment wheel** (`FitmentWheel.tsx`, `fitmentLabels`, `fitmentTimeline`,
  `fitment-wheel.css`) and its GLB car model — all deleted.
- ❌ **`HowItWorks.tsx`** — deleted. There is no standalone "How it works" band.
- ❌ The **funnel simulator**, the **GarageOS laser scanner**, the **R12 2D DOM scanner**, the
  **floating product/fit/video cards**, the **3-beat protection strip**.
- ❌ `useTilt` is now **dead code** (zero consumers).

---

## 3. The founder's directives (his voice — inherit these)

**R2 (founding brief):** full-screen top section, transparent header, logo visible on dark ·
"Across the archipelago / From Sabang to Merauke" as its **own full section**, nearer the top ·
front page = **3–4 brief sections, shorter words, fewer numbers** (data lives on its own page) ·
"use different elements to tell our goal and story and **to make it look less like AI**" · keep the
public profile **broad** — "people try not to take our idea and tech moat, it's easily copyable with
AI now" · stock photos = hands + Jakarta + studio, **not** SE-Asian people · ask questions in
multiple choice.
**R4:** "the **font needs improvement** — deeper research, best companies" · fix the broken 3D
overlay, give it its own section · "**why is the archipelago visual not the entire section?**" ·
"deep audit for missing requests" · "**use only 1 agent here and work hyper meticulously**".
**R5:** "engage **hyper-recursive improvement**… have the **highest level of visual taste, better
than UI/UX human designers**. Take **every little detail** from other websites, trends and practices."
**R6:** `/platform/analytics` shouldn't be public · "still not satisfied with the font" · fix the
double logo, make it bigger · deep audit both repos · "300 is correct" · English is English,
Indonesian is Bahasa.
**R7:** "**Why does the platform look and feel so much better than the landing page?**" → answered
by continuous ambient motion + depth + Space Grotesk · "the 3D wheel needs to be a full section" ·
"archipelago zoomed out to show Java" · "should we hand this off to Claude Design?" → yes.
**R8–R15:** the hallmark audit shipped; then Gemini's R10–R15 rounds landed, with the founder
explicitly choosing to **replace the 3D wheel with the catalog** and to **salvage R15 properly**
rather than ship it green-by-deletion.

**What he cares about most:** (1) investor-grade seriousness, (2) "look less like AI", (3) immersion
/ "feel" matching the platform, (4) type (he was dissatisfied 3 rounds — families are now settled,
don't relitigate), (5) relentless detail, (6) brand + honesty discipline, (7) founder-gated,
meticulous, single-threaded implementation.

---

## 4. Design opportunities — where the next round should go

Ranked for impact on his north star. **Band 2 is the weak link**: it is the section the nav points
at, it is the product's core promise, and it is the least visually resolved band on the page.

1. **Resolve band 2's visual hierarchy.** Its H2 renders at a **flat 28px** while every neighbouring
   band's H2 is fluid 38–64px (and the archipelago's is up to 74px) — the section carrying the core
   promise has the smallest headline on the page, and it is actually *smaller on desktop than on a
   phone* (§5 #3). This is the single highest-leverage design fix.
2. **One catalog, not two.** Bands 2 and 5 are both dark, both about "the catalog", and neither is
   labelled — a visitor sees the claim made twice with different art (§5 #2). Founder decision:
   drop `AiCatalogCard`, or re-frame it as a distinct band with its own id and a non-duplicating
   headline.
3. **Unify the glass material.** The picker panel and the part cards sit side by side in one band
   using **two different glass recipes**, and the picker ships with **no padding and no
   border-radius** — a sharp-cornered rectangle with content flush to its border, next to
   16px-radius cards (§5 #7, #8). Propose one `.mb-glass` primitive.
4. **Restore the protection story — or relabel the nav.** The nav says "How it works" and lands on a
   product grid. The protection promise (`prot_r1-3`: video-evidence resolution, authenticity
   verification, funds release when the part fits) renders **nowhere on the site** (§5 #11). That is
   the trust argument — the actual product thesis — currently invisible.
5. **Make the scan feel intentional.** The scan line sweeps **forever**, ungated, and the
   `.is-scanning` state has zero styling (§5 #1). Designed properly, the 1.8 s scan is the moment
   the product's promise becomes tangible; today it is permanent decoration.
6. **Aurora as one system, not three.** Three full-screen shader contexts run permanently
   (§5 #6). A single fixed aurora layer whose intensity responds to scroll would look more
   deliberate *and* cost a third as much.
7. **Give the unnamed bands identity.** Half the bands have no `id`, so nothing can deep-link to the
   archipelago, the catalog demo, or the capture strip.
8. **Type scale as a system.** 27 distinct px values + 9 clamps, five half-pixel steps, and weight
   800 is the dominant weight in `landing.css` even though `globals.css` sets headings to 600.

---

## 5. Open issues — ranked, with evidence

**Visitor-visible (design + front-end):**

| # | Sev | Issue | Where |
|---|---|---|---|
| 1 | 🔴 | **Scan line animates infinitely, no reduced-motion gate**, and `.is-scanning` has zero CSS — a blue laser sweeps forever for every user. Violates CLAUDE.md rule 3 + WCAG 2.2.2; the only ungated infinite animation on the page. | `landing.css:815-828`; `FitmentSection.tsx:218,226` |
| 2 | 🟠 | **Two catalog bands** ship on one page (R15 catalog + AiCatalogCard) — same claim, same `.mb-cat-*` namespace that caused the R15 collision. | `LandingView.tsx:44,47` |
| 3 | 🟠 | **Band-2 H2 is 28px flat**, overriding `.mb-h2`'s clamp(38–64px); the ≤480px rule then makes it **29px on phones** — bigger on mobile than desktop. | `landing.css:742-747` vs `:105-111`, `:2389-2391` |
| 4 | 🟠 | **Nav order contradicts band order.** DOM is `#how-it-works` → `#problem`; nav and `SPY_SECTION_IDS` are the reverse, so the scrollspy marks the wrong section active. | `Nav.tsx:28-35`; `ActiveSectionProvider.tsx:14-16` |
| 5 | 🟠 | **Hero LCP hit for reduced-motion users** — the poster `<Image>` has no `priority`, so the largest element in a 100svh hero lazy-loads. | `Hero.tsx:33-45` |
| 6 | 🟠 | **3 WebGL contexts, permanent rAF loops, no in-view gate**; the 183 KB-gzip three chunk enters the hero critical path (IndoGlobe correctly defers — aurora does not). `preserveDrawingBuffer: true` is set on a purely decorative canvas. | `AmbientAurora.tsx:86-104,166-180` |
| 7 | 🟠 | **Glass picker panel has no padding and no border-radius** — sharp rectangle, content flush to the border. | `landing.css:2654-2662` |
| 8 | 🟠 | **Two divergent glass recipes** in one band (specular 0.4 + border vs 0.2 + none). | `landing.css:844-857` vs `:2654-2662` |
| 9 | 🟠 | **~2.7 MB of oversized JPGs** (1024² sources for ~300px cards; the 280×140 car poster is 506 KB) + **2.57 MB of dead assets** in `public/` (`unify-graph.mp4`, `assets/brand/`). | `public/assets/parts/`, `public/assets/brand/` |
| 10 | 🟡 | Reduced-transparency fallback paints cards the **same colour as the band behind them**. | `landing.css:859-865` |
| 11 | 🟡 | **Protection story renders nowhere**; `/early-adopters` is live + sitemapped but **unlinked**; three bands have no `id`. | `copy.ts:152-154`; `Nav.tsx:23,32` |

**Honesty / copy (founder decisions — do not auto-edit):**

| # | Sev | Issue | Where |
|---|---|---|---|
| 12 | 🔴 | **EN and ID make materially different investor claims.** EN: "9 of the first 14 we visited **signed** in one afternoon". ID: "…**setuju untuk join waitlist**" (agreed to join the waitlist). One is wrong, and the EN version is the indexed `/investors` meta description. | `copy.ts:208-209` vs `:540-541`; `seo.ts:71` |
| 13 | 🟠 | **"Backed by … insurance"** still asserted as fact on `/join` and early-adopters. Still pending your confirmation from the R8 round. | `copy.ts:178,277` (+ ID) |
| 14 | 🟡 | 4 catalog **prices hardcoded** in the component (bypasses copy.ts); 3 English-only image alts; +15/+15/+20% badges hardcoded and the +20% contradicts its own body copy. | `FitmentSection.tsx:81-84`; `AnalogDeathSpiral.tsx:45-53` |
| 15 | 🟡 | **27 orphaned copy keys** (~10%) render nowhere, kept green by existence-only tests. Honest-labelling on the new catalog is genuinely correct. | `copy.ts`; `tests/landing.test.tsx:12-46` |

**Engineering integrity (this is how quality regressed last time):**

| # | Sev | Issue | Where |
|---|---|---|---|
| 16 | 🔴 | **The R13 glass test pins two DEAD selectors and leaves the live glass unpinned** — deleting dead CSS turns the suite red, deleting the *real* glass keeps it green. Same "green by pinning" failure the R15 salvage was meant to close. | `tests/r13-glass.test.tsx:20-30` |
| 17 | 🟠 | **~217 lines / 33 dead CSS selectors** from R12/R15 (the whole 2D scanner block, the fit-protect block, step-numbers) — including an `animation: laserSweep` whose `@keyframes` **does not exist**. | `landing.css:2513-2586`, `:2609-2648`, `:1171-1203` |
| 18 | 🟠 | **The garage flow — the page's only stateful feature — has zero behavioural coverage.** No DOM env exists (`environment: "node"`, no jsdom), so the SSR test can only ever hit the empty-garage branch. | `vitest.config.ts:26`; `tests/r15-catalog.test.tsx` |
| 19 | 🟠 | **The Playwright E2E is not in the repo** — no dep, no config, no spec. It cannot be re-run, extended, or noticed when it rots. | `package.json` |
| 20 | 🟡 | R15 asserts image **filenames as source strings**, never that the files exist — a rename ships green with 4 broken images. | `tests/r15-catalog.test.tsx:34-36` |

**Infra / go-live (queued, needs founder for the external half):**

| # | Sev | Issue |
|---|---|---|
| 21 | 🔴 | **`DECK_SECRET` is emailed and carried in URL query strings** (`/deck-admin?key=…`), landing in logs, history and Referer headers. It is the master key: it gates admin *and* signs every deck token. |
| 22 | 🟠 | **No `error.tsx` / `not-found.tsx` / `global-error.tsx` anywhere** — every failure and bad URL falls to Next's unbranded English default, breaking the i18n contract. |
| 23 | 🟠 | **No security headers, no CSP** (`next.config.ts` has only redirects); `poweredByHeader` still true. |
| 24 | 🟠 | **No Node version pinned** (no `engines`, `.nvmrc`, `packageManager`) — the build target can drift silently. |
| 25 | 🟠 | **No env validation at boot** — a bad `RESEND_API_KEY` means lead alerts silently stop (the route deliberately returns 200). No health endpoint, no error monitoring. |
| 26 | 🟠 | **Domain cutover needs a redeploy**, not just an env edit — `NEXT_PUBLIC_SITE_URL` is inlined at build time, and the fallback is `https://mobeeli.com` (destined for the platform, not this site). |

---

## 6. Locked contracts — a change violating any of these is invalid

1. **i18n.** Every user-facing string lives in `src/lib/i18n/copy.ts` as **EN + ID** with full parity
   (compile-enforced: `as const satisfies` + `Record<CopyKey,string>`). New copy = additive key in
   both languages, **founder-stamped**.
2. **Brand.** "Mobeeli" only — never "Mobilee"/"Carteria" in copy. Spelling is **"Early Adopters"**.
3. **No fee stated. No marketplace names. No fabricated claims** — `REAL-TIME` and `/guarantee/i`
   are vetoed; every number is real or labelled "(Simulation)"/"(Simulasi)". No emoji, no hype.
4. **Footer** is exactly `Mobeeli — Jakarta, Indonesia`.
5. **Colour.** Emerald/indigo/green (`#10b981`/`#34d399`/`#818cf8`) are **banned**. Verified/success =
   the **blue** family. Red is pain/error only. The 16 contract hexes match `.ba/design/style.json` —
   **do not convert to OKLCH**.
6. **Type families are settled:** Space Grotesk (display) + Inter (body) via next/font. Refine
   scale/weight/rhythm — never the families.
7. **Motion.** Everything gated by `useReducedMotion`. three.js stays `dynamic({ssr:false})`.
   **No new deps** (no framer-motion; Lenis founder-gated). Motion is the rAF-writes-a-CSS-var idiom.
8. **Focus system** is canonical: `outline: 2px solid var(--mb-focus-ring); outline-offset: 2px`.
   Nothing stacks on it; never animate it.
9. **Tokens** are additive-only vs the contract block; code-level tokens go in the separate `:root`.
10. **Every visual guarantee ships with a contract test** — and **never delete a contract test to go
    green** (see §7).
11. **DB is insert-only on a shared production Neon table. NEVER run DDL or migrations.**
12. **Git:** author must be `78766430+piztanza@users.noreply.github.com`; **pushing `main` = production**;
    never merge to main yourself.
13. **Windows CRLF** — surgical edits only, never reformat whole files. `npm ci`, not `npm install`.

---

## 7. Guardrails for Gemini — derived from what actually went wrong

These are not hypothetical. Each one is a real failure from R10–R15:

1. **Never delete a contract test to make the suite green.** R15 shipped by deleting 7 test files
   (336 → 296 tests). If you change a feature, **update** its test. Removing a feature means removing
   its test *in the same commit as the feature*, stated explicitly in the handback.
2. **Never pin a selector that isn't rendered.** The R13 glass test certifies markup that no longer
   exists. Assert against **rendered output**, not stylesheet substrings, wherever possible.
3. **Delete the CSS and copy you orphan.** R12/R15 left ~217 lines of dead CSS and 27 dead copy keys.
   Removing markup without removing its rules is an incomplete change.
4. **Check the class namespace before you name anything.** R15's `.mb-cat-card` collided with
   `AiCatalogCard`'s and rendered the part cards malformed. Grep the whole stylesheet first.
5. **Every colour on a dark surface must be checked for contrast.** Two separate rounds shipped
   dark-text-on-dark (invisible H2, invisible price). Compute the ratio; the light-band muted token
   fails on dark.
6. **`next/image`, never raw `<img>`.** And re-encode source assets — don't drop 670 KB 1024² JPGs
   for 300px cards.
7. **No `as any`, no `TODO`, no hardcoded user-facing strings.** All three shipped in raw R15.
8. **Every animation gets a reduced-motion gate** — including CSS-only ones. The scan line is live
   proof this gets missed.
9. **Commit your work on a branch.** R15 arrived as an uncommitted working tree layered on production
   main, with no ledger. Branch → commit → push → preview.
10. **Handbacks describe your own git diff only** — no inflated claims, no certifying work you didn't
    do (standing rule since the R7 round; R11's handback certified a GLB pipeline that doesn't exist).

---

## 8. Codebase map (verified)

```
src/app/            layout.tsx (Inter + Space Grotesk via next/font) · globals.css (37 tokens, 3 :root blocks)
                    page.tsx · why-mobeeli/ · team/ · investors/ · early-adopters/ · join/ · deck/ · deck-admin/
                    api/{waitlist,notify,deck-request,deck-file}/route.ts · sitemap.ts · robots.ts · opengraph-image.tsx
src/components/landing/   LandingView.tsx (band order) · Nav · Hero · HeroRotator · FitmentSection (R15 catalog)
                    ProblemSection · UnifyBand · AiCatalogCard · BuyerStrip · Footer · WhyMobeeli
                    AnalogDeathSpiral · ProofBar · ProblemStats · SearchComparison · TeamSection · Investors
                    EarlyAdopters · SectionPage · SkipLink · ActiveSectionProvider · HeroNetworkBackground (SVG)
                    landing.css  ← 2,691 lines / 62 KB, ALL landing + section-page styles
src/components/three/     AmbientAurora.tsx · IndoGlobe.tsx · indoMap.ts · indo-globe.css   (FitmentWheel is GONE)
src/lib/hooks/      useReducedMotion (central gate) · useScrollReveal · useGlowCards · useMagneticCTA
                    useOverlaySolid · useTilt (DEAD — no consumers)
src/lib/i18n/       copy.ts (279 keys × EN/ID, parity compile-enforced) · rotation.ts (hero H1 pairs)
tests/              41 files — node env only, no jsdom, no Playwright
```

**Two traps that have bitten before:** (a) `useScrollReveal` leaves an inline `transform: none` on
`[data-rev]` elements, so a stylesheet transform on one is permanently dead — put it on a child.
(b) `landing.css` is imported by `LandingView`, `SectionPage` **and** `JoinView`, so a "landing" rule
ships on `/join` too.

---

## 9. Environment quirks (will cost you hours otherwise)

- **The dev server is mis-rooted.** A stray `C:\Users\user\package-lock.json` makes Next infer the
  wrong workspace root; symptoms are `GET / 404` and a "multiple lockfiles" warning. Run `next dev`
  **from the project directory**, or pin `turbopack.root`. Worth fixing permanently.
- **Stale `next-server` processes survive** Git-Bash `pkill` on Windows and cause "Another next dev
  server is already running" plus ghost servers that serve the *wrong* content to test runners.
  Kill them via PowerShell `Get-CimInstance Win32_Process`.
- **The in-app browser pane is usually hidden**, so screenshots fail and rAF/IntersectionObserver
  never fire — WebGL/scroll behaviour cannot be verified there. Verify by construction + tests, or
  use headless Playwright.
- `networkidle` never settles under Next dev (HMR socket) — use `domcontentloaded` + explicit
  selector waits.

---

## 10. Suggested next rounds

**Round A — design (Claude Design owns):** band-2 hierarchy + type scale · one-catalog decision ·
unified `.mb-glass` primitive · the scan as designed feedback · protection story placement ·
aurora as one system · ids for the unnamed bands. *(§4 in full.)*

**Round B — integrity cleanup (Gemini, tightly specced):** fix the R13 test to pin live selectors →
delete the ~217 dead CSS lines → delete the 27 orphaned copy keys → re-encode the images → delete the
2.57 MB dead assets. Each step gated.

**Round C — coverage:** add jsdom for a `tests/dom/**` project and cover the garage flow; **commit
the Playwright suite** (`playwright.config.ts` + `e2e/` + `test:e2e`).

**Round D — go-live hardening:** Node pin · env schema + health endpoint · security headers + CSP ·
`error.tsx`/`not-found.tsx`/`global-error.tsx` · deck-secret-in-URL fix · then the founder-only
external steps (rotate `RESEND_API_KEY`, add `company.mobeeli.com` + DNS, Resend SPF/DKIM/DMARC,
Search Console, real WhatsApp number).

---

## 11. Founder Run-button merge protocol (exact)

You cannot merge to `main` — that is the founder's approval gate, by design.

1. Work on a branch, gate green, push → Vercel preview (SSO-protected; the founder views it).
2. Check out `main`, `git pull --ff-only`, confirm a clean merge.
3. Present **one `git` command per fenced ```bash block, NEVER `&&`** — the founder's Run buttons
   execute in **PowerShell 5.1**, where `&&` is a parse error and the button silently no-ops.
4. He clicks merge, then push. Production deploys on the push.
5. Verify: `gh api repos/piztanza/mobeeli-landing-page/deployments` → `success`, then smoke-test the
   live URL.

---

## 12. Documentation status — what to trust

**This file (v2) is the only current design brief.** The audit found **no root doc documented R14/R15**
before this rewrite.

- ✅ **Trust:** `CLAUDE.md` (binding rules — verified clean against source, except its font sentence,
  which still says Plus Jakarta Sans is the type system; it is Inter + Space Grotesk),
  `HANDBACK_LANDING_VISUAL_POLISH_REPLY.md` (standing audit rulings), `HANDOFF.md` (ops half only —
  its commit pin is stale).
- ⚠️ **Historical — do not action:** `HANDOFF_LANDING_REDESIGN.md` (still mandates the superseded
  "Early Adaptors" spelling), `HANDOFF_GEMINI_*`, `HANDBACK_GEMINI_*`. Nine of these still describe a
  standalone How-it-works band; seven still name `FitmentWheel`. `HANDBACK_GEMINI_SCANNER_R11.md`
  certifies a GLB pipeline that is **100% absent from disk**. `README.md` is wrong about the API
  surface (says 1 route, there are 4) and the fonts.
- 🚫 **v1 of this file** claimed production `9274c94`, "44 files / 325 tests", a 3D-wheel band order,
  live `FitmentWheel.tsx`/`HowItWorks.tsx`, and ranked the aurora as the #1 unbuilt item. All false.

---

*Loop owner: the founder. Auditor/engineer: Fable (Claude). Every visual change is founder-gated on a
Vercel preview before production. Keep the bar where he set it — better than a human designer, and
nothing that reads like AI.*
