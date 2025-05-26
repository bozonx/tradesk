import { PositionService } from '~/server/services/position.service'
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

    const positionService = new PositionService()
    const positions = await positionService.getGroupPositions(groupId)
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