import { PositionService } from '~/server/services/position.service'
import { updatePositionSchema } from '~/server/schemas/position.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid position ID'
      })
    }

    const body = await readBody(event)
    const validatedData = updatePositionSchema.partial().parse(body)

    const positionService = new PositionService()
    const position = await positionService.updatePosition(id, validatedData)
    
    if (!position) {
      throw createError({
        statusCode: 404,
        message: 'Position not found'
      })
    }

    return position
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid position data',
        data: (err as ZodError).errors
      })
    }
    if ('statusCode' in err) throw error
    throw createError({
      statusCode: 500,
      message: 'Error updating position'
    })
  }
}) 