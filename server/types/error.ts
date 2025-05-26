import { z } from 'zod'

export interface H3Error extends Error {
  statusCode?: number
  statusMessage?: string
  data?: any
}

export type ZodError = z.ZodError 