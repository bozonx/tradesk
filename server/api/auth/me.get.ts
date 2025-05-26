import { AuthService } from '~/server/services/auth.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'Authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Authorization header is required'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const authService = new AuthService()
    const user = await authService.validateToken(token)

    return {
      id: user.id,
      email: user.email,
      name: user.name
    }
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    })
  }
}) 