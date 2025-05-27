import { UserService } from '~/server/services/user.service'
import { updateUserSchema } from '~/server/schemas/user.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid user ID'
      })
    }

    const body = await readBody(event)
    const validatedData = updateUserSchema.partial().parse(body)

    const userService = new UserService()
    const user = await userService.updateUser(id, validatedData)
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    return user
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid user data',
        data: (err as ZodError).errors
      })
    }
    if ('statusCode' in err) throw error
    throw createError({
      statusCode: 500,
      message: 'Error updating user'
    })
  }
}) 