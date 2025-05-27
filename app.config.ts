export default defineAppConfig({
  title: 'Tradesk',
  theme: {
    dark: false,
    colors: {
      primary: '#1976d2',
      secondary: '#424242',
      accent: '#82B1FF',
      error: '#FF5252',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FFC107',
    },
  },
  vuetify: {
    defaultTheme: 'light',
    icons: {
      defaultSet: 'mdi',
    },
  },
  ui: {
    primary: 'blue',
    gray: 'slate',
    notifications: {
      // Позиция уведомлений
      position: 'top-right'
    }
  },
  api: {
    // Базовый URL для API
    baseURL: process.env.NUXT_PUBLIC_API_BASE || '/api',
    // Таймаут для запросов
    timeout: 30000,
    // Версия API
    version: 'v1'
  },
  // Глобальные настройки для всех страниц
  pages: {
    // Применяем middleware auth ко всем страницам по умолчанию
    middleware: ['auth']
  }
}) 