# HANDOFF.md

Operational handover for the Mobeeli landing page. Written 2026-07-23, as of `main` @
`af12792` (36 merged PRs; tests, build, and lint all clean).

Read `CLAUDE.md` first — it contains the hard rules (no DDL on the shared DB, binding
copy rules, git-author requirement). This document covers everything else.

## Current state

- **Production is LIVE** at https://mobeeli-landing-page.vercel.app — full funnel
  verified 2026-07-22 end-to-end, including the DB insert and the alert email.
- Vercel project `prj_7OCeLwe5K7Fat9wNYukciBORzC2S` on team
  `team_fy7nIFHlZCpTGUaluClNo1uk`, git-integrated to
  `piztanza/mobeeli-landing-page`. Push to `main` → production deploy; push to any
  branch → preview deploy.
- Local dev: `npm ci`, copy `.env.example` → `.env.local`, `npm run dev`. With
  `DATABASE_URL` unset, waitlist leads append to `.data/waitlist-leads.jsonl` instead of
  the DB — safe for local testing.

## Environment variables

All set in Vercel (pull with `vercel env pull` once you have team access). Never commit
them.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for SEO metadata. Should become `https://company.mobeeli.com` when the domain is connected. |
| `DATABASE_URL` | Neon Postgres — the platform's **live shared** DB (see CLAUDE.md rule 1). |
| `RESEND_API_KEY` | Resend key for alert emails + audience contacts. **Should be rotated** — the current key was once pasted in a chat. |
| `WAITLIST_ALERT_TO` | Founding-team inbox (@mobeeli.com) for lead/deck-request alerts. |
| `RESEND_AUDIENCE_ID` | `311b0b83-fb99-40a8-bcf1-36b1b79a929a` — the dedicated **Buyers** audience (see Resend notes). |
| `DECK_SECRET` | Gates `/deck-admin` and HMAC-signs `/deck?token=…` links. Rotating it kills all outstanding links. |
| `NOTION_TOKEN` | Optional. Internal-integration secret used to mirror inbound leads into Notion. Unset → logging is skipped, email/Resend unaffected. |
| `NOTION_DECK_DB_ID` | Optional. Id of the Notion **Deck Requests** database (`f609475a65e340118e320dbaf48b4524`). |
| `NOTION_BUYERS_DB_ID` | Optional. Id of the Notion **Buyer Signups** database (`f9130622595e4dcdaa049f97ce1b1768`). |

## Immediate next steps

1. **Merge `chore/spec-sync-CHG-piztanza-19`** (open PR branch, one commit ahead of
   main, touching only `.ba`/`ba-link` metadata). Every pipeline change leaves one of
   these spec-sync PRs; this is the last unmerged one.
2. **Accessibility pass**: add a proper `:focus-visible` system and a skip-to-content
   link. Follow the repo's own conventions — i18n-only strings, `useReducedMotion`
   gating, strict TS.
3. Note: `npm run lint` is already clean on `main` — any lint warnings you were told
   about came from uncommitted local work, not the repo.

## Outstanding work (in rough priority order)

- **Domain**: connect `company.mobeeli.com` (subdomain — a `/company` base-path approach
  was tried and deliberately discarded) to this Vercel project. Bare `mobeeli.com`
  temporarily redirects to it via a Vercel domain-level redirect; it will later point at
  the platform (which is moving to GCP — the subdomain avoids cross-cloud proxying).
  Then set `NEXT_PUBLIC_SITE_URL=https://company.mobeeli.com`.
- **Google Search Console**: verify after the domain is connected.
- **Resend domain verification** for `mobeeli.com` → branded sender address.
- **Rotate `RESEND_API_KEY`** (see table above).
- **Replace the placeholder WhatsApp number** (`6281234567890`) wherever it appears.
- **Yavet's photo + LinkedIn URL** (LinkedIn also goes into the JSON-LD `sameAs`).
- Cosmetic: the Jakarta map label clips at the left edge on phones.

## Resend specifics (easy to get wrong)

- The account has **two** audiences: General and **Buyers**. The new Resend UI tends to
  show only one — the second exists; don't assume it doesn't.
