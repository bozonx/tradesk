import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Groups API', () => {
  let authToken: string
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
    })
  })

  describe('POST /api/groups', () => {
    it('should create a new group', async () => {
      const groupData = {
        name: 'Test Group',
        descr: 'Test group description',
        state: 'active'
      }

      const response = await request(BASE_URL)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(groupData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(groupData)
      expect(response.body).toHaveProperty('message', 'Group created successfully')

      testGroupId = response.body.data.id
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
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body).toHaveProperty('message', 'Group updated successfully')
    })
  })

  describe('DELETE /api/groups/:id', () => {
    it('should delete group', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/groups/${testGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Group deleted successfully')
    })
  })
}) 