import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Strategies API', () => {
  let authToken: string
  let testStrategyId: number

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

  describe('GET /api/strategies', () => {
    it('should return list of strategies', async () => {
      const response = await request(BASE_URL)
        .get('/api/strategies')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('page')
      expect(response.body).toHaveProperty('limit')
    })
  })

  describe('POST /api/strategies', () => {
    it('should create a new strategy', async () => {
      const strategyData = {
        name: 'Test Strategy',
        descr: 'Test strategy description',
        state: 'active'
      }

      const response = await request(BASE_URL)
        .post('/api/strategies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(strategyData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(strategyData)
      expect(response.body).toHaveProperty('message', 'Strategy created successfully')

      testStrategyId = response.body.data.id
    })
  })

  describe('GET /api/strategies/:id', () => {
    it('should return strategy by id', async () => {
      const response = await request(BASE_URL)
        .get(`/api/strategies/${testStrategyId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.id).toBe(testStrategyId)
    })

    it('should return 404 for non-existent strategy', async () => {
      const response = await request(BASE_URL)
        .get('/api/strategies/999999')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/strategies/:id', () => {
    it('should update strategy', async () => {
      const updateData = {
        descr: 'Updated strategy description'
      }

      const response = await request(BASE_URL)
        .put(`/api/strategies/${testStrategyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body).toHaveProperty('message', 'Strategy updated successfully')
    })
  })

  describe('DELETE /api/strategies/:id', () => {
    it('should delete strategy', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/strategies/${testStrategyId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Strategy deleted successfully')
    })
  })
}) 