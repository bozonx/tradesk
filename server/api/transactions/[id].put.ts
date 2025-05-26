import { TransactionService } from '~/server/services/transaction.service'
import { updateTransactionSchema } from '~/server/schemas/transaction.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID транзакции'
      })
    }

    const body = await readBody(event)
    const validatedData = updateTransactionSchema.parse(body)

    const transactionService = new TransactionService()
    const transaction = await transactionService.updateTransaction(id, validatedData)
    if (!transaction) {
      throw createError({
        statusCode: 404,
        message: 'Транзакция не найдена'
      })
    }
    return transaction
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.statusCode) throw error
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Неверные данные транзакции',
        data: err.errors
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Ошибка при обновлении транзакции'
    })
  }
}) 