import { defineConfig } from '@anichkay/pwa-lib/config'

export default defineConfig({
  // Иконка будет найдена автоматически в public/icon-512.png
  icon: './public/icon-512.png',

  // Выходная директория для иконок
  outDir: './public/icons',

  // Manifest конфигурация
  manifest: {
    name: 'Knowledge Base',
    short_name: 'KB',
    description: 'Lightweight self-hosted knowledge base with graph visualization, wikilinks, and markdown support',
    theme_color: '#0C0F16',
    background_color: '#000000',
    display: 'standalone',
    start_url: '/',
    scope: '/',
    lang: 'en',
    orientation: 'any',
  },

  // Service Worker конфигурация
  sw: {
    output: './public/sw.js',

    // Предзагрузка критичных ресурсов
    precache: [
      './public/index.html',
      './public/assets/**/*.{js,css}',
    ],

    // Стратегии кэширования
    routes: [
      // API - сначала сеть, потом кэш
      {
        match: '/api/**',
        strategy: 'NetworkFirst',
        cache: 'api-cache',
        maxAge: 60 * 5, // 5 минут
      },

      // Иконки и изображения - долгий кэш
      {
        match: '*.{png,jpg,jpeg,gif,svg,webp,ico}',
        strategy: 'CacheFirst',
        cache: 'images',
        maxAge: 60 * 60 * 24 * 30, // 30 дней
        maxEntries: 100,
      },

      // Шрифты - очень долгий кэш
      {
        match: '*.{woff,woff2,ttf,eot}',
        strategy: 'CacheFirst',
        cache: 'fonts',
        maxAge: 60 * 60 * 24 * 365, // 1 год
      },

      // CSS и JS - обновление в фоне
      {
        match: '*.{css,js}',
        strategy: 'StaleWhileRevalidate',
        cache: 'static',
        maxEntries: 50,
      },

      // Всё остальное - сеть с fallback на кэш
      {
        match: '/**',
        strategy: 'NetworkFirst',
        cache: 'pages',
        maxAge: 60 * 60, // 1 час
      },
    ],
  },

  // Push-уведомления отключены
  notifications: {
    enabled: false,
  },
})
