import { describe, it, expect, beforeAll } from 'vitest'
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
      },
      create: {
        email: 'settings_test@example.com',
        password: hashedPassword,
        name: 'Settings Test User',
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

  describe('Get Settings', () => {
    it('should get user settings', async () => {
      const settings = await prisma.userSettings.findUnique({
        where: { userId: testUser.id },
      })

      expect(settings).toBeDefined()
      expect(settings?.userId).toBe(testUser.id)
    })
  })

  describe('Update Settings', () => {
    it('should update all settings', async () => {
      const updatedSettings = await prisma.userSettings.update({
        where: { userId: testUser.id },
        data: {
          theme: 'dark',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            desktop: true,
          },
        },
      })

      expect(updatedSettings).toBeDefined()
      expect(updatedSettings.theme).toBe('dark')
      expect(updatedSettings.language).toBe('en')
      expect(updatedSettings.timezone).toBe('UTC')
      expect(updatedSettings.notifications).toEqual({
        email: true,
        push: true,
        desktop: true,
      })
    })

    it('should update partial settings', async () => {
      const updatedSettings = await prisma.userSettings.update({
        where: { userId: testUser.id },
        data: {
          theme: 'light',
          notifications: {
            email: false,
          },
        },
      })

      expect(updatedSettings).toBeDefined()
      expect(updatedSettings.theme).toBe('light')
      expect(updatedSettings.language).toBe('en') // Should remain unchanged
      expect(updatedSettings.timezone).toBe('UTC') // Should remain unchanged
      expect(updatedSettings.notifications).toEqual({
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

      const resetSettings = await prisma.userSettings.update({
        where: { userId: testUser.id },
        data: defaultSettings,
      })

      expect(resetSettings).toBeDefined()
      expect(resetSettings.theme).toBe(defaultSettings.theme)
      expect(resetSettings.language).toBe(defaultSettings.language)
      expect(resetSettings.timezone).toBe(defaultSettings.timezone)
      expect(resetSettings.notifications).toEqual(defaultSettings.notifications)
    })
  })
}) 