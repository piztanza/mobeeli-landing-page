import path from "node:path";

/**
 * The private pitch deck (F-016). Lives under private/ (NOT public/) so it is
 * never a static asset; it ships with the serverless bundle via
 * outputFileTracingIncludes in next.config.ts.
 */
export const DECK_PDF_PATH = path.join(
  process.cwd(),
  "private",
  "deck",
  "mobeeli-pitchdeck.pdf",
);
