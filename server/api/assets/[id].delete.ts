import { defineEventHandler, createError } from 'h3'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  if (!event.context.params?.id) {
    throw createError({
      statusCode: 400,
      message: 'Asset ID is required',
    })
  }

  const id = parseInt(event.context.params.id)
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid asset ID',
    })
  }

  const asset = await prisma.asset.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  })

  if (!asset) {
    throw createError({
      statusCode: 404,
      message: 'Asset not found',
    })
  }

  await prisma.asset.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  })

  return {
    message: 'Asset deleted successfully',
  }
}) 