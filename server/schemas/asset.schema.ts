import { z } from 'zod'

// Схема для создания актива
export const createAssetSchema = z.object({
  ticker: z.string(),
  type: z.string()
})

// Схема для обновления актива
export const updateAssetSchema = z.object({
  ticker: z.string().optional(),
  type: z.string().optional()
})

// Схема для ответа с данными актива
export const assetResponseSchema = z.object({
  id: z.number(),
  ticker: z.string(),
  type: z.string()
}) 