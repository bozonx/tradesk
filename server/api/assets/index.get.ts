import { AssetService } from '~/server/services/asset.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const assetService = new AssetService()
    const assets = await assetService.getAllAssets()
    return assets
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении активов'
    })
  }
}) 