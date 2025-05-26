import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('Dashboard', () => {
  let testUser: any
  let testPortfolio: any
  let testPosition: any
  let testAsset: any
  let authToken: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcryptjs.hash('test123', 10)
    testUser = await prisma.user.upsert({
      where: { email: 'dashboard_test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Dashboard Test User',
        role: 'USER',
      },
      create: {
        email: 'dashboard_test@example.com',
        password: hashedPassword,
        name: 'Dashboard Test User',
        role: 'USER',
      },
    })

    // Create test portfolio
    testPortfolio = await prisma.portfolio.create({
      data: {
        userId: testUser.id,
        name: 'Test Portfolio',
        descr: 'Test portfolio for dashboard',
        state: 'active',
      },
    })

    // Create test asset
    testAsset = await prisma.asset.create({
      data: {
        ticker: 'BTC',
        type: 'CRYP',
      },
    })

    // Create test position
    testPosition = await prisma.position.create({
      data: {
        userId: testUser.id,
        type: 'LONG',
        descr: 'Test position for dashboard',
        portfolioId: testPortfolio.id,
      },
    })

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  })

  describe('Get Dashboard Data', () => {
    it('should get portfolio summary', async () => {
      const portfolios = await prisma.portfolio.findMany({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
        include: {
          positions: {
            where: {
              deletedAt: null,
            },
          },
        },
      })

      expect(Array.isArray(portfolios)).toBe(true)
      expect(portfolios.length).toBeGreaterThan(0)
      portfolios.forEach(portfolio => {
        expect(portfolio.userId).toBe(testUser.id)
        expect(portfolio.deletedAt).toBeNull()
        expect(Array.isArray(portfolio.positions)).toBe(true)
      })
    })

    it('should get active positions', async () => {
      const positions = await prisma.position.findMany({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
        include: {
          portfolio: true,
          transactions: {
            where: {
              deletedAt: null,
            },
            include: {
              toAsset: true,
            },
          },
        },
      })

      expect(Array.isArray(positions)).toBe(true)
      expect(positions.length).toBeGreaterThan(0)
      positions.forEach(position => {
        expect(position.userId).toBe(testUser.id)
        expect(position.deletedAt).toBeNull()
        expect(position.portfolio).toBeDefined()
        expect(Array.isArray(position.transactions)).toBe(true)
      })
    })

    it('should get recent transactions', async () => {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        include: {
          toAsset: true,
          fromAsset: true,
        },
      })

      expect(Array.isArray(transactions)).toBe(true)
      transactions.forEach(transaction => {
        expect(transaction.userId).toBe(testUser.id)
        expect(transaction.deletedAt).toBeNull()
        expect(transaction.toAsset).toBeDefined()
      })
    })

    it('should get asset distribution', async () => {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
        include: {
          toAsset: true,
        },
      })

      expect(Array.isArray(transactions)).toBe(true)
      transactions.forEach(transaction => {
        expect(transaction.userId).toBe(testUser.id)
        expect(transaction.deletedAt).toBeNull()
        expect(transaction.toAsset).toBeDefined()
      })
    })

    it('should get performance metrics', async () => {
      const positions = await prisma.position.findMany({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
        include: {
          transactions: {
            where: {
              deletedAt: null,
            },
            include: {
              toAsset: true,
              fromAsset: true,
            },
          },
        },
      })

      expect(Array.isArray(positions)).toBe(true)
      positions.forEach(position => {
        expect(position.userId).toBe(testUser.id)
        expect(position.deletedAt).toBeNull()
        expect(Array.isArray(position.transactions)).toBe(true)
      })
    })
  })
}) 