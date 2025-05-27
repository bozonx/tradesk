import { WalletService } from '~/server/services/wallet.service'
import { updateWalletSchema } from '~/server/schemas/wallet.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid wallet ID'
      })
    }

    const body = await readBody(event)
    const validatedData = updateWalletSchema.partial().parse(body)

    const walletService = new WalletService()
    const wallet = await walletService.updateWallet(id, validatedData)
    
    if (!wallet) {
      throw createError({
        statusCode: 404,
        message: 'Wallet not found'
      })
    }

    return wallet
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid wallet data',
        data: (err as ZodError).errors
      })
    }
    if ('statusCode' in err) throw error
    throw createError({
      statusCode: 500,
      message: 'Error updating wallet'
    })
  }
}) 