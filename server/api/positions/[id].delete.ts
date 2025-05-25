import { defineEventHandler, createError, getRouterParam } from 'h3'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const id = parseInt(getRouterParam(event, 'id') || '0')

  // Check if position exists and belongs to user
  const existingPosition = await prisma.position.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
  })

  if (!existingPosition) {
    throw createError({
      statusCode: 404,
      message: 'Position not found',
    })
  }

  // Soft delete the position
  await prisma.position.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  })

  return {
    message: 'Position deleted successfully',
  }
}) 