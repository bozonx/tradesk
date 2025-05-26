import { NoteService } from '~/server/services/note.service'
import { updateNoteSchema } from '~/server/schemas/note.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный ID заметки'
      })
    }

    const body = await readBody(event)
    const validatedData = updateNoteSchema.parse(body)

    const noteService = new NoteService()
    const note = await noteService.updateNote(id, validatedData)
    
    if (!note) {
      throw createError({
        statusCode: 404,
        message: 'Заметка не найдена'
      })
    }

    return note
  } catch (error) {
    const err = error as H3Error | ZodError
    if ('statusCode' in err) throw error
    if (err instanceof Error && err.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Неверные данные заметки',
        data: err
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Ошибка при обновлении заметки'
    })
  }
}) 