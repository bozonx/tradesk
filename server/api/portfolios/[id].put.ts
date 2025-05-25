import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const updatePortfolioSchema = z.object({
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
    const validatedData = updatePortfolioSchema.parse(body)

    // Check if portfolio exists and belongs to user
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    })

    if (!existingPortfolio) {
      throw createError({
        statusCode: 404,
        message: 'Portfolio not found',
      })
    }

    // If groupId is provided, check if it exists and belongs to user
    if (validatedData.groupId) {
      const group = await prisma.group.findFirst({
        where: {
          id: validatedData.groupId,
          userId,
          deletedAt: null,
        },
      })

      if (!group) {
        throw createError({
          statusCode: 400,
          message: 'Invalid group ID',
        })
      }
    }

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id },
      data: validatedData,
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
      data: updatedPortfolio,
      message: 'Portfolio updated successfully',
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