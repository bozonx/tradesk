import { createRouter, defineEventHandler, readBody, getCookie, setCookie } from 'h3'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Создаем роутер для аутентификации
export const authRoutes = createRouter()

// Регистрация нового пользователя
authRoutes.post('/register', defineEventHandler(async (event) => {
  try {
    const { email, password, name } = await readBody(event)

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return {
        statusCode: 400,
        body: { message: 'User already exists' }
      }
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    // Генерируем JWT токен
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' })

    return {
      statusCode: 200,
      body: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    }
  }
}))

// Вход пользователя
authRoutes.post('/login', defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event)

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Invalid credentials' }
      }
    }

    // Проверяем пароль
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return {
        statusCode: 401,
        body: { message: 'Invalid credentials' }
      }
    }

    // Генерируем JWT токен
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' })

    return {
      statusCode: 200,
      body: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      statusCode: 500,
      body: { message: 'Internal server error' }
    }
  }
}))

// Получение информации о текущем пользователе
authRoutes.get('/me', defineEventHandler(async (event) => {
  try {
    const authHeader = event.node.req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: { message: 'Unauthorized' }
      }
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'User not found' }
      }
    }

    return {
      statusCode: 200,
      body: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
  } catch (error) {
    console.error('Get user error:', error)
    return {
      statusCode: 401,
      body: { message: 'Invalid token' }
    }
  }
})) 