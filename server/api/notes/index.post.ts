import { NoteService } from '~/server/services/note.service'
import { createNoteSchema } from '~/server/schemas/note.schema'
import type { H3Error, ZodError } from '~/server/types/error'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createNoteSchema.parse(body)

    const noteService = new NoteService()
    const note = await noteService.createNote(validatedData)

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
      message: 'Ошибка при создании заметки'
    })
  }
}) 