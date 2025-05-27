import type { H3Event } from 'h3'
import type { LoginCredentials, AuthResponse } from '~/types/auth'
import jwt from 'jsonwebtoken'
import { UserService } from '~/server/services/user.service'

export default defineEventHandler(async (event: H3Event): Promise<AuthResponse> => {
  const body = await readBody<LoginCredentials>(event)
  const userService = new UserService()
  
  // Ищем пользователя по email
  const user = await userService.findByEmail(body.email)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // Проверяем пароль
  const isValidPassword = await userService.verifyPassword(user, body.password)
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // Создаем JWT токен
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  )

  // Возвращаем данные пользователя и токен
  const { password, ...userWithoutPassword } = user
  return {
    user: userWithoutPassword,
    token
  }
}) 