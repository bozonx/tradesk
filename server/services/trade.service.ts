import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createTradeOrderSchema, updateTradeOrderSchema } from '../schemas/trade.schema'

const prisma = new PrismaClient()

export class TradeService {
  // Получить все ордера позиции
  async getPositionTradeOrders(positionId: number) {
    return prisma.tradeOrder.findMany({
      where: {
        positionId,
        deletedAt: null
      },
      include: {
        fromWallet: true,
        toWallet: true,
        fromAsset: true,
        toAsset: true
      }
    })
  }

  // Получить ордер по ID
  async getTradeOrderById(id: number) {
    return prisma.tradeOrder.findUnique({
      where: { id },
      include: {
        fromWallet: true,
        toWallet: true,
        fromAsset: true,
        toAsset: true
      }
    })
  }

  // Создать новый ордер
  async createTradeOrder(data: z.infer<typeof createTradeOrderSchema>) {
    return prisma.tradeOrder.create({
      data,
      include: {
        fromWallet: true,
        toWallet: true,
        fromAsset: true,
        toAsset: true
      }
    })
  }

  // Обновить ордер
  async updateTradeOrder(id: number, data: z.infer<typeof updateTradeOrderSchema>) {
    return prisma.tradeOrder.update({
      where: { id },
      data,
      include: {
        fromWallet: true,
        toWallet: true,
        fromAsset: true,
        toAsset: true
      }
    })
  }

  // Удалить ордер (soft delete)
  async deleteTradeOrder(id: number) {
    return prisma.tradeOrder.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  }
} 