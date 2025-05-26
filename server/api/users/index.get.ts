import { UserService } from '~/server/services/user.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const userService = new UserService()
    const users = await userService.getAllUsers()
    return users
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении пользователей'
    })
  }
}) 