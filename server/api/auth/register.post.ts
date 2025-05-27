import type { H3Event } from 'h3'
import { UserService } from '~/server/services/user.service'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody<{
    email: string
    password: string
    name: string
  }>(event)

  const userService = new UserService()

  // Проверяем, существует ли пользователь
  const existingUser = await userService.findByEmail(body.email)
  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: 'User already exists'
    })
  }

  // Создаем нового пользователя
  const user = await userService.createUser(
    body.email,
    body.password,
    body.name
  )

  // Возвращаем данные пользователя без пароля
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}) 