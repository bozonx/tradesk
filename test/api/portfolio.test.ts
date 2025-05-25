import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

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
    testUser = await prisma.user.create({
      data: {
        email: 'portfolio_test@example.com',
        password: hashedPassword,
        name: 'Portfolio Test User',
        role: 'USER',
      },
    })

    // Create test group
    testGroup = await prisma.group.create({
      data: {
        type: 'PORTFOLIO',
        name: 'Test Portfolio Group',
        descr: 'Test group for portfolios',
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
    it('should create a new portfolio', async () => {
      const portfolioData = {
        name: 'Test Portfolio',
        descr: 'Test portfolio description',
        groupId: testGroup.id,
        state: 'active',
      }

      const portfolio = await prisma.portfolio.create({
        data: {
          ...portfolioData,
          userId: testUser.id,
        },
        include: {
          group: true,
          positions: true,
        },
      })

      expect(portfolio).toBeDefined()
      expect(portfolio.name).toBe(portfolioData.name)
      expect(portfolio.descr).toBe(portfolioData.descr)
      expect(portfolio.groupId).toBe(testGroup.id)
      expect(portfolio.state).toBe(portfolioData.state)
      expect(portfolio.userId).toBe(testUser.id)
      expect(portfolio.isArchived).toBe(false)
      expect(portfolio.deletedAt).toBeNull()
    })

    it('should create a portfolio without group', async () => {
      const portfolioData = {
        name: 'Test Portfolio No Group',
        descr: 'Test portfolio without group',
        state: 'active',
      }

      const portfolio = await prisma.portfolio.create({
        data: {
          ...portfolioData,
          userId: testUser.id,
        },
        include: {
          group: true,
          positions: true,
        },
      })

      expect(portfolio).toBeDefined()
      expect(portfolio.name).toBe(portfolioData.name)
      expect(portfolio.descr).toBe(portfolioData.descr)
      expect(portfolio.groupId).toBeNull()
      expect(portfolio.state).toBe(portfolioData.state)
      expect(portfolio.userId).toBe(testUser.id)
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
          positions: true,
        },
      })

      expect(Array.isArray(portfolios)).toBe(true)
      expect(portfolios.length).toBeGreaterThan(0)
      portfolios.forEach(portfolio => {
        expect(portfolio.userId).toBe(testUser.id)
        expect(portfolio.deletedAt).toBeNull()
      })
    })

    it('should get portfolio by id', async () => {
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(portfolio).toBeDefined()
      if (!portfolio) return

      const foundPortfolio = await prisma.portfolio.findFirst({
        where: {
          id: portfolio.id,
          userId: testUser.id,
          deletedAt: null,
        },
        include: {
          group: true,
          positions: true,
        },
      })

      expect(foundPortfolio).toBeDefined()
      expect(foundPortfolio?.id).toBe(portfolio.id)
      expect(foundPortfolio?.userId).toBe(testUser.id)
    })
  })

  describe('Update Portfolio', () => {
    it('should update portfolio', async () => {
      const portfolio = await prisma.portfolio.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(portfolio).toBeDefined()
      if (!portfolio) return

      const updateData = {
        name: 'Updated Portfolio Name',
        descr: 'Updated portfolio description',
        state: 'inactive',
      }

      const updatedPortfolio = await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: updateData,
        include: {
          group: true,
          positions: true,
        },
      })

      expect(updatedPortfolio).toBeDefined()
      expect(updatedPortfolio.name).toBe(updateData.name)
      expect(updatedPortfolio.descr).toBe(updateData.descr)
      expect(updatedPortfolio.state).toBe(updateData.state)
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
        include: {
          group: true,
          positions: true,
        },
      })

      expect(updatedPortfolio).toBeDefined()
      expect(updatedPortfolio.groupId).toBe(testGroup.id)
      expect(updatedPortfolio.group).toBeDefined()
      expect(updatedPortfolio.group?.id).toBe(testGroup.id)
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
        data: {
          deletedAt: new Date(),
        },
      })

      expect(deletedPortfolio).toBeDefined()
      expect(deletedPortfolio.deletedAt).not.toBeNull()

      // Verify portfolio is not returned in normal queries
      const foundPortfolio = await prisma.portfolio.findFirst({
        where: {
          id: portfolio.id,
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(foundPortfolio).toBeNull()
    })
  })
}) 