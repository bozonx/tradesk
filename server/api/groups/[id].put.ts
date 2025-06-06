import { GroupService } from '~/server/services/group.service'
import { updateGroupSchema } from '~/server/schemas/group.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID группы'
      })
    }

    const body = await readBody(event)
    const validatedData = updateGroupSchema.parse(body)

    const groupService = new GroupService()
    const group = await groupService.updateGroup(id, validatedData)
    if (!group) {
      throw createError({
        statusCode: 404,
        message: 'Группа не найдена'
      })
    }
    return group
  } catch (error) {
    const err = error as H3Error | ZodError
    if (err.statusCode) throw error
    if (err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Неверные данные группы',
        data: err.errors
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Ошибка при обновлении группы'
    })
  }
}) 