import { z } from 'zod'

// Схема для создания группы
export const createGroupSchema = z.object({
  userId: z.number(),
  name: z.string().min(1),
  descr: z.string().optional(),
  state: z.string().optional()
})

// Схема для обновления группы
export const updateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  descr: z.string().optional(),
  state: z.string().optional()
})

// Схема для ответа с данными группы
export const groupResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  descr: z.string().nullable(),
  state: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
}) 