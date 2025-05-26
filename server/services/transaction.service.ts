import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createTransactionSchema, updateTransactionSchema } from '../schemas/transaction.schema'

const prisma = new PrismaClient()

export class TransactionService {
  // Получить все транзакции пользователя
  async getUserTransactions(userId: number) {
    return prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        position: true,
        tradeOrder: true,
        fromWallet: true,
        toWallet: true,
        fromAsset: true,
        toAsset: true
      }
    })
  }

  // Получить все транзакции позиции
  async getPositionTransactions(positionId: number) {
    return prisma.transaction.findMany({
      where: {
        positionId,
        deletedAt: null
      },
      include: {
        position: true,
        tradeOrder: true,
        fromWallet: true,
        toWallet: true,
        fromAsset: true,
        toAsset: true
      }
    })
  }

  // Получить все транзакции ордера
  async getTradeOrderTransactions(tradeOrderId: number) {
    return prisma.transaction.findMany({
      where: {
        tradeOrderId,
        deletedAt: null
      },
      include: {
        position: true,
        tradeOrder: true,
        fromWallet: true,
        toWallet: true,
        fromAsset: true,
        toAsset: true
      }
    })
  }

  // Получить транзакцию по ID
  async getTransactionById(id: number) {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        position: true,
        tradeOrder: true,
        fromWallet: true,
        toWallet: true,
        fromAsset: true,
        toAsset: true
      }
    })
  }

  // Создать новую транзакцию
  async createTransaction(data: z.infer<typeof createTransactionSchema>) {
    return prisma.transaction.create({
      data,
      include: {
        position: true,
        tradeOrder: true,
        fromWallet: true,
        toWallet: true,
        fromAsset: true,
        toAsset: true
      }
    })
  }

  // Обновить транзакцию
  async updateTransaction(id: number, data: z.infer<typeof updateTransactionSchema>) {
    return prisma.transaction.update({
      where: { id },
      data,
      include: {
        position: true,
        tradeOrder: true,
        fromWallet: true,
        toWallet: true,
        fromAsset: true,
        toAsset: true
      }
    })
  }

  // Удалить транзакцию (soft delete)
  async deleteTransaction(id: number) {
    return prisma.transaction.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  }
} 