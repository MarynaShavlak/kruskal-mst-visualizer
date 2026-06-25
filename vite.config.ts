/// <reference types="vitest/config" />
import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"

// Деплой — GitHub Pages (project site), тож усе живе під цим base-path. PWA
// start_url/scope/іконки мусять його дзеркалити, інакше offline-навігація й
// install ламаються.
const BASE = "/kruskal-mst-visualizer/"

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'prompt' (а не 'autoUpdate'): auto-update свопнув би JS-чанки під
      // працюючим плеєром і зіпсував би детерміновану trace-модель. Оновлення —
      // лише за явним кліком користувача (PwaUpdatePrompt).
      registerType: "prompt",
      // Реєстрацію SW робимо вручну в main.tsx (virtual:pwa-register), тож
      // авто-інжект скрипта вимикаємо.
      injectRegister: null,
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      workbox: {
        // Застосунок повністю клієнтський (увесь learn-markdown inline через
        // ?raw, обчислювалка на клієнті) → чистого precache достатньо. woff2
        // покриваємо у precache; інші формати шрифтів — runtime-кеш нижче.
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        // Найбільший чанк ~430KB (translate); ліміт із запасом покриває всі
        // ~196 JS-чанків і dist ~4.1MB.
        maximumFileSizeToCacheInBytes: 4_000_000,
        cleanupOutdatedCaches: true,
        navigateFallback: `${BASE}index.html`,
        runtimeCaching: [
          {
            // KaTeX/інші не-woff2 шрифти (ttf/woff) — runtime замість роздування
            // precache; CacheFirst, бо вони незмінні (хешовані імена).
            urlPattern: /\.(?:woff|ttf|eot)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "font-assets",
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: "Алгоритми: інтерактивні розбори",
        short_name: "Алгоритми",
        description:
          "Інтерактивна платформа для вивчення алгоритмів: теорія, редактор, покрокове програвання та бенчмарк.",
        lang: "uk",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        theme_color: "#4f46e5",
        background_color: "#ffffff",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
})
