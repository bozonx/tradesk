import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const createGroupSchema = z.object({
  type: z.enum(['PORTFOLIO', 'POSITION', 'STRATEGY']),
  name: z.string().min(1),
  descr: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const data = createGroupSchema.parse(body)

    const group = await prisma.group.create({
      data,
      include: {
        portfolios: true,
        positions: true,
        strategies: true,
      },
    })

    return {
      data: group,
      message: 'Group created successfully',
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