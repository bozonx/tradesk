import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Trade Orders API', () => {
  let authToken: string
  let testOrderId: number
  let testPositionId: number
  let testFromWalletId: number
  let testToWalletId: number
  let testFromAssetId: number
  let testToAssetId: number

  beforeAll(async () => {
    // Get test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })

    if (!user) {
      throw new Error('Test user not found')
    }

    // Generate auth token
    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    // Create test position
    const position = await prisma.position.create({
      data: {
        userId: user.id,
        type: 'LONG',
        descr: 'Test position for orders'
      }
    })
    testPositionId = position.id

    // Create test wallets
    const fromWallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        name: 'From Wallet',
        descr: 'Test from wallet',
        state: 'active'
      }
    })
    testFromWalletId = fromWallet.id

    const toWallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        name: 'To Wallet',
        descr: 'Test to wallet',
        state: 'active'
      }
    })
    testToWalletId = toWallet.id

    // Create test assets
    const fromAsset = await prisma.asset.create({
      data: {
        ticker: 'USDT',
        type: 'CRYP'
      }
    })
    testFromAssetId = fromAsset.id

    const toAsset = await prisma.asset.create({
      data: {
        ticker: 'BTC',
        type: 'CRYP'
      }
    })
    testToAssetId = toAsset.id
  })

  describe('GET /api/trade-orders', () => {
    it('should return list of trade orders', async () => {
      const response = await request(BASE_URL)
        .get('/api/trade-orders')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('page')
      expect(response.body).toHaveProperty('limit')
    })
  })

  describe('POST /api/trade-orders', () => {
    it('should create a new trade order', async () => {
      const orderData = {
        fromWalletId: testFromWalletId,
        fromAssetId: testFromAssetId,
        fromValue: 1000,
        toWalletId: testToWalletId,
        toAssetId: testToAssetId,
        toValue: 0.05,
        action: 'BUY',
        status: 'FILL',
        positionId: testPositionId,
        openDate: new Date().toISOString(),
        fillDate: new Date().toISOString()
      }

      const response = await request(BASE_URL)
        .post('/api/trade-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(orderData)
      expect(response.body).toHaveProperty('message', 'Trade order created successfully')

      testOrderId = response.body.data.id
    })
  })

  describe('GET /api/trade-orders/:id', () => {
    it('should return trade order by id', async () => {
      const response = await request(BASE_URL)
        .get(`/api/trade-orders/${testOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.id).toBe(testOrderId)
    })

    it('should return 404 for non-existent trade order', async () => {
      const response = await request(BASE_URL)
        .get('/api/trade-orders/999999')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/trade-orders/:id', () => {
    it('should update trade order', async () => {
      const updateData = {
        status: 'CANCEL',
        descr: 'Updated test order description'
      }

      const response = await request(BASE_URL)
        .put(`/api/trade-orders/${testOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body).toHaveProperty('message', 'Trade order updated successfully')
    })
  })

  describe('DELETE /api/trade-orders/:id', () => {
    it('should delete trade order', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/trade-orders/${testOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Trade order deleted successfully')
    })
  })
}) 