import { UserService } from '~/server/services/user.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID пользователя'
      })
    }

    const userService = new UserService()
    const user = await userService.deleteUser(id)
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Пользователь не найден'
      })
    }

    return { message: 'User deleted successfully' }
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при удалении пользователя'
    })
  }
}) 