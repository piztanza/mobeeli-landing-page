import { describe, expect, it } from "vitest";

import { copy, langs } from "@/lib/i18n";

/*
 * FOUNDER RULING 2026-08-01 — DATA PROVENANCE IN COPY.
 *
 * No user-facing string may suggest that Mobeeli ingests, scrapes, harvests or
 * otherwise helps itself to anyone's data. Sellers hand us their OWN files;
 * the platform lists them. "AI" survives as a capability claim, but it is
 * never described acting on files by itself — every such sentence names whose
 * file it is.
 *
 * This matters beyond tone: the site is investor-facing, and a line that reads
 * as scraping is a claim about how the catalogue was obtained.
 *
 * Retired by this ruling: "gated AI ingestion" (/team), "catalogue assembled
 * by Mobeeli AI" (/), "Thousands of SKUs uploaded automatically by AI"
 * (/early-adopters), "Mobeeli's AI reads them all" (dormant card).
 */

const entries = langs.flatMap((lang) =>
  Object.entries(copy[lang]).map(([key, value]) => ({ lang, key, value })),
);

/** Words that describe taking data, in either language. */
const BANNED = [
  "ingest", // EN
  "ingesti", // ID
  "scrape",
  "scraping",
  "scrap", // ID "scraping" borrowings
  "crawl",
  "harvest",
  "data mining",
  "menambang data",
  "mengeruk",
];

/** Tokens that mean "our AI is the actor". */
const AI = ["mobeeli ai", "ai mobeeli", "our ai", "ai kami"];

/** Tokens that mean "a file / catalogue of parts data". */
const FILE = [
  "excel",
  "pdf",
  "price list",
  "daftar harga",
  "catalog",
  "catalogue",
  "katalog",
  "upload",
  "unggah",
  "ledger",
  "catatan",
];

/** Tokens that attribute the file to the person handing it over. */
const OWNERSHIP = [
  "your",
  "yours",
  "seller",
  "sellers",
  "seller's",
  "sellers'",
  "anda",
  "penjual",
  "milik",
  "mereka", // ID "their"
];

describe("copy never implies Mobeeli takes data (founder ruling 2026-08-01)", () => {
  it("uses no ingestion, scraping or harvesting vocabulary", () => {
    const hits = entries.filter(({ value }) =>
      BANNED.some((w) => value.toLowerCase().includes(w)),
    );
    expect(
      hits.map((h) => `${h.lang}.${h.key}: ${h.value}`),
      "these strings describe taking data rather than being given it",
    ).toEqual([]);
  });

  it("never lets the AI act on files without naming whose files they are", () => {
    // The structural form of the ruling: if a sentence puts our AI and a file
    // in the same breath, it must also say the file belongs to the seller.
    const offenders = entries.filter(({ value }) => {
      const v = value.toLowerCase();
      const mentionsAi = AI.some((w) => v.includes(w));
      const mentionsFile = FILE.some((w) => v.includes(w));
      if (!mentionsAi || !mentionsFile) return false;
      return !OWNERSHIP.some((w) => v.includes(w));
    });
    expect(
      offenders.map((h) => `${h.lang}.${h.key}: ${h.value}`),
      "AI + a file, with no owner named — reads as helping ourselves",
    ).toEqual([]);
  });

  it("keeps the specific retired phrasings out", () => {
    const RETIRED = [
      "assembled by mobeeli ai",
      "disusun oleh mobeeli ai",
      "uploaded automatically by ai",
      "terunggah otomatis oleh ai",
      "reads them all",
      "membaca semuanya",
      "puts itself together",
      "menyusun dirinya sendiri",
    ];
    const hits = entries.filter(({ value }) =>
      RETIRED.some((p) => value.toLowerCase().includes(p)),
    );
    expect(hits.map((h) => `${h.lang}.${h.key}: ${h.value}`)).toEqual([]);
  });
});
