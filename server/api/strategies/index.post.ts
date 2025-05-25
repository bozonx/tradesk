import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const createStrategySchema = z.object({
  name: z.string().min(1),
  descr: z.string().optional(),
  groupId: z.number().optional(),
  state: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user.id
    const body = await readBody(event)
    const data = createStrategySchema.parse(body)

    // Check if group exists and belongs to user if provided
    if (data.groupId) {
      const group = await prisma.group.findFirst({
        where: {
          id: data.groupId,
          type: 'STRATEGY',
        },
      })

      if (!group) {
        throw createError({
          statusCode: 400,
          message: 'Invalid group',
        })
      }
    }

    const strategy = await prisma.strategy.create({
      data: {
        ...data,
        userId,
      },
      include: {
        group: true,
        positions: {
          include: {
            transactions: true,
            tradeOrders: true,
          },
        },
      },
    })

    return {
      data: strategy,
      message: 'Strategy created successfully',
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