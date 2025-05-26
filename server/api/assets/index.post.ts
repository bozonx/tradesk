import { AssetService } from '~/server/services/asset.service'
import { createAssetSchema } from '~/server/schemas/asset.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createAssetSchema.parse(body)

    const assetService = new AssetService()
    const asset = await assetService.createAsset(validatedData)
    return asset
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.statusCode) throw error
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Неверные данные актива',
        data: err.errors
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Ошибка при создании актива'
    })
  }
}) 