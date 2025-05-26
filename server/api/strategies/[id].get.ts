import { StrategyService } from '~/server/services/strategy.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID стратегии'
      })
    }

    const strategyService = new StrategyService()
    const strategy = await strategyService.getStrategyById(id)
    if (!strategy) {
      throw createError({
        statusCode: 404,
        message: 'Стратегия не найдена'
      })
    }
    return strategy
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении стратегии'
    })
  }
}) 