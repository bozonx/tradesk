import { TradeService } from '~/server/services/trade.service'
import { updateTradeOrderSchema } from '~/server/schemas/trade.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID ордера'
      })
    }

    const body = await readBody(event)
    const validatedData = updateTradeOrderSchema.parse(body)

    const tradeService = new TradeService()
    const tradeOrder = await tradeService.updateTradeOrder(id, validatedData)
    
    if (!tradeOrder) {
      throw createError({
        statusCode: 404,
        message: 'Ордер не найден'
      })
    }

    return tradeOrder
  } catch (error) {
    const err = error as H3Error | ZodError
    if ('statusCode' in err) throw error
    if (err instanceof Error && err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Неверные данные ордера',
        data: err
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Ошибка при обновлении ордера'
    })
  }
}) 