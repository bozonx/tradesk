import { PositionService } from '~/server/services/position.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const strategyId = Number(event.context.params?.strategyId)
    if (isNaN(strategyId)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID стратегии'
      })
    }

    const positionService = new PositionService()
    const positions = await positionService.getStrategyPositions(strategyId)
    return positions
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении позиций'
    })
  }
}) 