import { PortfolioService } from '~/server/services/portfolio.service'
import { createPortfolioSchema } from '~/server/schemas/portfolio.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createPortfolioSchema.parse(body)

    const portfolioService = new PortfolioService()
    const portfolio = await portfolioService.createPortfolio(validatedData)
    
    return portfolio
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Неверные данные портфолио',
        data: (err as ZodError).errors
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Ошибка при создании портфолио'
    })
  }
}) 