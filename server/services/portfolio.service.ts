import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createPortfolioSchema, updatePortfolioSchema } from '../schemas/portfolio.schema'
import { createError } from 'h3'

const prisma = new PrismaClient()

export class PortfolioService {
  // Получить все портфолио пользователя
  async getUserPortfolios(userId: number) {
    return prisma.portfolio.findMany({
      where: {
        userId,
        deletedAt: null,
        isArchived: false
      },
      include: {
        positions: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  // Получить портфолио по ID
  async getPortfolioById(id: number) {
    return prisma.portfolio.findFirst({
      where: { 
        id,
        deletedAt: null
      },
      include: {
        positions: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  // Создать новое портфолио
  async createPortfolio(data: z.infer<typeof createPortfolioSchema>) {
    // Проверяем валидность данных
    const validatedData = createPortfolioSchema.parse(data)

    // Проверяем существование пользователя
    const user = await prisma.user.findFirst({
      where: { 
        id: validatedData.userId,
        deletedAt: null
      }
    })
    if (!user) {
      throw createError({
        statusCode: 400,
        message: 'User not found'
      })
    }

    // Проверяем уникальность имени для пользователя
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        userId: validatedData.userId,
        name: validatedData.name,
        OR: [
          { deletedAt: null },
          { deletedAt: { gt: new Date() } }
        ]
      }
    })
    if (existingPortfolio) {
      throw createError({
        statusCode: 400,
        message: 'Portfolio with this name already exists'
      })
    }

    return prisma.portfolio.create({
      data: validatedData,
      include: {
        positions: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  // Обновить портфолио
  async updatePortfolio(id: number, data: z.infer<typeof updatePortfolioSchema>) {
    // Проверяем валидность данных
    const validatedData = updatePortfolioSchema.parse(data)

    // Проверяем существование портфолио
    const portfolio = await prisma.portfolio.findFirst({
      where: { 
        id,
        deletedAt: null
      }
    })
    if (!portfolio) {
      return null
    }

    // Если обновляется имя, проверяем уникальность
    if (validatedData.name) {
      const existingPortfolio = await prisma.portfolio.findFirst({
        where: {
          userId: portfolio.userId,
          name: validatedData.name,
          id: { not: id },
          OR: [
            { deletedAt: null },
            { deletedAt: { gt: new Date() } }
          ]
        }
      })
      if (existingPortfolio) {
        throw createError({
          statusCode: 400,
          message: 'Portfolio with this name already exists'
        })
      }
    }

    return prisma.portfolio.update({
      where: { id },
      data: validatedData,
      include: {
        positions: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }

  // Удалить портфолио (soft delete)
  async deletePortfolio(id: number) {
    // Проверяем существование портфолио
    const portfolio = await prisma.portfolio.findFirst({
      where: { 
        id,
        deletedAt: null
      }
    })
    if (!portfolio) {
      return null
    }

    return prisma.portfolio.update({
      where: { id },
      data: {
        deletedAt: new Date()
      },
      include: {
        positions: {
          where: {
            deletedAt: null
          }
        }
      }
    })
  }
} 