import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Путь к схеме
const SCHEMA_PATH = path.join(process.cwd(), 'prisma/schema.prisma')

// Кэш для схемы
let schemaCache: string | null = null

// Функция для создания тестовой базы данных
export async function setupTestDatabase(testName: string) {
  let tempDbPath: string | null = null
  let testPrisma: PrismaClient | null = null

  try {
    // Создаем уникальный путь для тестовой БД
    tempDbPath = path.join(os.tmpdir(), `test-${testName}-${Date.now()}.db`)
    
    // Создаем новый клиент для тестовой базы
    testPrisma = new PrismaClient({
      datasourceUrl: `file:${tempDbPath}`
    })

    // Проверяем существование схемы
    if (!fs.existsSync(SCHEMA_PATH)) {
      throw new Error(`Schema file not found at ${SCHEMA_PATH}`)
    }

    // Кэшируем схему
    if (!schemaCache) {
      schemaCache = fs.readFileSync(SCHEMA_PATH, 'utf-8')
    }

    // Применяем миграции к тестовой базе
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: `file:${tempDbPath}`,
        PRISMA_SCHEMA_PATH: SCHEMA_PATH
      },
      stdio: 'inherit'
    })

    // Проверяем, что таблицы созданы
    const tables = await testPrisma.$queryRaw<{ name: string }[]>`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `
    
    if (tables.length === 0) {
      throw new Error('No tables were created in the test database')
    }

    // Проверяем подключение к базе
    await testPrisma.$connect()

    // Добавляем обработчик для удаления временного файла при закрытии соединения
    const originalDisconnect = testPrisma.$disconnect
    testPrisma.$disconnect = async () => {
      await originalDisconnect.call(testPrisma)
      if (tempDbPath && fs.existsSync(tempDbPath)) {
        fs.unlinkSync(tempDbPath)
      }
    }

    return testPrisma
  } catch (error) {
    // В случае ошибки удаляем временный файл и закрываем соединение
    if (tempDbPath && fs.existsSync(tempDbPath)) {
      fs.unlinkSync(tempDbPath)
    }
    if (testPrisma) {
      await testPrisma.$disconnect()
    }
    console.error('Error setting up test database:', error)
    throw error
  }
} 