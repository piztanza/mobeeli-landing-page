# HANDOFF_VSCODE_TAKEOVER.md — take over the Mobeeli landing page

**For:** Claude running in VS Code, in this repo, picking up where the previous session stopped.
**From:** Fable (Claude Opus 5), engineer + auditor on this repo.
**Written:** 2026-07-26 · **Verified against:** `main` @ **`13595a1`** — live in production, deploy green.

Read this whole file before touching anything. It is written so you need no other context.

---

## 0. The 60-second version

| | |
|---|---|
| **Repo** | `piztanza/mobeeli-landing-page` (private). Local: `C:\Users\user\.gemini\antigravity\PROJECTS\mobeeli-landing-page` |
| **Production** | `main` @ `13595a1` → https://mobeeli-landing-page.vercel.app (will move to `company.mobeeli.com`) |
| **Gate right now** | **323 Vitest tests / 43 files**, ESLint clean, `next build` clean, Playwright E2E 54/54 |
| **What just finished** | Rounds R15 → R16 batch 2, all merged and live |
| **The ONE piece of design work left** | R16 **§8 — the scan choreography** (fully specified; see §6) |
| **You cannot** | merge to `main` yourself — the founder clicks the merge (see §8) |

---

## 1. What this product is

Mobeeli is a pre-launch **auto-parts marketplace for Indonesia** — "trust infrastructure" that
verifies a part fits a buyer's exact vehicle before checkout. This repo is the **investor-facing
marketing site** during an active fundraise. Every design decision is judged by: *does a sharp
investor read this as a serious, well-made company?*

**Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Vitest 4,
three.js client islands (`dynamic ssr:false`). **No Tailwind** — a hand-authored CSS design
system in `src/components/landing/landing.css` (~2,700 lines). **No framer-motion.**
Local toolchain observed: Node **v25.2.1**, npm **11.6.2** (note: no version is pinned in the
repo — see §7).

**Two product constraints that shape everything:**
- **Moat protection.** The founder deliberately keeps the front page **broad**. The real
  ET/PCD/offset fitment mechanics are the moat and stay off `/` ("easily copyable with AI").
- **"Look less like AI."** The founder's most-repeated note across every round.

---

## 2. The page as it exists right now

Band order on `/` (`src/components/landing/LandingView.tsx`) — every band has an `id`:

| # | Band | Component | `id` | Surface |
|---|---|---|---|---|
| 1 | Hero (rotating H1, full viewport) | `Hero` + `HeroRotator` | `top` | dark |
| 2 | **Unified catalog** | `FitmentSection` | `how-it-works` | dark |
| 3 | Problem (Senen quote) | `ProblemSection` | `problem` | light |
| 4 | Coverage (archipelago WebGL map) | `UnifyBand` | `coverage` | dark |
| 5 | **Protection** | `ProtectionSection` | `protection` | light |
| 6 | Buyer strip (inline email capture) | `BuyerStrip` | `waitlist` | tint |
| 7 | Footer | `Footer` | — | dark |

**Band 2 is the heart of the page.** A vehicle picker (4 selects: Year/Make/Model/Trim, plus a
plate/VIN field) that persists a vehicle to `localStorage["mobeeli_garage"]`, runs an 1800ms
"scan", then shows 4 part cards with **fitment specs** and a "Verified Fit" badge.

**Other routes:** `/why-mobeeli` (data page — still live and indexed, just no longer in the nav),
`/team`, `/investors`, `/early-adopters`, `/join` (waitlist wizard), `/deck` + `/deck-admin`
(HMAC/secret-gated).

**Things that NO LONGER EXIST** — do not try to style or fix them; earlier docs may mention them:
the 3D fitment wheel (`FitmentWheel`), `HowItWorks.tsx`, the funnel simulator, the GarageOS
scanner, the 2D DOM scanner, the simulated stat tiles.

**`AiCatalogCard` is unmounted, NOT dead.** It is deliberately kept in the repo (founder may put
it on `/why-mobeeli` or in the deck). Its header comment says so. **Do not delete it** as orphaned,
and do not delete its CSS (`.mb-cat-section`, `.mb-cat-card`, `.mb-cat-stage`, `.mb-sprite*`,
`.mb-cat-pill`, `.mb-file-chip*`, `.mb-ai-chip*`, `.mb-cat-h2`, `.mb-cat-p`).

---

## 3. Locked contracts — a change that violates any of these is INVALID

