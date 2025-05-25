import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const updateStrategySchema = z.object({
  name: z.string().min(1).optional(),
  descr: z.string().optional(),
  groupId: z.number().optional(),
  state: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const id = parseInt(getRouterParam(event, 'id') || '0')
  const body = await readBody(event)

  try {
    const validatedData = updateStrategySchema.parse(body)

    // Check if strategy exists and belongs to user
    const existingStrategy = await prisma.strategy.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    })

    if (!existingStrategy) {
      throw createError({
        statusCode: 404,
        message: 'Strategy not found',
      })
    }

    // Check if group exists and belongs to user if provided
    if (validatedData.groupId) {
      const group = await prisma.group.findFirst({
        where: {
          id: validatedData.groupId,
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

    const updatedStrategy = await prisma.strategy.update({
      where: { id },
      data: validatedData,
      include: {
        group: true,
        positions: {
          include: {
            transactions: {
              include: {
                fromWallet: true,
                toWallet: true,
                fromAsset: true,
                toAsset: true,
              },
            },
            tradeOrders: {
              include: {
                fromWallet: true,
                toWallet: true,
                fromAsset: true,
                toAsset: true,
              },
            },
          },
        },
      },
    })

    return {
      data: updatedStrategy,
      message: 'Strategy updated successfully',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Invalid input data',
        data: error.errors,
      })
    }
    throw error
  }
}) 