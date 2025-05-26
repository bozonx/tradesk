import { PrismaClient } from '@prisma/client'
import { beforeAll, afterAll } from 'vitest'

const prisma = new PrismaClient()

// Глобальная настройка перед всеми тестами
beforeAll(async () => {
  // Очищаем базу данных перед тестами
  // Сначала удаляем зависимые записи в правильном порядке
  await prisma.transaction.deleteMany()
  await prisma.tradeOrder.deleteMany()
  await prisma.position.deleteMany()
  await prisma.portfolio.deleteMany()
  await prisma.strategy.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.session.deleteMany()
  // Затем удаляем пользователей
  await prisma.user.deleteMany()
})

// Глобальная очистка после всех тестов
afterAll(async () => {
  await prisma.$disconnect()
}) 