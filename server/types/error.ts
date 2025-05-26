export interface H3Error extends Error {
  statusCode?: number
  statusMessage?: string
  data?: any
}

export interface ZodError extends Error {
  name: 'ZodError'
  errors: Array<{
    code: string
    path: (string | number)[]
    message: string
  }>
} 