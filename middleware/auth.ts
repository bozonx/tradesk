export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  
  // Если пользователь не аутентифицирован и пытается получить доступ к защищенному маршруту
  if (!auth.isLoggedIn && to.path !== '/login') {
    return navigateTo('/login')
  }
  
  // Если пользователь аутентифицирован и пытается получить доступ к страницам входа/регистрации
  if (auth.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/')
  }
}) 