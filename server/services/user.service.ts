import { PrismaClient } from '@prisma/client'
import type { User } from '@prisma/client'
import { z } from 'zod'
import { createUserSchema, updateUserSchema } from '../schemas/user.schema'
import { createError } from 'h3'

// Тип пользователя без пароля
type UserWithoutPassword = Omit<User, 'password'>
// Тип пользователя с паролем
type UserWithPassword = User

export class UserService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  // Получить всех пользователей
  async getAllUsers(): Promise<UserWithoutPassword[]> {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null
      }
    })
    // Скрываем пароли
    return users.map(({ password, ...user }) => user)
  }

  // Получить пользователя по ID
  async getUserById(id: number): Promise<UserWithoutPassword | null> {
    const user = await this.prisma.user.findFirst({
      where: { 
        id,
        deletedAt: null
      }
    })
    if (!user) return null
    // Скрываем пароль
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // Получить пользователя по email (с паролем для внутреннего использования)
  async getUserByEmail(email: string): Promise<UserWithPassword | null> {
    const user = await this.prisma.user.findFirst({
      where: { 
        email,
        deletedAt: null
      }
    })
    return user
  }

  // Получить пользователя по email (без пароля для внешнего использования)
  async getUserByEmailPublic(email: string): Promise<UserWithoutPassword | null> {
    const user = await this.getUserByEmail(email)
    if (!user) return null
    // Скрываем пароль
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // Создать нового пользователя
  async createUser(data: z.infer<typeof createUserSchema>): Promise<UserWithPassword> {
    try {
      const user = await this.prisma.user.create({
        data
      })
      return user
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw createError({
          statusCode: 400,
          message: 'User already exists'
        })
      }
      throw error
    }
  }

  // Обновить пользователя
  async updateUser(id: number, data: Partial<User>): Promise<UserWithoutPassword | null> {
    try {
      // Проверяем существование пользователя
      const existingUser = await this.prisma.user.findFirst({
        where: { 
          id,
          deletedAt: null
        }
      })
      if (!existingUser) {
        return null
      }

      // Если обновляется email, проверяем его уникальность
      if (data.email && data.email !== existingUser.email) {
        const userWithEmail = await this.prisma.user.findFirst({
          where: { 
            email: data.email,
            deletedAt: null
          }
        })
        if (userWithEmail) {
          throw createError({
            statusCode: 400,
            message: 'User already exists'
          })
        }
      }

      const user = await this.prisma.user.update({
        where: { id },
        data
      })
      // Скрываем пароль
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw createError({
          statusCode: 400,
          message: 'User already exists'
        })
      }
      throw error
    }
  }

  // Удалить пользователя (soft delete)
  async deleteUser(id: number): Promise<UserWithoutPassword | null> {
    try {
      // Проверяем существование пользователя
      const existingUser = await this.prisma.user.findFirst({
        where: { 
          id,
          deletedAt: null
        }
      })
      if (!existingUser) {
        return null
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      })
      // Скрываем пароль
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error: any) {
      throw error
    }
  }
} 