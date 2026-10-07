import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals, // React, hooks, Next.js and accessibility rules
  ...nextTs, // TypeScript rules (e.g. no-explicit-any)
  prettier, // turns off stylistic rules that conflict with Prettier; keep after the configs above
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
