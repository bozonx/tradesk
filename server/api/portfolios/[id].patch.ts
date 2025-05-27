import { PortfolioService } from '~/server/services/portfolio.service'
import { updatePortfolioSchema } from '~/server/schemas/portfolio.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid portfolio ID'
      })
    }

    const body = await readBody(event)
    const validatedData = updatePortfolioSchema.partial().parse(body)

    const portfolioService = new PortfolioService()
    const portfolio = await portfolioService.updatePortfolio(id, validatedData)
    
    if (!portfolio) {
      throw createError({
        statusCode: 404,
        message: 'Portfolio not found'
      })
    }

    return portfolio
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid portfolio data',
        data: (err as ZodError).errors
      })
    }
    if ('statusCode' in err) throw error
    throw createError({
      statusCode: 500,
      message: 'Error updating portfolio'
    })
  }
}) 