import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('Authentication', () => {
  let testUser: any
  const testPassword = 'test123'

  beforeAll(async () => {
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

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'auth_test@example.com' },
      })

      expect(user).toBeDefined()
      expect(user?.email).toBe('auth_test@example.com')

      const isValidPassword = await bcryptjs.compare(testPassword, user!.password)
      expect(isValidPassword).toBe(true)

      const token = jwt.sign(
        { userId: user!.id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      )

      expect(token).toBeDefined()
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
      expect(decoded.userId).toBe(user!.id)
    })

    it('should not login with invalid password', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'auth_test@example.com' },
      })

      expect(user).toBeDefined()
      const isValidPassword = await bcryptjs.compare('wrong_password', user!.password)
      expect(isValidPassword).toBe(false)
    })

    it('should not login with non-existent email', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      })

      expect(user).toBeNull()
    })
  })

  describe('Register', () => {
    it('should register new user', async () => {
      const newUserData = {
        email: 'new_user@example.com',
        password: 'newpass123',
        name: 'New User',
        role: 'USER' as const,
      }

      const hashedPassword = await bcryptjs.hash(newUserData.password, 10)
      const user = await prisma.user.create({
        data: {
          ...newUserData,
          password: hashedPassword,
        },
      })

      expect(user).toBeDefined()
      expect(user.email).toBe(newUserData.email)
      expect(user.name).toBe(newUserData.name)
      expect(user.role).toBe(newUserData.role)

      const isValidPassword = await bcryptjs.compare(newUserData.password, user.password)
      expect(isValidPassword).toBe(true)
    })

    it('should not register user with existing email', async () => {
      const existingUserData = {
        email: 'auth_test@example.com',
        password: 'test123',
        name: 'Existing User',
        role: 'USER' as const,
      }

      const hashedPassword = await bcryptjs.hash(existingUserData.password, 10)
      await expect(prisma.user.create({
        data: {
          ...existingUserData,
          password: hashedPassword,
        },
      })).rejects.toThrow()
    })
  })

  describe('Password Reset', () => {
    it('should update user password', async () => {
      const newPassword = 'newpass123'
      const hashedPassword = await bcryptjs.hash(newPassword, 10)

      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { password: hashedPassword },
      })

      expect(updatedUser).toBeDefined()
      const isValidPassword = await bcryptjs.compare(newPassword, updatedUser.password)
      expect(isValidPassword).toBe(true)
    })
  })
}) 