import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const updateWalletSchema = z.object({
  name: z.string().min(1).optional(),
  descr: z.string().optional(),
  externalEntityId: z.number().optional(),
  state: z.string().optional(),
  isArchived: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id
  const id = parseInt(getRouterParam(event, 'id') || '0')
  const body = await readBody(event)

  try {
    const validatedData = updateWalletSchema.parse(body)

    // Check if wallet exists and belongs to user
    const existingWallet = await prisma.wallet.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    })

    if (!existingWallet) {
      throw createError({
        statusCode: 404,
        message: 'Wallet not found',
      })
    }

    // Check if external entity exists if provided
    if (validatedData.externalEntityId) {
      const externalEntity = await prisma.externalEntity.findUnique({
        where: { id: validatedData.externalEntityId },
      })

      if (!externalEntity) {
        throw createError({
          statusCode: 400,
          message: 'Invalid external entity',
        })
      }
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id },
      data: validatedData,
      include: {
        externalEntity: true,
        fromTransactions: true,
        toTransactions: true,
        fromTradeOrders: true,
        toTradeOrders: true,
      },
    })

    return {
      data: updatedWallet,
      message: 'Wallet updated successfully',
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