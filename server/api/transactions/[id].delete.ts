import { TransactionService } from '~/server/services/transaction.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID транзакции'
      })
    }

    const transactionService = new TransactionService()
    const transaction = await transactionService.deleteTransaction(id)
    if (!transaction) {
      throw createError({
        statusCode: 404,
        message: 'Транзакция не найдена'
      })
    }
    return transaction
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при удалении транзакции'
    })
  }
}) 