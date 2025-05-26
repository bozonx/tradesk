import { TradeService } from '~/server/services/trade.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const positionId = Number(query.positionId)

    if (isNaN(positionId)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID позиции'
      })
    }

    const tradeService = new TradeService()
    const tradeOrders = await tradeService.getPositionTradeOrders(positionId)
    return tradeOrders
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении ордеров'
    })
  }
}) 