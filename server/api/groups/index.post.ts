import { GroupService } from '~/server/services/group.service'
import { createGroupSchema } from '~/server/schemas/group.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createGroupSchema.parse(body)

    const groupService = new GroupService()
    const group = await groupService.createGroup(validatedData)
    
    return group
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Неверные данные группы',
        data: (err as ZodError).errors
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Ошибка при создании группы'
    })
  }
}) 