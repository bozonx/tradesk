import { defineEventHandler, createError, getRouterParam } from 'h3'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const id = parseInt(getRouterParam(event, 'id') || '0')

  // Check if transaction exists and belongs to user
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
  })

  if (!existingTransaction) {
    throw createError({
      statusCode: 404,
      message: 'Transaction not found',
    })
  }

  // Soft delete the transaction
  await prisma.transaction.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  })

  return {
    message: 'Transaction deleted successfully',
  }
}) 