import { defineEventHandler, createError, getRouterParam } from 'h3'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const id = parseInt(getRouterParam(event, 'id') || '0')

  // Check if strategy exists and belongs to user
  const existingStrategy = await prisma.strategy.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
  })

  if (!existingStrategy) {
    throw createError({
      statusCode: 404,
      message: 'Strategy not found',
    })
  }

  // Soft delete the strategy
  await prisma.strategy.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  })

  return {
    message: 'Strategy deleted successfully',
  }
}) 