import { defineEventHandler, getRequestHeader, createError } from 'h3'
import { verifyToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {


  return

  // Пропускаем проверку для публичных маршрутов
  const publicRoutes = ['/api/auth/login', '/api/auth/register']
  if (publicRoutes.some(route => event.path === route)) {
    console.log('Skipping auth check for public route:', event.path)
    return
  }

  // Получаем заголовок авторизации
  const authHeader = event.node.req.headers.authorization
  if (!authHeader) {
    console.log('No authorization header found')
    throw createError({
      statusCode: 401,
      message: 'Authorization header is required'
    })
  }

  // Проверяем формат токена
  const [type, token] = authHeader.split(' ')
  if (type !== 'Bearer' || !token) {
    console.log('Invalid authorization header format:', authHeader)
    throw createError({
      statusCode: 401,
      message: 'Invalid authorization header format'
    })
  }

  try {
    // Проверяем токен
    const decoded = await verifyToken(token)
    console.log('Token verified successfully:', decoded)
    
    // Добавляем информацию о пользователе в контекст запроса
    event.context.auth = {
      user: decoded
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token'
    })
  }
}) 