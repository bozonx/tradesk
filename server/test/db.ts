import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Путь к тестовой базе данных
const TEST_DB_PATH = path.join(process.cwd(), 'test.db')
const SCHEMA_PATH = path.join(process.cwd(), 'prisma/schema.prisma')

// Функция для создания тестовой базы данных
export async function setupTestDatabase() {
  try {
    // Удаляем старую тестовую базу если она существует
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }

    // Создаем новый клиент для тестовой базы
    const testPrisma = new PrismaClient({
      datasourceUrl: `file:${TEST_DB_PATH}`
    })

    // Применяем миграции к тестовой базе
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: `file:${TEST_DB_PATH}`,
        PRISMA_SCHEMA_PATH: SCHEMA_PATH
      },
      stdio: 'inherit' // Показываем вывод команды
    })

    // Проверяем, что таблицы созданы
    const tables = await testPrisma.$queryRaw<{ name: string }[]>`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `
    
    if (tables.length === 0) {
      throw new Error('No tables were created in the test database')
    }

    return testPrisma
  } catch (error) {
    console.error('Error setting up test database:', error)
    throw error
  }
} 