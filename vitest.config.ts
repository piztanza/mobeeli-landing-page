import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Vitest 4 transforms with oxc (rolldown); tsconfig has jsx: "preserve" for Next,
  // so tell oxc to compile JSX with the automatic runtime in tests.
  oxc: {
    jsx: { runtime: "automatic" },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Font packages need the Next compiler; tests get static stubs (R4/R6).
      "next/font/google": fileURLToPath(new URL("./tests/stubs/next-font-google.ts", import.meta.url)),
      "geist/font/sans": fileURLToPath(new URL("./tests/stubs/geist-font-sans.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
