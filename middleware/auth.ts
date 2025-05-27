export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  
  // Если пользователь не аутентифицирован и пытается получить доступ к защищенному маршруту
  if (!authStore.getIsAuthenticated && to.path !== '/auth/login') {
    return navigateTo('/auth/login')
  }
  
  // Если пользователь аутентифицирован и пытается получить доступ к страницам авторизации
  if (authStore.getIsAuthenticated && to.path.startsWith('/auth/')) {
    return navigateTo('/')
  }
}) 