export default defineAppConfig({
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