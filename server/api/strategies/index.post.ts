import { StrategyService } from '~/server/services/strategy.service'
import { createStrategySchema } from '~/server/schemas/strategy.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createStrategySchema.parse(body)

    const strategyService = new StrategyService()
    const strategy = await strategyService.createStrategy(validatedData)
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
      message: 'Ошибка при создании стратегии'
    })
  }
}) 