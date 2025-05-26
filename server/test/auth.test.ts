import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { AuthService } from '../services/auth.service'
import { createError } from 'h3'

const prisma = new PrismaClient()
const authService = new AuthService()

// Тестовые данные
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User',
  role: 'USER' as const,
  settings: '{}'
}

describe('Auth Service', () => {
  beforeEach(async () => {
    await prisma.portfolio.deleteMany({ where: { user: { email: testUser.email } } })
    await prisma.user.deleteMany({ where: { email: testUser.email } })
  })

  afterEach(async () => {
    await prisma.portfolio.deleteMany({ where: { user: { email: testUser.email } } })
    await prisma.user.deleteMany({ where: { email: testUser.email } })
  })

  describe('register', () => {
    it('should register a new user', async () => {
      const result = await authService.register(testUser)
      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('user')
      expect(result.user).toHaveProperty('id')
      expect(result.user).toHaveProperty('email', testUser.email)
      expect(result.user).toHaveProperty('name', testUser.name)
      expect(result.user).toHaveProperty('role', testUser.role)
      expect(result.user).toHaveProperty('settings', testUser.settings)
      expect(result.user).not.toHaveProperty('password')
    })

    it('should not register user with existing email', async () => {
      await authService.register(testUser)
      await expect(authService.register(testUser)).rejects.toThrow('User already exists')
    })
  })

  describe('login', () => {
    it('should login with correct credentials', async () => {
      await authService.register(testUser)
      const result = await authService.login(testUser.email, testUser.password)
      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('user')
      expect(result.user).toHaveProperty('id')
      expect(result.user).toHaveProperty('email', testUser.email)
      expect(result.user).toHaveProperty('name', testUser.name)
      expect(result.user).toHaveProperty('role', testUser.role)
      expect(result.user).toHaveProperty('settings', testUser.settings)
      expect(result.user).not.toHaveProperty('password')
    })

    it('should not login with incorrect password', async () => {
      await authService.register(testUser)
      await expect(authService.login(testUser.email, 'wrongpassword')).rejects.toThrow('Invalid credentials')
    })

    it('should not login with non-existent email', async () => {
      await expect(authService.login('nonexistent@example.com', 'password')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('validateToken', () => {
    it('should validate correct token', async () => {
      await authService.register(testUser)
      const { token } = await authService.login(testUser.email, testUser.password)
      const user = await authService.validateToken(token)
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email', testUser.email)
      expect(user).toHaveProperty('name', testUser.name)
      expect(user).toHaveProperty('role', testUser.role)
      expect(user).toHaveProperty('settings', testUser.settings)
      expect(user).not.toHaveProperty('password')
    })

    it('should not validate incorrect token', async () => {
      await expect(authService.validateToken('invalid-token')).rejects.toThrow('Invalid token')
    })

    it('should not validate expired token', async () => {
      // Создаем токен с истекшим сроком действия
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      await expect(authService.validateToken(expiredToken)).rejects.toThrow('Invalid token')
    })
  })
}) 