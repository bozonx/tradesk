import { defineEventHandler, createError, getRouterParam } from 'h3'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const id = parseInt(getRouterParam(event, 'id') || '0')

  const strategy = await prisma.strategy.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
    include: {
      group: true,
      positions: {
        include: {
          transactions: {
            include: {
              fromWallet: true,
              toWallet: true,
              fromAsset: true,
              toAsset: true,
            },
          },
          tradeOrders: {
            include: {
              fromWallet: true,
              toWallet: true,
              fromAsset: true,
              toAsset: true,
            },
          },
        },
      },
    },
  })

  if (!strategy) {
    throw createError({
      statusCode: 404,
      message: 'Strategy not found',
    })
  }

  return {
    data: strategy,
  }
}) 