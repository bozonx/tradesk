import { AssetService } from '~/server/services/asset.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const ticker = event.context.params?.ticker
    if (!ticker) {
      throw createError({
        statusCode: 400,
        message: 'Неверный тикер актива'
      })
    }

    const assetService = new AssetService()
    const asset = await assetService.getAssetByTicker(ticker)
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