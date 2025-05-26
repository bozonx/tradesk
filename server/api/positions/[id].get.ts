import { PositionService } from '~/server/services/position.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID позиции'
      })
    }

    const positionService = new PositionService()
    const position = await positionService.getPositionById(id)
    
    if (!position) {
      throw createError({
        statusCode: 404,
        message: 'Позиция не найдена'
      })
    }

    return position
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении позиции'
    })
  }
}) 