import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { createNoteSchema, updateNoteSchema } from '../schemas/note.schema'

const prisma = new PrismaClient()

export class NoteService {
  // Получить все заметки пользователя
  async getUserNotes(userId: number) {
    return prisma.note.findMany({
      where: {
        userId,
        deletedAt: null
      }
    })
  }

  // Получить заметку по ID
  async getNoteById(id: number) {
    return prisma.note.findUnique({
      where: { id }
    })
  }

  // Создать новую заметку
  async createNote(data: z.infer<typeof createNoteSchema>) {
    return prisma.note.create({
      data
    })
  }

  // Обновить заметку
  async updateNote(id: number, data: z.infer<typeof updateNoteSchema>) {
    return prisma.note.update({
      where: { id },
      data
    })
  }

  // Удалить заметку (soft delete)
  async deleteNote(id: number) {
    return prisma.note.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  }
} 