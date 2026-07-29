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
  quote_main:
    "Toko saya sampai ditutup karena terlalu banyak retur COD. Platform menghukum saya. Bukan pembelinya.",
  quote_en:
    "“My shop was closed because of too many returns from COD. The platform penalized me. Not the customer.”",
  quote_by: "Shop owner, Senen Market, Jakarta — shared with permission",
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
  cat_count_ai: "· catalogue assembled by Mobeeli AI",
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
  why_ds_c1_d: "Every hop (Principal → Distributor → Wholesale → Store → Garage) stacks ~15% margin.",
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
  early_f1_t: "Automated catalog uploads",
  early_f1_d:
    "Thousands of SKUs uploaded automatically by AI — Excel files or PDFs become an online store in hours.",
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
  team_h2: "Three founders. One engine.",
  team_n1: "Yavet Arimathea Widjaja",
  team_r1: "CEO & Founder",
  team_n2: "Muhammad Salman Al Hafizh",
  team_r2: "CTO & Co-Founder",
  team_n3: "Ferdinansyah Husein",
  team_r3: "COO & Co-Founder",
  /* FOUNDER RULING 2026-07-29: the "9 of 14" count is retired everywhere —
     the small denominator undersold the real signal, which is conversion
     speed. Keep the honest fact (most shops visited signed the same
     afternoon), never a raw count. */
  team_c1: "Signed Mobeeli's first shops in a single afternoon — runs market strategy and the seller program.",
  team_c2:
    "Built the platform pre-funding — the fitment engine, gated AI ingestion, the marketplace.",
  team_c3: "Runs operations and partnerships — logistics, payments, and the wholesaler pipeline.",
  inv_kicker: "For investors",
  inv_h2: "Come see what we've built.",
  inv_p:
    "Mobeeli is built, and Jakarta's shops are already signing on — most of the shops we visited signed the same afternoon. If you follow commerce infrastructure in Southeast Asia, we'd like to show you what's coming.",
  inv_cta: "Request the deck",
  inv_or: "or write to the founders directly",
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
  cat_h2: "The catalog that puts itself together.",
  cat_p:
    "Excel sheets, PDFs, even photos of handwritten ledgers — Mobeeli's AI reads them all and builds one clean catalog, mapped to every car on the road.",
  cat_pill: "✓ One catalog · 120M+ mappings (Simulation)",
  cat_ai_read: "Mobeeli AI · reading 3 catalogs…",
  cat_ai_done: "Mobeeli AI · catalog assembled ✓",
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
  jw_ben1_t: "Automated catalog uploads",
  jw_ben1_s: "Excel or PDF becomes an online store in hours.",
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
  "join.title": "Join Waitlist",
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
  hero_chip: "Launching 2026 — Jakarta, Indonesia",
  hero_sub:
    "Mobeeli adalah infrastruktur kepercayaan untuk aftermarket otomotif Indonesia senilai $5,3 miliar — marketplace suku cadang tempat setiap barang dipastikan cocok sebelum checkout, penjual membawa pulang lebih banyak dari tiap transaksi, dan dua belah pihak sama-sama terlindungi.",
  /* Slim-landing hero sub (redesign phase 4) — the deck's approved thesis line
     (mobeeli-site: One platform to unify Indonesia's auto industry), kept broad
     per founder direction: no market figures, no moat mechanics on the front page. */
  hero_sub_short:
    "Merek, distributor, toko, mekanik, dan pengemudi — satu katalog terverifikasi untuk industri otomotif Indonesia.",
  hero_cta_inv: "Untuk investor",
  hero_cta_shops: "Gabung Program Early Adopters",
  /* audit #24 — a11y pause control for the rotating hero headline. */
  hero_pause: "Jeda judul yang berputar",
  hero_resume: "Lanjutkan judul yang berputar",

  /* R11 YMM Vehicle Picker keys */
  ymm_picker_label: "Pilih kecocokan kendaraan:",
  ymm_year: "Tahun",
  ymm_make: "Merek",
  ymm_model: "Model",
  ymm_trim: "Varian",
  ymm_scanning: "MEMINDAI KECOCOKAN KENDARAAN...",
  ymm_verified: "TERVERIFIKASI COCOK: Toyota Avanza 1.5 G",
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
  prob_t3_chip: "Mobeeli: satu tarif flat, ringan",
  quote_main:
    "Toko saya sampai ditutup karena terlalu banyak retur COD. Platform menghukum saya. Bukan pembelinya.",
  quote_en:
    "“My shop was closed because of too many returns from COD. The platform penalized me. Not the customer.”",
  quote_by: "Pemilik toko, Pasar Senen, Jakarta — dibagikan seizin beliau",
  prob_lede:
    "Setiap onderdil punya tepat satu pasangan — satu tahun, satu trim, satu mesin. Di halaman listing semuanya terlihat sama. Itulah inti masalahnya.",
  prob_link: "Angka di balik masalah ini",
  prob_badge: "Satu onderdil, satu pasangan",
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
  cat_unified_h2: "Satu listing terverifikasi per suku cadang. Siapa pun yang mendeskripsikannya.",
  cat_unified_p:
    "Merek, distributor, dan toko menamai suku cadang yang sama dengan cara berbeda. Mobeeli menyatukannya menjadi satu listing, lalu memeriksanya terhadap mobil Anda sebelum Anda melihatnya.",
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
  cat_sku_title: "Satu listing per suku cadang. Setiap merek punya sendiri.",
  cat_sku_sub: "Ditegakkan oleh skema, bukan oleh moderator",
  cat_search_query: "kampas rem · Avanza 1.5 G CVT",
  cat_katalog_label: "Mobeeli · Katalog",
  cat_count_fit: "4 dari 217 cocok untuk mobil Anda",
  cat_count_hidden: "· 213 disembunyikan karena tidak pas",
  cat_count_ai: "· katalog disusun oleh Mobeeli AI",
  cat_badge_genuine: "Genuine",
  cat_chip_unfit: "Tidak Pas",
  cat_part5_name: "Ceramic Pad Set",
  cat_part5_spec: "1.3 E only — as tidak cocok",
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
    "Hari ini suku cadang yang sama dideskripsikan lima kali oleh lima pihak yang tidak pernah saling bicara. Dari situlah salah beli berasal — bukan karena ada yang ceroboh.",
  plat_src1_t: "Merek",
  plat_src1_s: "publikasi sekali, benar",
  plat_src2_t: "Distributor",
  plat_src2_s: "kirim format apa pun",
  plat_src3_t: "Toko",
  plat_src3_s: "bahkan foto buku catatan",
  plat_dst1_t: "Toko",
  plat_dst1_s: "pasang tanpa ketik ulang",
  plat_dst2_t: "Mekanik",
  plat_dst2_s: "pesan untuk mobil di bengkel",
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
  why_ds_c1_d: "Setiap pemindahan tangan membebankan tambahan marjin buta ~15%.",
  why_ds_c2_t: "Injeksi Suku Cadang KW",
  why_ds_c2_d: "Masuknya komponen OEM palsu merajalela melalui broker WhatsApp tanpa verifikasi.",
  why_ds_c3_t: "Belenggu COD",
  why_ds_c3_d: "Grosir konvensional membekukan modal kerja dengan memaksa bayar 100% tunai.",
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
  cmp_bad_res: "19,4% pesanan berakhir retur — 86% karena salah kecocokan.",
  cmp_good_t: "Di Mobeeli",
  cmp_good_1: "Cukup sekali isi data mobil — tahun · merek · model · tipe.",
  cmp_good_2: "Hasil pencarian hanya menampilkan onderdil yang pasti cocok untuk mobil Anda.",
  cmp_good_3: "Barang tiba, langsung terpasang — sesuai janji.",
  cmp_good_4: "Checkout terlindungi: dana cair setelah barang cocok.",
  cmp_good_res: "Sudah dipastikan cocok sebelum checkout — retur tak lagi jadi rutinitas.",
  why_kicker: "Kenapa Mobeeli",
  why_h2: "Biaya naik. Kepercayaan tidak.",
  why_p:
    "Mei 2026, marketplace besar menaikkan biaya penjual hingga sekitar 17–20%. Mobeeli hadir sebagai alternatif yang memang dibangun untuk industri otomotif — kecocokan terjamin, biaya masuk akal, dan perlindungan untuk dua belah pihak.",
  early_kicker: "Program Early Adopters",
  early_h2: "Biaya platform 0% untuk 300 toko pertama.",
  early_f1_t: "Unggah katalog serba otomatis",
  early_f1_d:
    "Ribuan SKU terunggah otomatis oleh AI — dari file Excel atau PDF jadi toko online hanya dalam hitungan jam.",
  early_f2_t: "Perlindungan dari penipuan",
  early_f2_d: "Perlindungan bawaan dari penipuan, ditopang bukti video dan asuransi.",
  early_f3_t: "Satu komisi flat yang ringan",
  early_f3_d:
    "Setelah masa promo, berlaku satu tarif flat yang jauh lebih ringan dari biaya marketplace pada umumnya — transparan, mudah dihitung, dan menjaga penjual tetap untung.",
  early_cta: "Join Waitlist",
  early_note: "300 toko pertama mengunci tarif 0% — daftarnya cuma dua menit.",
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
  team_h2: "Tiga founder. Satu mesin.",
  team_n1: "Yavet Arimathea Widjaja",
  team_r1: "CEO & Founder",
  team_n2: "Muhammad Salman Al Hafizh",
  team_r2: "CTO & Co-Founder",
  team_n3: "Ferdinansyah Husein",
  team_r3: "COO & Co-Founder",
  team_c1:
    "Meneken toko-toko pertama Mobeeli dalam satu sore — memegang strategi pasar dan program penjual.",
  team_c2:
    "Membangun platform ini sebelum ada pendanaan — dari mesin kecocokan, ingesti AI, sampai marketplace-nya.",
  team_c3:
    "Memegang operasional dan kemitraan — logistik, pembayaran, dan jalur distribusi grosir.",
  inv_kicker: "Untuk investor",
  inv_h2: "Lihat apa yang sudah kami bangun.",
  inv_p:
    "Mobeeli sudah jadi, dan toko-toko di Jakarta sudah mulai bergabung — sebagian besar toko yang kami datangi setuju di sore yang sama. Kalau Anda mengikuti infrastruktur commerce di Asia Tenggara, kami ingin menunjukkan apa yang kami persiapkan.",
  inv_cta: "Minta deck",
  inv_or: "atau langsung hubungi para founder",
  /* Deck request form on /investors (F-016) — name/firm/work-email required. */
  inv_f_name: "Nama Anda",
  inv_f_firm: "Firma / dana investasi",
  inv_f_email: "Email kerja",
  inv_f_linkedin: "LinkedIn atau situs web (opsional)",
  inv_f_message: "Ada hal lain? (opsional)",
  inv_f_send: "Kirim permintaan →",
  inv_f_sending: "Mengirim…",
  inv_err_name: "Mohon isi nama Anda.",
  inv_err_firm: "Mohon isi nama firma atau dana investasi Anda.",
  inv_err_email: "Format email sepertinya belum benar.",
  inv_f_fail:
    "Terjadi kendala saat mengirim permintaan Anda. Jawaban Anda tersimpan — silakan coba lagi.",
  inv_success_h: "Permintaan diterima.",
  inv_success_p: "Terima kasih — salah satu founder akan menindaklanjuti langsung dengan deck-nya.",
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
  cat_h2: "Katalog yang menyusun dirinya sendiri.",
  cat_p:
    "File Excel, PDF, sampai foto catatan tulis tangan — AI Mobeeli membaca semuanya, lalu merapikannya jadi satu katalog yang terpetakan ke setiap mobil di jalanan.",
  cat_pill: "✓ Satu katalog · 120 juta+ data kecocokan (Simulasi)",
  cat_ai_read: "AI Mobeeli · sedang membaca 3 katalog…",
  cat_ai_done: "AI Mobeeli · katalog selesai disusun ✓",
  scn1: "Kampas rem",
  scn2: "Filter oli",
  scn3: "Busi",
  scn4: "Cakram rem",
  scn5: "Sokbreker",
  scn6: "Filter udara",
  uni_kicker: "Menuju seluruh Nusantara",
  uni_h2: "Dari Sabang sampai Merauke, satu katalog.",
  uni_p:
    "100.000+ bengkel dan ribuan toko onderdil, akhirnya bicara dalam bahasa katalog yang sama — mulai dari Jakarta di 2026, lalu pulau demi pulau.",
  uni_drag: "Geser petanya — kami mulai dari Jakarta.",
  indo_city: "Jakarta",
  indo_note: "— pasar pertama, 2026",
  foot_tag: "Satu platform yang menyatukan industri otomotif Indonesia.",
  foot_copyright: "Mobeeli — Jakarta, Indonesia",
  foot_menu_a11y: "Tautan situs",
  foot_col_company: "Perusahaan",
  foot_col_product: "Produk",
  foot_coverage: "Jangkauan",
  careers_kicker: "Karier",
  careers_h2: "Ikut membangun tulang punggung suku cadang.",
  careers_p:
    "Mobeeli adalah tim pendiri kecil di Jakarta yang membangun satu katalog suku cadang terverifikasi untuk industri otomotif Indonesia. Kami belum meluncur, dan kami merekrut dengan hati-hati.",
  careers_open:
    "Belum ada lowongan yang dibuka saat ini. Saat lowongan dibuka, lowongan itu akan tampil di halaman ini.",
  careers_cta: "Merasa kita perlu bertemu? Tulis kepada kami.",

  /* Join Waitlist page (F-007) — keys mirror the Join Waitlist.dc.html TXT map, jw_-prefixed. */
  jw_back_home: "← Kembali ke Mobeeli",
  jw_offer: "Biaya platform 0% · 300 toko pertama",
  jw_left_h: "Jadi salah satu toko pertama di Mobeeli.",
  jw_left_sub:
    "Ceritakan tentang bisnis Anda. Salah satu founder akan menghubungi langsung — tanpa bayar, tanpa komitmen untuk menyatakan minat.",
  jw_ben1_t: "Unggah katalog serba otomatis",
  jw_ben1_s: "File Excel atau PDF jadi toko online dalam hitungan jam.",
  jw_ben2_t: "Perlindungan penipuan bawaan",
  jw_ben2_s: "Ditopang bukti video dan asuransi.",
  jw_ben3_t: "Satu komisi flat yang ringan",
  jw_ben3_s: "Setelah promo — jauh di bawah marketplace besar.",
  jw_trust: "Pilot pra-peluncuran · data Anda hanya dipegang tim pendiri.",
  jw_eyebrow: "Jadi partner",
  jw_introTitle: "Gabung Mobeeli",
  jw_introBody:
    "Ceritakan sedikit tentang bisnis Anda lewat beberapa langkah singkat. Salah satu founder akan menghubungi langsung lewat WhatsApp atau email.",
  jw_start: "Mulai →",
  jw_minutes: "Cuma sekitar satu menit.",
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
  jw_typeGarageSub: "Beli untuk mobil di lift",
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
  jw_net30: "Tertarik fasilitas kredit Tempo Net-30 (jika disetujui)",
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
    "Terima kasih, {n}. Salah satu founder akan menghubungi langsung lewat email. Ingin ngobrol lebih cepat? Email kami sekarang.",
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
