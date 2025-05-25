import { defineEventHandler, createError } from 'h3'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  if (!event.context.params?.id) {
    throw createError({
      statusCode: 400,
      message: 'Group ID is required',
    })
  }

  const id = parseInt(event.context.params.id)
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid group ID',
    })
  }

  const group = await prisma.group.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      portfolios: true,
      positions: true,
      strategies: true,
    },
  })

  if (!group) {
    throw createError({
      statusCode: 404,
      message: 'Group not found',
    })
  }

  return {
    data: group,
  }
}) 