import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const createExternalEntitySchema = z.object({
  type: z.string().min(1),
  name: z.string().min(1),
  descr: z.string().optional(),
  metadata: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const data = createExternalEntitySchema.parse(body)

    const entity = await prisma.externalEntity.create({
      data,
      include: {
        positions: true,
        transactions: true,
      },
    })

    return {
      data: entity,
      message: 'External entity created successfully',
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