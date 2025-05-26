import { TransactionService } from '~/server/services/transaction.service'
import { createTransactionSchema } from '~/server/schemas/transaction.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createTransactionSchema.parse(body)

    const transactionService = new TransactionService()
    const transaction = await transactionService.createTransaction(validatedData)
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
      message: 'Ошибка при создании транзакции'
    })
  }
}) 