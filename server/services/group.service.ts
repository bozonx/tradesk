import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createGroupSchema, updateGroupSchema } from '../schemas/group.schema'

const prisma = new PrismaClient()

export class GroupService {
  // Получить все группы пользователя
  async getUserGroups(userId: number) {
    return prisma.group.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        portfolios: true
      }
    })
  }

  // Получить группу по ID
  async getGroupById(id: number) {
    return prisma.group.findUnique({
      where: { id },
      include: {
        portfolios: true
      }
    })
  }

  // Создать новую группу
  async createGroup(data: z.infer<typeof createGroupSchema>) {
    return prisma.group.create({
      data,
      include: {
        portfolios: true
      }
    })
  }

  // Обновить группу
  async updateGroup(id: number, data: z.infer<typeof updateGroupSchema>) {
    return prisma.group.update({
      where: { id },
      data,
      include: {
        portfolios: true
      }
    })
  }

  // Удалить группу (soft delete)
  async deleteGroup(id: number) {
    return prisma.group.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  }
} 