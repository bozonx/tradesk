import { AuthService } from '~/server/services/auth.service'
import { createUserSchema } from '~/server/schemas/user.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createUserSchema.parse(body)

    const authService = new AuthService()
    const result = await authService.register(validatedData)

    return result
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid user data',
        data: (err as ZodError).errors
      })
    }
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Registration failed'
    })
  }
}) 