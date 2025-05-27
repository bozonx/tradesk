export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  
  // Если пользователь не авторизован и пытается получить доступ к защищенному роуту
  if (!auth.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login')
  }
  
  // Если пользователь авторизован и пытается получить доступ к странице логина
  if (auth.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
}) 