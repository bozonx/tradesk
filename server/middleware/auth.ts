import { defineEventHandler, getRequestHeader, createError, getRequestURL, getHeader } from 'h3'
import jwt from 'jsonwebtoken'
import { isPublicRoute } from '~/config/routes'

export default defineEventHandler(async (event: H3Event) => {
  const path = getRequestURL(event).pathname

  // Пропускаем публичные маршруты
  if (isPublicRoute(path)) {
    return
  }

  // Получаем токен из заголовка
  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '')

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  try {
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // Добавляем информацию о пользователе в контекст запроса
    event.context.auth = decoded
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    })
  }
}) 