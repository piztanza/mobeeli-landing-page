# Mobeeli Landing Page

Pre-launch marketing site + waitlist for Mobeeli — Next.js (App Router) + TypeScript on Vercel.

## Stack

- **Next.js (App Router)** — static marketing pages, one API route (`/api/waitlist`)
- **TypeScript** (strict) · **ESLint** (next/core-web-vitals) · **Prettier**
- **three.js** — client-island 3D scenes (hero fitment wheel, Indonesia flyover map)
- **Drizzle + Neon Postgres** — waitlist lead persistence
- **Resend** — team notification emails
- **Vitest** — unit tests (`npm test`)

## Structure

```
src/app              routes: / (landing), /join (wizard), /api/waitlist (route handler)
src/components       section components per design band
src/components/three FitmentWheel, IndoGlobe — client-only islands (dynamic import, no SSR)
src/lib/i18n         EN/ID copy maps — the ONLY place user-facing strings live
src/lib/waitlist     zod payload schema for /api/waitlist
src/lib/db           drizzle model of the platform's live partner_signups + lazy Neon client (no DDL/migrations — insert-only)
src/lib/email        Resend notification (stub until F-008)
src/lib/hooks        useReducedMotion — central reduced-motion gate
public/assets        logos, part sprites, icons, unify-graph.mp4
public/fonts         self-hosted Plus Jakarta Sans (woff2)
tests                Vitest suites
```

## Commands

```bash
npm run dev     # local dev server
npm run build   # production build
npm test        # run the Vitest suite
npm run lint    # ESLint
```

## Environment

Copy `.env.example` → `.env.local`. Secrets (`DATABASE_URL`, `RESEND_API_KEY`) live only in
server-side env vars (Vercel), never in client bundles.

## Buyer "get notified" capture (F-015)

The buyer strip's CTA expands an inline email field posting to `/api/notify`. Addresses are
added as contacts to the account's single Resend Audience — `RESEND_AUDIENCE_ID` when set,
otherwise auto-discovered (requires exactly one audience; zero/multiple fall back to an alert
email to `WAITLIST_ALERT_TO` so no address is lost). Each contact is tagged with the contact
property **`source=buyer_launch`** — that property key/value is what the "Buyers" segment in
Resend filters on.
