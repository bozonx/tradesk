import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Assets API', () => {
  let authToken: string
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
        .send(assetData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(assetData)
      expect(response.body).toHaveProperty('message', 'Asset created successfully')

      testAssetId = response.body.data.id
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
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body).toHaveProperty('message', 'Asset updated successfully')
    })
  })

  describe('DELETE /api/assets/:id', () => {
    it('should delete asset', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/assets/${testAssetId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Asset deleted successfully')
    })
  })
}) 