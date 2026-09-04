import js from "@eslint/js";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import next from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "node_modules/**",
      "public/**",
      "husky.config.js",
      "jest.config.js",
      "next.config.js",
      "i18n.ts"
    ]
  },
  js.configs.recommended,
  // Brings in the next, react, react-hooks, import and jsx-a11y plugins
  ...next,
  ...tanstackQuery.configs["flat/recommended"],
  prettier,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        NodeJS: true
      }
    },
    plugins: {
      "unused-imports": unusedImports
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // React Compiler rules, new in eslint-plugin-react-hooks 7. Kept as
      // warnings so they can be worked through incrementally rather than
      // failing the whole lint run on day one of the Next 16 upgrade.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/use-memo": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/incompatible-library": "warn",
      "react-hooks/globals": "warn",
      "react-hooks/unsupported-syntax": "warn",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ]
    }
  },
  {
    // TypeScript already resolves these; core no-undef only produces false
    // positives on type-only globals such as JSX, RequestInit and NodeListOf.
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-undef": "off"
    }
  }
];

export default eslintConfig;
