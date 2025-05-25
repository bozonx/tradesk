import { defineEventHandler, createError } from 'h3'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  if (!event.context.params?.id) {
    throw createError({
      statusCode: 400,
      message: 'Trade order ID is required',
    })
  }

  const id = parseInt(event.context.params.id)
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid trade order ID',
    })
  }

  const order = await prisma.tradeOrder.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      asset: true,
      strategy: true,
      position: true,
    },
  })

  if (!order) {
    throw createError({
      statusCode: 404,
      message: 'Trade order not found',
    })
  }

  return {
    data: order,
  }
}) 