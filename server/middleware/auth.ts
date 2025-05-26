import { AuthService } from '~/server/services/auth.service'

export default defineEventHandler(async (event) => {
  // Пропускаем авторизацию для эндпоинта логина
  if (event.path === '/api/auth/login') {
    return
  }

  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: 'Authorization header is required'
    })
  }

  const token = authHeader.replace('Bearer ', '')
  const authService = new AuthService()
  
  try {
    const user = await authService.validateToken(token)
    // Добавляем пользователя в контекст запроса
    event.context.user = user
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    })
  }
}) 