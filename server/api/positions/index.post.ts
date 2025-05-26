import { PositionService } from '~/server/services/position.service'
import { createPositionSchema } from '~/server/schemas/position.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createPositionSchema.parse(body)

    const positionService = new PositionService()
    const position = await positionService.createPosition(validatedData)
    
    return position
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Неверные данные позиции',
        data: (err as ZodError).errors
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Ошибка при создании позиции'
    })
  }
}) 