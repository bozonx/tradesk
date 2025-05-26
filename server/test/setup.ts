import { PrismaClient } from '@prisma/client'
import { beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestDatabase } from './db'

let prisma: PrismaClient | null = null

// Глобальная настройка перед всеми тестами
beforeAll(async () => {
  try {
    // Создаем новую тестовую базу данных
    prisma = await setupTestDatabase()
  } catch (error) {
    console.error('Failed to setup test database:', error)
    throw error
  }
})

// Очистка базы данных перед каждым тестом
beforeEach(async () => {
  if (!prisma) {
    throw new Error('Prisma client is not initialized')
  }

  try {
    // Отключаем внешние ключи для очистки
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF`

    // Очищаем таблицы в правильном порядке (сначала зависимые)
    await prisma.$transaction(async (tx) => {
      try {
        // Сначала удаляем все записи из зависимых таблиц
        await tx.$executeRaw`DELETE FROM "Transaction"`
        await tx.$executeRaw`DELETE FROM "TradeOrder"`
        await tx.$executeRaw`DELETE FROM "Position"`
        await tx.$executeRaw`DELETE FROM "Portfolio"`
        await tx.$executeRaw`DELETE FROM "Strategy"`
        await tx.$executeRaw`DELETE FROM "Wallet"`
        await tx.$executeRaw`DELETE FROM "Session"`
        await tx.$executeRaw`DELETE FROM "User"`
        await tx.$executeRaw`DELETE FROM "Group"`
        await tx.$executeRaw`DELETE FROM "Asset"`
        await tx.$executeRaw`DELETE FROM "ExternalEntity"`

        // Сбрасываем автоинкремент для всех таблиц
        await tx.$executeRaw`DELETE FROM sqlite_sequence WHERE name IN (
          'Transaction', 'TradeOrder', 'Position', 'Portfolio', 'Strategy',
          'Wallet', 'Session', 'User', 'Group', 'Asset', 'ExternalEntity'
        )`
      } catch (error) {
        console.error('Error in transaction:', error)
        throw error
      }
    })

    // Включаем внешние ключи обратно
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`
  } catch (error) {
    console.error('Failed to clean database:', error)
    throw error
  }
})

// Глобальная очистка после всех тестов
afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect()
  }
})

// Экспортируем prisma клиент для использования в тестах
export { prisma } 