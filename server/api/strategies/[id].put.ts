import { StrategyService } from '~/server/services/strategy.service'
import { updateStrategySchema } from '~/server/schemas/strategy.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID стратегии'
      })
    }

    const body = await readBody(event)
    const validatedData = updateStrategySchema.parse(body)

    const strategyService = new StrategyService()
    const strategy = await strategyService.updateStrategy(id, validatedData)
    if (!strategy) {
      throw createError({
        statusCode: 404,
        message: 'Стратегия не найдена'
      })
    }
    return strategy
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.statusCode) throw error
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Неверные данные стратегии',
        data: err.errors
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Ошибка при обновлении стратегии'
    })
  }
}) 