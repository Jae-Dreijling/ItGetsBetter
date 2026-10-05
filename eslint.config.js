import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // ~27 v1 components copy loaded data into state inside an effect.
      // Fixing them all at once would mean retesting most screens, so each
      // one is fixed when its file is reworked for 2.0. New code must not
      // add warnings (see V2-PLAN "Definition of done").
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
