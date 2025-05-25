import { PrismaClient } from '@prisma/client'
import { beforeAll, afterAll } from 'vitest'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

// Setup before all tests
beforeAll(async () => {
  try {
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
      prisma.asset.deleteMany(),
      prisma.externalEntity.deleteMany(),
      prisma.group.deleteMany(),
    ])

    // Create test user
    const hashedPassword = await bcryptjs.hash('test123', 10)
    await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Test User',
        role: 'USER',
      },
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'USER',
      },
    })

    // Create admin user
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
    })
  } catch (error) {
    console.error('Error in test setup:', error)
    throw error
  }
})

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect()
}) 