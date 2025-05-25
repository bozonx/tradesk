import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Portfolios API', () => {
  let authToken: string
  let csrfToken: string
  let testPortfolioId: number
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
        type: 'PORTFOLIO',
        name: 'Test Portfolio Group',
        descr: 'Test group for portfolios'
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

  describe('GET /api/portfolios', () => {
    it('should return list of portfolios', async () => {
      const response = await request(BASE_URL)
        .get('/api/portfolios')
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
        expect(response.body.data[0]).toHaveProperty('state')
      }
    })
  })

  describe('POST /api/portfolios', () => {
    it('should create a new portfolio', async () => {
      const portfolioData = {
        name: 'Test Portfolio',
        descr: 'Test portfolio description',
        state: 'active',
        groupId: testGroupId
      }

      const response = await request(BASE_URL)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(portfolioData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(portfolioData)
      expect(response.body.data).toHaveProperty('group')
      expect(response.body.data.group.id).toBe(testGroupId)
      expect(response.body).toHaveProperty('message', 'Portfolio created successfully')

      testPortfolioId = response.body.data.id
    })

    it('should return 400 with invalid group type', async () => {
      // Create a group with wrong type
      const wrongGroup = await prisma.group.create({
        data: {
          name: 'Wrong Group',
          type: 'STRATEGY',
          descr: 'Wrong type group'
        }
      })

      const portfolioData = {
        name: 'Test Portfolio',
        descr: 'Test portfolio description',
        state: 'active',
        groupId: wrongGroup.id
      }

      const response = await request(BASE_URL)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(portfolioData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid group or group type must be PORTFOLIO')
    })

    it('should return 400 with invalid state', async () => {
      const portfolioData = {
        name: 'Test Portfolio',
        descr: 'Test portfolio description',
        state: 'invalid_state',
        groupId: testGroupId
      }

      const response = await request(BASE_URL)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(portfolioData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid state value')
    })
  })

  describe('GET /api/portfolios/:id', () => {
    it('should return portfolio by id', async () => {
      const response = await request(BASE_URL)
        .get(`/api/portfolios/${testPortfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.id).toBe(testPortfolioId)
      expect(response.body.data).toHaveProperty('group')
      expect(response.body.data).toHaveProperty('positions')
      expect(response.body.data).toHaveProperty('state')
      expect(response.body.data.positions).toHaveProperty('transactions')
      expect(response.body.data.positions).toHaveProperty('tradeOrders')
    })

    it('should return 404 for non-existent portfolio', async () => {
      const response = await request(BASE_URL)
        .get('/api/portfolios/999999')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/portfolios/:id', () => {
    it('should update portfolio', async () => {
      const updateData = {
        name: 'Updated Test Portfolio',
        descr: 'Updated test portfolio description',
        state: 'inactive',
        groupId: testGroupId
      }

      const response = await request(BASE_URL)
        .put(`/api/portfolios/${testPortfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.data).toHaveProperty('group')
      expect(response.body.data.group.id).toBe(testGroupId)
      expect(response.body).toHaveProperty('message', 'Portfolio updated successfully')
    })

    it('should return 400 with invalid group type', async () => {
      // Create a group with wrong type
      const wrongGroup = await prisma.group.create({
        data: {
          name: 'Wrong Group',
          type: 'STRATEGY',
          descr: 'Wrong type group'
        }
      })

      const updateData = {
        name: 'Updated Test Portfolio',
        descr: 'Updated test portfolio description',
        state: 'active',
        groupId: wrongGroup.id
      }

      const response = await request(BASE_URL)
        .put(`/api/portfolios/${testPortfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid group or group type must be PORTFOLIO')
    })

    it('should return 400 with invalid state', async () => {
      const updateData = {
        name: 'Updated Test Portfolio',
        descr: 'Updated test portfolio description',
        state: 'invalid_state',
        groupId: testGroupId
      }

      const response = await request(BASE_URL)
        .put(`/api/portfolios/${testPortfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid state value')
    })
  })

  describe('DELETE /api/portfolios/:id', () => {
    it('should delete portfolio', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/portfolios/${testPortfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Portfolio deleted successfully')
    })
  })
}) 