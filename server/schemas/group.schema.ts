import { z } from 'zod'

// Схема для создания группы
export const createGroupSchema = z.object({
  type: z.string(),
  name: z.string(),
  descr: z.string().optional()
})

// Схема для обновления группы
export const updateGroupSchema = z.object({
  type: z.string().optional(),
  name: z.string().optional(),
  descr: z.string().optional()
})

// Схема для ответа с данными группы
export const groupResponseSchema = z.object({
  id: z.number(),
  type: z.string(),
  name: z.string(),
  descr: z.string().nullable()
}) 