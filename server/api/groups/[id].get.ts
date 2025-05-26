import { GroupService } from '~/server/services/group.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID группы'
      })
    }

    const groupService = new GroupService()
    const group = await groupService.getGroupById(id)
    
    if (!group) {
      throw createError({
        statusCode: 404,
        message: 'Группа не найдена'
      })
    }

    return group
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении группы'
    })
  }
}) 