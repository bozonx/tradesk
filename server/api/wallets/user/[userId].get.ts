import { WalletService } from '~/server/services/wallet.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const userId = Number(event.context.params?.userId)
    if (isNaN(userId)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID пользователя'
      })
    }

    const walletService = new WalletService()
    const wallets = await walletService.getUserWallets(userId)
    return wallets
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении кошельков'
    })
  }
}) 