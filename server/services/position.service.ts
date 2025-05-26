import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createPositionSchema, updatePositionSchema } from '../schemas/position.schema'

const prisma = new PrismaClient()

export class PositionService {
  // Получить все позиции пользователя
  async getUserPositions(userId: number) {
    return prisma.position.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        group: true,
        portfolio: true,
        strategy: true,
        transactions: true,
        tradeOrders: true
      }
    })
  }

  // Получить все позиции портфолио
  async getPortfolioPositions(portfolioId: number) {
    return prisma.position.findMany({
      where: {
        portfolioId,
        deletedAt: null
      },
      include: {
        group: true,
        portfolio: true,
        strategy: true,
        transactions: true,
        tradeOrders: true
      }
    })
  }

  // Получить все позиции группы
  async getGroupPositions(groupId: number) {
    return prisma.position.findMany({
      where: {
        groupId,
        deletedAt: null
      },
      include: {
        group: true,
        portfolio: true,
        strategy: true,
        transactions: true,
        tradeOrders: true
      }
    })
  }

  // Получить все позиции стратегии
  async getStrategyPositions(strategyId: number) {
    return prisma.position.findMany({
      where: {
        strategyId,
        deletedAt: null
      },
      include: {
        group: true,
        portfolio: true,
        strategy: true,
        transactions: true,
        tradeOrders: true
      }
    })
  }

  // Получить позицию по ID
  async getPositionById(id: number) {
    return prisma.position.findUnique({
      where: { id },
      include: {
        group: true,
        portfolio: true,
        strategy: true,
        transactions: true,
        tradeOrders: true
      }
    })
  }

  // Создать новую позицию
  async createPosition(data: z.infer<typeof createPositionSchema>) {
    return prisma.position.create({
      data,
      include: {
        group: true,
        portfolio: true,
        strategy: true,
        transactions: true,
        tradeOrders: true
      }
    })
  }

  // Обновить позицию
  async updatePosition(id: number, data: z.infer<typeof updatePositionSchema>) {
    return prisma.position.update({
      where: { id },
      data,
      include: {
        group: true,
        portfolio: true,
        strategy: true,
        transactions: true,
        tradeOrders: true
      }
    })
  }

  // Удалить позицию (soft delete)
  async deletePosition(id: number) {
    return prisma.position.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  }
} 