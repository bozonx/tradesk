import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Wallets API', () => {
  let authToken: string
  let csrfToken: string
  let testWalletId: number
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

    // Get CSRF token
    const loginResponse = await request(BASE_URL)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123'
      })
    csrfToken = loginResponse.body.csrfToken
  })

  describe('GET /api/wallets', () => {
    it('should return list of wallets', async () => {
      const response = await request(BASE_URL)
        .get('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('page')
      expect(response.body).toHaveProperty('limit')
      expect(Array.isArray(response.body.data)).toBe(true)
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('transactions')
        expect(response.body.data[0]).toHaveProperty('tradeOrders')
      }
    })
  })

  describe('POST /api/wallets', () => {
    it('should create a new wallet', async () => {
      const walletData = {
        name: 'Test Wallet',
        descr: 'Test wallet description',
        state: 'active'
      }

      const response = await request(BASE_URL)
        .post('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(walletData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(walletData)
      expect(response.body.data).toHaveProperty('transactions')
      expect(response.body.data).toHaveProperty('tradeOrders')
      expect(response.body).toHaveProperty('message', 'Wallet created successfully')

      testWalletId = response.body.data.id
    })

    it('should return 400 with invalid state', async () => {
      const walletData = {
        name: 'Invalid State Wallet',
        descr: 'Test wallet with invalid state',
        state: 'INVALID_STATE'
      }

      const response = await request(BASE_URL)
        .post('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(walletData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid state')
    })

    it('should return 400 with duplicate name', async () => {
      const walletData = {
        name: 'Test Wallet',
        descr: 'Test wallet with duplicate name',
        state: 'active'
      }

      const response = await request(BASE_URL)
        .post('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(walletData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Wallet name must be unique')
    })
  })

  describe('GET /api/wallets/:id', () => {
    it('should return wallet by id', async () => {
      const response = await request(BASE_URL)
        .get(`/api/wallets/${testWalletId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.id).toBe(testWalletId)
      expect(response.body.data).toHaveProperty('transactions')
      expect(response.body.data).toHaveProperty('tradeOrders')
    })

    it('should return 404 for non-existent wallet', async () => {
      const response = await request(BASE_URL)
        .get('/api/wallets/999999')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/wallets/:id', () => {
    it('should update wallet', async () => {
      const updateData = {
        name: 'Updated Test Wallet',
        descr: 'Updated test wallet description'
      }

      const response = await request(BASE_URL)
        .put(`/api/wallets/${testWalletId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.data).toHaveProperty('transactions')
      expect(response.body.data).toHaveProperty('tradeOrders')
      expect(response.body).toHaveProperty('message', 'Wallet updated successfully')
    })

    it('should return 400 with invalid state', async () => {
      const updateData = {
        state: 'INVALID_STATE'
      }

      const response = await request(BASE_URL)
        .put(`/api/wallets/${testWalletId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid state')
    })

    it('should return 400 with duplicate name', async () => {
      // Create another wallet first
      const anotherWallet = await prisma.wallet.create({
        data: {
          userId: testUserId,
          name: 'Another Test Wallet',
          descr: 'Another test wallet',
          state: 'active'
        }
      })

      const updateData = {
        name: 'Another Test Wallet'
      }

      const response = await request(BASE_URL)
        .put(`/api/wallets/${testWalletId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Wallet name must be unique')
    })
  })

  describe('DELETE /api/wallets/:id', () => {
    it('should delete wallet', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/wallets/${testWalletId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Wallet deleted successfully')
    })
  })
}) 