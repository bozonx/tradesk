import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Wallets API', () => {
  let authToken: string
  let testWalletId: number

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
        .send(walletData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(walletData)
      expect(response.body).toHaveProperty('message', 'Wallet created successfully')

      testWalletId = response.body.data.id
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
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body).toHaveProperty('message', 'Wallet updated successfully')
    })
  })

  describe('DELETE /api/wallets/:id', () => {
    it('should delete wallet', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/wallets/${testWalletId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Wallet deleted successfully')
    })
  })
}) 