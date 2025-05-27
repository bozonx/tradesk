import { StrategyService } from '~/server/services/strategy.service'
import { updateStrategySchema } from '~/server/schemas/strategy.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid strategy ID'
      })
    }

    const body = await readBody(event)
    const validatedData = updateStrategySchema.partial().parse(body)

    const strategyService = new StrategyService()
    const strategy = await strategyService.updateStrategy(id, validatedData)
    
    if (!strategy) {
      throw createError({
        statusCode: 404,
        message: 'Strategy not found'
      })
    }

    return strategy
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid strategy data',
        data: (err as ZodError).errors
      })
    }
    if ('statusCode' in err) throw error
    throw createError({
      statusCode: 500,
      message: 'Error updating strategy'
    })
  }
}) 