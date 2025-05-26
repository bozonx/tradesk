import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createGroupSchema, updateGroupSchema } from '../schemas/group.schema'

const prisma = new PrismaClient()

export class GroupService {
  // Получить все группы
  async getAllGroups() {
    return prisma.group.findMany({
      include: {
        portfolios: {
          where: {
            deletedAt: null
          }
        },
        positions: {
          where: {
            deletedAt: null
          }
        },
        strategies: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  // Получить группу по ID
  async getGroupById(id: number) {
    return prisma.group.findUnique({
      where: { id },
      include: {
        portfolios: {
          where: {
            deletedAt: null
          }
        },
        positions: {
          where: {
            deletedAt: null
          }
        },
        strategies: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  // Создать новую группу
  async createGroup(data: z.infer<typeof createGroupSchema>) {
    return prisma.group.create({
      data,
      include: {
        portfolios: true,
        positions: true,
        strategies: true
      }
    })
  }

  // Обновить группу
  async updateGroup(id: number, data: z.infer<typeof updateGroupSchema>) {
    return prisma.group.update({
      where: { id },
      data,
      include: {
        portfolios: {
          where: {
            deletedAt: null
          }
        },
        positions: {
          where: {
            deletedAt: null
          }
        },
        strategies: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  // Удалить группу
  async deleteGroup(id: number) {
    return prisma.group.delete({
      where: { id }
    })
  }
} 