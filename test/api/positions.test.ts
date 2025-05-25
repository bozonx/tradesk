import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000'

describe('Positions API', () => {
  let csrfToken: string
  let testPositionId: number
  let testUserId: number
  let authCookie: string

  beforeAll(async () => {
    // Get test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })

    if (!user) {
      throw new Error('Test user not found')
    }

    testUserId = user.id

    // Login to get CSRF token and auth cookie
    const loginResponse = await request(BASE_URL)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123'
      })

    // Get CSRF token from response
    csrfToken = loginResponse.body.csrfToken

    // Get auth cookie from response
    const cookies = loginResponse.headers['set-cookie']
    if (!cookies) {
      throw new Error('No cookies received from login')
    }
    authCookie = cookies[0].split(';')[0].split('=')[1]
  })

  describe('GET /api/positions', () => {
    it('should return list of positions', async () => {
      const response = await request(BASE_URL)
        .get('/api/positions')
        .set('Cookie', [`auth_token=${authCookie}`])
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('page')
      expect(response.body).toHaveProperty('limit')
      expect(Array.isArray(response.body.data)).toBe(true)
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('tradeOrders')
        expect(response.body.data[0]).toHaveProperty('type')
      }
    })
  })

  describe('POST /api/positions', () => {
    it('should create a new position', async () => {
      const positionData = {
        type: 'LONG',
        descr: 'Test position description'
      }

      const response = await request(BASE_URL)
        .post('/api/positions')
        .set('Cookie', [`auth_token=${authCookie}`])
        .set('x-csrf-token', csrfToken)
        .send(positionData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(positionData)
      expect(response.body.data).toHaveProperty('tradeOrders')
      expect(response.body).toHaveProperty('message', 'Position created successfully')

      testPositionId = response.body.data.id
    })

    it('should return 400 with invalid type', async () => {
      const positionData = {
        type: 'INVALID_TYPE',
        descr: 'Test position with invalid type'
      }

      const response = await request(BASE_URL)
        .post('/api/positions')
        .set('Cookie', [`auth_token=${authCookie}`])
        .set('x-csrf-token', csrfToken)
        .send(positionData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid position type')
    })
  })

  describe('GET /api/positions/:id', () => {
    it('should return position by id', async () => {
      const response = await request(BASE_URL)
        .get(`/api/positions/${testPositionId}`)
        .set('Cookie', [`auth_token=${authCookie}`])
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.id).toBe(testPositionId)
      expect(response.body.data).toHaveProperty('tradeOrders')
      expect(response.body.data).toHaveProperty('type')
    })

    it('should return 404 for non-existent position', async () => {
      const response = await request(BASE_URL)
        .get('/api/positions/999999')
        .set('Cookie', [`auth_token=${authCookie}`])
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/positions/:id', () => {
    it('should update position', async () => {
      const updateData = {
        descr: 'Updated test position description'
      }

      const response = await request(BASE_URL)
        .put(`/api/positions/${testPositionId}`)
        .set('Cookie', [`auth_token=${authCookie}`])
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.data).toHaveProperty('tradeOrders')
      expect(response.body.data).toHaveProperty('type')
      expect(response.body).toHaveProperty('message', 'Position updated successfully')
    })

    it('should return 400 with invalid type', async () => {
      const updateData = {
        type: 'INVALID_TYPE'
      }

      const response = await request(BASE_URL)
        .put(`/api/positions/${testPositionId}`)
        .set('Cookie', [`auth_token=${authCookie}`])
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid position type')
    })
  })

  describe('DELETE /api/positions/:id', () => {
    it('should delete position', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/positions/${testPositionId}`)
        .set('Cookie', [`auth_token=${authCookie}`])
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Position deleted successfully')
    })
  })
}) 