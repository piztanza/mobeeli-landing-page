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
      // next/font needs the Next compiler; tests get a static stub (R4).
      "next/font/google": fileURLToPath(new URL("./tests/stubs/next-font-google.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
