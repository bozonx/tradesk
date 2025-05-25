import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('Position', () => {
  let testUser: any
  let testGroup: any
  let testPortfolio: any
  let testStrategy: any
  let authToken: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcryptjs.hash('test123', 10)
    testUser = await prisma.user.upsert({
      where: { email: 'position_test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Position Test User',
        role: 'USER',
      },
      create: {
        email: 'position_test@example.com',
        password: hashedPassword,
        name: 'Position Test User',
        role: 'USER',
      },
    })

    // Create test group
    testGroup = await prisma.group.create({
      data: {
        type: 'POSITION',
        name: 'Test Position Group',
        descr: 'Test group for positions',
      },
    })

    // Create test portfolio
    testPortfolio = await prisma.portfolio.create({
      data: {
        userId: testUser.id,
        name: 'Test Portfolio',
        descr: 'Test portfolio for positions',
        state: 'active',
      },
    })

    // Create test strategy
    testStrategy = await prisma.strategy.create({
      data: {
        userId: testUser.id,
        name: 'Test Strategy',
        descr: 'Test strategy for positions',
        state: 'active',
      },
    })

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  })

  describe('Create Position', () => {
    it('should create a new position', async () => {
      const positionData = {
        type: 'LONG',
        descr: 'Test position description',
        groupId: testGroup.id,
        portfolioId: testPortfolio.id,
        strategyId: testStrategy.id,
      }

      const position = await prisma.position.create({
        data: {
          ...positionData,
          userId: testUser.id,
        },
        include: {
          group: true,
          portfolio: true,
          strategy: true,
          transactions: true,
          tradeOrders: true,
        },
      })

      expect(position).toBeDefined()
      expect(position.type).toBe(positionData.type)
      expect(position.descr).toBe(positionData.descr)
      expect(position.groupId).toBe(testGroup.id)
      expect(position.portfolioId).toBe(testPortfolio.id)
      expect(position.strategyId).toBe(testStrategy.id)
      expect(position.userId).toBe(testUser.id)
      expect(position.deletedAt).toBeNull()
    })

    it('should create a position without group and strategy', async () => {
      const positionData = {
        type: 'SHRT',
        descr: 'Test position without group and strategy',
        portfolioId: testPortfolio.id,
      }

      const position = await prisma.position.create({
        data: {
          ...positionData,
          userId: testUser.id,
        },
        include: {
          group: true,
          portfolio: true,
          strategy: true,
          transactions: true,
          tradeOrders: true,
        },
      })

      expect(position).toBeDefined()
      expect(position.type).toBe(positionData.type)
      expect(position.descr).toBe(positionData.descr)
      expect(position.groupId).toBeNull()
      expect(position.portfolioId).toBe(testPortfolio.id)
      expect(position.strategyId).toBeNull()
      expect(position.userId).toBe(testUser.id)
    })
  })

  describe('Get Positions', () => {
    it('should get all positions for user', async () => {
      const positions = await prisma.position.findMany({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
        include: {
          group: true,
          portfolio: true,
          strategy: true,
          transactions: true,
          tradeOrders: true,
        },
      })

      expect(Array.isArray(positions)).toBe(true)
      expect(positions.length).toBeGreaterThan(0)
      positions.forEach(position => {
        expect(position.userId).toBe(testUser.id)
        expect(position.deletedAt).toBeNull()
      })
    })

    it('should get position by id', async () => {
      const position = await prisma.position.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(position).toBeDefined()
      if (!position) return

      const foundPosition = await prisma.position.findFirst({
        where: {
          id: position.id,
          userId: testUser.id,
          deletedAt: null,
        },
        include: {
          group: true,
          portfolio: true,
          strategy: true,
          transactions: true,
          tradeOrders: true,
        },
      })

      expect(foundPosition).toBeDefined()
      expect(foundPosition?.id).toBe(position.id)
      expect(foundPosition?.userId).toBe(testUser.id)
    })
  })

  describe('Update Position', () => {
    it('should update position', async () => {
      const position = await prisma.position.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(position).toBeDefined()
      if (!position) return

      const updateData = {
        type: 'SHRT',
        descr: 'Updated position description',
      }

      const updatedPosition = await prisma.position.update({
        where: { id: position.id },
        data: updateData,
        include: {
          group: true,
          portfolio: true,
          strategy: true,
          transactions: true,
          tradeOrders: true,
        },
      })

      expect(updatedPosition).toBeDefined()
      expect(updatedPosition.type).toBe(updateData.type)
      expect(updatedPosition.descr).toBe(updateData.descr)
    })

    it('should update position group', async () => {
      const position = await prisma.position.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(position).toBeDefined()
      if (!position) return

      const updatedPosition = await prisma.position.update({
        where: { id: position.id },
        data: {
          groupId: testGroup.id,
        },
        include: {
          group: true,
          portfolio: true,
          strategy: true,
          transactions: true,
          tradeOrders: true,
        },
      })

      expect(updatedPosition).toBeDefined()
      expect(updatedPosition.groupId).toBe(testGroup.id)
      expect(updatedPosition.group).toBeDefined()
      expect(updatedPosition.group?.id).toBe(testGroup.id)
    })
  })

  describe('Delete Position', () => {
    it('should soft delete position', async () => {
      const position = await prisma.position.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(position).toBeDefined()
      if (!position) return

      const deletedPosition = await prisma.position.update({
        where: { id: position.id },
        data: {
          deletedAt: new Date(),
        },
      })

      expect(deletedPosition).toBeDefined()
      expect(deletedPosition.deletedAt).not.toBeNull()

      // Verify position is not returned in normal queries
      const foundPosition = await prisma.position.findFirst({
        where: {
          id: position.id,
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(foundPosition).toBeNull()
    })
  })
}) 