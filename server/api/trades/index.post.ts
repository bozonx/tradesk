import { TradeService } from '~/server/services/trade.service'
import { createTradeOrderSchema } from '~/server/schemas/trade.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createTradeOrderSchema.parse(body)

    const tradeService = new TradeService()
    const tradeOrder = await tradeService.createTradeOrder(validatedData)
    
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
      message: 'Ошибка при создании ордера'
    })
  }
}) 