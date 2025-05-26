import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { createServer } from 'http'
import { createApp, toNodeListener } from 'h3'
import { randomBytes } from 'crypto'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()
let server: any
let baseUrl: string
let testUser: any
const testPassword = 'test123'

describe('Authentication', () => {
  beforeAll(async () => {
    // Setup test server
    const app = createApp()
    server = createServer(toNodeListener(app))
    await new Promise<void>((resolve) => server.listen(0, () => resolve()))
    const address = server.address()
    baseUrl = `http://localhost:${address.port}`

    // Create test user
    const hashedPassword = await bcryptjs.hash(testPassword, 10)
    testUser = await prisma.user.upsert({
      where: { email: 'auth_test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Auth Test User',
        role: 'USER',
      },
      create: {
        email: 'auth_test@example.com',
        password: hashedPassword,
        name: 'Auth Test User',
        role: 'USER',
      },
    })
  })

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['auth_test@example.com', 'new_user@example.com']
        }
      }
    })
    await prisma.session.deleteMany({
      where: {
        userId: testUser.id
      }
    })
    await new Promise<void>((resolve) => server.close(() => resolve()))
  })

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'auth_test@example.com',
          password: testPassword,
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe('auth_test@example.com')
      expect(data.user.name).toBe('Auth Test User')
      expect(data.csrfToken).toBeDefined()

      // Check cookies
      const cookies = response.headers.get('set-cookie')
      expect(cookies).toContain('auth_token')
      expect(cookies).toMatch(/HttpOnly/)
      expect(cookies).toMatch(/SameSite=Strict/)

      // Verify session was created
      const session = await prisma.session.findFirst({
        where: { userId: testUser.id }
      })
      expect(session).toBeDefined()
      expect(session?.token).toBe(data.csrfToken)
    })

    it('should not login with invalid password', async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'auth_test@example.com',
          password: 'wrong_password',
        }),
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.message).toBe('Invalid credentials')
    })

    it('should not login with non-existent email', async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'test123',
        }),
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.message).toBe('Invalid credentials')
    })

    it('should validate input data', async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: '123', // Too short
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe('Invalid input')
      expect(data.data).toBeDefined()
    })
  })

  describe('Register', () => {
    it('should register new user', async () => {
      const newUserData = {
        email: 'new_user@example.com',
        password: 'newpass123',
        name: 'New User',
      }

      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(newUserData.email)
      expect(data.user.name).toBe(newUserData.name)
      expect(data.csrfToken).toBeDefined()

      // Verify user was created
      const user = await prisma.user.findUnique({
        where: { email: newUserData.email }
      })
      expect(user).toBeDefined()
      expect(user?.name).toBe(newUserData.name)
    })

    it('should not register user with existing email', async () => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'auth_test@example.com',
          password: 'test123',
          name: 'Existing User',
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe('Email already exists')
    })

    it('should validate registration input', async () => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: '123', // Too short
          name: '', // Empty name
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe('Invalid input')
      expect(data.data).toBeDefined()
    })
  })

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      const response = await fetch(`${baseUrl}/api/auth/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'auth_test@example.com',
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Password reset email sent')

      // Verify session was created for password reset
      const session = await prisma.session.findFirst({
        where: { 
          userId: testUser.id,
          userAgent: { contains: 'Password Reset' }
        }
      })
      expect(session).toBeDefined()
    })

    it('should not send reset email for non-existent user', async () => {
      const response = await fetch(`${baseUrl}/api/auth/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
        }),
      })

      expect(response.status).toBe(200) // We return 200 for security reasons
      const data = await response.json()
      expect(data.message).toBe('Password reset email sent')
    })
  })

  describe('Logout', () => {
    it('should logout user and clear session', async () => {
      // First login to get session
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'auth_test@example.com',
          password: testPassword,
        }),
      })

      const loginData = await loginResponse.json()
      const cookies = loginResponse.headers.get('set-cookie')

      // Now try to logout
      const response = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || '',
          'X-CSRF-Token': loginData.csrfToken,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Logged out successfully')

      // Verify session was deleted
      const session = await prisma.session.findFirst({
        where: { userId: testUser.id }
      })
      expect(session).toBeNull()
    })
  })

  describe('CSRF Protection', () => {
    it('should reject requests without CSRF token', async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'auth_test@example.com',
          password: testPassword,
        }),
      })

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.message).toBe('Invalid CSRF token')
    })

    it('should reject requests with invalid CSRF token', async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'invalid-token',
        },
        body: JSON.stringify({
          email: 'auth_test@example.com',
          password: testPassword,
        }),
      })

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.message).toBe('Invalid CSRF token')
    })
  })

  describe('Password Update', () => {
    it('should update password with valid reset token', async () => {
      // First request password reset
      await fetch(`${baseUrl}/api/auth/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'auth_test@example.com',
        }),
      })

      // Get reset token from session
      const session = await prisma.session.findFirst({
        where: { 
          userId: testUser.id,
          userAgent: { contains: 'Password Reset' }
        }
      })

      expect(session).toBeDefined()
      const resetToken = session?.token

      // Update password
      const response = await fetch(`${baseUrl}/api/auth/password-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': resetToken || '',
        },
        body: JSON.stringify({
          token: resetToken,
          password: 'newpassword123',
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Password updated successfully')

      // Verify new password works
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'auth_test@example.com',
          password: 'newpassword123',
        }),
      })

      expect(loginResponse.status).toBe(200)
    })
  })

  describe('Login Rate Limiting', () => {
    it('should block after multiple failed attempts', async () => {
      const attempts = 5
      for (let i = 0; i < attempts; i++) {
        await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'auth_test@example.com',
            password: 'wrong_password',
          }),
        })
      }

      // Try one more time
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'auth_test@example.com',
          password: testPassword,
        }),
      })

      expect(response.status).toBe(429)
      const data = await response.json()
      expect(data.message).toBe('Too many login attempts. Please try again later.')
    })
  })
}) 