import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000'

describe('Auth API', () => {
  const testUser = {
    email: 'auth-test@example.com',
    password: 'test123'
  }

  beforeAll(async () => {
    // Create test user if not exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email }
    })

    if (!existingUser) {
      const hashedPassword = await bcryptjs.hash(testUser.password, 10)
      await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          role: 'USER'
        }
      })
    }
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send(testUser)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('csrfToken')
      expect(response.body.user).toHaveProperty('email', testUser.email)
      expect(response.body.user).not.toHaveProperty('password')
      expect(response.headers['set-cookie']).toBeDefined()
    })

    it('should return 401 with invalid password', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })

      expect(response.status).toBe(401)
    })

    it('should return 401 with non-existent email', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'test123'
        })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: 'new-register@example.com',
        password: 'register123',
        name: 'New User'
      }

      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send(newUser)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('user')
      expect(response.body.user).toHaveProperty('email', newUser.email)
      expect(response.body.user).toHaveProperty('name', newUser.name)
      expect(response.body.user).not.toHaveProperty('password')
    })

    it('should return 400 with existing email', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send(testUser)

      expect(response.status).toBe(400)
    })

    it('should return 400 with invalid data', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123' // too short
        })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/auth/me', () => {
    let authToken: string
    let csrfToken: string

    beforeAll(async () => {
      // Login to get token
      const loginResponse = await request(BASE_URL)
        .post('/api/auth/login')
        .send(testUser)

      authToken = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1]
      csrfToken = loginResponse.body.csrfToken
    })

    it('should return current user with valid token', async () => {
      const response = await request(BASE_URL)
        .get('/api/auth/me')
        .set('Cookie', [`auth_token=${authToken}`])
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('user')
      expect(response.body.user).toHaveProperty('email', testUser.email)
      expect(response.body.user).not.toHaveProperty('password')
    })

    it('should return current user with Authorization header', async () => {
      const response = await request(BASE_URL)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('user')
      expect(response.body.user).toHaveProperty('email', testUser.email)
      expect(response.body.user).not.toHaveProperty('password')
    })

    it('should return 401 with invalid token', async () => {
      const response = await request(BASE_URL)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .set('x-csrf-token', csrfToken)

      expect(response.status).toBe(401)
    })

    it('should return 401 without token', async () => {
      const response = await request(BASE_URL)
        .get('/api/auth/me')

      expect(response.status).toBe(401)
    })
  })
}) 