Enforced by tests and `CLAUDE.md`. Treat them as compile errors.

1. **DB is insert-only on a SHARED production Neon Postgres.** NEVER run DDL, migrations, or
   `drizzle-kit push`. The landing app only INSERTs waitlist leads into a table the *platform*
   owns. A schema change is a hard stop — escalate, do not execute.
2. **i18n.** ALL user-facing strings live in `src/lib/i18n/copy.ts` as **EN + ID** maps.
   **Parity is test-enforced — you cannot ship a key with only one language.** Never hardcode
   copy in a component.
3. **Brand.** "Mobeeli" is the only brand name. Never "Mobilee" or "Carteria" in copy (the
   `mobilee-demo.vercel.app` nav URL is the literal domain, not a brand error). Spelling is
   "Early Adopters". Footer is exactly `Mobeeli — Jakarta, Indonesia`.
4. **Honesty.** Never state the fee/commission. Never name real marketplaces. No real
   manufacturer names as partners. No emoji, no hype. The strings `REAL-TIME` and anything
   matching `/guarantee/i` are **vetoed**. Every number is real or labelled
   "(Simulation)"/"(Simulasi)". **The fix for a fabricated figure is removal, not a label.**
5. **Colour.** Emerald/indigo/green are banned — `#10b981` / `#34d399` / `#818cf8` must never
   appear. Success/verified semantics use the BLUE family (`--mb-light-accent`). Red
   (`--mb-danger`, `--mb-danger-on-dark`) is pain-stats/errors only. Hex tokens are locked to
   `.ba/design/style.json` — **do not "convert to OKLCH"**.
6. **Type is ONE family** (founder ruling 7a): self-hosted **Plus Jakarta Sans** variable
   (200–800). `--mb-font-text` and `--mb-font-display` both point at `--mb-font`. Headings are
   **800**. Do NOT reintroduce `next/font`, Inter, or Space Grotesk. Do not add a Google Fonts
   `<link>` (self-hosting is required).
7. **Motion.** Everything gated by `useReducedMotion` or a `prefers-reduced-motion` media
   query. three.js scenes stay `dynamic({ ssr:false })`. **No new dependencies** — no
   framer-motion, no Lenis (founder-gated). Motion is the rAF-writes-a-CSS-var idiom
   (`src/lib/hooks/`).
8. **`:focus-visible`** is canonical: `outline: 2px solid var(--mb-focus-ring); outline-offset: 2px`.
   Nothing may stack onto it. Never animate the ring.
9. **Tokens.** `.ba/` and the `globals.css` `:root` *contract* block are additive-only.
   Code-level tokens go in the **separate** `:root`, never inside the contract block.
10. **Every new visual guarantee ships with a test.** NEVER delete a contract test to get a
    green suite. If a contract genuinely changed by founder ruling, UPDATE the assertion and
    say so in the commit.
