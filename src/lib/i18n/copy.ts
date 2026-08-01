/**
 * i18n copy maps — the ONLY place user-facing strings may live (EN + ID).
 *
 * Every string is taken VERBATIM from the approved design
 * (.ba/discovery/design-reference/Mobeeli Landing.dc.html TXT map — brief
 * numbers canon; the deck variants ship with F-014). Keys mirror the design's
 * data-i18n keys; a few design-hardcoded visible strings (prices, sample
 * vehicle values, founder names/roles) are promoted to keys with identical
 * values in both languages. Dotted keys are the foundation's shared strings.
 *
 * Generated from the design reference — do not hand-edit copy values.
 */

export const langs = ["en", "id"] as const;
export type Lang = (typeof langs)[number];

const en = {
  "meta.title": "Mobeeli | Every part, verified to fit.",
  /* SEO + social meta (F-010) — pipe title separator per the user
     (CHG-piztanza-07); descriptions composed verbatim from approved design copy
     (hero_sub; jw_left_h + jw_left_sub): no fee figures, no incumbent names. */
  "meta.description":
    "Mobeeli is the trust infrastructure for Indonesia's $5.3B automotive aftermarket — a parts marketplace where fitment is verified before checkout, sellers keep more of every sale, and both sides are protected.",
  "meta.join.title": "Join Waitlist | Mobeeli",
  "meta.join.description":
    "Be one of the first shops on Mobeeli. Tell us about your business. A founder follows up personally — no payment, no commitment to express interest.",
  /* Deck routes (F-016) — noindex pages, titles only. */
  "meta.deck.title": "Investor deck | Mobeeli",
  "meta.deckadmin.title": "Deck admin | Mobeeli",
  "nav.cta": "Join us",
  "hero.line1": "Every part,",
  "hero.line2": "verified to fit.",
  "join.title": "Join Waitlist",
  nav_problem: "The problem",
  nav_how: "How it works",
  nav_why: "Why Mobeeli",
  nav_early: "Early Adopters",
  nav_team: "Team",
  nav_inv: "Investors",
  /* Careers page (founder request 2026-07-28). Linked from the footer only —
     the top nav stays at five links. DRAFT pending founder stamp. */
  nav_careers: "Careers",
  /* R16 ruling 1c: protection became its own band, so it needs an anchor. */
  nav_protect: "Protection",
  nav_cta: "Join us",
  /* Mobile hamburger nav a11y labels (CHG-piztanza-10) — not part of the design TXT map. */
  nav_menu_open: "Open menu",
  nav_menu_close: "Close menu",
  /* Skip-to-content link (accessibility pass) — not part of the design TXT map. */
  skip_to_content: "Skip to content",
  hero_chip: "Launching 2026 — Jakarta, Indonesia",
  hero_sub:
    "Mobeeli is the trust infrastructure for Indonesia's $5.3B automotive aftermarket — a parts marketplace where fitment is verified before checkout, sellers keep more of every sale, and both sides are protected.",
  /* Slim-landing hero sub (redesign phase 4) — the deck's approved thesis line
     (mobeeli-site: One platform to unify Indonesia's auto industry), kept broad
     per founder direction: no market figures, no moat mechanics on the front page. */
  hero_sub_short:
    "Brands, distributors, stores, mechanics and drivers — one verified catalog for Indonesia's auto industry.",
  hero_cta_inv: "For investors",
  hero_cta_shops: "Join Early Adopters Program",
  /* audit #24 — a11y pause control for the rotating hero headline (WCAG 2.2.2). */
  hero_pause: "Pause the rotating headline",
  hero_resume: "Resume the rotating headline",

  /* R11 YMM Vehicle Picker keys */
  ymm_picker_label: "Select vehicle fitment:",
  ymm_year: "Year",
  ymm_make: "Make",
  ymm_model: "Model",
  ymm_trim: "Trim",
  ymm_scanning: "SCANNING VEHICLE FITMENT...",
  ymm_verified: "VERIFIED FIT: Toyota Avanza 1.5 G",
  card_part_name: "Front brake pad set",
  card_part_sub: "Front axle · ceramic",
  card_part_price: "Rp 385.000",
  card_part_chip: "✓ Verified fit",
  card_fit: "✓ Fits: Toyota Avanza 1.5 G 2019",
  card_video_cap: "One platform. Five links.",
  /* Fitment band kicker (R4) — verbatim fragment of the approved hero.line2. */
  fit3d_kicker: "Verified to fit",
  /* Stage chip (R5, audit-fixed): honest demo label — never fake telemetry. */
  fit3d_chip: "Interactive 3D demo",
  fit3d_pcd_t: "Bolt pattern · PCD",
  fit3d_pcd_v: "4 × 100",
  fit3d_bore_t: "Center bore",
  fit3d_bore_v: "⌀ 54.1 mm",
  fit3d_auth_t: "Authenticity",
  fit3d_auth_v: "Genuine",
  pf1_v: "120M+ (Simulation)",
  pf1_l: "fitment mappings behind every listing",
  pf2_v: "0%",
  pf2_l: "platform fee for the first 300 shops",
  pf3_v: "100,000+",
  pf3_l: "workshops across Indonesia's aftermarket",
  pf4_v: "2026",
  pf4_l: "launching — Jakarta first",
  prob_kicker: "The problem",
  prob_h2: "Buying car parts online is a guessing game.",
  prob_t1_v: "19.4%",
  prob_t2_v: "86%",
  prob_t1_t: "return rate on big online marketplaces",
  prob_t1_l: "Nearly 1 in 5 parts ordered online gets sent back.",
  prob_t2_t: "of those returns caused by wrong fit",
  prob_t2_l: "Almost 9 in 10 returns are the same story: the part didn't fit the car.",
  prob_t3_v: "16.75–19.66%",
  prob_t3_t: "seller fees on big marketplaces",
  prob_t3_l: "Sellers hand over up to a fifth of every sale in fees.",
  prob_t3_chip: "Mobeeli: one low, flat rate",
  /* FOUNDER 2026-07-29 16:06: the Senen testimony leaves the callout — it was
     seller-grievance (shop closure, "the platform penalized me") inside a
     buyer-pain band, adversarial toward unnamed platforms, and unverifiable
     to a reader. quote_* keys stay DEFINED (existence contract, dormant —
     prot_r* precedent). The callout is now Mobeeli-voice mechanism: the one
     thing worth keeping from the testimony was the COD reality. DRAFT. */
  quote_main:
    "Toko saya sampai ditutup karena terlalu banyak retur COD. Platform menghukum saya. Bukan pembelinya.",
  quote_en:
    "“My shop was closed because of too many returns from COD. The platform penalized me. Not the customer.”",
  quote_by: "Shop owner, Senen Market, Jakarta — shared with permission",
  prob_call_h: "A wrong part ships twice: out to the buyer, and back — unpaid.",
  prob_call_p:
    "In a cash-on-delivery market, a part that doesn't fit is refused at the door. The shop pays the shipping both ways, and the car is still up on the lift.",
  prob_call_tag: "Indonesia's parts trade runs on COD",
  /* R28 problem-section rebuild (CD handoff 2026-07-29). English is UNSTAMPED
     draft per the brief — founder rules wording. The lede/link/badge/chip are
     new; eyebrow reuses prob_kicker, headline reuses prob_h2, quote reuses
     quote_*. */
  prob_lede:
    "Every part on a car has exactly one match — one year, one trim, one engine. On a listing page they all look identical. That is the whole problem.",
  prob_link: "The numbers behind this",
  prob_badge: "Every part, one match",
  prob_chip_n: "4",
  prob_chip_of: "/ 217",
  prob_chip_cap: "listings actually fit this exact car",
  prob_img_alt:
    "Exploded technical view of a car, every serviceable part separated and connected by leader lines",
  how_kicker: "How it works",
  /* R25 — the how-it-works band now spans industry scale (the flow figure) and
     per-part proof (the picker + result), so it needs one headline for both and
     a kicker of its own. Note `how_kicker` above is a dormant twin of
     `cat_kicker` with the same value; it renders nowhere and is left alone
     rather than repurposed, so nothing silently changes on another surface.
     DRAFT WORDING — founder approves EN and confirms ID. */
  cat_kicker: "How it works",
  /* Rewritten in R25. "No duplicates. No guesswork." described the catalogue;
     the new second clause states what the flow figure above it argues — that the
     listing is one thing no matter which of the five parties described it. */
  cat_unified_h2: "One verified listing per part. No matter who described it.",
  cat_unified_p:
    "Brands, distributors and stores each name the same part differently. Mobeeli reconciles them into one listing, then checks it against your exact car before you see it.",
  /* The hand-off from the diagram to the demonstration. Deliberately short — it
     is a hinge, not a paragraph. */
  cat_bridge: "One description in. One verified listing out.",
  /* DORMANT since the R25 full-mockup pass: the window bar now shows
     cat_katalog_label + the query, not this title. Kept defined and paired
     (prot_r* precedent) so restoring it is a mount, not a translation round. */
  cat_window_title: "Verified for your vehicle",
  /* R25 full-mockup pass. The catalogue result window and the five-level
     picker, matched to `mobeeli-landing-r25.html`.
     DRAFT WORDING — founder approves EN and confirms ID. */
  cat_picker_title: "Select your vehicle",
  cat_picker_levels: "5 levels",
  cat_engine_code: "2NR-VE",
  cat_engine_note: "← engine, the fifth level",
  cat_sku_kicker: "Single-SKU architecture",
  cat_sku_title: "One listing per part. Every brand its own.",
  cat_sku_sub: "Enforced by the schema, not by moderators",
  cat_search_query: "kampas rem · Avanza 1.5 G CVT",
  cat_katalog_label: "Mobeeli · Katalog",
  /* FOUNDER RULING 2026-07-28: these counts are illustrative, not measured, and
     ship carrying cat_sim_tag. R16 ruling 2b had removed simulated figures from
     this band; the founder reinstated them for the mockup's result line ON THE
     CONDITION that they are labelled, which is the R15 precedent for the part
     cards. Do NOT drop the tag to tidy the line up. */
  cat_count_fit: "4 of 217 fit your car",
  cat_count_hidden: "· 213 hidden — they do not fit",
  /* FOUNDER RULING 2026-08-01: nothing in user-facing copy may suggest Mobeeli
     INGESTS, scrapes or otherwise helps itself to data. AI stays as a
     capability claim, but every mention is anchored to a seller handing their
     OWN file over — the AI never acts on files by itself. "assembled by
     Mobeeli AI" read as though the AI compiled the catalogue from unstated
     sources; the provenance is now explicit. */
  cat_count_ai: "· built by Mobeeli AI from sellers' own catalogues",
  cat_badge_genuine: "Genuine",
  cat_chip_unfit: "Does not fit",
  cat_part5_name: "Ceramic Pad Set",
  cat_part5_spec: "1.3 E only — wrong axle",
  cat_part1_name: "Iridium Spark Plug",
  cat_part2_name: "Clutch Cover Assy",
  cat_part3_name: "Gas Shock Absorber",
  /* DORMANT since R25: the fourth card became the deliberately non-fitting
     cat_part5_* (Ceramic Pad Set). Name and spec both kept, paired. */
  cat_part4_name: "Standard Grade Pads",
  cat_sim_tag: "(Simulation)",
  /* R16 ruling 2b: the cards show FITMENT SPECS, not simulated prices — the page
     may show that fitment is resolved, not invent commercial figures.
     DRAFT WORDING — founder to confirm EN and ID before this is treated as final. */
  cat_part1_spec: "2NR-VE · 4 per set",
  cat_part2_spec: "manual · ⌀ 200 mm",
  cat_part3_spec: "rear · gas-filled · ET 45",
  cat_part4_spec: "front axle · ceramic · 2NR-VE",
  cat_part_brand: "OEM Equivalent",
  cat_part_verified: "Verified Fit",
  /* R18 call C: authenticity carried as ONE clause, subordinate to the fitment
     claim. Verification is the noun; fit and authenticity are its two outputs —
     that keeps trust from competing with the thesis (a trust BAND would put us
     on Otoklix's message, which is why R18 call A removed one).
     DRAFT WORDING — founder to confirm EN and ID. */
  cat_verified_note: "Verified means two things: it fits your car, and it's the real part.",
  cat_filter_active: "Filter Active",
  cat_car_alt: "Catalog vehicle blueprint",
  /* R16 §8 (ruling 4a): the scan's measurement callouts. The bore value reuses
     fit3d_bore_v rather than duplicating it. These read the same illustrative
     Avanza the catalogue cards above already describe (cat_part1_spec is
     "2NR-VE"), so the whole readout stays one coherent vehicle — per-model
     geometry is real data nobody has stamped.
     DRAFT WORDING — founder to confirm EN and ID before this is treated as final. */
  cat_scan_pcd: "PCD 4 × 100",
  cat_scan_offset: "offset ET 45",
  cat_scan_lock: "2019 Avanza 1.5 G · 2NR-VE",
  garage_plate_label: "Or enter Plate / VIN",
  garage_plate_placeholder: "B 1234 CD or VIN",
  garage_plate_btn: "Find Vehicle",
  garage_chip_label: "My Garage",
  garage_chip_clear: "Clear",
  how_s3_t: "Check out protected",

  /* R20 band 2a — platform-flow Sankey. The industry-scale "how it works": three
     parties push data in, it is verified in one core, three consume it out. No
     figures (front page is a profile, not a pitch). DRAFT WORDING — founder
     approves EN and confirms ID; party names match hero_sub_short's ID. */
  plat_kicker: "Across the industry",
  plat_h2: "Five parties. One platform in the middle.",
  plat_p:
    "Today the same part is described five times by five people who never speak to each other. That is where the wrong part comes from — not from anyone being careless.",
  plat_src1_t: "Brands",
  plat_src1_s: "publish once, correctly",
  plat_src2_t: "Distributors",
  plat_src2_s: "send any format",
  plat_src3_t: "Stores",
  plat_src3_s: "even a ledger photo",
  plat_dst1_t: "Stores",
  plat_dst1_s: "list without retyping",
  plat_dst2_t: "Mechanics",
  plat_dst2_s: "order for the car in the bay",
  plat_dst3_t: "Drivers",
  plat_dst3_s: "see only what fits",
  plat_hub: "The platform",
  /* The three things the core actually does, under the mark. */
  plat_step1: "Normalise",
  plat_step2: "De-duplicate",
  plat_step3: "Map to vehicle",
  plat_in_xls: "Excel file",
  plat_in_pdf: "PDF file",
  plat_in_jpg: "Photo of a handwritten ledger",
  plat_out: "verified",
  /* Accessible flow summary — the SVG/stack visuals are aria-hidden; this single
     sentence is what a screen reader announces for the figure. */
  plat_a11y:
    "Brands, distributors and stores send parts data in any format to the Mobeeli platform, which verifies it. Stores, mechanics and drivers then receive one clean, verified catalog.",

  why_ds_title: "The Analog Margin Bleed.",
  why_ds_sub: "Today's B2B parts distribution network is broken for both sides.",
  why_ds_c1_t: "The 4-Tier Margin Bleed",
  why_ds_c1_d:
    "Every hop (Principal → Distributor → Wholesale → Store → Garage) stacks ~15% margin.",
  why_ds_c2_t: "The Counterfeit Injection",
  why_ds_c2_d: "Counterfeit OEM parts blindly infect inventory through offline WhatsApp brokers.",
  why_ds_c3_t: "The C.O.D. Chokehold",
  why_ds_c3_d: "Zero-trust trading forces strict Cash-on-Delivery, freezing working capital.",
  /* Death-spiral mockup labels (R5 audit): keyed EN+ID, generic — no real
     manufacturer names on marketing surfaces, no hype punctuation. */
  why_ds_n_base: "Manufacturer",
  why_ds_n_base_tag: "Base price",
  why_ds_n1: "Main dealer",
  why_ds_n2: "Regional wholesale",
  why_ds_n3: "Offline broker",
  why_ds_scan_ok: "Authenticated",
  why_ds_scan_bad: "Warning: fake detected",
  why_ds_cod_l: "100% cash buffer required",
  why_ds_cod_lock: "Capital locked",
  prot_r1: "Video-evidence resolution",
  prot_r2: "Authenticity verification",
  prot_r3: "Funds release when the part fits",
  cmp_h: "The same search, two outcomes.",
  cmp_bad_t: "On a generalist marketplace",
  cmp_bad_1: "Search “brake pad Honda Brio 2018” — 500 listings, none that know your car.",
  cmp_bad_2: "WhatsApp the seller to ask if it fits — you both guess.",
  cmp_bad_3: "The order arrives — wrong generation, wrong part.",
  cmp_bad_4: "Return, dispute, wait — or keep a part you can't use.",
  cmp_bad_res: "19.4% of orders come back — 86% from fitment errors.",
  cmp_good_t: "On Mobeeli",
  cmp_good_1: "Tell us your car once — year · make · model · trim.",
  cmp_good_2: "Search shows only parts verified to fit your exact car.",
  cmp_good_3: "The part arrives and bolts on — as verified.",
  cmp_good_4: "Protected checkout: funds release when the part fits.",
  cmp_good_res: "Verified before checkout — returns stop being the norm.",
  why_kicker: "Why Mobeeli",
  why_h2: "Fees went up. Trust didn't.",
  why_p:
    "In May 2026, the big marketplaces raised seller fees to roughly 17–20%. Mobeeli is the alternative built for the auto industry — verified fitment, honest economics, and protection on both sides.",
  early_kicker: "Early Adopters Program",
  early_h2: "0% platform fee for the first 300 shops.",
  /* "uploaded automatically by AI" read as the AI doing the uploading, from
     somewhere unnamed. The seller sends the file; the automation does the
     listing (founder ruling 2026-08-01). */
  early_f1_t: "Your price list, listed automatically",
  early_f1_d:
    "Send us your Excel or PDF — our AI turns your own price list into a live store in hours.",
  early_f2_t: "Fraud protection",
  early_f2_d: "Built-in protection against fraud, backed by video evidence and insurance.",
  early_f3_t: "One low, flat commission",
  early_f3_d:
    "After the promo period, one flat rate that stays a fraction of standard marketplace fees — transparent, predictable, and built to keep quality sellers profitable.",
  early_cta: "Join Waitlist",
  early_note: "First 300 shops lock in 0% — takes two minutes.",
  buyer_line: "Buying parts? Be first to know when Mobeeli opens in Jakarta.",
  buyer_cta: "Get notified",
  /* Buyer notify capture (F-015, CHG-piztanza-13) — inline email field in the buyer strip. */
  buyer_email_label: "Email address",
  buyer_email_ph: "nama@email.com",
  buyer_send: "Notify me →",
  buyer_sending: "Sending…",
  buyer_success: "You're on the list — we'll email you when Mobeeli opens in Jakarta.",
  buyer_err_email: "That email doesn't look right.",
  buyer_err_fail: "Something went wrong — please try again.",
  team_kicker: "The team",
  /* R29 (CD handoff 2026-07-29, founder-directed content rulings): the engine
     metaphor is rejected; the CEO renders as "Matheau Widjaja" everywhere; his
     bio carries the Canada->Indonesia return, never "signed the shops" (that
     line lives in team_quote, the STAMPED traction frame). EN drafts pending
     stamp except where noted; ID for the NEW/CHANGED strings is the
     founder's to write — per the brief they are NEVER machine-translated, so
     the ID map temporarily carries the EN values. */
  team_h2: "Meet the team.",
  team_lede: "Set the vision. Build the platform. Move the parts. Each job has an owner.",
  team_own1: "sets the vision",
  team_own2: "builds the platform",
  team_own3: "moves the parts",
  /* STAMPED traction frame (2026-07-29 ruling) — verbatim, do not touch. */
  team_quote: "Most of the shops we visited signed the same afternoon.",
  team_quote_by: "Early Adopters program — Jakarta, 2026",
  team_n1: "Matheau Widjaja",
  team_r1: "CEO & Founder",
  team_n2: "Muhammad Salman Al Hafizh",
  team_r2: "CTO & Co-Founder",
  team_n3: "Ferdinansyah Husein",
  team_r3: "COO & Co-Founder",
  /* FOUNDER RULING 2026-07-29: the "9 of 14" count is retired everywhere —
     the small denominator undersold the real signal, which is conversion
     speed. Keep the honest fact (most shops visited signed the same
     afternoon), never a raw count. */
  team_c1:
    "A lifetime in Canada, a career across automotive and tech e-commerce — he saw the gap in Indonesia's parts trade and came home to close it.",
  /* "gated AI ingestion" retired 2026-08-01 (founder): "ingestion" describes
     the platform swallowing data. Same system, named by whose data it is. */
  team_c2:
    "Built the platform pre-funding — the fitment engine, the AI behind seller uploads, the marketplace.",
  team_c3: "Runs operations and partnerships — logistics, payments, and the wholesaler pipeline.",
  inv_kicker: "For investors",
  inv_h2: "Come see what we've built.",
  inv_p:
    "Mobeeli is built, and Jakarta's shops are already signing on — most of the shops we visited signed the same afternoon. If you follow commerce infrastructure in Southeast Asia, we'd like to show you what's coming.",
  inv_cta: "Request the deck",
  /* FOUNDER 2026-07-29 22:53: reword the direct-email block and route it to
     the new /contact page — the founder inboxes move THERE (F-009 addresses
     unchanged). DRAFT pending stamp. */
  inv_or: "Prefer a direct line?",
  inv_contact_link: "Contact Mobeeli",
  nav_contact: "Contact",
  /* R30b (CD handoff 2026-07-30, option 4a) — /contact becomes a message
     form (founder overruled mailto-first). RULINGS baked into these strings:
     no email address anywhere on the page; the word "founder" appears
     nowhere in contact keys (the page speaks as a team); no SLA/timeframe.
     EN DRAFT pending stamp; ID = founder writes (EN stands in). */
  contact_kicker: "Contact",
  contact_h2: "Let's build together.",
  contact_p:
    "Partnerships, press, suppliers, investors — send a message and you'll hear back from the person who owns it. It's a small team.",
  /* DORMANT since R30b (prot_r* precedent): the founder-inbox line the form
     replaced. */
  contact_direct: "Or write to a founder directly:",
  contact_form_h: "Send us a message",
  contact_f_name: "Your name",
  contact_f_email: "Email",
  contact_f_topic: "What's this about?",
  contact_f_message: "Message",
  contact_ph_email: "you@company.com",
  contact_ph_message: "A sentence or two is plenty — what do you need from us?",
  contact_t_general: "General question",
  contact_t_partnership: "Partnership",
  contact_t_press: "Press & media",
  contact_t_supplier: "Supplier or wholesaler",
  contact_t_investor: "Investor",
  contact_f_send: "Send message",
  contact_f_note: "No ticket number, no queue — someone on the team writes back.",
  contact_next_h: "What happens next",
  contact_next_1: "A person reads it — not a shared inbox, not a bot.",
  contact_next_2: "Whoever owns your topic replies personally, from their own address.",
  contact_next_3: "If it's a fit, the next step is a call — your timezone, not ours.",
  contact_next_link: "See who you're writing to",
  contact_email_hint: "Only used to reply to you — no list, nothing shared.",
  contact_f_fail:
    "Something went wrong sending your message. Your answers are kept — please try again.",
  contact_err_message: "Add a line or two so we know what you need.",
  contact_ramps_a: "A shop looking to join?",
  contact_ramps_a_link: "Early Adopters",
  contact_ramps_a_end: "is the right door. ",
  contact_ramps_b: "An investor after the deck?",
  contact_ramps_b_link: "Investors",
  contact_place_note: "Jakarta, Indonesia — pre-launch, so email is the whole channel.",
  contact_sent_h: "Message sent.",
  contact_sent_p:
    "It's with the team, and you'll get a personal reply from the person who owns your topic — not a ticket queue.",
  contact_sent_again: "Send another",
  contact_sent_urgent: "We'll write back to the address you gave us.",
  contact_privacy_link: "Privacy",
  /* /privacy (founder 2026-07-30, after the cookie-popup analysis): the
     transparency page the ePrivacy exemption and UU PDP notice duty both
     point at. Every claim below is enforced by tests/cookieless-contract —
     if the code changes, this page must change in the same PR.
     EN DRAFT pending founder/legal review; ID = founder writes. */
  nav_privacy: "Privacy",
  privacy_kicker: "Privacy",
  privacy_h2: "What we do with your data.",
  privacy_lede:
    "Mobeeli is pre-launch, and this site is deliberately quiet: no cookies, no trackers, nothing loaded from third parties. This page says exactly what does happen.",
  privacy_b1_h: "Messages you send",
  privacy_b1_p:
    "The contact form collects your name, email, topic and message. It is delivered to the team as an email and used only to reply to you — there is no marketing list, and messages are not stored in a database.",
  privacy_b2_h: "Waitlist signups",
  privacy_b2_p:
    "Joining the Early Adopters waitlist stores the business details you provide, and a copy in our internal workspace, so we can contact you about the program. They are used for nothing else.",
  privacy_b3_h: "Deck requests",
  privacy_b3_p:
    "Requesting the investor deck sends your name, firm and work email to the team by email, used to follow up personally. The same details, plus the country the request came from, are recorded in our internal workspace so the follow-up is tracked. They go no further.",
  privacy_b7_h: "Launch notifications",
  privacy_b7_p:
    "Asking to be notified at launch stores your email with our mail provider so we can send that one announcement, and records the signup — with the country it came from — in our internal workspace. Every message carries an unsubscribe link.",
  privacy_b4_h: "On your device",
  privacy_b4_p:
    "This site sets no cookies. It keeps two preferences in your browser — your language and the vehicle you picked in the demo. They never leave your device.",
  privacy_b5_h: "Third parties",
  privacy_b5_p:
    "Nothing on this site loads from a third party — no analytics, no embedded scripts, no external fonts. Email delivery runs through a mail provider, and deck requests are recorded in the workspace tool the team runs on; both act on our instructions.",
  privacy_b6_h: "Your rights",
  privacy_b6_p:
    "Under Indonesia's Personal Data Protection Law (UU PDP 27/2022) you can ask what we hold about you, have it corrected, or have it deleted. One address handles all of it:",
  /* Deck request form on /investors (F-016) — name/firm/work-email required. */
  inv_f_name: "Your name",
  inv_f_firm: "Firm / fund",
  inv_f_email: "Work email",
  inv_f_linkedin: "LinkedIn or website (optional)",
  inv_f_message: "Anything you'd like to add? (optional)",
  inv_f_send: "Send request →",
  inv_f_sending: "Sending…",
  inv_err_name: "Please enter your name.",
  inv_err_firm: "Please enter your firm or fund.",
  inv_err_email: "That email doesn't look right.",
  inv_f_fail:
    "Something went wrong sending your request. Your answers are kept — please try again.",
  inv_success_h: "Request received.",
  inv_success_p: "Thank you — a founder will follow up personally with the deck.",
  /* Hosted deck viewer + expired-link page (F-016). */
  deck_loading: "Loading the deck…",
  deck_error: "We couldn't load the deck. Refresh the page or request a new link.",
  deck_expired_h: "This link has expired.",
  deck_expired_p:
    "Deck links are time-limited. Request a fresh one and a founder will follow up personally.",
  deck_invalid_h: "This link isn't valid.",
  deck_invalid_p:
    "The link may have been copied incompletely. Request a fresh one and a founder will follow up personally.",
  deck_expired_cta: "Request the deck",
  /* Founder-only /deck-admin (F-016) — internal tool, identical in both languages. */
  da_h: "Deck link admin",
  da_hours_label: "Custom duration (hours)",
  da_hours_btn: "Generate link",
  da_link_label: "Deck link",
  da_expires: "Expires: {t}",
  da_never: "Never expires",
  da_copy: "Copy link",
  da_copied: "Copied ✓",
  da_notion_btn: "Record in Notion",
  da_notion_saved: "Saved to Notion: link, expiry and status updated on the request.",
  da_notion_failed: "Could not update Notion — put the link on the row by hand.",
  cat_h2: "One catalog, built from what sellers send.",
  cat_p:
    "Sellers send their own Excel sheets, PDFs, even photos of handwritten ledgers — Mobeeli's AI reads what they send and builds one clean catalog, mapped to every car on the road.",
  cat_pill: "✓ One catalog · 120M+ mappings (Simulation)",
  cat_ai_read: "Mobeeli AI · reading 3 seller uploads…",
  cat_ai_done: "Mobeeli AI · seller uploads listed ✓",
  scn1: "Brake pads",
  scn2: "Oil filter",
  scn3: "Spark plugs",
  scn4: "Brake disc",
  scn5: "Shock absorber",
  scn6: "Air filter",
  uni_kicker: "Across the archipelago",
  uni_h2: "From Sabang to Merauke, one catalog.",
  uni_p:
    "100,000+ workshops and thousands of parts shops, finally speaking the same language — starting in Jakarta, 2026, then island by island.",
  uni_drag: "Drag the map to explore — launching in Jakarta first.",
  indo_city: "Jakarta",
  indo_note: "— first market, 2026",
  foot_tag: "One platform to unify Indonesia's auto industry.",
  foot_copyright: "Mobeeli — Jakarta, Indonesia",
  /* Footer menu (the R25 mockup's two-column footer; founder request
     2026-07-28). Link labels reuse nav_* keys — these are the column
     headings, the a11y label and the one label the nav does not carry.
     The join link uses nav_cta ("Join us"), not the mockup's "Join
     waitlist": the founder's rename ruling supersedes the mockup there.
     DRAFT pending founder stamp. */
  foot_menu_a11y: "Site links",
  foot_col_company: "Company",
  foot_col_product: "Product",
  foot_coverage: "Coverage",

  /* /careers page (founder request 2026-07-28) — honest pre-launch stance:
     no roles are invented; the page says none are posted and routes
     interest to the footer's existing public address. DRAFT pending
     founder stamp. */
  careers_kicker: "Careers",
  careers_h2: "Help build the parts backbone.",
  careers_p:
    "Mobeeli is a small founding team in Jakarta building one verified parts catalogue for Indonesia's auto industry. We are pre-launch, and we hire slowly.",
  careers_open:
    "No open roles are posted right now. When a role opens, it will be listed on this page.",
  careers_cta: "Think we should meet anyway? Write to us.",

  /* Join Waitlist page (F-007) — keys mirror the Join Waitlist.dc.html TXT map, jw_-prefixed. */
  jw_back_home: "← Back to Mobeeli",
  jw_offer: "0% platform fee · first 300 shops",
  jw_left_h: "Be one of the first shops on Mobeeli.",
  jw_left_sub:
    "Tell us about your business. A founder follows up personally — no payment, no commitment to express interest.",
  jw_ben1_t: "Your price list, listed automatically",
  jw_ben1_s: "Your own Excel or PDF — our AI lists it in hours.",
  jw_ben2_t: "Fraud protection built in",
  jw_ben2_s: "Backed by video evidence and insurance.",
  jw_ben3_t: "One low, flat commission",
  jw_ben3_s: "After the promo — far below the big marketplaces.",
  jw_trust: "Pre-launch pilot · your details stay with the founding team.",
  jw_eyebrow: "Become a partner",
  jw_introTitle: "Join Mobeeli",
  jw_introBody:
    "Tell us a little about your business in a few quick steps. A founder will reach out personally on WhatsApp or email.",
  jw_start: "Get started →",
  jw_minutes: "Takes about a minute.",
  jw_stepType: "Who you are",
  jw_stepBusiness: "Your business",
  jw_stepContact: "How to reach you",
  jw_stepDetails: "A few details",
  jw_qType: "What best describes you?",
  jw_qBusiness: "Tell us about your business.",
  jw_qContact: "Where can we reach you?",
  jw_qDetails: "Anything else that helps us prepare?",
  jw_typeStore: "Store / Seller",
  jw_typeStoreSub: "Sell parts online",
  jw_typeGarage: "Garage / Workshop",
  jw_typeGarageSub: "Buy for cars on your lift",
  jw_typeDist: "Distributor",
  jw_typeDistSub: "Wholesale to workshops",
  jw_contactName: "Contact name (optional)",
  jw_email: "Email (optional)",
  jw_contactPhone: "Phone (optional)",
  jw_whatsapp: "WhatsApp (optional)",
  jw_city: "City (optional)",
  jw_pickCity: "Pick a city…",
  jw_cityOther: "Other",
  jw_volume: "Monthly order volume (optional)",
  jw_pickVolume: "Pick volume…",
  jw_toolsUsed: "Tools you use today (select all)",
  jw_brands: "Brands you carry (optional)",
  jw_brandsPh: "e.g. Denso, Aspira, NGK",
  jw_net30: "Interested in Net-30 credit terms (subject to approval)",
  jw_message: "Anything else? (optional)",
  jw_back: "← Back",
  jw_next: "Next →",
  jw_submit: "Submit →",
  jw_bizStore: "Store name",
  jw_bizGarage: "Workshop name",
  jw_bizDist: "Company name",
  jw_bizPhStore: "e.g. Jaya Motor Parts",
  jw_bizPhGarage: "e.g. Bengkel Sumber Rejeki",
  jw_bizPhDist: "e.g. Sinar Sparepart Nusantara",
  jw_errBiz: "Please enter your business name.",
  jw_errEmail: "That email doesn't look right.",
  jw_errPhone: "That number doesn't look right.",
  jw_successTitle: "You're on the list.",
  jw_succBody:
    "Thank you, {n}. A founder will reach out personally by email. Want to talk sooner? Email us now.",
  jw_emailCta: "Email us",
  jw_homeCta: "Back to Mobeeli",
  /* Design-hardcoded visible strings promoted to keys (identical in both languages). */
  jw_ph_email: "nama@toko.com",
  jw_ph_phone: "+62 812 …",
  /* Success/mailto interpolation strings for the prefilled email CTA. */
  jw_fallback_name: "there",
  jw_mail_subject: "Early Adopter waitlist — {n}",
  jw_mail_body:
    "Hi Mobeeli, I just joined the Early Adopter waitlist. Business: {n}. I'd like to get started.",
  /* Submit states (F-008 — the design stops at a client-side success). */
  jw_submitting: "Submitting…",
  jw_submitErr:
    "Something went wrong sending your application. Your answers are saved — please try again.",
} as const satisfies Record<string, string>;

