import { AuthService } from '~/server/services/auth.service'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required'
      })
    }

    const authService = new AuthService()
    const result = await authService.login(email, password)

    return result
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Authentication failed'
    })
  }
}) 