import { TradeService } from '~/server/services/trade.service'
import { updateTradeSchema } from '~/server/schemas/trade.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid trade ID'
      })
    }

    const body = await readBody(event)
    const validatedData = updateTradeSchema.partial().parse(body)

    const tradeService = new TradeService()
    const trade = await tradeService.updateTrade(id, validatedData)
    
    if (!trade) {
      throw createError({
        statusCode: 404,
        message: 'Trade not found'
      })
    }

    return trade
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid trade data',
        data: (err as ZodError).errors
      })
    }
    if ('statusCode' in err) throw error
    throw createError({
      statusCode: 500,
      message: 'Error updating trade'
    })
  }
}) 