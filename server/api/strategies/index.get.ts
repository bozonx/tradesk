import { StrategyService } from '~/server/services/strategy.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const strategyService = new StrategyService()
    const strategies = await strategyService.getAllStrategies()
    return strategies
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении стратегий'
    })
  }
}) 