import { UserService } from './user.service'
import { z } from 'zod'
import { createUserSchema } from '../schemas/user.schema'
import { createError } from 'h3'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '24h'

export class AuthService {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  // Регистрация нового пользователя
  async register(data: z.infer<typeof createUserSchema>) {
    const existingUser = await this.userService.getUserByEmail(data.email)
    
    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'User already exists'
      })
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const user = await this.userService.createUser({
      ...data,
      password: hashedPassword
    })
    
    // Генерируем JWT токен
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        settings: user.settings
      }
    }
  }

  // Авторизация по email и паролю
  async login(email: string, password: string) {
    const user = await this.userService.getUserByEmail(email)
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        settings: user.settings
      }
    }
  }

  // Проверка токена
  async validateToken(token: string) {
    try {
      // Проверяем JWT токен
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
      
      const user = await this.userService.getUserById(decoded.userId)
      if (!user) {
        throw createError({
          statusCode: 401,
          message: 'Invalid token'
        })
      }

      // Возвращаем пользователя без пароля
      return user
    } catch (error) {
      throw createError({
        statusCode: 401,
        message: 'Invalid token'
      })
    }
  }
} 