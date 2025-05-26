import { createRouter, defineEventHandler, readBody, createError } from 'h3'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import type { H3Error } from '~/server/types/error'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Создаем роутер для пользователей
export const userRoutes = createRouter()

// Получение всех пользователей
userRoutes.get('/', defineEventHandler(async (event) => {
  try {
    const authHeader = event.node.req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return users
  } catch (error) {
    console.error('Get users error:', error)
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    })
  }
}))

// Получение пользователя по ID
userRoutes.get('/:id', defineEventHandler(async (event) => {
  try {
    const authHeader = event.node.req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const userId = Number(event.context.params?.id)
    if (isNaN(userId)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid user ID'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    return user
  } catch (error) {
    console.error('Get user error:', error)
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    })
  }
}))

// Обновление пользователя
userRoutes.put('/:id', defineEventHandler(async (event) => {
  try {
    const authHeader = event.node.req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const userId = Number(event.context.params?.id)
    if (isNaN(userId)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid user ID'
      })
    }

    const { name, email } = await readBody(event)

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    // Если обновляется email, проверяем, не занят ли он
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        throw createError({
          statusCode: 400,
          message: 'Email already in use'
        })
      }
    }

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return updatedUser
  } catch (error) {
    console.error('Update user error:', error)
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 400,
      message: 'Invalid data'
    })
  }
}))

// Удаление пользователя
userRoutes.delete('/:id', defineEventHandler(async (event) => {
  try {
    const authHeader = event.node.req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const userId = Number(event.context.params?.id)
    if (isNaN(userId)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid user ID'
      })
    }

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    // Удаляем пользователя
    await prisma.user.delete({
      where: { id: userId }
    })

    return { message: 'User deleted successfully' }
  } catch (error) {
    console.error('Delete user error:', error)
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 400,
      message: 'Invalid data'
    })
  }
})) 