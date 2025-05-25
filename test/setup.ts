import { PrismaClient } from '@prisma/client'
import { beforeAll, afterAll } from 'vitest'

const prisma = new PrismaClient()

// Setup before all tests
beforeAll(async () => {
  // Clean up database before tests
  await prisma.$transaction([
    prisma.transaction.deleteMany(),
    prisma.tradeOrder.deleteMany(),
    prisma.position.deleteMany(),
    prisma.wallet.deleteMany(),
    prisma.portfolio.deleteMany(),
    prisma.strategy.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ])

  // Create test user
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9Uu', // 'test123'
      name: 'Test User',
    },
  })
})

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect()
}) 