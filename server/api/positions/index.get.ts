import { PositionService } from '~/server/services/position.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const portfolioId = Number(query.portfolioId)

    if (isNaN(portfolioId)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID портфолио'
      })
    }

    const positionService = new PositionService()
    const positions = await positionService.getPortfolioPositions(portfolioId)
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