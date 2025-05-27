import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { H3Event, createError, getRequestHeader } from 'h3'

const config = useRuntimeConfig()

// Генерация JWT токена
export const generateToken = (payload: Record<string, unknown>): string => {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as string
  }
  
  return jwt.sign(payload, config.jwtSecret as string, options)
}

// Проверка JWT токена
export const verifyToken = (token: string): Record<string, unknown> => {
  try {
    return jwt.verify(token, config.jwtSecret as string) as Record<string, unknown>
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token'
    })
  }
}

// Получение токена из заголовка
export const getTokenFromHeader = (event: H3Event): string | null => {
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader) return null

  const [type, token] = authHeader.split(' ')
  if (type !== 'Bearer' || !token) return null

  return token
}

// Получение пользователя из токена
export const getUserFromToken = async (event: H3Event): Promise<Record<string, unknown> | null> => {
  const token = getTokenFromHeader(event)
  if (!token) return null

  try {
    return verifyToken(token)
  } catch {
    return null
  }
} 