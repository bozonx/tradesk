import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import prisma from '../../utils/prisma'

const createWalletSchema = z.object({
  name: z.string().min(1),
  descr: z.string().optional(),
  externalEntityId: z.number().optional(),
  state: z.string().optional(),
  isArchived: z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.user.id
    const body = await readBody(event)
    const data = createWalletSchema.parse(body)

    // Check if external entity exists if provided
    if (data.externalEntityId) {
      const externalEntity = await prisma.externalEntity.findUnique({
        where: { id: data.externalEntityId },
      })

      if (!externalEntity) {
        throw createError({
          statusCode: 400,
          message: 'Invalid external entity',
        })
      }
    }

    const wallet = await prisma.wallet.create({
      data: {
        ...data,
        userId,
      },
      include: {
        externalEntity: true,
        fromTransactions: true,
        toTransactions: true,
        fromTradeOrders: true,
        toTradeOrders: true,
      },
    })

    return {
      data: wallet,
      message: 'Wallet created successfully',
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