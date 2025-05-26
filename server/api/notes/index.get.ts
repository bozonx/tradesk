import { NoteService } from '~/server/services/note.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = Number(query.userId)

    if (isNaN(userId)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID пользователя'
      })
    }

    const noteService = new NoteService()
    const notes = await noteService.getUserNotes(userId)
    return notes
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при получении заметок'
    })
  }
}) 