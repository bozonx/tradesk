import { z } from 'zod'

// Схема для создания сделки
export const createTradeOrderSchema = z.object({
  userId: z.number(),
  positionId: z.number().optional(),
  remoteOrderId: z.string().optional(),
  openDate: z.date().optional(),
  fillDate: z.date().optional(),
  cancelDate: z.date().optional(),
  expirationDate: z.date().optional(),
  fromWalletId: z.number(),
  fromAssetId: z.number(),
  fromValue: z.number().positive(),
  toWalletId: z.number(),
  toAssetId: z.number(),
  toValue: z.number().positive(),
  lotSize: z.number().positive().optional(),
  price: z.number().positive().optional(),
  action: z.enum(['BUY', 'SELL']),
  status: z.enum(['OPND', 'FILL', 'CANC', 'EXPR']),
  note: z.string().optional(),
  data: z.string().optional()
})

// Схема для обновления сделки
export const updateTradeOrderSchema = z.object({
  remoteOrderId: z.string().optional(),
  openDate: z.date().optional(),
  fillDate: z.date().optional(),
  cancelDate: z.date().optional(),
  expirationDate: z.date().optional(),
  fromWalletId: z.number().optional(),
  fromAssetId: z.number().optional(),
  fromValue: z.number().positive().optional(),
  toWalletId: z.number().optional(),
  toAssetId: z.number().optional(),
  toValue: z.number().positive().optional(),
  lotSize: z.number().positive().optional(),
  price: z.number().positive().optional(),
  action: z.enum(['BUY', 'SELL']).optional(),
  status: z.enum(['OPND', 'FILL', 'CANC', 'EXPR']).optional(),
  note: z.string().optional(),
  data: z.string().optional()
})

// Схема для ответа с данными сделки
export const tradeOrderResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  positionId: z.number().nullable(),
  remoteOrderId: z.string().nullable(),
  openDate: z.date().nullable(),
  fillDate: z.date().nullable(),
  cancelDate: z.date().nullable(),
  expirationDate: z.date().nullable(),
  fromWalletId: z.number(),
  fromAssetId: z.number(),
  fromValue: z.number(),
  toWalletId: z.number(),
  toAssetId: z.number(),
  toValue: z.number(),
  lotSize: z.number().nullable(),
  price: z.number().nullable(),
  action: z.string(),
  status: z.string(),
  note: z.string().nullable(),
  data: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
}) 