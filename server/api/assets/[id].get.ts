import { AssetService } from '~/server/services/asset.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID актива'
      })
    }

    const assetService = new AssetService()
    const asset = await assetService.getAssetById(id)
    if (!asset) {
      throw createError({
        statusCode: 404,
        message: 'Актив не найден'
      })
    }
    return asset
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении актива'
    })
  }
}) 