import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Portfolios API', () => {
  let authToken: string
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
        .send(portfolioData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(portfolioData)
      expect(response.body).toHaveProperty('message', 'Portfolio created successfully')

      testPortfolioId = response.body.data.id
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
        descr: 'Updated test portfolio description'
      }

      const response = await request(BASE_URL)
        .put(`/api/portfolios/${testPortfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body).toHaveProperty('message', 'Portfolio updated successfully')
    })
  })

  describe('DELETE /api/portfolios/:id', () => {
    it('should delete portfolio', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/portfolios/${testPortfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Portfolio deleted successfully')
    })
  })
}) 