import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createAssetSchema, updateAssetSchema } from '../schemas/asset.schema'

const prisma = new PrismaClient()

export class AssetService {
  // Получить все активы
  async getAllAssets() {
    return prisma.asset.findMany({
      include: {
        toTradeOrders: true,
        fromTradeOrders: true,
        toTransactions: true,
        fromTransactions: true
      }
    })
  }

  // Получить актив по ID
  async getAssetById(id: number) {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        toTradeOrders: true,
        fromTradeOrders: true,
        toTransactions: true,
        fromTransactions: true
      }
    })
  }

  // Получить актив по тикеру
  async getAssetByTicker(ticker: string) {
    return prisma.asset.findUnique({
      where: { ticker },
      include: {
        toTradeOrders: true,
        fromTradeOrders: true,
        toTransactions: true,
        fromTransactions: true
      }
    })
  }

  // Создать новый актив
  async createAsset(data: z.infer<typeof createAssetSchema>) {
    return prisma.asset.create({
      data,
      include: {
        toTradeOrders: true,
        fromTradeOrders: true,
        toTransactions: true,
        fromTransactions: true
      }
    })
  }

  // Обновить актив
  async updateAsset(id: number, data: z.infer<typeof updateAssetSchema>) {
    return prisma.asset.update({
      where: { id },
      data,
      include: {
        toTradeOrders: true,
        fromTradeOrders: true,
        toTransactions: true,
        fromTransactions: true
      }
    })
  }

  // Удалить актив
  async deleteAsset(id: number) {
    return prisma.asset.delete({
      where: { id }
    })
  }
} 