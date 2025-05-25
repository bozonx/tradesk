import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const BASE_URL = 'http://localhost:3000'

describe('Users API', () => {
  let authToken: string
  let testUserId: number
  let adminAuthToken: string

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

    // Get or create admin user
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })

    if (!admin) {
      const hashedPassword = await bcryptjs.hash('admin123', 10)
      admin = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'ADMIN'
        }
      })
    }

    // Generate admin auth token
    adminAuthToken = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    )
  })

  describe('GET /api/users', () => {
    it('should return list of users for admin', async () => {
      const response = await request(BASE_URL)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminAuthToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('page')
      expect(response.body).toHaveProperty('limit')
    })

    it('should return 403 for non-admin user', async () => {
      const response = await request(BASE_URL)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(403)
    })
  })

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        role: 'USER'
      }

      const response = await request(BASE_URL)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(userData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject({
        email: userData.email,
        role: userData.role
      })
      expect(response.body.data).not.toHaveProperty('password')
      expect(response.body).toHaveProperty('message', 'User created successfully')

      testUserId = response.body.data.id
    })

    it('should return 403 for non-admin user', async () => {
      const response = await request(BASE_URL)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'another@example.com',
          password: 'password123',
          role: 'USER'
        })

      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/users/:id', () => {
    it('should return user by id for admin', async () => {
      const response = await request(BASE_URL)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.id).toBe(testUserId)
      expect(response.body.data).not.toHaveProperty('password')
    })

    it('should return 403 for non-admin user', async () => {
      const response = await request(BASE_URL)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(403)
    })

    it('should return 404 for non-existent user', async () => {
      const response = await request(BASE_URL)
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${adminAuthToken}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/users/:id', () => {
    it('should update user for admin', async () => {
      const updateData = {
        email: 'updated@example.com',
        role: 'USER'
      }

      const response = await request(BASE_URL)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toMatchObject(updateData)
      expect(response.body.data).not.toHaveProperty('password')
      expect(response.body).toHaveProperty('message', 'User updated successfully')
    })

    it('should return 403 for non-admin user', async () => {
      const response = await request(BASE_URL)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'another@example.com'
        })

      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('should delete user for admin', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'User deleted successfully')
    })

    it('should return 403 for non-admin user', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(403)
    })
  })
}) 