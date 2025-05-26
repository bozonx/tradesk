import { TradeService } from '~/server/services/trade.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID ордера'
      })
    }

    const tradeService = new TradeService()
    const tradeOrder = await tradeService.deleteTradeOrder(id)
    
    if (!tradeOrder) {
      throw createError({
        statusCode: 404,
        message: 'Ордер не найден'
      })
    }

    return { message: 'Ордер успешно удален' }
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при удалении ордера'
    })
  }
}) 