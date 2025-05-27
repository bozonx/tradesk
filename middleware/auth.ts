import { isPublicRoute } from '~/config/routes'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  
  // Если маршрут публичный, пропускаем проверку
  if (isPublicRoute(to.path)) {
    // Если пользователь авторизован и пытается получить доступ к странице логина,
    // перенаправляем на главную
    if (auth.isAuthenticated && to.path === '/login') {
      return navigateTo('/')
    }
    return
  }
  
  // Если пользователь не авторизован и пытается получить доступ к защищенному маршруту
  if (!auth.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login')
  }
  
  // Если пользователь авторизован и пытается получить доступ к странице логина
  if (auth.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
}) 