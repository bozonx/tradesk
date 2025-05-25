import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const updateAssetSchema = z.object({
  ticker: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  type: z.enum(['CRYP', 'FIAT', 'STOK', 'BOND', 'ETF']).optional(),
  descr: z.string().optional(),
  metadata: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  if (!event.context.params?.id) {
    throw createError({
      statusCode: 400,
      message: 'Asset ID is required',
    })
  }

  const id = parseInt(event.context.params.id)
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid asset ID',
    })
  }

  try {
    const body = await readBody(event)
    const data = updateAssetSchema.parse(body)

    const asset = await prisma.asset.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!asset) {
      throw createError({
        statusCode: 404,
        message: 'Asset not found',
      })
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data,
      include: {
        positions: true,
        transactions: true,
        tradeOrders: true,
      },
    })

    return {
      data: updatedAsset,
      message: 'Asset updated successfully',
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