import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('Auth', () => {
  describe('Login', () => {
    it('should login with valid credentials', async () => {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
      })

      expect(user).toBeDefined()
      if (!user) return

      // Verify password
      const isValidPassword = await bcryptjs.compare('test123', user.password)
      expect(isValidPassword).toBe(true)

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      )

      // Generate CSRF token
      const csrfToken = randomBytes(32).toString('hex')

      // Create session
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: csrfToken,
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1',
        },
      })

      expect(session).toBeDefined()
      expect(session.token).toBe(csrfToken)
      expect(session.userId).toBe(user.id)

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
      expect(decoded.userId).toBe(user.id)
    })

    it('should fail with invalid password', async () => {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
      })

      expect(user).toBeDefined()
      if (!user) return

      // Verify password
      const isValidPassword = await bcryptjs.compare('wrongpassword', user.password)
      expect(isValidPassword).toBe(false)
    })

    it('should fail with non-existent email', async () => {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' }
      })

      expect(user).toBeNull()
    })
  })

  describe('Register', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'newuser123',
        name: 'New User',
        role: 'USER' as const
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          ...newUser,
          password: await bcryptjs.hash(newUser.password, 10)
        }
      })

      expect(user).toBeDefined()
      expect(user.email).toBe(newUser.email)
      expect(user.name).toBe(newUser.name)
      expect(user.role).toBe(newUser.role)
      expect(user.password).not.toBe(newUser.password)

      // Verify password
      const isValidPassword = await bcryptjs.compare(newUser.password, user.password)
      expect(isValidPassword).toBe(true)
    })

    it('should fail with existing email', async () => {
      const existingUser = {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
        role: 'USER' as const
      }

      // Try to create user
      await expect(
        prisma.user.create({
          data: {
            ...existingUser,
            password: await bcryptjs.hash(existingUser.password, 10)
          }
        })
      ).rejects.toThrow()
    })
  })
}) 