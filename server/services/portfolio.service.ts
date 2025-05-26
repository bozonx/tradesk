import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createPortfolioSchema, updatePortfolioSchema } from '../schemas/portfolio.schema'

const prisma = new PrismaClient()

export class PortfolioService {
  // Получить все портфолио пользователя
  async getUserPortfolios(userId: number) {
    return prisma.portfolio.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        positions: true
      }
    })
  }

  // Получить портфолио по ID
  async getPortfolioById(id: number) {
    return prisma.portfolio.findUnique({
      where: { id },
      include: {
        positions: true
      }
    })
  }

  // Создать новое портфолио
  async createPortfolio(data: z.infer<typeof createPortfolioSchema>) {
    return prisma.portfolio.create({
      data,
      include: {
        positions: true
      }
    })
  }

  // Обновить портфолио
  async updatePortfolio(id: number, data: z.infer<typeof updatePortfolioSchema>) {
    return prisma.portfolio.update({
      where: { id },
      data,
      include: {
        positions: true
      }
    })
  }

  // Удалить портфолио (soft delete)
  async deletePortfolio(id: number) {
    return prisma.portfolio.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  }
} 