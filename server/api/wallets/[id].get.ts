import { defineEventHandler, createError, getRouterParam } from 'h3'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const id = parseInt(getRouterParam(event, 'id') || '0')

  const wallet = await prisma.wallet.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
    include: {
      externalEntity: true,
      fromTransactions: true,
      toTransactions: true,
      fromTradeOrders: true,
      toTradeOrders: true,
    },
  })

  if (!wallet) {
    throw createError({
      statusCode: 404,
      message: 'Wallet not found',
    })
  }

  return {
    data: wallet,
  }
}) 