import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createWalletSchema, updateWalletSchema } from '../schemas/wallet.schema'

const prisma = new PrismaClient()

export class WalletService {
  // Получить все кошельки с пагинацией и фильтрацией
  async getAllWallets(params: {
    page?: number
    limit?: number
    isArchived?: boolean
    externalEntityId?: number
  } = {}) {
    const { page = 1, limit = 10, isArchived, externalEntityId } = params
    const skip = (page - 1) * limit

    const where = {
      deletedAt: null,
      ...(isArchived !== undefined && { isArchived }),
      ...(externalEntityId && { externalEntityId })
    }

    const [wallets, total] = await Promise.all([
      prisma.wallet.findMany({
        where,
        include: {
          externalEntity: true,
          toTradeOrders: true,
          fromTradeOrders: true,
          toTransactions: true,
          fromTransactions: true
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.wallet.count({ where })
    ])

    return {
      data: wallets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  // Получить все кошельки пользователя
  async getUserWallets(userId: number) {
    return prisma.wallet.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        externalEntity: true,
        toTradeOrders: true,
        fromTradeOrders: true,
        toTransactions: true,
        fromTransactions: true
      }
    })
  }

  // Получить кошелек по ID
  async getWalletById(id: number) {
    return prisma.wallet.findUnique({
      where: { id },
      include: {
        externalEntity: true,
        toTradeOrders: true,
        fromTradeOrders: true,
        toTransactions: true,
        fromTransactions: true
      }
    })
  }

  // Создать новый кошелек
  async createWallet(data: z.infer<typeof createWalletSchema>) {
    return prisma.wallet.create({
      data,
      include: {
        externalEntity: true,
        toTradeOrders: true,
        fromTradeOrders: true,
        toTransactions: true,
        fromTransactions: true
      }
    })
  }

  // Обновить кошелек
  async updateWallet(id: number, data: z.infer<typeof updateWalletSchema>) {
    return prisma.wallet.update({
      where: { id },
      data,
      include: {
        externalEntity: true,
        toTradeOrders: true,
        fromTradeOrders: true,
        toTransactions: true,
        fromTransactions: true
      }
    })
  }

  // Удалить кошелек (soft delete)
  async deleteWallet(id: number) {
    return prisma.wallet.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  }
} 