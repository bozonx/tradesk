import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('User Profile', () => {
  let testUser: any
  let authToken: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcryptjs.hash('test123', 10)
    testUser = await prisma.user.upsert({
      where: { email: 'profile_test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Profile Test User',
        role: 'USER',
      },
      create: {
        email: 'profile_test@example.com',
        password: hashedPassword,
        name: 'Profile Test User',
        role: 'USER',
      },
    })

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  })

  describe('Get Profile', () => {
    it('should get user profile', async () => {
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      })

      expect(user).toBeDefined()
      expect(user?.id).toBe(testUser.id)
      expect(user?.email).toBe('profile_test@example.com')
      expect(user?.name).toBe('Profile Test User')
      expect(user?.role).toBe('USER')
    })
  })

  describe('Update Profile', () => {
    it('should update user name', async () => {
      const newName = 'Updated Test User'
      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { name: newName },
      })

      expect(updatedUser).toBeDefined()
      expect(updatedUser.name).toBe(newName)
    })

    it('should update user email', async () => {
      const newEmail = 'updated_profile_test@example.com'
      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { email: newEmail },
      })

      expect(updatedUser).toBeDefined()
      expect(updatedUser.email).toBe(newEmail)
    })

    it('should not update user role', async () => {
      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { role: 'ADMIN' },
      })

      expect(updatedUser).toBeDefined()
      expect(updatedUser.role).toBe('USER') // Role should remain unchanged
    })
  })

  describe('Delete Profile', () => {
    it('should soft delete user profile', async () => {
      const deletedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { deletedAt: new Date() },
      })

      expect(deletedUser).toBeDefined()
      expect(deletedUser.deletedAt).not.toBeNull()

      // Verify user is not returned in normal queries
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      })

      expect(user).toBeNull()
    })

    it('should restore deleted user profile', async () => {
      const restoredUser = await prisma.user.update({
        where: { id: testUser.id },
        data: { deletedAt: null },
      })

      expect(restoredUser).toBeDefined()
      expect(restoredUser.deletedAt).toBeNull()

      // Verify user is returned in normal queries
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      })

      expect(user).toBeDefined()
      expect(user?.id).toBe(testUser.id)
    })
  })
}) 