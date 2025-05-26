import { z } from 'zod'

// Схема для создания позиции
export const createPositionSchema = z.object({
  userId: z.number(),
  type: z.enum(['LONG', 'SHRT']),
  groupId: z.number().optional(),
  portfolioId: z.number().optional(),
  strategyId: z.number().optional(),
  descr: z.string().optional()
})

// Схема для обновления позиции
export const updatePositionSchema = z.object({
  type: z.enum(['LONG', 'SHRT']).optional(),
  groupId: z.number().optional(),
  portfolioId: z.number().optional(),
  strategyId: z.number().optional(),
  descr: z.string().optional()
})

// Схема для ответа с данными позиции
export const positionResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  type: z.string(),
  groupId: z.number().nullable(),
  portfolioId: z.number().nullable(),
  strategyId: z.number().nullable(),
  descr: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
}) 