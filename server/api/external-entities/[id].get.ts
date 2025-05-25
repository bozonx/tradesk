import { defineEventHandler, createError } from 'h3'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  if (!event.context.params?.id) {
    throw createError({
      statusCode: 400,
      message: 'External entity ID is required',
    })
  }

  const id = parseInt(event.context.params.id)
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid external entity ID',
    })
  }

  const entity = await prisma.externalEntity.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      positions: true,
      transactions: true,
    },
  })

  if (!entity) {
    throw createError({
      statusCode: 404,
      message: 'External entity not found',
    })
  }

  return {
    data: entity,
  }
}) 