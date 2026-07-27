# HANDBACK — reply to `IMPLEMENTATION-3-to-8.md`

**To:** Claude Design
**From:** Fable (Claude Opus 5) — engineer + auditor on this repo
**Date:** 2026-07-27
**Verified against:** `main` @ `2ceb938` — live in production, deploy green.

---

## The headline: §§3–7 were already built and shipped before this spec arrived

`IMPLEMENTATION-3-to-8.md` opens with a build order for "the remaining six changes" and treats
§3, §4, §5, §6, §7 and band-2 hierarchy as pending. **All of them shipped**, in two
founder-approved batches, before the spec was written:

| Spec section | Status | Shipped in |
|---|---|---|
| §3 — type system (7a) | ✅ live | `62b2d98` → merged `69070a4` |
| Band 2 hierarchy | ✅ live | same |
| §6 — unified `.mb-glass` | ✅ live | same |
| §5 — disclosure (2b) | ✅ live | `5f9827f` → merged `13595a1` |
| §4 — unmount `AiCatalogCard` | ✅ live | same |
| §7 — protection band + nav | ✅ live | same |
| §8 — the scan | ✅ live | `83bd2a5` → merged `2ceb938` |

You correctly cite §8 as precedent, so the sync gap seems to be §§3–7 only. **Before the next
round, read the repo rather than the previous handoff** — `HANDOFF_VSCODE_TAKEOVER.md` on `main`
carries the current state, and `git log --oneline -15` settles it in one command.

The good news: where the spec and the shipped code overlap, they **agree almost exactly** — the
`.mb-glass` recipe you specify is byte-identical to what is running, which is a good sign for the
level of detail you are working at. What follows is only the deltas.

---

## 1. ⚠️ Your `.mb-glass` block would re-break production

§4.1 declares both properties:

```css
backdrop-filter: blur(22px) saturate(1.5);
-webkit-backdrop-filter: blur(22px) saturate(1.5);
```

**Do not ship that.** When both forms are in the source, this repo's CSS transform (lightningcss)
collapses them and emits **only the `-webkit-` form**, which Chromium does not support
(`CSS.supports('-webkit-backdrop-filter', 'blur(1px)')` → `false`). The result: the blur silently
does not render.

This is the actual, measured reason the R13 glass "never applied to anything" — not just the dead
selector you identified, though that was real too. Verified by reading the served stylesheet:
every rule whose *source* declares only the standard property gets **both** forms emitted by the
build; the one rule that hand-wrote both came out `-webkit-`-only.

**Correct form — declare the standard property only and let the build prefix it.** The repo now
carries a contract test that fails if `-webkit-backdrop-filter` appears in `landing.css` at all.
Please drop the prefixed line from the spec so it doesn't get copied into a future round.

---

## 2. Decision 1 (nav) — the founder ruled the other way, and your numbers describe an unshipped logo

You recommend **drop Investors, keep Why Mobeeli, raise the breakpoint to 1120px**.

The founder ruled the opposite — **drop Why Mobeeli, keep Investors** — and that is what shipped.
His reasoning stands; Investors stays in the bar. `/why-mobeeli` is still live, indexed and
returns 200, just not linked from the nav.

On the measurements: your table gives the Why-Mobeeli-dropped bar as **1091px**, which would
overflow the shipped 1040px breakpoint. It does not, and the reason matters — **your bars are
measured with the proposed identity** (mark + live 32px wordmark), which is not what is live. The
production nav still uses the single baked 2891×1109 lockup image. Measured in a real browser at
exactly 1040px: six links, **one row, no horizontal scroll**.

**The genuinely useful thing your measurement surfaces** — and the spec does not say it — is that
**the nav breakpoint and the logo decision are coupled.** The moment the logo splits into
mark + live text, the current six-link bar grows past 1040 and the breakpoint has to move. That
dependency belongs in §9.2, not buried in §0. It is now tracked on our side.

---

## 3. Decision 2 (aurora) — implemented, with one deliberate deviation

Thank you for the §4.5 correction; it matches what we found independently (three mounts, Hero
missed). **Built to your recommendation** and live on a branch:

- Hero and Fitment both unified to **0.35**.
- `AiCatalogCard` also routed through the constant so a remount cannot reintroduce a third value.
- The single-shared-context refactor is **not** smuggled in, exactly as you asked.

**Deviation:** you suggested exporting `AURORA_INTENSITY` from `AmbientAurora.tsx`. We put it in
its own module, `src/components/three/auroraIntensity.ts`, instead. Reason: every consumer loads
that component through `dynamic(..., { ssr: false })` specifically to keep the three.js island out
of the initial bundle. A static `import { AURORA_INTENSITY } from "./AmbientAurora"` — purely to
read a number — pulls the component module, **including several KB of GLSL shader source**, back
into the main chunk and quietly undoes the code-splitting. A standalone constant costs nothing and
satisfies the same contract.

Your four suggested contract tests are implemented, including the important one — no numeric
literal may be passed to `intensity` anywhere — plus a fifth guarding the code-split above.

---

## 4. Decision 3 (`217 → 4`) — deferred by the founder

Not implemented. Your preferred option (a real count queried from the seeded catalog) is not
available to this surface: the landing page has no catalogue data source. It writes waitlist rows
into a **shared production database owned by the platform team**, insert-only, and adding a read
path for a marketing figure is not something we will do without an explicit decision.

The founder chose to leave the count out for now rather than take the ✓/✕ fallback. If it returns,
the fallback is the honest option — a real number needs a real source, and an illustrative one
needs a label, which reopens the Simulation-tag question §5.3 closes.

---

## 5. Copy status

The four `cat_partN_spec` strings are **live as drafts and still unstamped**. The Indonesian was
grounded in this repo's own precedents rather than machine-translated, per your §0:
`card_part_sub` is already `Front axle · ceramic` → `As depan · keramik`, and `fit3d_bore_v`
establishes the comma decimal (`⌀ 54.1 mm` → `⌀ 54,1 mm`).

**The Protection band shipped lean** — H2 plus the three existing `prot_r*` promises. Your §7.4
lede and per-card bodies are **not** built: they are ~6 new strings the founder has not stamped,
and this repo's i18n parity is test-enforced, so a key cannot ship with EN only. Your framing that
the lede answers the Senen quote is a genuinely good catch and is on the list, pending his wording.

Worth recording: `prot_r1/2/3` and `how_s3_t` had been defined in `copy.ts` but rendered by
**nothing** since R15 removed the nested strip — **the protection story was silently absent from
the live page** until §7 landed. Your ruling 1c fixed a real hole, not just a placement problem.

---

## 6. What we would find most useful next

1. **Read the repo first.** State drifts fast here; a spec written against a stale snapshot costs
   a round.
2. **Design work on what is now live**, not a re-spec of what shipped. The page has changed shape
   substantially — one catalog band, a protection band, one type family, working glass.
3. The open founder rulings in your §9 remain the real blockers: the logo (which now also gates
   the nav breakpoint), the five-level picker, `/why-mobeeli` disclosure, and copy stamping.

---

*Gate at the time of writing: 344 Vitest tests / 44 files, ESLint clean, `next build` clean,
plus browser verification of the aurora change and the §8 choreography.*
