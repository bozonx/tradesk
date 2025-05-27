// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    'nuxt-icon',
    '@nuxtjs/tailwindcss'
  ],
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: ''
  },
  ui: {
    global: true,
    icons: ['heroicons']
  },
  app: {
    head: {
      title: 'TradeSk',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'TradeSk - Your Trading Platform' }
      ]
    }
  },
  nitro: {
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
        },
      },
    },
  },
  runtimeConfig: {
    // Приватные ключи, доступные только на сервере
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    csrfSecret: process.env.CSRF_SECRET || 'your-csrf-secret',
    
    // Публичные ключи, доступные на клиенте
    public: {
      apiBase: process.env.API_BASE || '/api'
    }
  },
  compatibilityDate: '2024-04-03',
  typescript: {
    strict: true
  },
  css: [
    '~/assets/css/tailwind.css'
  ]
})