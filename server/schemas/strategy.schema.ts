import { z } from 'zod'

// Схема для создания стратегии
export const createStrategySchema = z.object({
  userId: z.number(),
  groupId: z.number().optional(),
  name: z.string(),
  descr: z.string().optional(),
  state: z.string().optional(),
  isArchived: z.boolean().optional().default(false)
})

// Схема для обновления стратегии
export const updateStrategySchema = z.object({
  groupId: z.number().optional(),
  name: z.string().optional(),
  descr: z.string().optional(),
  state: z.string().optional(),
  isArchived: z.boolean().optional()
})

// Схема для ответа с данными стратегии
export const strategyResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  groupId: z.number().nullable(),
  name: z.string(),
  descr: z.string().nullable(),
  state: z.string().nullable(),
  isArchived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
}) 