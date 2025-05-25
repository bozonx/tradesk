import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Trade Orders API', () => {
  let authToken: string
  let csrfToken: string
  let testOrderId: number
  let testPositionId: number
  let testFromWalletId: number
  let testToWalletId: number
  let testFromAssetId: number
  let testToAssetId: number
  let testUserId: number

  beforeAll(async () => {
    // Get test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })

    if (!user) {
      throw new Error('Test user not found')
    }

    testUserId = user.id

    // Generate auth token
    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    // Create test position
    const position = await prisma.position.create({
      data: {
        userId: testUserId,
        type: 'LONG',
        descr: 'Test position for orders'
      }
    })
    testPositionId = position.id

    // Create test wallets
    const fromWallet = await prisma.wallet.create({
      data: {
        userId: testUserId,
        name: 'From Wallet',
        descr: 'Test from wallet',
        state: 'active'
      }
    })
    testFromWalletId = fromWallet.id

    const toWallet = await prisma.wallet.create({
      data: {
        userId: testUserId,
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

    // Get CSRF token
    const loginResponse = await request(BASE_URL)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123'
      })
    csrfToken = loginResponse.body.csrfToken
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
      expect(Array.isArray(response.body.data)).toBe(true)
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('fromWallet')
        expect(response.body.data[0]).toHaveProperty('toWallet')
        expect(response.body.data[0]).toHaveProperty('fromAsset')
        expect(response.body.data[0]).toHaveProperty('toAsset')
        expect(response.body.data[0]).toHaveProperty('position')
      }
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
        .set('x-csrf-token', csrfToken)
        .send(orderData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(orderData)
      expect(response.body.data).toHaveProperty('fromWallet')
      expect(response.body.data).toHaveProperty('toWallet')
      expect(response.body.data).toHaveProperty('fromAsset')
      expect(response.body.data).toHaveProperty('toAsset')
      expect(response.body.data).toHaveProperty('position')
      expect(response.body).toHaveProperty('message', 'Trade order created successfully')

      testOrderId = response.body.data.id
    })

    it('should return 400 with invalid action', async () => {
      const orderData = {
        fromWalletId: testFromWalletId,
        fromAssetId: testFromAssetId,
        fromValue: 1000,
        toWalletId: testToWalletId,
        toAssetId: testToAssetId,
        toValue: 0.05,
        action: 'INVALID_ACTION',
        status: 'FILL',
        positionId: testPositionId,
        openDate: new Date().toISOString(),
        fillDate: new Date().toISOString()
      }

      const response = await request(BASE_URL)
        .post('/api/trade-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(orderData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid action')
    })

    it('should return 400 with invalid status', async () => {
      const orderData = {
        fromWalletId: testFromWalletId,
        fromAssetId: testFromAssetId,
        fromValue: 1000,
        toWalletId: testToWalletId,
        toAssetId: testToAssetId,
        toValue: 0.05,
        action: 'BUY',
        status: 'INVALID_STATUS',
        positionId: testPositionId,
        openDate: new Date().toISOString(),
        fillDate: new Date().toISOString()
      }

      const response = await request(BASE_URL)
        .post('/api/trade-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(orderData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid status')
    })

    it('should return 400 with inactive from wallet', async () => {
      // Create inactive wallet
      const inactiveWallet = await prisma.wallet.create({
        data: {
          userId: testUserId,
          name: 'Inactive Wallet',
          descr: 'Inactive wallet for testing',
          state: 'inactive'
        }
      })

      const orderData = {
        fromWalletId: inactiveWallet.id,
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
        .set('x-csrf-token', csrfToken)
        .send(orderData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'From wallet must be active')
    })

    it('should return 400 with inactive to wallet', async () => {
      // Create inactive wallet
      const inactiveWallet = await prisma.wallet.create({
        data: {
          userId: testUserId,
          name: 'Inactive Wallet',
          descr: 'Inactive wallet for testing',
          state: 'inactive'
        }
      })

      const orderData = {
        fromWalletId: testFromWalletId,
        fromAssetId: testFromAssetId,
        fromValue: 1000,
        toWalletId: inactiveWallet.id,
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
        .set('x-csrf-token', csrfToken)
        .send(orderData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'To wallet must be active')
    })

    it('should return 400 with invalid position type', async () => {
      // Create position with wrong type
      const wrongPosition = await prisma.position.create({
        data: {
          userId: testUserId,
          type: 'SHORT',
          descr: 'Wrong type position for testing'
        }
      })

      const orderData = {
        fromWalletId: testFromWalletId,
        fromAssetId: testFromAssetId,
        fromValue: 1000,
        toWalletId: testToWalletId,
        toAssetId: testToAssetId,
        toValue: 0.05,
        action: 'BUY',
        status: 'FILL',
        positionId: wrongPosition.id,
        openDate: new Date().toISOString(),
        fillDate: new Date().toISOString()
      }

      const response = await request(BASE_URL)
        .post('/api/trade-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(orderData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Position type must match order action')
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
      expect(response.body.data).toHaveProperty('fromWallet')
      expect(response.body.data).toHaveProperty('toWallet')
      expect(response.body.data).toHaveProperty('fromAsset')
      expect(response.body.data).toHaveProperty('toAsset')
      expect(response.body.data).toHaveProperty('position')
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
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.data).toHaveProperty('fromWallet')
      expect(response.body.data).toHaveProperty('toWallet')
      expect(response.body.data).toHaveProperty('fromAsset')
      expect(response.body.data).toHaveProperty('toAsset')
      expect(response.body.data).toHaveProperty('position')
      expect(response.body).toHaveProperty('message', 'Trade order updated successfully')
    })

    it('should return 400 with invalid status', async () => {
      const updateData = {
        status: 'INVALID_STATUS',
        descr: 'Updated test order description'
      }

      const response = await request(BASE_URL)
        .put(`/api/trade-orders/${testOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid status')
    })
  })

  describe('DELETE /api/trade-orders/:id', () => {
    it('should delete trade order', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/trade-orders/${testOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Trade order deleted successfully')
    })
  })
}) 