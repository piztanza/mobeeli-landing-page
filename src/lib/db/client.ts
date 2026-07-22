import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

let db: NeonHttpDatabase<typeof schema> | null = null;

/**
 * Lazily-initialized Drizzle client over Neon Postgres.
 * DATABASE_URL is read at call time (server only) so importing this module
 * never requires the secret — only actually querying does.
 */
export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set — configure it in the server environment.");
    }
    db = drizzle(neon(url), { schema });
  }
  return db;
}
