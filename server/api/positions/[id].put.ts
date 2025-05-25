import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const updatePositionSchema = z.object({
  type: z.enum(['LONG', 'SHRT']).optional(),
  groupId: z.number().optional(),
  portfolioId: z.number().optional(),
  strategyId: z.number().optional(),
  descr: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const id = parseInt(getRouterParam(event, 'id') || '0')
  const body = await readBody(event)

  try {
    const validatedData = updatePositionSchema.parse(body)

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

    // Check if group exists and belongs to user if provided
    if (validatedData.groupId) {
      const group = await prisma.group.findFirst({
        where: {
          id: validatedData.groupId,
          type: 'POSITION',
        },
      })

      if (!group) {
        throw createError({
          statusCode: 400,
          message: 'Invalid group or group type must be POSITION',
        })
      }
    }

    // Check if portfolio exists and belongs to user if provided
    if (validatedData.portfolioId) {
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          id: validatedData.portfolioId,
          userId,
          deletedAt: null,
        },
      })

      if (!portfolio) {
        throw createError({
          statusCode: 400,
          message: 'Invalid portfolio',
        })
      }
    }

    // Check if strategy exists and belongs to user if provided
    if (validatedData.strategyId) {
      const strategy = await prisma.strategy.findFirst({
        where: {
          id: validatedData.strategyId,
          userId,
          deletedAt: null,
        },
      })

      if (!strategy) {
        throw createError({
          statusCode: 400,
          message: 'Invalid strategy',
        })
      }
    }

    const updatedPosition = await prisma.position.update({
      where: { id },
      data: validatedData,
      include: {
        group: true,
        portfolio: true,
        strategy: true,
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
    })

    return {
      data: updatedPosition,
      message: 'Position updated successfully',
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