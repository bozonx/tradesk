import { WalletService } from '~/server/services/wallet.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID кошелька'
      })
    }

    const walletService = new WalletService()
    const wallet = await walletService.deleteWallet(id)
    if (!wallet) {
      throw createError({
        statusCode: 404,
        message: 'Кошелек не найден'
      })
    }
    return wallet
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при удалении кошелька'
    })
  }
}) 