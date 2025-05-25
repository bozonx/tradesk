import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const updateTransactionSchema = z.object({
  date: z.string().transform(str => new Date(str)).optional(),
  positionId: z.number().optional(),
  partialOfId: z.number().optional(),
  feeOfId: z.number().optional(),
  tradeOrderId: z.number().optional(),
  type: z.enum(['TRDE', 'TRNS', 'EXTR', 'FEE']).optional(),
  status: z.enum(['DONE', 'PEND', 'CANC']).optional(),
  fromWalletId: z.number().optional(),
  fromAssetId: z.number().optional(),
  fromValue: z.number().optional(),
  toWalletId: z.number().optional(),
  toAssetId: z.number().optional(),
  toValue: z.number().optional(),
  note: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const id = parseInt(getRouterParam(event, 'id') || '0')
  const body = await readBody(event)

  try {
    const validatedData = updateTransactionSchema.parse(body)

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    })

    if (!existingTransaction) {
      throw createError({
        statusCode: 404,
        message: 'Transaction not found',
      })
    }

    // Check if position exists and belongs to user if provided
    if (validatedData.positionId) {
      const position = await prisma.position.findFirst({
        where: {
          id: validatedData.positionId,
          userId,
          deletedAt: null,
        },
      })

      if (!position) {
        throw createError({
          statusCode: 400,
          message: 'Invalid position',
        })
      }
    }

    // Check if partialOf transaction exists and belongs to user if provided
    if (validatedData.partialOfId) {
      const partialOf = await prisma.transaction.findFirst({
        where: {
          id: validatedData.partialOfId,
          userId,
          deletedAt: null,
        },
      })

      if (!partialOf) {
        throw createError({
          statusCode: 400,
          message: 'Invalid partialOf transaction',
        })
      }
    }

    // Check if feeOf transaction exists and belongs to user if provided
    if (validatedData.feeOfId) {
      const feeOf = await prisma.transaction.findFirst({
        where: {
          id: validatedData.feeOfId,
          userId,
          deletedAt: null,
        },
      })

      if (!feeOf) {
        throw createError({
          statusCode: 400,
          message: 'Invalid feeOf transaction',
        })
      }
    }

    // Check if tradeOrder exists and belongs to user if provided
    if (validatedData.tradeOrderId) {
      const tradeOrder = await prisma.tradeOrder.findFirst({
        where: {
          id: validatedData.tradeOrderId,
          userId,
          deletedAt: null,
        },
      })

      if (!tradeOrder) {
        throw createError({
          statusCode: 400,
          message: 'Invalid trade order',
        })
      }
    }

    // Check if fromWallet exists and belongs to user if provided
    if (validatedData.fromWalletId) {
      const fromWallet = await prisma.wallet.findFirst({
        where: {
          id: validatedData.fromWalletId,
          userId,
          deletedAt: null,
        },
      })

      if (!fromWallet) {
        throw createError({
          statusCode: 400,
          message: 'Invalid from wallet',
        })
      }
    }

    // Check if toWallet exists and belongs to user if provided
    if (validatedData.toWalletId) {
      const toWallet = await prisma.wallet.findFirst({
        where: {
          id: validatedData.toWalletId,
          userId,
          deletedAt: null,
        },
      })

      if (!toWallet) {
        throw createError({
          statusCode: 400,
          message: 'Invalid to wallet',
        })
      }
    }

    // Check if fromAsset exists if provided
    if (validatedData.fromAssetId) {
      const fromAsset = await prisma.asset.findUnique({
        where: { id: validatedData.fromAssetId },
      })

      if (!fromAsset) {
        throw createError({
          statusCode: 400,
          message: 'Invalid from asset',
        })
      }
    }

    // Check if toAsset exists if provided
    if (validatedData.toAssetId) {
      const toAsset = await prisma.asset.findUnique({
        where: { id: validatedData.toAssetId },
      })

      if (!toAsset) {
        throw createError({
          statusCode: 400,
          message: 'Invalid to asset',
        })
      }
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: validatedData,
      include: {
        position: true,
        partialOf: true,
        partialTransactions: true,
        feeOf: true,
        feeTransactions: true,
        tradeOrder: true,
        fromWallet: true,
        toWallet: true,
        fromAsset: true,
        toAsset: true,
      },
    })

    return {
      data: updatedTransaction,
      message: 'Transaction updated successfully',
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