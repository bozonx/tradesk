import { z } from 'zod'

// Схема для создания пользователя
export const createUserSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  settings: z.string().optional().default('{}')
})

// Схема для обновления пользователя
export const updateUserSchema = z.object({
  email: z.string().email('Неверный формат email').optional(),
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  settings: z.string().optional()
})

// Схема для ответа с данными пользователя
export const userResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string().nullable(),
  role: z.string(),
  settings: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
}) 