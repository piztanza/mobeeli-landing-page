/**
 * Approved founder direct-contact addresses (F-009). Moved OUT of
 * ContactSection by R30b's no-address ruling: /contact renders no email
 * address at all (the form is the channel; info@ lives in the footer), and
 * the ★ contract test greps the component for "@mobeeli.com" — so the list
 * lives here for any surface that still needs it.
 */
export const FOUNDER_EMAILS = [
  "matheau@mobeeli.com",
  "hafizh@mobeeli.com",
  "ferdi@mobeeli.com",
] as const;
