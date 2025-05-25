import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Strategies API', () => {
  let authToken: string
  let csrfToken: string
  let testStrategyId: number
  let testGroupId: number

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

    // Create test group
    const group = await prisma.group.create({
      data: {
        name: 'Test Strategy Group',
        type: 'STRATEGY',
        descr: 'Test group for strategies'
      }
    })
    testGroupId = group.id

    // Get CSRF token
    const loginResponse = await request(BASE_URL)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123'
      })
    csrfToken = loginResponse.body.csrfToken
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
      expect(Array.isArray(response.body.data)).toBe(true)
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('group')
        expect(response.body.data[0]).toHaveProperty('positions')
      }
    })
  })

  describe('POST /api/strategies', () => {
    it('should create a new strategy', async () => {
      const strategyData = {
        name: 'Test Strategy',
        descr: 'Test strategy description',
        state: 'active',
        groupId: testGroupId
      }

      const response = await request(BASE_URL)
        .post('/api/strategies')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(strategyData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(strategyData)
      expect(response.body.data).toHaveProperty('group')
      expect(response.body.data.group.id).toBe(testGroupId)
      expect(response.body).toHaveProperty('message', 'Strategy created successfully')

      testStrategyId = response.body.data.id
    })

    it('should return 400 with invalid group type', async () => {
      // Create a group with wrong type
      const wrongGroup = await prisma.group.create({
        data: {
          name: 'Wrong Group',
          type: 'PORTFOLIO',
          descr: 'Wrong type group'
        }
      })

      const strategyData = {
        name: 'Test Strategy',
        descr: 'Test strategy description',
        state: 'active',
        groupId: wrongGroup.id
      }

      const response = await request(BASE_URL)
        .post('/api/strategies')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(strategyData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid group or group type must be STRATEGY')
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
      expect(response.body.data).toHaveProperty('group')
      expect(response.body.data).toHaveProperty('positions')
      expect(response.body.data.positions).toHaveProperty('transactions')
      expect(response.body.data.positions).toHaveProperty('tradeOrders')
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
        descr: 'Updated strategy description',
        groupId: testGroupId
      }

      const response = await request(BASE_URL)
        .put(`/api/strategies/${testStrategyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.data).toHaveProperty('group')
      expect(response.body.data.group.id).toBe(testGroupId)
      expect(response.body).toHaveProperty('message', 'Strategy updated successfully')
    })

    it('should return 400 with invalid group type', async () => {
      // Create a group with wrong type
      const wrongGroup = await prisma.group.create({
        data: {
          name: 'Wrong Group',
          type: 'PORTFOLIO',
          descr: 'Wrong type group'
        }
      })

      const updateData = {
        descr: 'Updated strategy description',
        groupId: wrongGroup.id
      }

      const response = await request(BASE_URL)
        .put(`/api/strategies/${testStrategyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid group or group type must be STRATEGY')
    })
  })

  describe('DELETE /api/strategies/:id', () => {
    it('should delete strategy', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/strategies/${testStrategyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Strategy deleted successfully')
    })
  })
}) 