import { TransactionService } from '~/server/services/transaction.service'
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

    const transactionService = new TransactionService()
    const transactions = await transactionService.getUserTransactions(userId)
    return transactions
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении транзакций'
    })
  }
}) 