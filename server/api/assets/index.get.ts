import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'
import { getPaginationParams, createPaginationResponse, createWhereClause, createOrderByClause } from '../../utils/pagination'

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  filter: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { page, limit, sortBy, sortOrder, search, filter } = querySchema.parse(query)

    const paginationParams = getPaginationParams(page, limit)
    const whereClause = createWhereClause(search, filter)
    const orderByClause = createOrderByClause(sortBy, sortOrder)

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where: {
          ...whereClause,
          deletedAt: null,
        },
        include: {
          positions: true,
          transactions: true,
          tradeOrders: true,
        },
        ...paginationParams,
        ...orderByClause,
      }),
      prisma.asset.count({
        where: {
          ...whereClause,
          deletedAt: null,
        },
      }),
    ])

    return createPaginationResponse(assets, total, paginationParams)
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