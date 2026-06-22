import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'ARISE — Personal AI',
        short_name: 'ARISE',
        description: 'Your personal JARVIS-style AI operating system',
        theme_color: '#010f1e',
        background_color: '#000811',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Chat with ARISE',
            short_name: 'Chat',
            url: '/chat',
            icons: [{ src: 'icons/icon-96.png', sizes: '96x96' }]
          },
          {
            name: 'My Tasks',
            short_name: 'Tasks',
            url: '/tasks',
            icons: [{ src: 'icons/icon-96.png', sizes: '96x96' }]
          }
        ],
        categories: ['productivity', 'utilities'],
        lang: 'en-IN'
      },
      workbox: {
        // Cache strategy
        runtimeCaching: [
          {
            // Cache API responses for 10 minutes
            urlPattern: /^https:\/\/.*\.railway\.app\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'arise-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 10  // 10 minutes
              },
              networkTimeoutSeconds: 8,
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cache static assets forever (they have hashed names)
            urlPattern: /\.(?:js|css|woff2|woff|ttf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'arise-static-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30  // 30 days
              }
            }
          },
          {
            // Cache images for 7 days
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'arise-image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7
              }
            }
          }
        ],
        // Pages to precache
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Skip waiting — update immediately
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: true,  // Enable PWA in development for testing
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
