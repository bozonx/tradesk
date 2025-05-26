import { PrismaClient } from '@prisma/client'
import { beforeEach, afterEach } from 'vitest'
import { setupTestDatabase } from './db'
import path from 'path'

let prisma: PrismaClient | null = null

// Создаем новую БД перед каждым тестом
beforeEach(async () => {
  try {
    // Получаем имя текущего тестового файла
    const testFile = expect.getState().testPath
    const testName = testFile ? path.basename(testFile, '.test.ts') : 'unknown'
    
    // Создаем новую тестовую базу данных
    prisma = await setupTestDatabase(testName)
  } catch (error) {
    console.error('Failed to setup test database:', error)
    throw error
  }
})

// Очищаем после каждого теста
afterEach(async () => {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
})

// Экспортируем prisma клиент для использования в тестах
export { prisma } 