import { WalletService } from '~/server/services/wallet.service'
import { createWalletSchema } from '~/server/schemas/wallet.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createWalletSchema.parse(body)

    const walletService = new WalletService()
    const wallet = await walletService.createWallet(validatedData)
    return wallet
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.statusCode) throw error
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Неверные данные кошелька',
        data: err.errors
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Ошибка при создании кошелька'
    })
  }
}) 