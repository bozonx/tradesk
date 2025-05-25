import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('Portfolio', () => {
  let testUser: any
  let testGroup: any
  let authToken: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcryptjs.hash('test123', 10)
    testUser = await prisma.user.upsert({
      where: { email: 'portfolio_test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Portfolio Test User',
        role: 'USER',
      },
      create: {
        email: 'portfolio_test@example.com',
        password: hashedPassword,
        name: 'Portfolio Test User',
        role: 'USER',
      },
    })

    // Create test group
    testGroup = await prisma.group.create({
      data: {
        userId: testUser.id,
        name: 'Test Group',
        type: 'PORTFOLIO',
        descr: 'Test group for portfolio',
      },
    })

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  })

  describe('Create Portfolio', () => {
    it('should create portfolio with all fields', async () => {
      const portfolio = await prisma.portfolio.create({
        data: {
          userId: testUser.id,
          name: 'Test Portfolio',
          descr: 'Test portfolio description',
          state: 'active',
          groupId: testGroup.id,
        },
      })

      expect(portfolio).toBeDefined()
      expect(portfolio.userId).toBe(testUser.id)
      expect(portfolio.name).toBe('Test Portfolio')
      expect(portfolio.descr).toBe('Test portfolio description')
      expect(portfolio.state).toBe('active')
      expect(portfolio.groupId).toBe(testGroup.id)
      expect(portfolio.deletedAt).toBeNull()
    })

    it('should create portfolio with minimal data', async () => {
      const portfolio = await prisma.portfolio.create({
        data: {
          userId: testUser.id,
          name: 'Minimal Portfolio',
          state: 'active',
        },
      })

      expect(portfolio).toBeDefined()
      expect(portfolio.userId).toBe(testUser.id)
      expect(portfolio.name).toBe('Minimal Portfolio')
      expect(portfolio.state).toBe('active')
      expect(portfolio.groupId).toBeNull()
      expect(portfolio.deletedAt).toBeNull()
    })
  })

  describe('Get Portfolios', () => {
    it('should get all portfolios for user', async () => {
      const portfolios = await prisma.portfolio.findMany({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
        include: {
          group: true,
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

    it('should get portfolio by id', async () => {
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
        include: {
          group: true,
          positions: {
            where: {
              deletedAt: null,
            },
          },
        },
      })

      expect(portfolio).toBeDefined()
      if (!portfolio) return

      const foundPortfolio = await prisma.portfolio.findUnique({
        where: { id: portfolio.id },
        include: {
          group: true,
          positions: {
            where: {
              deletedAt: null,
            },
          },
        },
      })

      expect(foundPortfolio).toBeDefined()
      expect(foundPortfolio?.id).toBe(portfolio.id)
      expect(foundPortfolio?.userId).toBe(testUser.id)
      expect(foundPortfolio?.deletedAt).toBeNull()
      expect(Array.isArray(foundPortfolio?.positions)).toBe(true)
    })
  })

  describe('Update Portfolio', () => {
    it('should update portfolio details', async () => {
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(portfolio).toBeDefined()
      if (!portfolio) return

      const updatedPortfolio = await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          name: 'Updated Portfolio',
          descr: 'Updated portfolio description',
          state: 'inactive',
        },
      })

      expect(updatedPortfolio).toBeDefined()
      expect(updatedPortfolio.id).toBe(portfolio.id)
      expect(updatedPortfolio.name).toBe('Updated Portfolio')
      expect(updatedPortfolio.descr).toBe('Updated portfolio description')
      expect(updatedPortfolio.state).toBe('inactive')
    })

    it('should update portfolio group', async () => {
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(portfolio).toBeDefined()
      if (!portfolio) return

      const updatedPortfolio = await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          groupId: testGroup.id,
        },
      })

      expect(updatedPortfolio).toBeDefined()
      expect(updatedPortfolio.id).toBe(portfolio.id)
      expect(updatedPortfolio.groupId).toBe(testGroup.id)
    })
  })

  describe('Delete Portfolio', () => {
    it('should soft delete portfolio', async () => {
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(portfolio).toBeDefined()
      if (!portfolio) return

      const deletedPortfolio = await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: { deletedAt: new Date() },
      })

      expect(deletedPortfolio).toBeDefined()
      expect(deletedPortfolio.deletedAt).not.toBeNull()

      // Verify portfolio is not returned in normal queries
      const foundPortfolio = await prisma.portfolio.findUnique({
        where: { id: portfolio.id },
      })

      expect(foundPortfolio).toBeNull()
    })
  })
}) 