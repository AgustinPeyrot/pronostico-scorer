import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // autoUpdate: registra un nuevo SW cuando hay una actualización lista.
      // La app mostrará un banner propio para invitar a recargar.
      registerType: 'prompt',

      // Incluir todos los assets del build en el precache
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'icons/*.png',
      ],

      // Web App Manifest
      manifest: {
        name: 'Anotador de Pronóstico',
        short_name: 'Pronóstico',
        description: 'Anotador offline para el juego de cartas argentino Pronóstico',
        theme_color: '#4338ca',          // indigo-700 — coincide con header de pedidos
        background_color: '#0f172a',     // slate-900 — fondo oscuro de la app
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'es',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
        screenshots: [],
      },

      // Workbox: estrategia offline-first
      workbox: {
        // Cachear todos los assets del build (JS, CSS, HTML, íconos)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // Estrategia para navegación (index.html): NetworkFirst con fallback a caché
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],

        // Estrategia para assets estáticos: CacheFirst (cambian con cada build)
        runtimeCaching: [
          {
            // Google Fonts — stale-while-revalidate para que funcione offline
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      // Desactivar en desarrollo para no interferir con HMR
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
