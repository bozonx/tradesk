import { defineEventHandler, createError, getRouterParam } from 'h3'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const id = parseInt(getRouterParam(event, 'id') || '0')

  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
    include: {
      position: true,
      partialOf: true,
      partialTransactions: true,
      feeOf: true,
      feeTransactions: true,
      tradeOrder: true,
      fromWallet: true,
      toWallet: true,
      fromAsset: true,
      toAsset: true,
    },
  })

  if (!transaction) {
    throw createError({
      statusCode: 404,
      message: 'Transaction not found',
    })
  }

  return {
    data: transaction,
  }
}) 