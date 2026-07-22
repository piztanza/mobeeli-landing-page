import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // .ba/ holds orchestrator specs + design reference files — not product source.
  globalIgnores(["node_modules/**", ".next/**", "out/**", "next-env.d.ts", ".ba/**"]),
]);

export default eslintConfig;
