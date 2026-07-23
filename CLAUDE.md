# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

Mobeeli's pre-launch marketing site + partner waitlist — Next.js (App Router) + TypeScript,
deployed on Vercel. See `README.md` for the full structure and stack. Production:
https://mobeeli-landing-page.vercel.app (will move to https://company.mobeeli.com).

## Commands

```bash
npm run dev     # local dev server
npm run build   # production build
npm test        # Vitest suite
npm run lint    # ESLint (clean on main — keep it that way)
npm run format  # Prettier
```

## Hard rules — do not break these

### 1. Database: insert-only, NEVER run DDL

The waitlist writes into the Mobeeli **platform's live** Neon Postgres table
`partner_signups` — the same production database the platform uses. The Drizzle model in
`src/lib/db` *mirrors* that existing table; it does not own it.

- **NEVER** run migrations, `CREATE/ALTER/DROP`, or any schema change against this DB.
- Inserts only, always with `source = 'LANDING_MOBEELI_COM'`.
- If a schema change seems needed, stop and escalate to the founders — the platform team
  owns that table.

### 2. Copy rules (binding brand decisions — not suggestions)

- **Never** state Mobeeli's exact fee/commission anywhere.
- **Never** name specific marketplaces (e.g. Tokopedia, Shopee). Generic terms only.
- **"Early Adopters"** is the spelling since 2026-07-23 (founder decision, superseding the
  earlier intentional "Adaptors"); the route is /early-adopters with a permanent redirect
  from /early-adaptors.
- **"Mobeeli" is the only brand name** (founder ruling 2026-07-23). "Mobilee" (used
  throughout the platform repo overtakemg-cell/mobilee) and "Carteria" (a leftover from an
  earlier project) are both wrong — never introduce them here, and rename them to Mobeeli
  wherever user-facing text is touched in the platform repo.
- No hype language, no emoji, anywhere in user-facing copy.
- Footer is exactly: `Mobeeli — Jakarta, Indonesia`.
- **All** user-facing strings live in the EN/ID maps in `src/lib/i18n` — never hardcode
  copy in components. Every string needs both languages.

### 3. Motion & 3D

- All animation must respect `useReducedMotion` (`src/lib/hooks`) — the central gate.
- three.js scenes (`src/components/three`) are client-only islands: dynamic import with
  `ssr: false`. Keep them that way.

### 4. Git & deploy

- **Pushing to `main` deploys to production** (Vercel git integration). Work on branches;
  every branch push gets a preview deployment — verify there first.
- Commit author must be `78766430+piztanza@users.noreply.github.com` (already set in this
  repo's local git config — don't override it). **Vercel blocks deploys from other
  authors.**
- Never commit secrets. `.env` is gitignored; `.env.example` documents every variable.

### 5. Deck flow is security-sensitive

`/deck-admin` is gated by `DECK_SECRET` (`?key=…`); `/deck?token=…` links are
HMAC-signed and stateless; the PDF lives in `private/deck/` (deliberately outside
`public/`). Don't weaken the gating, move the PDF into `public/`, or log tokens.
Rotating `DECK_SECRET` invalidates every outstanding link.

### 6. `.ba/` and `ba-link.json` are pipeline metadata

This repo was built by Mobeeli's internal build pipeline (an MCP engine). `.ba/` and
`ba-link.json` are its spec/state artifacts. When working **without** the engine:
ignore them, don't hand-edit them, and don't delete them. Manual code changes will make
them drift from the code — that's expected and fine; the engine reconciles later if ever
resumed.

## Conventions

- TypeScript strict mode; keep `npm run lint` and `npm test` clean before committing.
- Match the existing code style (Prettier config in repo).
- Tests live in `tests/` (Vitest). Behavior changes to `/api/*` routes or `src/lib/*`
  should come with test updates.
- Fonts are self-hosted (Plus Jakarta Sans in `public/fonts`) — no external font CDNs.

## More context

`HANDOFF.md` has the full operational picture: environment variables, Vercel/DNS state,
Resend setup, known issues, and the outstanding work list.
