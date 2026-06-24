import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"

// Flat-config. Свідомо консервативний набір: база JS + typescript-eslint (без
// type-aware рулів — швидко), правила хуків React і react-refresh. exhaustive-deps
// лишаємо як warning (не валить CI), щоб поступово розгребти 41 наявний inline-disable.
export default tseslint.config([
  { ignores: ["dist", "coverage", "node_modules"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  // Тести: Vitest-глобали (describe/it/expect/vi) + допускаємо порожні функції-моки.
  {
    files: ["**/*.{test,spec}.{ts,tsx}", "src/test/**"],
    languageOptions: { globals: { ...globals.node } },
  },
  // Node-конфіги поза src.
  {
    files: ["*.config.{js,ts}", "vite.config.ts"],
    languageOptions: { globals: globals.node },
  },
])
