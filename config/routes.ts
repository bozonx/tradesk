// Публичные маршруты, доступные без авторизации
export const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/contact',
  '/',
  '/privacy-policy',
  '/terms-of-service'
]

// Проверка является ли маршрут публичным
export function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => {
    // Если маршрут заканчивается на *, проверяем начало пути
    if (route.endsWith('*')) {
      return path.startsWith(route.slice(0, -1))
    }
    // Иначе проверяем точное совпадение
    return path === route
  })
} 