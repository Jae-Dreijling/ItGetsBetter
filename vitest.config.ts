import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Separate from the dev server's node_modules/.vite: when `npm run dev` was
  // re-optimizing dependencies while tests started, whole test runs
  // occasionally failed with "no tests".
  cacheDir: 'node_modules/.vite-vitest',
  test: {
    globals: false,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
  },
})
