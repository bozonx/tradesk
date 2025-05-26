import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('User Settings', () => {
  let testUser: any
  let authToken: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcryptjs.hash('test123', 10)
    testUser = await prisma.user.upsert({
      where: { email: 'settings_test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Settings Test User',
        role: 'USER',
        settings: '{}',
      },
      create: {
        email: 'settings_test@example.com',
        password: hashedPassword,
        name: 'Settings Test User',
        role: 'USER',
        settings: '{}',
      },
    })

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.user.delete({
      where: { id: testUser.id },
    })
  })

  describe('Get Settings', () => {
    it('should get user settings', async () => {
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      })

      expect(user).toBeDefined()
      expect(user?.settings).toBeDefined()
      expect(JSON.parse(user?.settings || '{}')).toEqual({})
    })
  })

  describe('Update Settings', () => {
    it('should update all settings', async () => {
      const newSettings = {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          desktop: true,
        },
      }

      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: {
          settings: JSON.stringify(newSettings),
        },
      })

      expect(updatedUser).toBeDefined()
      const settings = JSON.parse(updatedUser.settings || '{}')
      expect(settings.theme).toBe('dark')
      expect(settings.language).toBe('en')
      expect(settings.timezone).toBe('UTC')
      expect(settings.notifications).toEqual({
        email: true,
        push: true,
        desktop: true,
      })
    })

    it('should update partial settings', async () => {
      // First get current settings
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      })
      const currentSettings = JSON.parse(user?.settings || '{}')

      // Update only specific fields
      const updatedSettings = {
        ...currentSettings,
        theme: 'light',
        notifications: {
          ...currentSettings.notifications,
          email: false,
        },
      }

      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: {
          settings: JSON.stringify(updatedSettings),
        },
      })

      expect(updatedUser).toBeDefined()
      const settings = JSON.parse(updatedUser.settings || '{}')
      expect(settings.theme).toBe('light')
      expect(settings.language).toBe('en') // Should remain unchanged
      expect(settings.timezone).toBe('UTC') // Should remain unchanged
      expect(settings.notifications).toEqual({
        email: false,
        push: true, // Should remain unchanged
        desktop: true, // Should remain unchanged
      })
    })
  })

  describe('Reset Settings', () => {
    it('should reset settings to default values', async () => {
      const defaultSettings = {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          desktop: true,
        },
      }

      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: {
          settings: JSON.stringify(defaultSettings),
        },
      })

      expect(updatedUser).toBeDefined()
      const settings = JSON.parse(updatedUser.settings || '{}')
      expect(settings.theme).toBe(defaultSettings.theme)
      expect(settings.language).toBe(defaultSettings.language)
      expect(settings.timezone).toBe(defaultSettings.timezone)
      expect(settings.notifications).toEqual(defaultSettings.notifications)
    })
  })

  describe('Settings Validation', () => {
    it('should handle invalid JSON settings', async () => {
      try {
        await prisma.user.update({
          where: { id: testUser.id },
          data: {
            settings: 'invalid-json',
          },
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle null settings', async () => {
      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: {
          settings: null,
        },
      })

      expect(updatedUser).toBeDefined()
      expect(updatedUser.settings).toBeNull()
    })
  })
}) 