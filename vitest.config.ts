import { defineConfig } from 'vitest/config'
import path from 'path'

// Путь к тестовой базе данных
const TEST_DB_PATH = path.join(process.cwd(), 'test.db')
const SCHEMA_PATH = path.join(process.cwd(), 'prisma/schema.prisma')

export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/test/**/*.test.ts'],
    setupFiles: ['server/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server/**/*.ts'],
      exclude: ['server/test/**/*.ts']
    },
    env: {
      // Используем тестовую SQLite базу данных
      DATABASE_URL: `file:${TEST_DB_PATH}`,
      PRISMA_SCHEMA_PATH: SCHEMA_PATH
    }
  }
}) 