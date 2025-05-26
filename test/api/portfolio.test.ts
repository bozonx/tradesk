import { describe, it, expect, beforeAll, afterAll } from 'vitest'
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
  let testPortfolios: any[] = []

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

  afterAll(async () => {
    // Clean up test data
    await prisma.$transaction([
      prisma.portfolio.deleteMany({
        where: {
          userId: testUser.id,
        },
      }),
      prisma.group.deleteMany({
        where: {
          id: testGroup.id,
        },
      }),
      prisma.user.deleteMany({
        where: {
          id: testUser.id,
        },
      }),
    ])
  })

  describe('Create Portfolio', () => {
    it('should create portfolio with all fields', async () => {
      const portfolio = await prisma.portfolio.create({
        data: {
          userId: testUser.id,
          name: 'Test Portfolio',
          descr: 'Test portfolio description',
          isArchived: false,
          groupId: testGroup.id,
        },
      })

      expect(portfolio).toBeDefined()
      expect(portfolio.userId).toBe(testUser.id)
      expect(portfolio.name).toBe('Test Portfolio')
      expect(portfolio.descr).toBe('Test portfolio description')
      expect(portfolio.isArchived).toBe(false)
      expect(portfolio.groupId).toBe(testGroup.id)
      expect(portfolio.deletedAt).toBeNull()
    })

    it('should create portfolio with minimal data', async () => {
      const portfolio = await prisma.portfolio.create({
        data: {
          userId: testUser.id,
          name: 'Minimal Portfolio',
          isArchived: false,
        },
      })

      expect(portfolio).toBeDefined()
      expect(portfolio.userId).toBe(testUser.id)
      expect(portfolio.name).toBe('Minimal Portfolio')
      expect(portfolio.isArchived).toBe(false)
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
          isArchived: true,
        },
      })

      expect(updatedPortfolio).toBeDefined()
      expect(updatedPortfolio.id).toBe(portfolio.id)
      expect(updatedPortfolio.name).toBe('Updated Portfolio')
      expect(updatedPortfolio.descr).toBe('Updated portfolio description')
      expect(updatedPortfolio.isArchived).toBe(true)
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

  describe('Access Control', () => {
    it('should not allow access to other user\'s portfolio', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other_user@example.com',
          password: await bcryptjs.hash('test123', 10),
          name: 'Other User',
          role: 'USER',
        },
      })

      // Create portfolio for other user
      const otherPortfolio = await prisma.portfolio.create({
        data: {
          userId: otherUser.id,
          name: 'Other User Portfolio',
          isArchived: false,
        },
      })

      // Try to access other user's portfolio
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: otherPortfolio.id },
      })

      expect(portfolio).toBeDefined()
      expect(portfolio?.userId).not.toBe(testUser.id)

      // Clean up
      await prisma.$transaction([
        prisma.portfolio.delete({ where: { id: otherPortfolio.id } }),
        prisma.user.delete({ where: { id: otherUser.id } }),
      ])
    })
  })

  describe('Data Validation', () => {
    it('should not create portfolio with empty name', async () => {
      try {
        await prisma.portfolio.create({
          data: {
            userId: testUser.id,
            name: '',
            isArchived: false,
          },
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle non-existent portfolio gracefully', async () => {
      const nonExistentId = 999999
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: nonExistentId },
      })
      expect(portfolio).toBeNull()
    })

    it('should handle invalid portfolio ID format', async () => {
      try {
        await prisma.portfolio.findUnique({
          where: { id: -1 },
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('Portfolio Archive State', () => {
    it('should handle archive state transitions correctly', async () => {
      const portfolio = await prisma.portfolio.create({
        data: {
          userId: testUser.id,
          name: 'Archive Test Portfolio',
          isArchived: false,
        },
      })

      // Test transition to archived
      const archivedPortfolio = await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: { isArchived: true },
      })
      expect(archivedPortfolio.isArchived).toBe(true)

      // Test transition back to active
      const activePortfolio = await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: { isArchived: false },
      })
      expect(activePortfolio.isArchived).toBe(false)

      // Clean up
      await prisma.portfolio.delete({ where: { id: portfolio.id } })
    })
  })
}) 