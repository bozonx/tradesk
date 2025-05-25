import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Transactions API', () => {
  let authToken: string
  let testTransactionId: number
  let testWalletId: number
  let testAssetId: number
  let testOrderId: number

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

    // Create test wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
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
        userId: user.id,
        type: 'LONG',
        descr: 'Test position for transactions'
      }
    })

    // Create test order
    const order = await prisma.tradeOrder.create({
      data: {
        userId: user.id,
        positionId: position.id,
        action: 'BUY',
        status: 'FILL',
        openDate: new Date(),
        fillDate: new Date()
      }
    })
    testOrderId = order.id
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
        .send(transactionData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(transactionData)
      expect(response.body).toHaveProperty('message', 'Transaction created successfully')

      testTransactionId = response.body.data.id
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
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body).toHaveProperty('message', 'Transaction updated successfully')
    })
  })

  describe('DELETE /api/transactions/:id', () => {
    it('should delete transaction', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/transactions/${testTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Transaction deleted successfully')
    })
  })
}) 