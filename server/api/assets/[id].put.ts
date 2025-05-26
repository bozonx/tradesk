import { AssetService } from '~/server/services/asset.service'
import { updateAssetSchema } from '~/server/schemas/asset.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID актива'
      })
    }

    const body = await readBody(event)
    const validatedData = updateAssetSchema.parse(body)

    const assetService = new AssetService()
    const asset = await assetService.updateAsset(id, validatedData)
    if (!asset) {
      throw createError({
        statusCode: 404,
        message: 'Актив не найден'
      })
    }
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
      message: 'Ошибка при обновлении актива'
    })
  }
}) 