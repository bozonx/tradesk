import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const updateExternalEntitySchema = z.object({
  type: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  descr: z.string().optional(),
  metadata: z.string().optional(),
})

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

  try {
    const body = await readBody(event)
    const data = updateExternalEntitySchema.parse(body)

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

    const updatedEntity = await prisma.externalEntity.update({
      where: { id },
      data,
      include: {
        positions: true,
        transactions: true,
      },
    })

    return {
      data: updatedEntity,
      message: 'External entity updated successfully',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Invalid input',
        data: error.errors,
      })
    }
    throw error
  }
}) 