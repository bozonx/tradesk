import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Positions API', () => {
  let authToken: string
  let testPositionId: number
  let testPortfolioId: number
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

    // Create test portfolio
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: user.id,
        name: 'Test Portfolio',
        descr: 'Test portfolio for positions',
        state: 'active'
      }
    })
    testPortfolioId = portfolio.id

    // Create test strategy
    const strategy = await prisma.strategy.create({
      data: {
        userId: user.id,
        name: 'Test Strategy',
        descr: 'Test strategy for positions',
        state: 'active'
      }
    })
    testStrategyId = strategy.id
  })

  describe('GET /api/positions', () => {
    it('should return list of positions', async () => {
      const response = await request(BASE_URL)
        .get('/api/positions')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('page')
      expect(response.body).toHaveProperty('limit')
    })
  })

  describe('POST /api/positions', () => {
    it('should create a new position', async () => {
      const positionData = {
        type: 'LONG',
        portfolioId: testPortfolioId,
        strategyId: testStrategyId,
        descr: 'Test position description'
      }

      const response = await request(BASE_URL)
        .post('/api/positions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(positionData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(positionData)
      expect(response.body).toHaveProperty('message', 'Position created successfully')

      testPositionId = response.body.data.id
    })
  })

  describe('GET /api/positions/:id', () => {
    it('should return position by id', async () => {
      const response = await request(BASE_URL)
        .get(`/api/positions/${testPositionId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.id).toBe(testPositionId)
    })

    it('should return 404 for non-existent position', async () => {
      const response = await request(BASE_URL)
        .get('/api/positions/999999')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/positions/:id', () => {
    it('should update position', async () => {
      const updateData = {
        type: 'SHORT',
        descr: 'Updated test position description'
      }

      const response = await request(BASE_URL)
        .put(`/api/positions/${testPositionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body).toHaveProperty('message', 'Position updated successfully')
    })
  })

  describe('DELETE /api/positions/:id', () => {
    it('should delete position', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/positions/${testPositionId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Position deleted successfully')
    })
  })
}) 