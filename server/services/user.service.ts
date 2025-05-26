import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createUserSchema, updateUserSchema } from '../schemas/user.schema'

const prisma = new PrismaClient()

export class UserService {
  // Получить всех пользователей
  async getAllUsers() {
    return prisma.user.findMany({
      where: {
        deletedAt: null
      }
    })
  }

  // Получить пользователя по ID
  async getUserById(id: number) {
    return prisma.user.findUnique({
      where: { id }
    })
  }

  // Создать нового пользователя
  async createUser(data: z.infer<typeof createUserSchema>) {
    return prisma.user.create({
      data
    })
  }

  // Обновить пользователя
  async updateUser(id: number, data: z.infer<typeof updateUserSchema>) {
    return prisma.user.update({
      where: { id },
      data
    })
  }

  // Удалить пользователя (soft delete)
  async deleteUser(id: number) {
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  }
} 