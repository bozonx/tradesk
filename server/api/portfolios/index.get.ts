import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'
import { getPaginationParams, createPaginationResponse, createWhereClause, createOrderByClause } from '../../utils/pagination'
import type { QueryParams } from '../../types/api'

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  filter: z.record(z.any()).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user.id
    const query = await getQuery(event)
    const validatedQuery = querySchema.parse(query)

    const { skip, take, page, limit } = getPaginationParams(validatedQuery as QueryParams)
    const where = createWhereClause(validatedQuery as QueryParams)
    const orderBy = createOrderByClause(validatedQuery as QueryParams)

    // Add user filter
    where.userId = userId

    const [portfolios, total] = await Promise.all([
      prisma.portfolio.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          group: true,
          positions: true,
        },
      }),
      prisma.portfolio.count({ where }),
    ])

    return createPaginationResponse(portfolios, total, page, limit)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Invalid query parameters',
        data: error.errors,
      })
    }

    throw error
  }
}) 