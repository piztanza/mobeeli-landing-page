# HANDBACK / COMMISSION — R30: design the /contact page (it is NOT a sign-up)

**To:** Claude Design
**From:** Claude Code, at the founder's direction (2026-07-29 23:21)
**Verified against:** `main` @ `90e9b0d`, live in production.

---

## 1. What exists today (your starting point, not your ceiling)

/contact shipped tonight as a **functional placeholder** so the founder could stop
listing raw emails on /investors. Current state, live:

- SectionPage route on the dark investor-card surface (`.mb-inv-card` — the same
  panel /investors and /careers use).
- Content: kicker "Contact" → H2 "Talk to Mobeeli." → one line ("Partnerships,
  press, shops, investors — one address reaches the whole founding team.") →
  primary `mailto:info@mobeeli.com` button → "Or write to a founder directly:" →
  the three F-009 inboxes (`matheau@`, `hafizh@`, `ferdi@mobeeli.com`).
- Inbound links: /investors ("Prefer a direct line?" → Contact Mobeeli) and the
  footer's COMPANY column. It is NOT in the top nav (five links stays the rule).
- Keys: `nav_contact`, `contact_kicker/h2/p/direct` + `inv_or`/`inv_contact_link`
  — all DRAFT, EN+ID.

**The commission: design this page properly.** Placeholder copy and layout are
yours to replace; the founder rules wording as always.

## 2. The one boundary that defines this page

**Contact is separate from sign-up.** The founder was explicit. Concretely:

- **/join is the sign-up** — the shop waitlist wizard: a conversion flow with a
  form that writes to the platform database. That job stays there, whole.
- **/contact is for talking to Mobeeli** — press, partnerships, suppliers,
  investors who want a human, anyone the waitlist doesn't fit.
- Therefore, on /contact: **no waitlist form, no lead capture, no "join" framing,
  no CTA that competes with /join.** A quiet cross-link ("a shop looking to join?
  → Early Adopters") is fine as an exit ramp; it must read as a redirect, not as
  this page's purpose.
- If your design calls for a **message form** instead of mailto links, flag it as
  a decision, not a default: it needs a new send channel (Resend exists in the
  stack for deck mail), a spam strategy, and founder sign-off — the waitlist
  table is insert-only for /join and will NOT take contact messages. Mailto-first
  is the zero-engineering baseline; design so the page works with either.

## 3. Real facts you can design with (do not invent others)

- Channels that exist: `info@mobeeli.com` (public, in the footer since R-early),
  and the three approved founder inboxes above. **No phone. No street address** —
  the only place-fact is the fixed footer line "Mobeeli — Jakarta, Indonesia".
  No company LinkedIn URL has been supplied yet (open HANDOFF item) — leave a
  slot if you want one, marked pending.
- Audiences, in the founder's own single line: partnerships, press, shops,
  investors. Shops route to /join, investors to /investors — contact catches
  what those funnels don't.
- Response expectation: founders answer personally (same promise /join makes) —
  usable as a trust line if you want it, it is true.

## 4. System context — where this page sits visually

- The site now has two registers: the **light "ledger" language** you built in
  R28/R29 (ghost numerals, dot-grid plates, ink rules, #f5f7fa ground) and the
  **dark utility card** the three "talk to us" pages currently share.
- /contact is the page most likely to be visited from /team (people finder →
  contact) — R29's ledger is its natural neighbour. Whether contact joins the
  ledger family or stays a dark card is YOUR call; make it once, deliberately,
  and say which family /careers should follow so the utility pages stay one
  system.

## 5. Constraints (unchanged, binding)

No hype, no emoji · never the fee, never marketplace names · EN+ID for every
string (founder writes ID for anything sensitive — flag which) · palette law
(green = verified semantics only; indigo banned) · 10px floor · footer line
fixed · `useReducedMotion` gates all motion · contact content must stay honest:
no invented office, hours, phone, or response-time SLAs.

## 6. Protocol (per your own §5, now standard)

Ship the `.dc.html` + generated style contract with hooks · state translucency
per surface · state whether the spec is complete or partial · founder ruling →
mockup → prose. Rounds R28/R29 both went bundle → production in one pass; keep
the streak.

## 7. Deliverable

One designed /contact direction (variations welcome, founder picks), its style
contract, and the copy ledger with EN drafts. Route, wiring, tests and SEO are
already in place — I only need the design and values to build against.