11. **Commit author must be** `78766430+piztanza@users.noreply.github.com` (already set in
    repo-local git config — don't override). **Vercel blocks other authors.**
12. **Pushing `main` = production.** Work on a branch. **Never merge to main yourself** (§8).
13. **Windows CRLF** — never reformat whole files; keep edits surgical.

---

## 4. Everything the previous session did (chronological)

### R15 salvage — the catalog
Gemini left a "unified catalog" rework **uncommitted in the working tree**, green only because it
had **deleted 7 contract test files** (336 → 296 tests). It was checkpointed verbatim
(`484687d`, marked DO NOT MERGE) then salvaged:
- **Class collision:** its part cards reused `.mb-cat-card`/`.mb-cat-h2`, which `AiCatalogCard`
  also owns (its `.mb-cat-card` is a 560px section container that was clobbering the small
  cards) → renamed to `.mb-ucat-card` / `.mb-ucat-h2`.
- **Contrast:** `.mb-cat-stat-l` / `.mb-cat-card-brand` / `.mb-sim-tag` were `--mb-muted`
  (~3.5:1 on dark) → `--mb-dark-muted` (8.7:1).
- Raw `<img>` on 500–670 KB JPEGs → `next/image`. Removed `as any` casts. Moved 2 hardcoded
  strings into `copy.ts`. Replaced the thin green-by-deletion test with a real contract.

### A live production bug fixed before R16
The merged second section had shipped **dark text on a dark surface**: the H2 and part-card price
computed **1.0:1 (invisible)**, and the scanner frame had collapsed to a 40px sliver. Fixed and
pinned.

### R16 batch 1 (from Claude Design's brief, `design_handoff_r16_landing/`)
Verified every one of the brief's claims against source first. Both bugs it reported were real:
- **Bug A:** `.is-scanning` was applied by the component but appeared **zero times** in
  `landing.css`, while `.mb-cat-scan-line` ran `animation: … 1.5s infinite` unconditionally.
  The "scan" was permanent idle motion. → gated behind `.is-scanning`, one pass, then stops.
- **Bug B:** that infinite animation had **no reduced-motion gate at all**. → gated.
- **Timing:** CSS said 1.5s, the `setTimeout` said 1800ms, so the sweep was cut off mid-pass.
  → extracted `SCAN_DURATION_MS` from `FitmentSection.tsx`; a contract test binds both sides.
- **Type system (7a):** 3 families → 1 (see contract 6). Headings 600 → 800.
  ⚠️ **The class rules had to move too** — `.mb-h2` etc. out-specify the `h1,h2,h3` rule, so
  editing globals alone would have left every band heading at 600.
- **Hierarchy:** `.mb-ucat-h2` had `font-size: 28px`, overriding `.mb-h2`'s
  `clamp(38px, 4.8vw, 64px)` — band 2's heading rendered **smaller on desktop than on a phone**.
- **Disclosure (2b):** simulated stat tiles removed — markup, 4 CSS rules, 6 copy keys.
- **Glass:** one `.mb-glass` primitive replaced three divergent recipes.

### R16 batch 2
- **Fitment specs replaced simulated prices.** No `Rp` figure anywhere on the page now.
- **`AiCatalogCard` unmounted** from `/` (ruling 1a) — kept in repo.
- **Protection band built** (ruling 1c). Discovered while doing it: `prot_r1/2/3` and `how_s3_t`
  were defined in copy but **rendered by nothing** since R15 removed the nested strip — the
  protection story had silently vanished from the live page.
- **Nav:** a 7th link would not fit the 1040px breakpoint. **Founder ruling: drop "Why Mobeeli"
  from the bar, NOT Investors** (the brief recommended dropping Investors — overruled).
  `/why-mobeeli` still returns 200.
- **Section ids** `coverage` + `waitlist` added.

### Two bugs found that were nobody's assignment
1. **`backdrop-filter` was silently dead.** Hand-writing BOTH `backdrop-filter` and
   `-webkit-backdrop-filter` makes the CSS transform (lightningcss) collapse them and emit
   **only the `-webkit-` form**, which Chromium does not support (`CSS.supports` → false). So the
   blur never rendered — this is why "the R13 glass never applied." **Declare the standard
   property ONLY and let the build prefix it.** A test now forbids the manual prefix.
2. **A test that passed while its feature was broken.** `r13-glass.test.tsx` asserted that
   `.mb-fit3d .mb-cat-card` *existed in the CSS* — it did, and it matched nothing in the DOM.
   Rewritten to check the rule **AND** that a component really applies the class. **Copy this
   pattern:** a selector contract that never touches markup proves nothing.

---

## 5. Verification tooling (now committed — use it)

`npm test` / `npm run lint` / `npm run build` are the standard gate. Beyond that, two Playwright
suites are committed at **`tests/e2e/`** (they were previously only in a scratch dir):

- **`tests/e2e/e2e_full.py`** — 54 checks: all 6 routes (content, no h-scroll, no console/page
  errors), redirects, **deck security gating**, the full catalog+garage flow, mobile nav, EN/ID
  toggle, buyer capture validation, API input validation, a11y basics.
- **`tests/e2e/verify_r16.py`** — 25 checks specific to R16: one type family, only PJS fonts
  load, band-2 hierarchy, glass really blurs, scan gating at rest / during / after, reduced-motion.

**Setup (one-time):** `python -m pip install playwright` then `python -m playwright install chromium`.

**How to run** (both expect a dev server on **port 4400**):
```bash
npx next dev -p 4400
```
```bash
python tests/e2e/e2e_full.py
```
The API checks send **malformed payloads only** — they assert 4xx validation and never write to
the shared production DB. Keep it that way.

---

## 6. YOUR TASK: R16 §8 — the scan choreography

This is the only remaining piece of the design brief. Full spec:
**`design_handoff_r16_landing/README.md` §8**, and the visual reference is
**`design_handoff_r16_landing/R16 Scan Studio.dc.html`** (open in a browser; direction `4a` is
the chosen one and its timings are exact).

⚠️ **The `.dc.html` files are design REFERENCES. Never paste them into `src/`.** Reproduce what
they show using the repo's own patterns.

**Founder ruling 4a: clinical / diagnostic** — an instrument taking a measurement and reporting
it. Not a decorative sweep.

**Do NOT change the TypeScript timing.** `SCAN_DURATION_MS = 1800` in `FitmentSection.tsx` stays;
the design is built to it. A contract test (`tests/r16-scan-gating.test.ts`) asserts the CSS
duration equals that constant — keep them equal.

**Three phases of the 1800ms pass:**

| Phase | Window | What happens |
|---|---|---|
| Acquire | 0 – 216ms (0–12%) | Scan line fades in at the top of the frame |
| Traverse | 216 – 1314ms (12–73%) | Line travels 139px down the 140px frame, near-linear |
| Settle | 1314 – 1800ms (73–100%) | Line fades out; the locked readout holds |

**Three measurement callouts appear during the traverse** — each a 5px glowing dot, a 1px leader
line scaling out from it, and a value label fading in. Staggered so one value is read at a time:

| Callout | Dot | Leader | Value | Text |
|---|---|---|---|---|
| 1 | 500ms | 500ms | 550ms | `PCD 4 × 100` |
| 2 | 800ms | 800ms | 850ms | `⌀ 54.1 mm` |
| 3 | 1020ms | 1020ms | 1070ms | `offset ET 45` |
| Lock | — | — | 1300ms | `2019 Avanza 1.5 G · 2NR-VE` |

Durations: dot `300ms`, leader `450ms`, value `500ms`, lock `500ms`.
Easing for all four: `cubic-bezier(.2,.7,.2,1)`.
Callout labels: `10.5px / 600 / 0.05em / tabular-nums`. Lock readout:
`10px / 600 / 0.09em / uppercase / tabular-nums`.

Also specified: a measurement grid behind the vehicle image —
```css
.mb-cat-car-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(47,125,246,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(47,125,246,0.06) 1px, transparent 1px);
  background-size: 18px 18px;
}
```

**Hard requirements for your implementation:**
- **Every animation gated behind `.is-scanning`.** The current sweep already is — follow that
  pattern exactly. Nothing may animate at rest (that was Bug A).
- **Reduced motion shows the FINISHED reading** — all callouts and the lock visible immediately,
  no travel. Hiding the result would be wrong; the user must still get the information.
  Prefer the CSS media query over `useReducedMotion()` here: it is declarative and cannot
  desync from React state.
- **All four callout/lock strings are user-facing copy → they need EN+ID keys in `copy.ts`.**
  These are new strings the founder has not stamped. `PCD 4 × 100`, `⌀ 54.1 mm` and `ET 45` are
  technical tokens that barely change between languages, but **note the ID comma decimal
  precedent: `fit3d_bore_v` is `⌀ 54.1 mm` (EN) / `⌀ 54,1 mm` (ID)**. There are also existing
  keys you should reuse rather than duplicate: `fit3d_pcd_t/v`, `fit3d_bore_t/v`,
  `ymm_scanning`, `ymm_verified`. **Grep before creating.**
- **Ship a contract test** extending `tests/r16-scan-gating.test.ts`, and add browser checks to
  `tests/e2e/verify_r16.py`.

---

## 7. Everything else that is open

**Copy awaiting a founder stamp (LIVE NOW as drafts):** the four `cat_partN_spec` strings.
EN: `2NR-VE · 4 per set`, `manual · ⌀ 200 mm`, `rear · gas-filled · ET 45`,
`front axle · ceramic · 2NR-VE`. The ID was grounded in this file's own precedents
(`card_part_sub` → "As depan · keramik"; comma decimal) rather than invented. Not yet confirmed.

**The Protection band ships lean** — H2 + the 3 existing promises. The mockup's lede and
per-card paragraphs were NOT built because they need ~6 new founder-stamped strings. **No eyebrow
either: R8 retired the per-band kicker, so adding one back would contradict that ruling.**

**Founder decisions already made — do not re-litigate:**
- **Skip the 5th "engine" select.** Avoids a `mobeeli_garage` localStorage migration; the engine
  code still appears in the card specs. If it is ever added, version the key.
- Nav: drop Why Mobeeli, keep Investors.

**Still needing a founder ruling (do NOT guess):**
- The `217 → 4` filter count (brief §9.2) — not implemented; needs a real-or-illustrative call.
- The logo/wordmark direction (brief §9.4). ⚠️ **`design_handoff_r16_landing/assets/mobeeli-mark.png`
  DIFFERS from `public/assets/mobeeli-mark.png` (289KB vs 219KB). Do NOT copy it over** —
  `src/app/icon.tsx` and `apple-icon.tsx` generate the favicon and Apple touch icon from the
  repo's version.
- `/why-mobeeli` disclosure (it is public, indexed, and carries a seller-fee range).
- Where `AiCatalogCard` finally lives.
- **"Backed by insurance"** claim (open since R8) — is an insurer actually in place? If not, drop
  the clause from `early_f2_d` / `jw_ben2_s` in both languages.

**Go-live hardening — NOT started. This is what stands between "good site" and "launched":**
- No `error.tsx` / `not-found.tsx` / `global-error.tsx` anywhere.
- No security headers and no CSP (`next.config.ts` only has `redirects()`).
- No Node version pinned (`engines` / `.nvmrc` / `packageManager` all absent) — the #1
  "works locally, breaks on Vercel" risk.
- No env-var validation (zod 4.4.3 IS already a dep — reuse it, don't add anything).
- No rate limiting on `/api/waitlist` and `/api/notify` (would need a new dep → founder approval).
- `NEXT_PUBLIC_SITE_URL` is **build-time inlined**, so a `company.mobeeli.com` cutover needs a
  redeploy, plus DNS, Resend SPF/DKIM/DMARC, and Search Console.
- **Rotate `RESEND_API_KEY`** — it was once pasted into a chat, so treat it as compromised.
- Replace the placeholder WhatsApp number `6281234567890`.
- **Pre-existing `tsc --noEmit` error** in `tests/analog-deathspiral-port.test.tsx`
  (`Property 'lang' does not exist…`). It predates all this work. `npm run lint` is the repo's
  gate and is clean; `tsc` is not wired into it.
- Heavy source JPEGs (~500–670 KB) — `next/image` serves them optimised, but re-compressing to
  WebP is a real win.
- ~217 lines of dead CSS and ~27 orphaned copy keys accumulated across rounds.

---

## 8. THE MERGE PROTOCOL — read this before you try to ship

**You cannot merge to `main`.** The classifier blocks it, and that is by design: the merge is the
founder's approval gate. Your job is to prepare and verify; the human executes.

1. Work on a branch. Gate green: `npm test` → `npm run lint` → `npm run build` (add the
   Playwright suites for anything visual).
2. Push the branch → Vercel builds a **preview** (behind Vercel SSO; only the founder can view it).
3. Check out `main`, `git pull --ff-only`, confirm a clean merge
   (`git merge-tree --write-tree main <branch>`).
4. Present the merge as **founder Run-button blocks — ONE `git` command per fenced ```bash block,
   NEVER `&&`.** The buttons execute in **PowerShell 5.1**, where `&&` is a parse error and the
   button silently does nothing. This has bitten before.
5. After the founder clicks, verify: `gh api repos/piztanza/mobeeli-landing-page/deployments`
   → status `success`, then smoke-test the live domain (do not trust the deploy status alone).

---

## 9. Environment traps that will waste your time

These are all real and all cost the previous session time.

1. **The dev server is mis-rooted.** A stray `C:\Users\user\package-lock.json` makes Next pick
   the wrong workspace root; the symptom is `GET / 404` and a "multiple lockfiles" warning on
   every build. **Always run `next dev` from the project directory**, or pin `turbopack.root` in
   `next.config.ts` (a real fix worth doing).
2. **Stale `next-server` processes survive Git-Bash `pkill`.** They keep serving **wrong or old
   content** to test runners, and Next will refuse to start ("Another next dev server is already
   running"). Kill them from PowerShell:
   ```
   Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like '*next*dev*' -or $_.CommandLine -like '*next-server*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
   ```
3. **Background processes die between tool calls.** A `next dev &` started in one shell command
   will be gone by the next one. Start the server and run the tests **in the same command**.
4. **Console encoding.** Printing `⌀` (U+2300) from Python on this machine throws
   `UnicodeEncodeError` (cp1252). Use `PYTHONIOENCODING=utf-8`.
5. **`grep -c` returning 0 exits non-zero**, which silently short-circuits a `&&` chain — a test
   run can be skipped without you noticing.
6. **Your own comments will trip string-contains tests.** A CSS comment naming a selector, or a
   TS comment containing `as any` / `next/font`, will fail a `.not.toContain()` assertion. Either
   reword, or strip comments in the test:
   `css.replace(/\/\*[\s\S]*?\*\//g, "")`. This happened three times.
7. **The Vercel preview is auth-walled** — Playwright cannot reach it. Verify locally, and let the
   founder eyeball the preview.

---

## 10. Where things live

```
src/app/                  layout.tsx (metadata, JSON-LD — no webfont loading any more)
                          globals.css (token contract block + code-level tokens + a11y)
                          page.tsx · why-mobeeli/ · team/ · investors/ · early-adopters/
                          join/ · deck*/ · icon.tsx · apple-icon.tsx · sitemap.ts · api/*
src/components/landing/   LandingView.tsx (band order) · Nav.tsx · Hero.tsx · HeroRotator.tsx
                          FitmentSection.tsx (band 2 — the catalog; exports SCAN_DURATION_MS)
                          ProblemSection.tsx · UnifyBand.tsx · ProtectionSection.tsx
                          BuyerStrip.tsx · Footer.tsx · AiCatalogCard.tsx (UNMOUNTED, kept)
                          landing.css  ← the single stylesheet, ~2,700 lines
src/components/three/     AmbientAurora.tsx (WebGL backdrop) · IndoGlobe.tsx
src/lib/hooks/            useReducedMotion · useScrollReveal · useGlowCards · useTilt
                          useMagneticCTA · useOverlaySolid
src/lib/i18n/copy.ts      EN + ID maps — the ONLY place user-facing strings may live
tests/                    43 Vitest files (CSS asserted as regex contracts + SSR markup)
tests/e2e/                Playwright suites (see §5)
design_handoff_r16_landing/  Claude Design's R16 brief + .dc.html prototypes (REFERENCES ONLY;
                          excluded from eslint; its assets/ is gitignored as duplicates)
.ba/ , ba-link.json       pipeline metadata — never hand-edit or delete
```

**Docs to trust:** this file, `CLAUDE.md` (hard rules, canonical), `HANDOFF_CLAUDE_DESIGN.md`
**v2** (the design brief — v1 was wrong and is superseded), `design_handoff_r16_landing/README.md`
(the R16 spec), `HANDOFF.md` (ops).
**Docs that are historical fiction:** anything describing the 3D fitment wheel, the funnel
simulator, the GarageOS scanner, a standalone How-it-works band, or test counts below 323 — that
includes most `HANDOFF_GEMINI_*` and `HANDBACK_GEMINI_*` files. Read them as history, not state.

---

## 11. One known error in the R16 brief

`design_handoff_r16_landing/README.md` **§4.5 is wrong.** It says unmounting `AiCatalogCard`
leaves "only one `AmbientAurora`". There are **three** mounts — `Hero.tsx` (0.4),
`FitmentSection.tsx` (0.3), `AiCatalogCard.tsx` (0.28) — and it missed the Hero. With the catalog
card unmounted there are still **two** WebGL contexts (verified: two canvases in-browser), so its
diagnosis #6 is **not** resolved. If reducing WebGL contexts matters, that is still open work.

---

## 12. How the founder works — this matters

- **Terse and fast.** "OK go", "push it", "im ready go" mean proceed. He clicks the merge buttons.
- **Verify, don't assume.** He has been burned by agents claiming work was done when it wasn't.
  Check the source, run the gate, smoke-test the live site, and report failures plainly.
- **He rules on copy, brand, honesty, and business facts.** Never invent a metric, a testimonial,
  a partner name, or a claim. If a business fact is unknown (is there an insurer? what's the real
  WhatsApp number?), **ask — do not fill it in**.
- **He expects meticulous, single-threaded implementation.** His standing instruction for
  *implementation* is "use only 1 agent, work hyper meticulously." Fan-out is for analysis.
- **Deleting a test to make the suite green is the cardinal sin here.** It has happened twice
  (Gemini, R15) and both times it hid real bugs. Update assertions; explain why in the commit.

---

*Take over from `main` @ `13595a1`. The next concrete task is §6 (R16 §8, the scan
choreography). Gate everything, push a branch, and hand the founder Run-buttons — one git
command per block, no `&&`.*
