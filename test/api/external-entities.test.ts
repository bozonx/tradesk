import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('External Entities API', () => {
  let authToken: string
  let testEntityId: number

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

  describe('GET /api/external-entities', () => {
    it('should return list of external entities', async () => {
      const response = await request(BASE_URL)
        .get('/api/external-entities')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('page')
      expect(response.body).toHaveProperty('limit')
    })
  })

  describe('POST /api/external-entities', () => {
    it('should create a new external entity', async () => {
      const entityData = {
        name: 'Binance',
        type: 'EXCHANGE',
        descr: 'Binance cryptocurrency exchange',
        url: 'https://binance.com',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret'
      }

      const response = await request(BASE_URL)
        .post('/api/external-entities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entityData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject({
        ...entityData,
        apiSecret: undefined // API secret should not be returned in response
      })
      expect(response.body).toHaveProperty('message', 'External entity created successfully')

      testEntityId = response.body.data.id
    })
  })

  describe('GET /api/external-entities/:id', () => {
    it('should return external entity by id', async () => {
      const response = await request(BASE_URL)
        .get(`/api/external-entities/${testEntityId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.id).toBe(testEntityId)
      expect(response.body.data).not.toHaveProperty('apiSecret')
    })

    it('should return 404 for non-existent external entity', async () => {
      const response = await request(BASE_URL)
        .get('/api/external-entities/999999')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/external-entities/:id', () => {
    it('should update external entity', async () => {
      const updateData = {
        descr: 'Updated Binance description',
        apiKey: 'new-test-api-key'
      }

      const response = await request(BASE_URL)
        .put(`/api/external-entities/${testEntityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.data).not.toHaveProperty('apiSecret')
      expect(response.body).toHaveProperty('message', 'External entity updated successfully')
    })
  })

  describe('DELETE /api/external-entities/:id', () => {
    it('should delete external entity', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/external-entities/${testEntityId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'External entity deleted successfully')
    })
  })
}) 