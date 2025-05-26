import { z } from 'zod'

// Схема для создания заметки
export const createNoteSchema = z.object({
  userId: z.number(),
  title: z.string().min(1),
  content: z.string(),
  type: z.enum(['TEXT', 'MARKDOWN']).default('TEXT'),
  state: z.string().optional()
})

// Схема для обновления заметки
export const updateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  type: z.enum(['TEXT', 'MARKDOWN']).optional(),
  state: z.string().optional()
})

// Схема для ответа с данными заметки
export const noteResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  content: z.string(),
  type: z.string(),
  state: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
}) 