export type CopyKey = keyof typeof en;

const id: Record<CopyKey, string> = {
  "meta.title": "Mobeeli | Setiap suku cadang, dipastikan cocok.",
  /* SEO + social meta (F-010) — pipe title separator per the user
     (CHG-piztanza-07); descriptions composed verbatim from approved design copy
     (hero_sub; jw_left_h + jw_left_sub): no fee figures, no incumbent names. */
  "meta.description":
    "Mobeeli adalah infrastruktur kepercayaan untuk aftermarket otomotif Indonesia senilai $5,3 miliar — marketplace suku cadang tempat setiap barang dipastikan cocok sebelum checkout, penjual membawa pulang lebih banyak dari tiap transaksi, dan dua belah pihak sama-sama terlindungi.",
  "meta.join.title": "Join Waitlist | Mobeeli",
  /* Deck routes (F-016) — noindex pages, titles only. */
  "meta.deck.title": "Deck investor | Mobeeli",
  "meta.deckadmin.title": "Deck admin | Mobeeli",
  "meta.join.description":
    "Jadi salah satu toko pertama di Mobeeli. Ceritakan tentang bisnis Anda. Salah satu founder akan menghubungi langsung — tanpa bayar, tanpa komitmen untuk menyatakan minat.",
  "nav.cta": "Gabung",
  "hero.line1": "Setiap suku cadang,",
  "hero.line2": "dipastikan cocok.",
  "join.title": "Gabung Waitlist",
  nav_problem: "Masalah",
  nav_how: "Cara kerja",
  nav_why: "Kenapa Mobeeli",
  nav_early: "Early Adopters",
  nav_team: "Tim",
  nav_inv: "Investor",
  nav_careers: "Karier",
  /* R16 ruling 1c: protection became its own band, so it needs an anchor. */
  nav_protect: "Perlindungan",
  nav_cta: "Gabung",
  /* Mobile hamburger nav a11y labels (CHG-piztanza-10) — not part of the design TXT map. */
  nav_menu_open: "Buka menu",
  nav_menu_close: "Tutup menu",
  /* Skip-to-content link (accessibility pass) — not part of the design TXT map. */
  skip_to_content: "Langsung ke konten",
  hero_chip: "Meluncur 2026 — Jakarta, Indonesia",
  hero_sub:
    "Mobeeli adalah infrastruktur kepercayaan untuk aftermarket otomotif Indonesia senilai $5,3 miliar — marketplace suku cadang tempat kecocokan diverifikasi sebelum checkout, penjual membawa pulang lebih banyak dari tiap transaksi, dan kedua belah pihak terlindungi.",
  /* Slim-landing hero sub (redesign phase 4) — the deck's approved thesis line
     (mobeeli-site: One platform to unify Indonesia's auto industry), kept broad
     per founder direction: no market figures, no moat mechanics on the front page. */
  hero_sub_short:
    "Merek, distributor, toko, mekanik, dan pengemudi — satu katalog terverifikasi untuk industri otomotif Indonesia.",
  hero_cta_inv: "Untuk investor",
  hero_cta_shops: "Gabung Program Early Adopters",
  /* audit #24 — a11y pause control for the rotating hero headline. */
  hero_pause: "Jeda pergantian judul",
  hero_resume: "Lanjutkan pergantian judul",

  /* R11 YMM Vehicle Picker keys */
  ymm_picker_label: "Pilih kecocokan kendaraan:",
  ymm_year: "Tahun",
  ymm_make: "Merek",
  ymm_model: "Model",
  ymm_trim: "Varian",
  ymm_scanning: "MEMINDAI KECOCOKAN KENDARAAN...",
  ymm_verified: "DIPASTIKAN COCOK: Toyota Avanza 1.5 G",
  card_part_name: "Kampas rem depan",
  card_part_sub: "As depan · keramik",
  card_part_price: "Rp 385.000",
  card_part_chip: "✓ Dipastikan cocok",
  card_fit: "✓ Cocok: Toyota Avanza 1.5 G 2019",
  card_video_cap: "Satu platform. Lima mata rantai.",
  /* Fitment band kicker (R4) — verbatim fragment of the approved hero.line2. */
  fit3d_kicker: "Dipastikan cocok",
  /* Stage chip (R5, audit-fixed): honest demo label — never fake telemetry. */
  fit3d_chip: "Demo 3D interaktif",
  fit3d_pcd_t: "Pola baut · PCD",
  fit3d_pcd_v: "4 × 100",
  fit3d_bore_t: "Lubang tengah",
  fit3d_bore_v: "⌀ 54,1 mm",
  fit3d_auth_t: "Keaslian",
  fit3d_auth_v: "Asli",
  pf1_v: "120 juta+ (Simulasi)",
  pf1_l: "data kecocokan di balik setiap listing",
  pf2_v: "0%",
  pf2_l: "biaya platform untuk 300 toko pertama",
  pf3_v: "100.000+",
  pf3_l: "bengkel di seluruh aftermarket Indonesia",
  pf4_v: "2026",
  pf4_l: "Launching — mulai dari Jakarta",
  prob_kicker: "Masalah",
  prob_h2: "Beli onderdil online masih untung-untungan.",
  prob_t1_v: "19,4%",
  prob_t2_v: "86%",
  prob_t1_t: "tingkat retur di marketplace besar",
  prob_t1_l: "Hampir 1 dari 5 onderdil yang dibeli online berakhir dikirim balik.",
  prob_t2_t: "retur karena barang tidak cocok",
  prob_t2_l: "Hampir 9 dari 10 retur ceritanya sama: barangnya tidak cocok dengan mobil.",
  prob_t3_v: "16,75–19,66%",
  prob_t3_t: "potongan biaya penjual di marketplace besar",
  prob_t3_l: "Sementara penjual harus merelakan sampai seperlima omzetnya untuk biaya platform.",
  prob_t3_chip: "Mobeeli: satu tarif flat yang ringan",
  quote_main:
    "Toko saya sampai ditutup karena terlalu banyak retur COD. Platform menghukum saya. Bukan pembelinya.",
  quote_en:
    "“My shop was closed because of too many returns from COD. The platform penalized me. Not the customer.”",
  quote_by: "Pemilik toko, Pasar Senen, Jakarta — dibagikan seizin beliau",
  prob_call_h: "Onderdil yang salah dikirim dua kali: ke pembeli, lalu kembali — tanpa dibayar.",
  prob_call_p:
    "Di pasar COD, onderdil yang tidak cocok ditolak di depan pintu. Toko menanggung ongkir dua arah, dan mobilnya masih tertahan di bengkel.",
  prob_call_tag: "Perdagangan onderdil di Indonesia bertumpu pada COD",
  prob_lede:
    "Setiap onderdil hanya cocok untuk satu kombinasi — satu tahun, satu varian, satu mesin. Di halaman listing semuanya terlihat sama. Itulah inti masalahnya.",
  prob_link: "Angka di balik masalah ini",
  /* ID COPY PASS 2026-08-01: "pasangan" retired — it reads as partner/spouse,
     and to a mechanic "satu pasangan" means one SET (a pair of pads). Length
     is the constraint here: .mb-prob-badge is position:absolute and
     content-sized, so it grows right until it overhangs its own card. Measured
     at 320px — "Setiap onderdil, satu yang cocok" overhangs by 22px and lands
     2px from the screen edge; this fits with 37px to spare. "pas" over the
     more common "cocok" is deliberate: it is what the fitment chip already
     says ("Tidak Pas"), and it is the only phrasing short enough. */
  prob_badge: "Hanya satu yang pas",
  prob_chip_n: "4",
  prob_chip_of: "/ 217",
  prob_chip_cap: "listing yang benar-benar cocok untuk mobil ini",
  prob_img_alt:
    "Tampilan teknis mobil terurai, setiap onderdil terpisah dan terhubung garis penunjuk",
  how_kicker: "Cara kerja",
  /* R25. cat_kicker matches this file's own nav_how ("Cara kerja") rather than
     inventing a second phrasing for the same idea. The party names in
     cat_unified_p are the ones hero_sub_short and the plat_* keys already use —
     Merek, distributor, toko — so the page names the five parties one way
     throughout. DRAFT WORDING — founder to confirm. */
  cat_kicker: "Cara kerja",
  cat_unified_h2: "Satu listing terverifikasi per suku cadang. Tidak peduli siapa yang mendeskripsikannya.",
  cat_unified_p:
    "Merek, distributor, dan toko menamai suku cadang yang sama dengan sebutan berbeda-beda. Mobeeli menyatukannya menjadi satu listing, lalu mencocokkannya dengan mobil Anda sebelum Anda melihatnya.",
  cat_bridge: "Satu deskripsi masuk. Satu listing terverifikasi keluar.",
  cat_window_title: "Terverifikasi untuk kendaraan Anda",
  /* R25 full-mockup pass. Where the mockup itself is already in Indonesian its
     wording is taken VERBATIM — the search query, the count line and the pad
     card's spec were written that way in the design. DRAFT — founder to confirm. */
  cat_picker_title: "Pilih kendaraan Anda",
  cat_picker_levels: "5 tingkat",
  cat_engine_code: "2NR-VE",
  cat_engine_note: "← mesin, tingkat kelima",
  cat_sku_kicker: "Arsitektur Single-SKU",
  cat_sku_title: "Satu listing per suku cadang. Setiap merek punya listing sendiri.",
  cat_sku_sub: "Ditegakkan oleh skema, bukan oleh moderator",
  cat_search_query: "kampas rem · Avanza 1.5 G CVT",
  cat_katalog_label: "Mobeeli · Katalog",
  cat_count_fit: "4 dari 217 cocok untuk mobil Anda",
  cat_count_hidden: "· 213 disembunyikan karena tidak pas",
  cat_count_ai: "· disusun AI Mobeeli dari katalog milik penjual",
  cat_badge_genuine: "Genuine",
  cat_chip_unfit: "Tidak Pas",
  cat_part5_name: "Kampas Rem Keramik",
  cat_part5_spec: "1.3 E saja — as tidak cocok",
  cat_part1_name: "Busi Iridium",
  cat_part2_name: "Dekrup Kopling",
  cat_part3_name: "Shockbreaker Gas",
  cat_part4_name: "Kampas Rem Setara OEM",
  cat_sim_tag: "(Simulasi)",
  /* R16 ruling 2b — fitment specs, not simulated prices. Wording follows the
     existing ID precedents in this file: card_part_sub is "As depan · keramik"
     and fit3d_bore_v uses the comma decimal ("⌀ 54,1 mm").
     DRAFT WORDING — founder to confirm before this is treated as final. */
  cat_part1_spec: "2NR-VE · isi 4",
  cat_part2_spec: "manual · ⌀ 200 mm",
  cat_part3_spec: "belakang · gas · ET 45",
  cat_part4_spec: "As depan · keramik · 2NR-VE",
  cat_part_brand: "Setara OEM",
  cat_part_verified: "Terverifikasi",
  /* R18 call C. Wording follows this file's own precedents rather than being
     invented: fit3d_auth_v is "Genuine" → "Asli", and card_part_chip is
     "Verified fit" → "Dipastikan cocok".
     DRAFT WORDING — founder to confirm. */
  cat_verified_note: "Terverifikasi berarti dua hal: cocok untuk mobil Anda, dan barangnya asli.",
  cat_filter_active: "Filter Aktif",
  cat_car_alt: "Cetak biru kendaraan katalog",
  /* R16 §8 (ruling 4a) — measurement callouts. These are engineering tokens
     that do not translate: "PCD", "ET" and the engine code 2NR-VE are used
     as-is in Indonesian workshop parlance, exactly as cat_part3_spec already
     ships "ET 45" in the ID map. The bore callout reuses fit3d_bore_v, which
     already carries the comma decimal ("⌀ 54,1 mm").
     DRAFT WORDING — founder to confirm before this is treated as final. */
  cat_scan_pcd: "PCD 4 × 100",
  cat_scan_offset: "offset ET 45",
  cat_scan_lock: "2019 Avanza 1.5 G · 2NR-VE",
  garage_plate_label: "Atau masukkan Plat / Noka",
  garage_plate_placeholder: "B 1234 CD",
  garage_plate_btn: "Cari",
  garage_chip_label: "Garasi Saya",
  garage_chip_clear: "Hapus",
  how_s3_t: "Checkout dengan tenang",

  /* R20 band 2a. The five party names are taken VERBATIM from this map's own
     hero_sub_short ("Merek, distributor, toko, mekanik, dan pengemudi") so the
     page names the parties one consistent way. "suku cadang" follows the hero
     rather than prob_h2's "onderdil" — the formal register, since this band
     addresses the industry. "terverifikasi" matches cat_verified_note and
     cat_part_verified. DRAFT WORDING — founder to confirm. */
  plat_kicker: "Di seluruh industri",
  plat_h2: "Lima pihak. Satu platform di tengah.",
  plat_p:
    "Saat ini suku cadang yang sama dideskripsikan lima kali oleh lima pihak yang tidak pernah saling bicara. Dari situlah salah beli berasal — bukan karena ada yang ceroboh.",
  plat_src1_t: "Merek",
  plat_src1_s: "publikasikan sekali dengan benar",
  plat_src2_t: "Distributor",
  plat_src2_s: "kirim format apa pun",
  plat_src3_t: "Toko",
  plat_src3_s: "bahkan foto buku catatan",
  plat_dst1_t: "Toko",
  plat_dst1_s: "pasang tanpa ketik ulang",
  plat_dst2_t: "Mekanik",
  plat_dst2_s: "pesan untuk mobil yang ditangani",
  plat_dst3_t: "Pengemudi",
  plat_dst3_s: "lihat hanya yang cocok",
  plat_hub: "Platform",
  plat_step1: "Normalisasi",
  plat_step2: "Hapus duplikat",
  plat_step3: "Petakan ke kendaraan",
  plat_in_xls: "File Excel",
  plat_in_pdf: "File PDF",
  plat_in_jpg: "Foto buku catatan tulis tangan",
  plat_out: "terverifikasi",
  plat_a11y:
    "Merek, distributor, dan toko mengirim data suku cadang dalam format apa pun ke platform Mobeeli, yang memverifikasinya. Toko, mekanik, dan pengemudi kemudian menerima satu katalog terverifikasi yang bersih.",

  why_ds_title: "Lingkaran Setan Analog.",
  why_ds_sub: "Jaringan distribusi suku cadang saat ini merugikan kedua belah pihak.",
  why_ds_c1_t: "Efek Domino Margin",
  why_ds_c1_d: "Setiap kali barang berpindah tangan, margin bertambah ~15%.",
  why_ds_c2_t: "Banjir Suku Cadang KW",
  why_ds_c2_d: "Komponen OEM palsu diam-diam masuk ke stok toko melalui broker WhatsApp offline.",
  why_ds_c3_t: "Belenggu COD",
  why_ds_c3_d: "Nihilnya rasa saling percaya memaksa pembayaran 100% tunai, membekukan modal kerja.",
  /* Death-spiral mockup labels (R5 audit): keyed EN+ID, generic — no real
     manufacturer names on marketing surfaces, no hype punctuation. */
  why_ds_n_base: "Produsen",
  why_ds_n_base_tag: "Harga dasar",
  why_ds_n1: "Dealer utama",
  why_ds_n2: "Grosir regional",
  why_ds_n3: "Broker offline",
  why_ds_scan_ok: "Terautentikasi",
  why_ds_scan_bad: "Peringatan: palsu terdeteksi",
  why_ds_cod_l: "Butuh buffer tunai 100%",
  why_ds_cod_lock: "Modal terkunci",
  prot_r1: "Penyelesaian sengketa dengan bukti video",
  prot_r2: "Verifikasi barang asli",
  prot_r3: "Dana cair setelah barang cocok",
  cmp_h: "Pencarian sama, hasilnya beda jauh.",
  cmp_bad_t: "Di marketplace biasa",
  cmp_bad_1: "Ketik “kampas rem Brio 2018” — muncul 500 listing, tak ada yang paham mobil Anda.",
  cmp_bad_2: "Tanya penjual lewat WhatsApp, cocok atau tidak — dua-duanya cuma menebak.",
  cmp_bad_3: "Barang datang — beda generasi, salah tipe.",
  cmp_bad_4: "Ajukan retur, sengketa, menunggu — atau terpaksa menyimpan barang yang tak terpakai.",
  cmp_bad_res: "19,4% pesanan berakhir retur — 86% karena barang tidak cocok.",
  cmp_good_t: "Di Mobeeli",
  cmp_good_1: "Cukup sekali isi data mobil — tahun · merek · model · tipe.",
  cmp_good_2: "Hasil pencarian hanya menampilkan onderdil yang sudah diverifikasi cocok untuk mobil Anda.",
  cmp_good_3: "Barang tiba, langsung terpasang — memang sudah terverifikasi.",
  cmp_good_4: "Checkout terlindungi: dana cair setelah barang cocok.",
  cmp_good_res: "Sudah dipastikan cocok sebelum checkout — retur tak lagi jadi rutinitas.",
  why_kicker: "Kenapa Mobeeli",
  why_h2: "Biaya naik. Kepercayaan tidak.",
  why_p:
    "Pada Mei 2026, sejumlah marketplace besar menaikkan biaya penjual ke kisaran 17–20%. Mobeeli hadir sebagai alternatif yang memang dibangun untuk industri otomotif — kecocokan terverifikasi, biaya yang masuk akal, dan perlindungan untuk kedua belah pihak.",
  early_kicker: "Program Early Adopters",
  early_h2: "Biaya platform 0% untuk 300 toko pertama.",
  early_f1_t: "Daftar harga Anda, tayang otomatis",
  early_f1_d:
    "Kirim file Excel atau PDF Anda — AI kami mengubah daftar harga milik Anda sendiri jadi toko online dalam hitungan jam.",
  early_f2_t: "Perlindungan dari penipuan",
  early_f2_d: "Perlindungan bawaan dari penipuan, ditopang bukti video dan asuransi.",
  early_f3_t: "Satu komisi flat yang ringan",
  early_f3_d:
    "Setelah masa promo, berlaku satu tarif flat yang jauh lebih ringan dari biaya marketplace pada umumnya — transparan, mudah dihitung, dan dirancang agar penjual berkualitas tetap untung.",
  early_cta: "Gabung Waitlist",
  early_note: "300 toko pertama mengunci tarif 0% — daftarnya hanya dua menit.",
  buyer_line: "Butuh onderdil? Jadi yang pertama tahu begitu Mobeeli hadir di Jakarta.",
  buyer_cta: "Kabari saya",
  /* Buyer notify capture (F-015, CHG-piztanza-13) — inline email field in the buyer strip. */
  buyer_email_label: "Alamat email",
  buyer_email_ph: "nama@email.com",
  buyer_send: "Kabari saya →",
  buyer_sending: "Mengirim…",
  buyer_success: "Anda masuk daftar — kami kabari lewat email begitu Mobeeli hadir di Jakarta.",
  buyer_err_email: "Format email sepertinya belum benar.",
  buyer_err_fail: "Terjadi kendala — silakan coba lagi.",
  team_kicker: "Tim",
  /* FOUNDER DIRECTIVE 2026-07-30 ("Put all the focus on the ID translation
     now") superseded R29's founder-writes rule: Indonesian below is DRAFT
     for the founder's native review. team_quote reuses the founder's own
     shipped ID sentence from inv_p. */
  team_h2: "Kenali tim kami.",
  team_lede:
    "Menentukan visi. Membangun platform. Menyalurkan onderdil. Setiap tugas ada pemiliknya.",
  team_own1: "menentukan visi",
  team_own2: "membangun platform",
  team_own3: "menyalurkan onderdil",
  team_quote: "Sebagian besar toko yang kami datangi langsung mendaftar sore itu juga.",
  team_quote_by: "Program Early Adopters — Jakarta, 2026",
  team_n1: "Matheau Widjaja",
  team_r1: "CEO & Founder",
  team_n2: "Muhammad Salman Al Hafizh",
  team_r2: "CTO & Co-Founder",
  team_n3: "Ferdinansyah Husein",
  team_r3: "COO & Co-Founder",
  team_c1:
    "Seumur hidup di Kanada, berkarier di otomotif dan e-commerce teknologi — ia melihat celah di perdagangan onderdil Indonesia dan pulang untuk menutupnya.",
  team_c2:
    "Membangun platform ini sebelum ada pendanaan — dari mesin kecocokan, AI di balik unggahan penjual, sampai marketplace-nya.",
  team_c3:
    "Memegang operasional dan kemitraan — logistik, pembayaran, dan jalur distribusi grosir.",
  inv_kicker: "Untuk investor",
  inv_h2: "Lihat apa yang sudah kami bangun.",
  inv_p:
    "Mobeeli sudah dibangun, dan toko-toko di Jakarta sudah mulai bergabung — sebagian besar toko yang kami datangi langsung mendaftar sore itu juga. Kalau Anda mengikuti infrastruktur commerce di Asia Tenggara, kami ingin menunjukkan apa yang sedang kami siapkan.",
  inv_cta: "Minta deck",
  inv_or: "Ingin jalur langsung?",
  inv_contact_link: "Hubungi Mobeeli",
  nav_contact: "Kontak",
  /* FOUNDER DIRECTIVE 2026-07-30: Indonesian below is DRAFT for the
     founder's native review (supersedes the R30b founder-writes note). */
  contact_kicker: "Kontak",
  contact_h2: "Mari membangun bersama.",
  contact_p:
    "Kemitraan, media, pemasok, investor — kirim pesan dan Anda akan dibalas langsung oleh orang yang menangani topiknya. Tim kami kecil.",
  contact_direct: "Atau tulis langsung ke salah satu founder:",
  contact_form_h: "Kirim pesan ke kami",
  contact_f_name: "Nama Anda",
  contact_f_email: "Email",
  contact_f_topic: "Tentang apa ini?",
  contact_f_message: "Pesan",
  contact_ph_email: "nama@perusahaan.com",
  contact_ph_message: "Satu dua kalimat sudah cukup — apa yang Anda butuhkan dari kami?",
  contact_t_general: "Pertanyaan umum",
  contact_t_partnership: "Kemitraan",
  contact_t_press: "Pers & media",
  contact_t_supplier: "Pemasok atau grosir",
  contact_t_investor: "Investor",
  contact_f_send: "Kirim pesan",
  contact_f_note: "Tanpa nomor tiket, tanpa antrean — seseorang dari tim akan membalas.",
  contact_next_h: "Apa yang terjadi selanjutnya",
  contact_next_1: "Pesan Anda dibaca manusia — bukan inbox bersama, bukan bot.",
  contact_next_2:
    "Orang yang menangani topik Anda membalas secara pribadi, dari alamatnya sendiri.",
  contact_next_3:
    "Kalau cocok, langkah berikutnya adalah panggilan telepon — mengikuti zona waktu Anda, bukan kami.",
  contact_next_link: "Lihat siapa yang Anda hubungi",
  contact_email_hint: "Hanya dipakai untuk membalas Anda — tanpa milis, tidak dibagikan.",
  contact_f_fail:
    "Ada yang salah saat mengirim pesan Anda. Isian Anda tersimpan — silakan coba lagi.",
  contact_err_message: "Tulis satu dua kalimat supaya kami tahu apa yang Anda butuhkan.",
  contact_ramps_a: "Toko yang ingin bergabung?",
  contact_ramps_a_link: "Early Adopters",
  contact_ramps_a_end: "adalah pintu masuknya. ",
  contact_ramps_b: "Investor yang mencari deck?",
  contact_ramps_b_link: "Investor",
  contact_place_note:
    "Jakarta, Indonesia — masih pra-peluncuran, jadi email adalah satu-satunya kanal.",
  contact_sent_h: "Pesan terkirim.",
  contact_sent_p:
    "Pesan Anda sudah di tangan tim, dan Anda akan menerima balasan pribadi dari orang yang menangani topiknya — bukan antrean tiket.",
  contact_sent_again: "Kirim lagi",
  contact_sent_urgent: "Kami akan membalas ke alamat yang Anda berikan.",
  contact_privacy_link: "Privasi",
  /* FOUNDER DIRECTIVE 2026-07-30: Indonesian below is DRAFT for the
     founder's native + legal review. */
  nav_privacy: "Privasi",
  privacy_kicker: "Privasi",
  privacy_h2: "Apa yang kami lakukan dengan data Anda.",
  privacy_lede:
    "Mobeeli masih pra-peluncuran, dan situs ini sengaja dibuat senyap: tanpa cookie, tanpa pelacak, tanpa apa pun yang dimuat dari pihak ketiga. Halaman ini menjelaskan persis apa yang terjadi.",
  privacy_b1_h: "Pesan yang Anda kirim",
  privacy_b1_p:
    "Form kontak mengumpulkan nama, email, topik, dan pesan Anda. Semuanya dikirim ke tim sebagai email dan hanya dipakai untuk membalas Anda — tidak ada milis pemasaran, dan pesan tidak disimpan di database.",
  privacy_b2_h: "Pendaftaran waitlist",
  privacy_b2_p:
    /* MERGE 2026-08-02: the Notion/workspace disclosures landed on main while
       the ID copy pass was open. Both sides kept: their disclosure content is
       load-bearing (it is what the page discloses), the ID copy pass supplies
       the grammar. The recurring defect fixed here is the English
       gerund-subject calque — "Bergabung ... menyimpan ...", "Meminta ...
       mengirim ..." — which in Indonesian makes the ACT the agent of a
       transitive verb, so privacy_b3_p literally read as the deck doing the
       sending. Recast as "Saat Anda ...". Applied to privacy_b7_p too: it
       arrived with the same construction. */
    "Saat Anda bergabung ke waitlist Early Adopters, kami menyimpan detail usaha yang Anda berikan, beserta salinannya di ruang kerja internal kami, agar bisa menghubungi Anda soal program ini. Data itu tidak dipakai untuk hal lain.",
  privacy_b3_h: "Permintaan deck",
  privacy_b3_p:
    "Saat Anda meminta deck investor, nama, firma, dan email kerja Anda dikirim ke tim lewat email dan dipakai untuk tindak lanjut secara pribadi. Detail yang sama, ditambah negara asal permintaan, dicatat di ruang kerja internal kami agar tindak lanjutnya terpantau. Tidak diteruskan ke mana pun.",
  privacy_b7_h: "Pemberitahuan peluncuran",
  privacy_b7_p:
    "Saat Anda meminta pemberitahuan peluncuran, email Anda disimpan di penyedia email kami agar kami bisa mengirim satu pengumuman itu, dan pendaftarannya — beserta negara asalnya — dicatat di ruang kerja internal kami. Setiap pesan menyertakan tautan berhenti berlangganan.",
  privacy_b4_h: "Di perangkat Anda",
  privacy_b4_p:
    "Situs ini tidak memasang cookie. Hanya ada dua preferensi yang disimpan di browser Anda — bahasa dan kendaraan yang Anda pilih di demo. Keduanya tidak pernah meninggalkan perangkat Anda.",
  privacy_b5_h: "Pihak ketiga",
  privacy_b5_p:
    "Tidak ada apa pun di situs ini yang dimuat dari pihak ketiga — tanpa analytics, tanpa skrip tertanam, tanpa font eksternal. Pengiriman email berjalan lewat penyedia email, dan permintaan deck dicatat di aplikasi ruang kerja yang dipakai tim; keduanya bekerja atas instruksi kami.",
  privacy_b6_h: "Hak Anda",
  privacy_b6_p:
    "Berdasarkan Undang-Undang Pelindungan Data Pribadi (UU PDP 27/2022), Anda dapat menanyakan data apa yang kami simpan tentang Anda, memintanya diperbaiki, atau dihapus. Satu alamat menangani semuanya:",
  /* Deck request form on /investors (F-016) — name/firm/work-email required. */
  inv_f_name: "Nama Anda",
  inv_f_firm: "Perusahaan / dana investasi",
  inv_f_email: "Email kerja",
  inv_f_linkedin: "LinkedIn atau situs web (opsional)",
  inv_f_message: "Ada hal lain? (opsional)",
  inv_f_send: "Kirim permintaan →",
  inv_f_sending: "Mengirim…",
  inv_err_name: "Mohon isi nama Anda.",
  inv_err_firm: "Mohon isi nama perusahaan atau dana investasi Anda.",
  inv_err_email: "Format email sepertinya belum benar.",
  inv_f_fail:
    "Terjadi kendala saat mengirim permintaan Anda. Jawaban Anda tersimpan — silakan coba lagi.",
  inv_success_h: "Permintaan diterima.",
  inv_success_p: "Terima kasih — salah satu founder akan menghubungi Anda secara pribadi dan mengirimkan deck.",
  /* Hosted deck viewer + expired-link page (F-016). */
  deck_loading: "Memuat deck…",
  deck_error: "Deck gagal dimuat. Muat ulang halaman atau minta tautan baru.",
  deck_expired_h: "Tautan ini sudah kedaluwarsa.",
  deck_expired_p:
    "Tautan deck berlaku sementara. Minta tautan baru dan salah satu founder akan menindaklanjuti langsung.",
  deck_invalid_h: "Tautan ini tidak valid.",
  deck_invalid_p:
    "Tautan mungkin tersalin tidak lengkap. Minta tautan baru dan salah satu founder akan menindaklanjuti langsung.",
  deck_expired_cta: "Minta deck",
  /* Founder-only /deck-admin (F-016) — internal tool, identical in both languages. */
  da_h: "Deck link admin",
  da_hours_label: "Custom duration (hours)",
  da_hours_btn: "Generate link",
  da_link_label: "Deck link",
  da_expires: "Expires: {t}",
  da_never: "Never expires",
  da_copy: "Copy link",
  da_copied: "Copied ✓",
  da_notion_btn: "Record in Notion",
  da_notion_saved: "Saved to Notion: link, expiry and status updated on the request.",
  da_notion_failed: "Could not update Notion — put the link on the row by hand.",
  cat_h2: "Satu katalog, disusun dari yang dikirim penjual.",
  cat_p:
    "Penjual mengirim file Excel, PDF, sampai foto catatan tulis tangan mereka sendiri — AI Mobeeli membaca kiriman itu, lalu merapikannya jadi satu katalog yang terpetakan ke setiap mobil di jalanan.",
  cat_pill: "✓ Satu katalog · 120 juta+ data kecocokan (Simulasi)",
  cat_ai_read: "AI Mobeeli · membaca 3 unggahan penjual…",
  cat_ai_done: "AI Mobeeli · unggahan penjual selesai disusun ✓",
  scn1: "Kampas rem",
  scn2: "Filter oli",
  scn3: "Busi",
  scn4: "Cakram rem",
  scn5: "Sokbreker",
  scn6: "Filter udara",
  uni_kicker: "Menuju seluruh Nusantara",
  uni_h2: "Dari Sabang sampai Merauke, satu katalog.",
  uni_p:
    "100.000+ bengkel dan ribuan toko onderdil akhirnya berbicara dalam bahasa yang sama — mulai dari Jakarta pada 2026, lalu pulau demi pulau.",
  uni_drag: "Geser petanya — kami mulai dari Jakarta.",
  indo_city: "Jakarta",
  indo_note: "— pasar pertama, 2026",
  foot_tag: "Satu platform untuk menyatukan industri otomotif Indonesia.",
  foot_copyright: "Mobeeli — Jakarta, Indonesia",
  foot_menu_a11y: "Tautan situs",
  foot_col_company: "Perusahaan",
  foot_col_product: "Produk",
  foot_coverage: "Jangkauan",
  careers_kicker: "Karier",
  careers_h2: "Ikut membangun tulang punggung industri suku cadang.",
  careers_p:
    "Mobeeli adalah tim pendiri kecil di Jakarta yang membangun satu katalog suku cadang terverifikasi untuk industri otomotif Indonesia. Kami belum meluncur, dan kami merekrut dengan hati-hati.",
  careers_open:
    "Belum ada lowongan yang ditampilkan saat ini. Begitu ada posisi baru, kami akan menampilkannya di halaman ini.",
  careers_cta: "Merasa kita perlu bertemu? Tulis kepada kami.",

  /* Join Waitlist page (F-007) — keys mirror the Join Waitlist.dc.html TXT map, jw_-prefixed. */
  jw_back_home: "← Kembali ke Mobeeli",
  jw_offer: "Biaya platform 0% · 300 toko pertama",
  jw_left_h: "Jadilah salah satu toko pertama di Mobeeli.",
  jw_left_sub:
    "Ceritakan tentang bisnis Anda. Salah satu founder akan menghubungi Anda langsung — menyatakan minat tidak dipungut biaya dan tidak mengikat.",
  jw_ben1_t: "Daftar harga Anda, tayang otomatis",
  jw_ben1_s: "File Excel atau PDF milik Anda — AI kami menyusunnya dalam hitungan jam.",
  jw_ben2_t: "Perlindungan bawaan dari penipuan",
  jw_ben2_s: "Ditopang bukti video dan asuransi.",
  jw_ben3_t: "Satu komisi flat yang ringan",
  jw_ben3_s: "Setelah promo — jauh di bawah marketplace besar.",
  jw_trust: "Pilot pra-peluncuran · detail Anda tetap di tim pendiri.",
  jw_eyebrow: "Jadi partner",
  jw_introTitle: "Gabung Mobeeli",
  jw_introBody:
    "Ceritakan sedikit tentang bisnis Anda dalam beberapa langkah singkat. Salah satu founder akan menghubungi Anda langsung lewat WhatsApp atau email.",
  jw_start: "Mulai →",
  jw_minutes: "Hanya sekitar satu menit.",
  jw_stepType: "Siapa Anda",
  jw_stepBusiness: "Bisnis Anda",
  jw_stepContact: "Cara menghubungi",
  jw_stepDetails: "Beberapa detail",
  jw_qType: "Mana yang paling sesuai?",
  jw_qBusiness: "Ceritakan tentang bisnis Anda.",
  jw_qContact: "Di mana kami bisa menghubungi Anda?",
  jw_qDetails: "Ada hal lain yang membantu kami bersiap?",
  jw_typeStore: "Toko / Penjual",
  jw_typeStoreSub: "Jual onderdil online",
  jw_typeGarage: "Bengkel",
  jw_typeGarageSub: "Beli untuk mobil pelanggan",
  jw_typeDist: "Distributor",
  jw_typeDistSub: "Grosir ke bengkel",
  jw_contactName: "Nama kontak (opsional)",
  jw_email: "Email (opsional)",
  jw_contactPhone: "Telepon (opsional)",
  jw_whatsapp: "WhatsApp (opsional)",
  jw_city: "Kota (opsional)",
  jw_pickCity: "Pilih kota…",
  jw_cityOther: "Lainnya",
  jw_volume: "Volume order per bulan (opsional)",
  jw_pickVolume: "Pilih volume…",
  jw_toolsUsed: "Tools yang dipakai sekarang (boleh beberapa)",
  jw_brands: "Brand yang Anda jual (opsional)",
  jw_brandsPh: "mis. Denso, Aspira, NGK",
  jw_net30: "Tertarik termin pembayaran Net-30 (jika disetujui)",
  jw_message: "Ada hal lain? (opsional)",
  jw_back: "← Kembali",
  jw_next: "Lanjut →",
  jw_submit: "Kirim →",
  jw_bizStore: "Nama toko",
  jw_bizGarage: "Nama bengkel",
  jw_bizDist: "Nama perusahaan",
  jw_bizPhStore: "mis. Jaya Motor Parts",
  jw_bizPhGarage: "mis. Bengkel Sumber Rejeki",
  jw_bizPhDist: "mis. Sinar Sparepart Nusantara",
  jw_errBiz: "Mohon isi nama bisnis Anda.",
  jw_errEmail: "Format email sepertinya belum benar.",
  jw_errPhone: "Format nomor sepertinya belum benar.",
  jw_successTitle: "Pendaftaran Anda diterima.",
  jw_succBody:
    "Terima kasih, {n}. Salah satu founder akan menghubungi Anda langsung lewat email. Ingin terhubung lebih cepat? Email kami sekarang.",
  jw_emailCta: "Email kami",
  jw_homeCta: "Kembali ke Mobeeli",
  /* Design-hardcoded visible strings promoted to keys (identical in both languages). */
  jw_ph_email: "nama@toko.com",
  jw_ph_phone: "+62 812 …",
  /* Success/mailto interpolation strings for the prefilled email CTA. */
  jw_fallback_name: "rekan",
  jw_mail_subject: "Waitlist Early Adopter — {n}",
  jw_mail_body: "Halo Mobeeli, saya baru daftar Early Adopter. Bisnis: {n}. Saya ingin mulai.",
  /* Submit states (F-008 — the design stops at a client-side success). */
  jw_submitting: "Mengirim…",
  jw_submitErr:
    "Terjadi kendala saat mengirim pendaftaran Anda. Jawaban Anda tersimpan — silakan coba lagi.",
};

export const copy: Record<Lang, Record<CopyKey, string>> = { en, id };
