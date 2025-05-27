import { AssetService } from '~/server/services/asset.service'
import { updateAssetSchema } from '~/server/schemas/asset.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid asset ID'
      })
    }

    const body = await readBody(event)
    const validatedData = updateAssetSchema.partial().parse(body)

    const assetService = new AssetService()
    const asset = await assetService.updateAsset(id, validatedData)
    
    if (!asset) {
      throw createError({
        statusCode: 404,
        message: 'Asset not found'
      })
    }

    return asset
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid asset data',
        data: (err as ZodError).errors
      })
    }
    if ('statusCode' in err) throw error
    throw createError({
      statusCode: 500,
      message: 'Error updating asset'
    })
  }
}) 