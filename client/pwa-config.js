import { VitePWA } from 'vite-plugin-pwa';

export function configurePWA() {
  return VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.svg', 'masked-icon.svg'],
    manifest: {
      name: 'Project Management System',
      short_name: 'PMS',
      description: 'Comprehensive project management system for teams',
      theme_color: '#4F46E5',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: 'pwa-192x192.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        },
        {
          src: 'pwa-512x512.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    },
    strategies: 'generateSW',
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\./i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 // 1 day
            },
            networkTimeoutSeconds: 10
          }
        }
      ]
    }
  });
}