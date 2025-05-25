import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('Trade Order', () => {
  let testUser: any
  let testPortfolio: any
  let testPosition: any
  let testAsset: any
  let authToken: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcryptjs.hash('test123', 10)
    testUser = await prisma.user.upsert({
      where: { email: 'trade_order_test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Trade Order Test User',
        role: 'USER',
      },
      create: {
        email: 'trade_order_test@example.com',
        password: hashedPassword,
        name: 'Trade Order Test User',
        role: 'USER',
      },
    })

    // Create test portfolio
    testPortfolio = await prisma.portfolio.create({
      data: {
        userId: testUser.id,
        name: 'Test Portfolio',
        descr: 'Test portfolio for trade orders',
        state: 'active',
      },
    })

    // Create test position
    testPosition = await prisma.position.create({
      data: {
        userId: testUser.id,
        type: 'LONG',
        descr: 'Test position for trade orders',
        portfolioId: testPortfolio.id,
      },
    })

    // Create test asset
    testAsset = await prisma.asset.create({
      data: {
        ticker: 'BTC',
        type: 'CRYPTO',
      },
    })

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  })

  describe('Create Trade Order', () => {
    it('should create limit order', async () => {
      const order = await prisma.tradeOrder.create({
        data: {
          userId: testUser.id,
          type: 'LIMIT',
          side: 'BUY',
          amount: 1.5,
          price: 50000,
          status: 'PENDING',
          descr: 'Test limit order',
          portfolioId: testPortfolio.id,
          positionId: testPosition.id,
          assetId: testAsset.id,
        },
      })

      expect(order).toBeDefined()
      expect(order.userId).toBe(testUser.id)
      expect(order.type).toBe('LIMIT')
      expect(order.side).toBe('BUY')
      expect(order.amount).toBe(1.5)
      expect(order.price).toBe(50000)
      expect(order.status).toBe('PENDING')
      expect(order.descr).toBe('Test limit order')
      expect(order.portfolioId).toBe(testPortfolio.id)
      expect(order.positionId).toBe(testPosition.id)
      expect(order.assetId).toBe(testAsset.id)
      expect(order.deletedAt).toBeNull()
    })

    it('should create market order', async () => {
      const order = await prisma.tradeOrder.create({
        data: {
          userId: testUser.id,
          type: 'MARKET',
          side: 'SELL',
          amount: 0.5,
          status: 'PENDING',
          descr: 'Test market order',
          portfolioId: testPortfolio.id,
          positionId: testPosition.id,
          assetId: testAsset.id,
        },
      })

      expect(order).toBeDefined()
      expect(order.userId).toBe(testUser.id)
      expect(order.type).toBe('MARKET')
      expect(order.side).toBe('SELL')
      expect(order.amount).toBe(0.5)
      expect(order.status).toBe('PENDING')
      expect(order.descr).toBe('Test market order')
      expect(order.portfolioId).toBe(testPortfolio.id)
      expect(order.positionId).toBe(testPosition.id)
      expect(order.assetId).toBe(testAsset.id)
      expect(order.deletedAt).toBeNull()
    })
  })

  describe('Get Trade Orders', () => {
    it('should get all trade orders for user', async () => {
      const orders = await prisma.tradeOrder.findMany({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
        include: {
          portfolio: true,
          position: true,
          asset: true,
        },
      })

      expect(Array.isArray(orders)).toBe(true)
      expect(orders.length).toBeGreaterThan(0)
      orders.forEach(order => {
        expect(order.userId).toBe(testUser.id)
        expect(order.deletedAt).toBeNull()
        expect(order.portfolio).toBeDefined()
        expect(order.position).toBeDefined()
        expect(order.asset).toBeDefined()
      })
    })

    it('should get trade order by id', async () => {
      const order = await prisma.tradeOrder.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(order).toBeDefined()
      if (!order) return

      const foundOrder = await prisma.tradeOrder.findUnique({
        where: { id: order.id },
        include: {
          portfolio: true,
          position: true,
          asset: true,
        },
      })

      expect(foundOrder).toBeDefined()
      expect(foundOrder?.id).toBe(order.id)
      expect(foundOrder?.userId).toBe(testUser.id)
      expect(foundOrder?.deletedAt).toBeNull()
      expect(foundOrder?.portfolio).toBeDefined()
      expect(foundOrder?.position).toBeDefined()
      expect(foundOrder?.asset).toBeDefined()
    })
  })

  describe('Update Trade Order', () => {
    it('should update trade order details', async () => {
      const order = await prisma.tradeOrder.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(order).toBeDefined()
      if (!order) return

      const updatedOrder = await prisma.tradeOrder.update({
        where: { id: order.id },
        data: {
          amount: 2.0,
          price: 52000,
          status: 'FILLED',
          descr: 'Updated order',
        },
      })

      expect(updatedOrder).toBeDefined()
      expect(updatedOrder.id).toBe(order.id)
      expect(updatedOrder.amount).toBe(2.0)
      expect(updatedOrder.price).toBe(52000)
      expect(updatedOrder.status).toBe('FILLED')
      expect(updatedOrder.descr).toBe('Updated order')
    })
  })

  describe('Delete Trade Order', () => {
    it('should soft delete trade order', async () => {
      const order = await prisma.tradeOrder.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(order).toBeDefined()
      if (!order) return

      const deletedOrder = await prisma.tradeOrder.update({
        where: { id: order.id },
        data: { deletedAt: new Date() },
      })

      expect(deletedOrder).toBeDefined()
      expect(deletedOrder.deletedAt).not.toBeNull()

      // Verify order is not returned in normal queries
      const foundOrder = await prisma.tradeOrder.findUnique({
        where: { id: order.id },
      })

      expect(foundOrder).toBeNull()
    })
  })
}) 