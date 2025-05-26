import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createStrategySchema, updateStrategySchema } from '../schemas/strategy.schema'

const prisma = new PrismaClient()

export class StrategyService {
  // Получить все стратегии
  async getAllStrategies() {
    return prisma.strategy.findMany({
      where: {
        deletedAt: null
      },
      include: {
        group: true,
        positions: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  // Получить все стратегии пользователя
  async getUserStrategies(userId: number) {
    return prisma.strategy.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        group: true,
        positions: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  // Получить все стратегии группы
  async getGroupStrategies(groupId: number) {
    return prisma.strategy.findMany({
      where: {
        groupId,
        deletedAt: null
      },
      include: {
        group: true,
        positions: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  // Получить стратегию по ID
  async getStrategyById(id: number) {
    return prisma.strategy.findUnique({
      where: { id },
      include: {
        group: true,
        positions: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  // Создать новую стратегию
  async createStrategy(data: z.infer<typeof createStrategySchema>) {
    return prisma.strategy.create({
      data,
      include: {
        group: true,
        positions: true
      }
    })
  }

  // Обновить стратегию
  async updateStrategy(id: number, data: z.infer<typeof updateStrategySchema>) {
    return prisma.strategy.update({
      where: { id },
      data,
      include: {
        group: true,
        positions: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  // Удалить стратегию (soft delete)
  async deleteStrategy(id: number) {
    return prisma.strategy.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  }
} 