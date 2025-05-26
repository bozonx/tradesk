import { WalletService } from '~/server/services/wallet.service'
import { updateWalletSchema } from '~/server/schemas/wallet.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID кошелька'
      })
    }

    const body = await readBody(event)
    const validatedData = updateWalletSchema.parse(body)

    const walletService = new WalletService()
    const wallet = await walletService.updateWallet(id, validatedData)
    if (!wallet) {
      throw createError({
        statusCode: 404,
        message: 'Кошелек не найден'
      })
    }
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
      message: 'Ошибка при обновлении кошелька'
    })
  }
}) 