- Buyer "get notified" signups (`/api/notify`) go to the Buyers audience
  (`RESEND_AUDIENCE_ID`), tagged with contact property `source=buyer_launch` — that's
  what the "Buyers" segment filters on.
- Audience **custom properties must be defined on the audience** before contacts can
  carry them. `source` (Text) is already defined on Buyers; define any new property in
  the Resend UI first or the tag silently won't stick.
- If `RESEND_AUDIENCE_ID` is unset, `/api/notify` auto-discovers — but that requires
  exactly one audience on the account, which is no longer true. Keep the env var set.
- Every signup is also mirrored into the Notion **Buyer Signups** database (Mobeeli
  Company OS → Databases), whose **Mailing list** column records whether Resend actually
  took the address. The *Needs manual add* view is the list of buyers who would otherwise
  silently miss the launch email — work it to empty. `/api/notify` now returns a
  retriable 500 only when the audience, the fallback email **and** Notion all failed.
- **There is no per-signup alert email, by design** (founder decision 2026-08-01). The
  "Mobeeli Buyer Notify" mail is an *alarm*: it sends only when the contact create fails
  and someone has to add the buyer by hand. A quiet inbox means every address went
  straight onto the list. The signup list to read is the Notion *Inbox — new* view, not
  your mail. (Deck requests are the opposite — those alert on every request, because the
  volume is low and each one needs a human reply.)

## Deck flow (investor deck)

Investor form → alert email with a single **Generate Deck Link** button → `/deck-admin`
(gated by `DECK_SECRET` via `?key=…`, durations chosen there) → mints an HMAC-signed
stateless `/deck?token=…` viewer link. The PDF lives in `private/deck/` — intentionally
not in `public/`.

Every accepted request is also written to the Notion **Deck Requests** database
(Fundraise teamspace → *Fundraise — founders only*), one row per request: name, firm,
email, message, LinkedIn, receipt time, site language, edge country, email domain and a
work-vs-free mailbox flag. `Status` starts at **New**; `Deck link sent`, `Link expires`,
`Owner`, `Investor` (relation into the Investors CRM) and `Notes` are filled in by hand.
The alert email links straight to the row.

Logging is **best-effort**: if Notion is down, the token is wrong or the database was
never shared with the integration, the request still succeeds and the alert email says
`NOT LOGGED TO NOTION — <reason>`, so nothing is lost. To (re-)connect it:

1. https://www.notion.so/profile/integrations → **New internal integration** in the
   Mobeeli workspace, capability *Insert content*; copy the secret.
2. Open the **Deck Requests** database → `···` → **Connections** → add that integration.
   Without this step Notion answers 404 to every write.
3. Set `NOTION_TOKEN` and `NOTION_DECK_DB_ID` in Vercel (all environments) and redeploy.

## Database contract (summary — full rule in CLAUDE.md)

`/api/waitlist` inserts into the platform's existing `partner_signups` table, mirroring
the platform's own `/api/partners/signup` contract: uppercase `partnerType` enum,
`contactPhone`, `currentToolsUsed`/`brandsCarried` arrays, `_honeypot` field,
whitelisted values; the insert generates `id` (uuid) and `updatedAt`;
`source='LANDING_MOBEELI_COM'`. Zod schema in `src/lib/waitlist`, Drizzle model in
`src/lib/db`. **Insert-only. No DDL. Ever.**

## Build-pipeline history (context, not action items)

The site was built via Mobeeli's internal MCP pipeline in changes CHG-01 … CHG-19
(landing sections, FitmentWheel + IndoGlobe three.js islands, catalog animation,
wizard + backend, SEO + JSON-LD, platform DB integration, section pages, responsive +
hamburger + headshots, deck flow, buyer notify, scroll/nav polish, cross-device visual
fixes). `.ba/` holds the spec artifacts; they'll drift from manual edits — expected. If
the pipeline is ever resumed, it needs a reconcile pass first.

## Contacts

- Repo owner / previous operator: `piztanza` (GitHub) — CTO.
- Alert inbox: the `@mobeeli.com` address configured in `WAITLIST_ALERT_TO`.
