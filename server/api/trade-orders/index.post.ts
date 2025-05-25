import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const createTradeOrderSchema = z.object({
  type: z.enum(['BUY', 'SELL']),
  status: z.enum(['PENDING', 'EXECUTED', 'CANCELLED']),
  price: z.number().positive(),
  quantity: z.number().positive(),
  assetId: z.number(),
  strategyId: z.number().optional(),
  positionId: z.number().optional(),
  metadata: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const data = createTradeOrderSchema.parse(body)

    // Проверяем существование актива
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

    const order = await prisma.tradeOrder.create({
      data,
      include: {
        asset: true,
        strategy: true,
        position: true,
      },
    })

    return {
      data: order,
      message: 'Trade order created successfully',
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