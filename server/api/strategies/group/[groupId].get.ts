import { StrategyService } from '~/server/services/strategy.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const groupId = Number(event.context.params?.groupId)
    if (isNaN(groupId)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID группы'
      })
    }

    const query = getQuery(event)
    const page = query.page ? Number(query.page) : undefined
    const limit = query.limit ? Number(query.limit) : undefined
    const isArchived = query.isArchived ? query.isArchived === 'true' : undefined

    // Валидация параметров
    if (page !== undefined && (isNaN(page) || page < 1)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный параметр page'
      })
    }

    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный параметр limit'
      })
    }

    const strategyService = new StrategyService()
    const result = await strategyService.getGroupStrategies(groupId, {
      page,
      limit,
      isArchived
    })
    return result
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении стратегий'
    })
  }
}) 