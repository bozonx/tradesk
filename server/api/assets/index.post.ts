import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const createAssetSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  descr: z.string().optional(),
  metadata: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const data = createAssetSchema.parse(body)

    const asset = await prisma.asset.create({
      data,
      include: {
        positions: true,
        transactions: true,
        tradeOrders: true,
      },
    })

    return {
      data: asset,
      message: 'Asset created successfully',
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