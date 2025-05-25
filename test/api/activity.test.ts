import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('User Activity', () => {
  let testUser: any
  let authToken: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcryptjs.hash('test123', 10)
    testUser = await prisma.user.upsert({
      where: { email: 'activity_test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Activity Test User',
        role: 'USER',
      },
      create: {
        email: 'activity_test@example.com',
        password: hashedPassword,
        name: 'Activity Test User',
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

  describe('Create Activity', () => {
    it('should create login activity', async () => {
      const activity = await prisma.activity.create({
        data: {
          userId: testUser.id,
          type: 'LOGIN',
          descr: 'User logged in',
        },
      })

      expect(activity).toBeDefined()
      expect(activity.userId).toBe(testUser.id)
      expect(activity.type).toBe('LOGIN')
      expect(activity.descr).toBe('User logged in')
      expect(activity.deletedAt).toBeNull()
    })

    it('should create activity with metadata', async () => {
      const activity = await prisma.activity.create({
        data: {
          userId: testUser.id,
          type: 'TRADE_ORDER',
          descr: 'Created trade order',
          metadata: {
            orderId: 123,
            symbol: 'BTC',
            amount: 1.5,
          },
        },
      })

      expect(activity).toBeDefined()
      expect(activity.userId).toBe(testUser.id)
      expect(activity.type).toBe('TRADE_ORDER')
      expect(activity.descr).toBe('Created trade order')
      expect(activity.metadata).toEqual({
        orderId: 123,
        symbol: 'BTC',
        amount: 1.5,
      })
      expect(activity.deletedAt).toBeNull()
    })
  })

  describe('Get Activities', () => {
    it('should get all activities for user', async () => {
      const activities = await prisma.activity.findMany({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      expect(Array.isArray(activities)).toBe(true)
      expect(activities.length).toBeGreaterThan(0)
      activities.forEach(activity => {
        expect(activity.userId).toBe(testUser.id)
        expect(activity.deletedAt).toBeNull()
      })
    })

    it('should get activities by type', async () => {
      const activities = await prisma.activity.findMany({
        where: {
          userId: testUser.id,
          type: 'LOGIN',
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      expect(Array.isArray(activities)).toBe(true)
      activities.forEach(activity => {
        expect(activity.userId).toBe(testUser.id)
        expect(activity.type).toBe('LOGIN')
        expect(activity.deletedAt).toBeNull()
      })
    })

    it('should get activity by id', async () => {
      const activity = await prisma.activity.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(activity).toBeDefined()
      if (!activity) return

      const foundActivity = await prisma.activity.findUnique({
        where: { id: activity.id },
      })

      expect(foundActivity).toBeDefined()
      expect(foundActivity?.id).toBe(activity.id)
      expect(foundActivity?.userId).toBe(testUser.id)
      expect(foundActivity?.deletedAt).toBeNull()
    })
  })

  describe('Delete Activity', () => {
    it('should soft delete activity', async () => {
      const activity = await prisma.activity.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(activity).toBeDefined()
      if (!activity) return

      const deletedActivity = await prisma.activity.update({
        where: { id: activity.id },
        data: { deletedAt: new Date() },
      })

      expect(deletedActivity).toBeDefined()
      expect(deletedActivity.deletedAt).not.toBeNull()

      // Verify activity is not returned in normal queries
      const foundActivity = await prisma.activity.findUnique({
        where: { id: activity.id },
      })

      expect(foundActivity).toBeNull()
    })
  })
}) 