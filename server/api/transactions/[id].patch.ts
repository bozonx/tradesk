import { TransactionService } from '~/server/services/transaction.service'
import { updateTransactionSchema } from '~/server/schemas/transaction.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid transaction ID'
      })
    }

    const body = await readBody(event)
    const validatedData = updateTransactionSchema.partial().parse(body)

    const transactionService = new TransactionService()
    const transaction = await transactionService.updateTransaction(id, validatedData)
    
    if (!transaction) {
      throw createError({
        statusCode: 404,
        message: 'Transaction not found'
      })
    }

    return transaction
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid transaction data',
        data: (err as ZodError).errors
      })
    }
    if ('statusCode' in err) throw error
    throw createError({
      statusCode: 500,
      message: 'Error updating transaction'
    })
  }
}) 