import { NoteService } from '~/server/services/note.service'
import type { H3Error } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID заметки'
      })
    }

    const noteService = new NoteService()
    const note = await noteService.deleteNote(id)
    
    if (!note) {
      throw createError({
        statusCode: 404,
        message: 'Заметка не найдена'
      })
    }

    return { message: 'Заметка успешно удалена' }
  } catch (error) {
    const err = error as H3Error
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Ошибка при удалении заметки'
    })
  }
}) 