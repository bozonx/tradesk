import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const updateTradeOrderSchema = z.object({
  type: z.enum(['BUY', 'SELL']).optional(),
  status: z.enum(['PENDING', 'EXECUTED', 'CANCELLED']).optional(),
  price: z.number().positive().optional(),
  quantity: z.number().positive().optional(),
  assetId: z.number().optional(),
  strategyId: z.number().optional(),
  positionId: z.number().optional(),
  metadata: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  if (!event.context.params?.id) {
    throw createError({
      statusCode: 400,
      message: 'Trade order ID is required',
    })
  }

  const id = parseInt(event.context.params.id)
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid trade order ID',
    })
  }

  try {
    const body = await readBody(event)
    const data = updateTradeOrderSchema.parse(body)

    const order = await prisma.tradeOrder.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!order) {
      throw createError({
        statusCode: 404,
        message: 'Trade order not found',
      })
    }

    // Проверяем существование актива, если указан
    if (data.assetId) {
      const asset = await prisma.asset.findFirst({
        where: {
          id: data.assetId,
          deletedAt: null,
        },
      })

      if (!asset) {
        throw createError({
          statusCode: 400,
          message: 'Asset not found',
        })
      }
    }

    // Проверяем существование стратегии, если указана
    if (data.strategyId) {
      const strategy = await prisma.strategy.findFirst({
        where: {
          id: data.strategyId,
          deletedAt: null,
        },
      })

      if (!strategy) {
        throw createError({
          statusCode: 400,
          message: 'Strategy not found',
        })
      }
    }

    // Проверяем существование позиции, если указана
    if (data.positionId) {
      const position = await prisma.position.findFirst({
        where: {
          id: data.positionId,
          deletedAt: null,
        },
      })

      if (!position) {
        throw createError({
          statusCode: 400,
          message: 'Position not found',
        })
      }
    }

    const updatedOrder = await prisma.tradeOrder.update({
      where: { id },
      data,
      include: {
        asset: true,
        strategy: true,
        position: true,
      },
    })

    return {
      data: updatedOrder,
      message: 'Trade order updated successfully',
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