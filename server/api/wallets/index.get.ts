import { WalletService } from '~/server/services/wallet.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = query.page ? Number(query.page) : undefined
    const limit = query.limit ? Number(query.limit) : undefined
    const isArchived = query.isArchived ? query.isArchived === 'true' : undefined
    const externalEntityId = query.externalEntityId ? Number(query.externalEntityId) : undefined

    // Валидация параметров
    if (page !== undefined && (isNaN(page) || page < 1)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный параметр page'
      })
    }

    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный параметр limit'
      })
    }

    if (externalEntityId !== undefined && isNaN(externalEntityId)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный параметр externalEntityId'
      })
    }

    const walletService = new WalletService()
    const result = await walletService.getAllWallets({
      page,
      limit,
      isArchived,
      externalEntityId
    })
    return result
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении кошельков'
    })
  }
}) 