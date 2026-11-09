import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'apps', 'packages']),

  /* ── Browser code (src/**) ─────────────────────────────── */
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      /* `motion` and `AnimatePresence` are JSX namespace bindings
         (`<motion.div>`, `<AnimatePresence>`). The default JS rule doesn't
         see those usages — without `eslint-plugin-react` they look unused.
         We whitelist them explicitly rather than pull in another plugin. */
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^([A-Z_]|motion|AnimatePresence)',
      }],

      /* React Compiler-aware rules are valuable but very strict. We keep
         the classic safety rules (rules-of-hooks + exhaustive-deps) hard,
         and surface the new compiler advice as warnings rather than CI
         failures so existing R3F + scroll-handler patterns keep working. */
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },

  /* ── Server-side code (api/**) ─────────────────────────── */
  {
    files: ['api/**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.node },
      sourceType: 'module',
    },
    rules: {
      /* `motion` and `AnimatePresence` are JSX namespace bindings
         (`<motion.div>`, `<AnimatePresence>`). The default JS rule doesn't
         see those usages — without `eslint-plugin-react` they look unused.
         We whitelist them explicitly rather than pull in another plugin. */
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^([A-Z_]|motion|AnimatePresence)',
      }],
    },
  },

  /* ── Tooling configs (vite.config.js, eslint.config.js) ── */
  {
    files: ['*.config.{js,mjs}', '.eslintrc.{js,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.node },
      sourceType: 'module',
    },
  },
])
