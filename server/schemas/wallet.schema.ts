import { z } from 'zod'

// Схема для создания кошелька
export const createWalletSchema = z.object({
  userId: z.number(),
  externalEntityId: z.number().optional(),
  name: z.string(),
  descr: z.string().optional(),
  state: z.string().optional(),
  isArchived: z.boolean().optional().default(false)
})

// Схема для обновления кошелька
export const updateWalletSchema = z.object({
  externalEntityId: z.number().optional(),
  name: z.string().optional(),
  descr: z.string().optional(),
  state: z.string().optional(),
  isArchived: z.boolean().optional()
})

// Схема для ответа с данными кошелька
export const walletResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  externalEntityId: z.number().nullable(),
  name: z.string(),
  descr: z.string().nullable(),
  state: z.string().nullable(),
  isArchived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
}) 