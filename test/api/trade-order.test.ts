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
  let testWallet: any

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
    testAsset = await prisma.asset.upsert({
      where: { ticker: 'BTC' },
      update: { type: 'CRYPTO' },
      create: { ticker: 'BTC', type: 'CRYPTO' },
    })

    // Create test wallet
    testWallet = await prisma.wallet.create({
      data: {
        userId: testUser.id,
        name: 'Test Wallet',
        descr: 'Test wallet for trade orders',
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

  describe('Create Trade Order', () => {
    it('should create limit order', async () => {
      const order = await prisma.tradeOrder.create({
        data: {
          userId: testUser.id,
          fromWalletId: testWallet.id,
          fromAssetId: testAsset.id,
          fromValue: 1.5,
          toWalletId: testWallet.id,
          toAssetId: testAsset.id,
          toValue: 1.5,
          price: 50000,
          action: 'BUY',
          status: 'OPND',
          note: 'Test limit order',
          positionId: testPosition.id,
        },
      })

      expect(order).toBeDefined()
      expect(order.userId).toBe(testUser.id)
      expect(order.fromWalletId).toBe(testWallet.id)
      expect(order.fromAssetId).toBe(testAsset.id)
      expect(order.fromValue).toBe(1.5)
      expect(order.toWalletId).toBe(testWallet.id)
      expect(order.toAssetId).toBe(testAsset.id)
      expect(order.toValue).toBe(1.5)
      expect(order.price).toBe(50000)
      expect(order.action).toBe('BUY')
      expect(order.status).toBe('OPND')
      expect(order.note).toBe('Test limit order')
      expect(order.positionId).toBe(testPosition.id)
      expect(order.deletedAt).toBeNull()
    })

    it('should create market order', async () => {
      const order = await prisma.tradeOrder.create({
        data: {
          userId: testUser.id,
          fromWalletId: testWallet.id,
          fromAssetId: testAsset.id,
          fromValue: 0.5,
          toWalletId: testWallet.id,
          toAssetId: testAsset.id,
          toValue: 0.5,
          price: 48000,
          action: 'SELL',
          status: 'OPND',
          note: 'Test market order',
          positionId: testPosition.id,
        },
      })

      expect(order).toBeDefined()
      expect(order.userId).toBe(testUser.id)
      expect(order.fromWalletId).toBe(testWallet.id)
      expect(order.fromAssetId).toBe(testAsset.id)
      expect(order.fromValue).toBe(0.5)
      expect(order.toWalletId).toBe(testWallet.id)
      expect(order.toAssetId).toBe(testAsset.id)
      expect(order.toValue).toBe(0.5)
      expect(order.price).toBe(48000)
      expect(order.action).toBe('SELL')
      expect(order.status).toBe('OPND')
      expect(order.note).toBe('Test market order')
      expect(order.positionId).toBe(testPosition.id)
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
      })

      expect(Array.isArray(orders)).toBe(true)
      expect(orders.length).toBeGreaterThan(0)
      orders.forEach(order => {
        expect(order.userId).toBe(testUser.id)
        expect(order.deletedAt).toBeNull()
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
      })

      expect(foundOrder).toBeDefined()
      expect(foundOrder?.id).toBe(order.id)
      expect(foundOrder?.userId).toBe(testUser.id)
      expect(foundOrder?.deletedAt).toBeNull()
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
          price: 52000,
          status: 'FILL',
          note: 'Updated order',
        },
      })

      expect(updatedOrder).toBeDefined()
      expect(updatedOrder.id).toBe(order.id)
      expect(updatedOrder.price).toBe(52000)
      expect(updatedOrder.status).toBe('FILL')
      expect(updatedOrder.note).toBe('Updated order')
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