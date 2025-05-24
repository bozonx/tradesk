import { defineEventHandler, createError, getCookie, getRequestHeader } from 'h3'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Skip auth for login and register endpoints
  if (event.path.startsWith('/api/auth/')) {
    return
  }

  // Get JWT token from cookie
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  try {
    // Verify JWT token
    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: number }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'User not found',
      })
    }

    // Check CSRF token for non-GET requests
    if (event.method !== 'GET') {
      const csrfToken = getRequestHeader(event, 'x-csrf-token')
      if (!csrfToken) {
        throw createError({
          statusCode: 403,
          message: 'CSRF token missing',
        })
      }

      // Verify CSRF token
      const session = await prisma.session.findFirst({
        where: {
          userId: user.id,
          token: csrfToken,
          deletedAt: null,
        },
      })

      if (!session) {
        throw createError({
          statusCode: 403,
          message: 'Invalid CSRF token',
        })
      }
    }

    // Add user to event context
    event.context.user = user
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token',
    })
  }
}) 