import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Groups API', () => {
  let authToken: string
  let csrfToken: string
  let testGroupId: number
  let testUserId: number

  beforeAll(async () => {
    // Get test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })

    if (!user) {
      throw new Error('Test user not found')
    }

    testUserId = user.id

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

  describe('GET /api/groups', () => {
    it('should return list of groups', async () => {
      const response = await request(BASE_URL)
        .get('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('page')
      expect(response.body).toHaveProperty('limit')
      expect(Array.isArray(response.body.data)).toBe(true)
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('portfolios')
        expect(response.body.data[0]).toHaveProperty('strategies')
        expect(response.body.data[0]).toHaveProperty('positions')
      }
    })
  })

  describe('POST /api/groups', () => {
    it('should create a new group', async () => {
      const groupData = {
        name: 'Test Group',
        descr: 'Test group description',
        state: 'active',
        type: 'PORTFOLIO'
      }

      const response = await request(BASE_URL)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(groupData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(groupData)
      expect(response.body.data).toHaveProperty('portfolios')
      expect(response.body.data).toHaveProperty('strategies')
      expect(response.body.data).toHaveProperty('positions')
      expect(response.body).toHaveProperty('message', 'Group created successfully')

      testGroupId = response.body.data.id
    })

    it('should return 400 with invalid type', async () => {
      const groupData = {
        name: 'Invalid Type Group',
        descr: 'Test group with invalid type',
        state: 'active',
        type: 'INVALID_TYPE'
      }

      const response = await request(BASE_URL)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(groupData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid group type')
    })

    it('should return 400 with invalid state', async () => {
      const groupData = {
        name: 'Invalid State Group',
        descr: 'Test group with invalid state',
        state: 'INVALID_STATE',
        type: 'PORTFOLIO'
      }

      const response = await request(BASE_URL)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(groupData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid state')
    })

    it('should return 400 with duplicate name', async () => {
      const groupData = {
        name: 'Test Group',
        descr: 'Another test group',
        state: 'active',
        type: 'PORTFOLIO'
      }

      const response = await request(BASE_URL)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(groupData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Group name must be unique')
    })
  })

  describe('GET /api/groups/:id', () => {
    it('should return group by id', async () => {
      const response = await request(BASE_URL)
        .get(`/api/groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.id).toBe(testGroupId)
      expect(response.body.data).toHaveProperty('portfolios')
      expect(response.body.data).toHaveProperty('strategies')
      expect(response.body.data).toHaveProperty('positions')
    })

    it('should return 404 for non-existent group', async () => {
      const response = await request(BASE_URL)
        .get('/api/groups/999999')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/groups/:id', () => {
    it('should update group', async () => {
      const updateData = {
        name: 'Updated Test Group',
        descr: 'Updated test group description',
        state: 'inactive'
      }

      const response = await request(BASE_URL)
        .put(`/api/groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.data).toHaveProperty('portfolios')
      expect(response.body.data).toHaveProperty('strategies')
      expect(response.body.data).toHaveProperty('positions')
      expect(response.body).toHaveProperty('message', 'Group updated successfully')
    })

    it('should return 400 with invalid type', async () => {
      const updateData = {
        type: 'INVALID_TYPE'
      }

      const response = await request(BASE_URL)
        .put(`/api/groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid group type')
    })

    it('should return 400 with invalid state', async () => {
      const updateData = {
        state: 'INVALID_STATE'
      }

      const response = await request(BASE_URL)
        .put(`/api/groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid state')
    })

    it('should return 400 with duplicate name', async () => {
      // Create another group first
      const anotherGroup = await prisma.group.create({
        data: {
          userId: testUserId,
          name: 'Another Test Group',
          descr: 'Another test group',
          state: 'active',
          type: 'PORTFOLIO'
        }
      })

      const updateData = {
        name: 'Another Test Group'
      }

      const response = await request(BASE_URL)
        .put(`/api/groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Group name must be unique')
    })
  })

  describe('DELETE /api/groups/:id', () => {
    it('should delete group', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Group deleted successfully')
    })
  })
}) 