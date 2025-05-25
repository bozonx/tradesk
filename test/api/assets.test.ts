import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Assets API', () => {
  let authToken: string
  let csrfToken: string
  let testAssetId: number

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

    // Get CSRF token
    const loginResponse = await request(BASE_URL)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123'
      })
    csrfToken = loginResponse.body.csrfToken
  })

  describe('GET /api/assets', () => {
    it('should return list of assets', async () => {
      const response = await request(BASE_URL)
        .get('/api/assets')
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

  describe('POST /api/assets', () => {
    it('should create a new asset', async () => {
      const assetData = {
        ticker: 'ETH',
        type: 'CRYP',
        descr: 'Ethereum cryptocurrency'
      }

      const response = await request(BASE_URL)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(assetData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(assetData)
      expect(response.body.data).toHaveProperty('transactions')
      expect(response.body.data).toHaveProperty('tradeOrders')
      expect(response.body).toHaveProperty('message', 'Asset created successfully')

      testAssetId = response.body.data.id
    })

    it('should return 400 with invalid type', async () => {
      const assetData = {
        ticker: 'INVALID',
        type: 'INVALID_TYPE',
        descr: 'Asset with invalid type'
      }

      const response = await request(BASE_URL)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(assetData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid asset type')
    })

    it('should return 400 with duplicate ticker', async () => {
      const assetData = {
        ticker: 'ETH',
        type: 'CRYP',
        descr: 'Another Ethereum asset'
      }

      const response = await request(BASE_URL)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(assetData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Asset ticker must be unique')
    })
  })

  describe('GET /api/assets/:id', () => {
    it('should return asset by id', async () => {
      const response = await request(BASE_URL)
        .get(`/api/assets/${testAssetId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.id).toBe(testAssetId)
      expect(response.body.data).toHaveProperty('transactions')
      expect(response.body.data).toHaveProperty('tradeOrders')
    })

    it('should return 404 for non-existent asset', async () => {
      const response = await request(BASE_URL)
        .get('/api/assets/999999')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/assets/:id', () => {
    it('should update asset', async () => {
      const updateData = {
        descr: 'Updated Ethereum description'
      }

      const response = await request(BASE_URL)
        .put(`/api/assets/${testAssetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.data).toHaveProperty('transactions')
      expect(response.body.data).toHaveProperty('tradeOrders')
      expect(response.body).toHaveProperty('message', 'Asset updated successfully')
    })

    it('should return 400 with invalid type', async () => {
      const updateData = {
        type: 'INVALID_TYPE'
      }

      const response = await request(BASE_URL)
        .put(`/api/assets/${testAssetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid asset type')
    })

    it('should return 400 with duplicate ticker', async () => {
      // Create another asset first
      const anotherAsset = await prisma.asset.create({
        data: {
          ticker: 'BTC',
          type: 'CRYP',
          descr: 'Bitcoin cryptocurrency'
        }
      })

      const updateData = {
        ticker: 'BTC'
      }

      const response = await request(BASE_URL)
        .put(`/api/assets/${testAssetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Asset ticker must be unique')
    })
  })

  describe('DELETE /api/assets/:id', () => {
    it('should delete asset', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/assets/${testAssetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Asset deleted successfully')
    })
  })
}) 