import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Set in the environment (Vercel env vars / .env.local) — never committed.
    url: process.env.DATABASE_URL ?? "",
  },
});
