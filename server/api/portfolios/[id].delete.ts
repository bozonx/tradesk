import { PortfolioService } from '~/server/services/portfolio.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID портфолио'
      })
    }

    const portfolioService = new PortfolioService()
    const portfolio = await portfolioService.deletePortfolio(id)
    
    if (!portfolio) {
      throw createError({
        statusCode: 404,
        message: 'Портфолио не найдено'
      })
    }

    return { message: 'Портфолио успешно удалено' }
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при удалении портфолио'
    })
  }
}) 