import { defineEventHandler, createError, getRouterParam } from 'h3'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const id = parseInt(getRouterParam(event, 'id') || '0')

  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
    include: {
      group: true,
      positions: {
        include: {
          transactions: true,
          tradeOrders: true,
        },
      },
    },
  })

  if (!portfolio) {
    throw createError({
      statusCode: 404,
      message: 'Portfolio not found',
    })
  }

  return {
    data: portfolio,
  }
}) 