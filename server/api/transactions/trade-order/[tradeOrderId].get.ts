import { TransactionService } from '~/server/services/transaction.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const tradeOrderId = Number(event.context.params?.tradeOrderId)
    if (isNaN(tradeOrderId)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID торгового ордера'
      })
    }

    const transactionService = new TransactionService()
    const transactions = await transactionService.getTradeOrderTransactions(tradeOrderId)
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