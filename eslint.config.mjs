import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // .ba/ holds orchestrator specs + design reference files — not product source.
  // design_handoff_r16_landing/ is the same: Claude Design's .dc.html prototypes
  // and their bundled support.js are references to build FROM, never shipped.
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "next-env.d.ts",
    ".ba/**",
    "design_handoff_r16_landing/**",
  ]),
]);

export default eslintConfig;
