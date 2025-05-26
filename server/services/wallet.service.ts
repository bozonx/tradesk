import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createWalletSchema, updateWalletSchema } from '../schemas/wallet.schema'

const prisma = new PrismaClient()

export class WalletService {
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