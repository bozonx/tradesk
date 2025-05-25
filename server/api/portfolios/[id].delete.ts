import { defineEventHandler, createError, getRouterParam } from 'h3'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const id = parseInt(getRouterParam(event, 'id') || '0')

  // Check if portfolio exists and belongs to user
  const existingPortfolio = await prisma.portfolio.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
  })

  if (!existingPortfolio) {
    throw createError({
      statusCode: 404,
      message: 'Portfolio not found',
    })
  }

  // Soft delete the portfolio
  await prisma.portfolio.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  })

  return {
    message: 'Portfolio deleted successfully',
  }
}) 