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
  })

  if (!entity) {
    throw createError({
      statusCode: 404,
      message: 'External entity not found',
    })
  }

  await prisma.externalEntity.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  })

  return {
    message: 'External entity deleted successfully',
  }
}) 