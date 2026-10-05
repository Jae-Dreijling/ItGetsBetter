import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { execSync } from 'node:child_process'

function getCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

export default defineConfig(({ mode }) => ({
  define: {
    __APP_COMMIT__: JSON.stringify(getCommitHash()),
    __APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    // `npm run dev:phone` serves over https: the encryption API used by
    // backups and the app lock only works on secure origins, and a phone on
    // the local network reaches the PC by IP, which isn't one over http.
    mode === 'phone' && basicSsl(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'ItGetsBetter',
        short_name: 'IGB',
        description: 'Your personal Health Operating System',
        theme_color: '#f47e6c',
        background_color: '#fdf6f0',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['health', 'lifestyle'],
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
}))
