import { z } from 'zod'

// Схема для создания транзакции
export const createTransactionSchema = z.object({
  userId: z.number(),
  date: z.date(),
  positionId: z.number().optional(),
  partialOfId: z.number().optional(),
  feeOfId: z.number().optional(),
  tradeOrderId: z.number().optional(),
  type: z.enum(['TRDE', 'TRNS', 'EXTR', 'FEE']),
  status: z.enum(['DONE', 'PEND', 'CANC']),
  fromWalletId: z.number().optional(),
  fromAssetId: z.number().optional(),
  fromValue: z.number().optional(),
  toWalletId: z.number(),
  toAssetId: z.number(),
  toValue: z.number().positive(),
  note: z.string().optional()
})

// Схема для обновления транзакции
export const updateTransactionSchema = z.object({
  date: z.date().optional(),
  positionId: z.number().optional(),
  partialOfId: z.number().optional(),
  feeOfId: z.number().optional(),
  tradeOrderId: z.number().optional(),
  type: z.enum(['TRDE', 'TRNS', 'EXTR', 'FEE']).optional(),
  status: z.enum(['DONE', 'PEND', 'CANC']).optional(),
  fromWalletId: z.number().optional(),
  fromAssetId: z.number().optional(),
  fromValue: z.number().optional(),
  toWalletId: z.number().optional(),
  toAssetId: z.number().optional(),
  toValue: z.number().positive().optional(),
  note: z.string().optional()
})

// Схема для ответа с данными транзакции
export const transactionResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  date: z.date(),
  positionId: z.number().nullable(),
  partialOfId: z.number().nullable(),
  feeOfId: z.number().nullable(),
  tradeOrderId: z.number().nullable(),
  type: z.string(),
  status: z.string(),
  fromWalletId: z.number().nullable(),
  fromAssetId: z.number().nullable(),
  fromValue: z.number().nullable(),
  toWalletId: z.number(),
  toAssetId: z.number(),
  toValue: z.number(),
  note: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
}) 