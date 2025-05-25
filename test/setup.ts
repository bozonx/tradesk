import { PrismaClient } from '@prisma/client'
import { beforeAll, afterAll } from 'vitest'
import { startServer, stopServer } from './helpers/server'

const prisma = new PrismaClient()

// Setup before all tests
beforeAll(async () => {
  try {
    // Start test server
    await startServer()

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

    // Create test user using upsert to handle existing user
    await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9Uu', // 'test123'
        name: 'Test User',
        role: 'USER',
      },
      create: {
        email: 'test@example.com',
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9Uu', // 'test123'
        name: 'Test User',
        role: 'USER',
      },
    })

    // Create admin user using upsert
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9Uu', // 'test123'
        name: 'Admin User',
        role: 'ADMIN',
      },
      create: {
        email: 'admin@example.com',
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9Uu', // 'test123'
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
  await stopServer()
  await prisma.$disconnect()
}) 