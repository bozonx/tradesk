import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const createTransactionSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  positionId: z.number().optional(),
  partialOfId: z.number().optional(),
  feeOfId: z.number().optional(),
  tradeOrderId: z.number().optional(),
  type: z.enum(['TRDE', 'TRNS', 'EXTR', 'FEE']),
  status: z.enum(['DONE', 'PEND', 'CANC']),
  fromWalletId: z.number().optional(),
  fromAssetId: z.number().optional(),
  fromValue: z.number().optional(),
  toWalletId: z.number(),
  toAssetId: z.number(),
  toValue: z.number(),
  note: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user.id
    const body = await readBody(event)
    const data = createTransactionSchema.parse(body)

    // Check if position exists and belongs to user if provided
    if (data.positionId) {
      const position = await prisma.position.findFirst({
        where: {
          id: data.positionId,
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
    if (data.partialOfId) {
      const partialOf = await prisma.transaction.findFirst({
        where: {
          id: data.partialOfId,
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
    if (data.feeOfId) {
      const feeOf = await prisma.transaction.findFirst({
        where: {
          id: data.feeOfId,
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
    if (data.tradeOrderId) {
      const tradeOrder = await prisma.tradeOrder.findFirst({
        where: {
          id: data.tradeOrderId,
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
    if (data.fromWalletId) {
      const fromWallet = await prisma.wallet.findFirst({
        where: {
          id: data.fromWalletId,
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

    // Check if toWallet exists and belongs to user
    const toWallet = await prisma.wallet.findFirst({
      where: {
        id: data.toWalletId,
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

    // Check if fromAsset exists if provided
    if (data.fromAssetId) {
      const fromAsset = await prisma.asset.findUnique({
        where: { id: data.fromAssetId },
      })

      if (!fromAsset) {
        throw createError({
          statusCode: 400,
          message: 'Invalid from asset',
        })
      }
    }

    // Check if toAsset exists
    const toAsset = await prisma.asset.findUnique({
      where: { id: data.toAssetId },
    })

    if (!toAsset) {
      throw createError({
        statusCode: 400,
        message: 'Invalid to asset',
      })
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId,
      },
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
      data: transaction,
      message: 'Transaction created successfully',
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