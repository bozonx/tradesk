import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Transactions API', () => {
  let authToken: string
  let csrfToken: string
  let testTransactionId: number
  let testWalletId: number
  let testAssetId: number
  let testOrderId: number
  let testUserId: number
  let testPositionId: number

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

    // Create test wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId: testUserId,
        name: 'Test Wallet',
        descr: 'Test wallet for transactions',
        state: 'active'
      }
    })
    testWalletId = wallet.id

    // Create test asset
    const asset = await prisma.asset.create({
      data: {
        ticker: 'USDT',
        type: 'CRYP'
      }
    })
    testAssetId = asset.id

    // Create test position
    const position = await prisma.position.create({
      data: {
        userId: testUserId,
        type: 'LONG',
        descr: 'Test position for transactions'
      }
    })
    testPositionId = position.id

    // Create test order
    const order = await prisma.tradeOrder.create({
      data: {
        userId: testUserId,
        positionId: testPositionId,
        action: 'BUY',
        status: 'FILL',
        openDate: new Date(),
        fillDate: new Date()
      }
    })
    testOrderId = order.id

    // Get CSRF token
    const loginResponse = await request(BASE_URL)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123'
      })
    csrfToken = loginResponse.body.csrfToken
  })

  describe('GET /api/transactions', () => {
    it('should return list of transactions', async () => {
      const response = await request(BASE_URL)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('page')
      expect(response.body).toHaveProperty('limit')
      expect(Array.isArray(response.body.data)).toBe(true)
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('wallet')
        expect(response.body.data[0]).toHaveProperty('asset')
        expect(response.body.data[0]).toHaveProperty('order')
      }
    })
  })

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        walletId: testWalletId,
        assetId: testAssetId,
        orderId: testOrderId,
        type: 'DEPOSIT',
        value: 1000,
        descr: 'Test transaction',
        date: new Date().toISOString()
      }

      const response = await request(BASE_URL)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(transactionData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(transactionData)
      expect(response.body.data).toHaveProperty('wallet')
      expect(response.body.data).toHaveProperty('asset')
      expect(response.body.data).toHaveProperty('order')
      expect(response.body).toHaveProperty('message', 'Transaction created successfully')

      testTransactionId = response.body.data.id
    })

    it('should return 400 with invalid transaction type', async () => {
      const transactionData = {
        walletId: testWalletId,
        assetId: testAssetId,
        orderId: testOrderId,
        type: 'INVALID_TYPE',
        value: 1000,
        descr: 'Test transaction',
        date: new Date().toISOString()
      }

      const response = await request(BASE_URL)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(transactionData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid transaction type')
    })

    it('should return 400 with inactive wallet', async () => {
      // Create inactive wallet
      const inactiveWallet = await prisma.wallet.create({
        data: {
          userId: testUserId,
          name: 'Inactive Wallet',
          descr: 'Inactive wallet for testing',
          state: 'inactive'
        }
      })

      const transactionData = {
        walletId: inactiveWallet.id,
        assetId: testAssetId,
        orderId: testOrderId,
        type: 'DEPOSIT',
        value: 1000,
        descr: 'Test transaction',
        date: new Date().toISOString()
      }

      const response = await request(BASE_URL)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(transactionData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Wallet must be active')
    })

    it('should return 400 with unfilled order', async () => {
      // Create unfilled order
      const unfilledOrder = await prisma.tradeOrder.create({
        data: {
          userId: testUserId,
          positionId: testPositionId,
          action: 'BUY',
          status: 'OPEN',
          openDate: new Date()
        }
      })

      const transactionData = {
        walletId: testWalletId,
        assetId: testAssetId,
        orderId: unfilledOrder.id,
        type: 'DEPOSIT',
        value: 1000,
        descr: 'Test transaction',
        date: new Date().toISOString()
      }

      const response = await request(BASE_URL)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(transactionData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Order must be filled')
    })
  })

  describe('GET /api/transactions/:id', () => {
    it('should return transaction by id', async () => {
      const response = await request(BASE_URL)
        .get(`/api/transactions/${testTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.id).toBe(testTransactionId)
      expect(response.body.data).toHaveProperty('wallet')
      expect(response.body.data).toHaveProperty('asset')
      expect(response.body.data).toHaveProperty('order')
    })

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(BASE_URL)
        .get('/api/transactions/999999')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/transactions/:id', () => {
    it('should update transaction', async () => {
      const updateData = {
        value: 1500,
        descr: 'Updated test transaction description'
      }

      const response = await request(BASE_URL)
        .put(`/api/transactions/${testTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.data).toHaveProperty('wallet')
      expect(response.body.data).toHaveProperty('asset')
      expect(response.body.data).toHaveProperty('order')
      expect(response.body).toHaveProperty('message', 'Transaction updated successfully')
    })
  })

  describe('DELETE /api/transactions/:id', () => {
    it('should delete transaction', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/transactions/${testTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Transaction deleted successfully')
    })
  })
}) 