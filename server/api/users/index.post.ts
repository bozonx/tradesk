import { UserService } from '~/server/services/user.service'
import { createUserSchema } from '~/server/schemas/user.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createUserSchema.parse(body)

    const userService = new UserService()
    const user = await userService.createUser(validatedData)
    
    return user
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Неверные данные пользователя',
        data: (err as ZodError).errors
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Ошибка при создании пользователя'
    })
  }
}) 