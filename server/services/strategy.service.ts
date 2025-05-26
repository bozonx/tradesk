import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createStrategySchema, updateStrategySchema } from '../schemas/strategy.schema'

const prisma = new PrismaClient()

export class StrategyService {
  // Получить все стратегии с пагинацией и фильтрацией
  async getAllStrategies(params: {
    page?: number
    limit?: number
    isArchived?: boolean
    groupId?: number
  } = {}) {
    const { page = 1, limit = 10, isArchived, groupId } = params
    const skip = (page - 1) * limit

    const where = {
      deletedAt: null,
      ...(isArchived !== undefined && { isArchived }),
      ...(groupId && { groupId })
    }

    const [strategies, total] = await Promise.all([
      prisma.strategy.findMany({
        where,
        include: {
          group: true,
          positions: {
            where: {
              deletedAt: null
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.strategy.count({ where })
    ])

    return {
      data: strategies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  // Получить все стратегии пользователя с пагинацией и фильтрацией
  async getUserStrategies(userId: number, params: {
    page?: number
    limit?: number
    isArchived?: boolean
    groupId?: number
  } = {}) {
    const { page = 1, limit = 10, isArchived, groupId } = params
    const skip = (page - 1) * limit

    const where = {
      userId,
      deletedAt: null,
      ...(isArchived !== undefined && { isArchived }),
      ...(groupId && { groupId })
    }

    const [strategies, total] = await Promise.all([
      prisma.strategy.findMany({
        where,
        include: {
          group: true,
          positions: {
            where: {
              deletedAt: null
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.strategy.count({ where })
    ])

    return {
      data: strategies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  // Получить все стратегии группы с пагинацией и фильтрацией
  async getGroupStrategies(groupId: number, params: {
    page?: number
    limit?: number
    isArchived?: boolean
  } = {}) {
    const { page = 1, limit = 10, isArchived } = params
    const skip = (page - 1) * limit

    const where = {
      groupId,
      deletedAt: null,
      ...(isArchived !== undefined && { isArchived })
    }

    const [strategies, total] = await Promise.all([
      prisma.strategy.findMany({
        where,
        include: {
          group: true,
          positions: {
            where: {
              deletedAt: null
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.strategy.count({ where })
    ])

    return {
      data: strategies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
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