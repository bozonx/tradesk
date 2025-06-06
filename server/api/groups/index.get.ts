import { GroupService } from '~/server/services/group.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const groupService = new GroupService()
    const groups = await groupService.getAllGroups()
    return groups
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении групп'
    })
  }
}) 