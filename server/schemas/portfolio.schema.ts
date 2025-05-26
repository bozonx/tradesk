import { z } from 'zod'

// Схема для создания портфолио
export const createPortfolioSchema = z.object({
  userId: z.number(),
  name: z.string().min(1),
  descr: z.string().optional(),
  state: z.string().optional(),
  groupId: z.number().optional(),
  isArchived: z.boolean().default(false)
})

// Схема для обновления портфолио
export const updatePortfolioSchema = z.object({
  name: z.string().min(1).optional(),
  descr: z.string().optional(),
  state: z.string().optional(),
  groupId: z.number().optional(),
  isArchived: z.boolean().optional()
})

// Схема для ответа с данными портфолио
export const portfolioResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  descr: z.string().nullable(),
  state: z.string().nullable(),
  groupId: z.number().nullable(),
  isArchived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
}) 