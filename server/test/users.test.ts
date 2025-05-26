import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { UserService } from '../services/user.service'
import { AuthService } from '../services/auth.service'

const prisma = new PrismaClient()
const userService = new UserService()
const authService = new AuthService()

// Тестовые данные
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User',
  role: 'USER' as const,
  settings: '{}'
}

let testUserId: number

describe('User Service', () => {
  beforeEach(async () => {
    // Очищаем тестовые данные перед каждым тестом
    await prisma.user.deleteMany({
      where: {
        email: testUser.email
      }
    })
    // Создаем тестового пользователя
    const user = await userService.createUser(testUser)
    testUserId = user.id
  })

  afterEach(async () => {
    // Очищаем тестовые данные после каждого теста
    await prisma.user.deleteMany({
      where: {
        email: testUser.email
      }
    })
  })

  describe('getAllUsers', () => {
    it('should get all users', async () => {
      const users = await userService.getAllUsers()
      expect(Array.isArray(users)).toBe(true)
      expect(users.length).toBeGreaterThan(0)
      expect(users[0]).toHaveProperty('id')
      expect(users[0]).toHaveProperty('email')
      expect(users[0]).toHaveProperty('name')
      expect(users[0]).toHaveProperty('role')
      expect(users[0]).toHaveProperty('settings')
      expect(users[0]).not.toHaveProperty('password')
    })
  })

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const user = await userService.getUserById(testUserId)
      expect(user).not.toBeNull()
      expect(user?.id).toBe(testUserId)
      expect(user?.email).toBe(testUser.email)
      expect(user?.name).toBe(testUser.name)
      expect(user?.role).toBe(testUser.role)
      expect(user?.settings).toBe(testUser.settings)
      expect(user).not.toHaveProperty('password')
    })

    it('should return null for non-existent user', async () => {
      const user = await userService.getUserById(999999)
      expect(user).toBeNull()
    })
  })

  describe('getUserByEmail', () => {
    it('should get user by email', async () => {
      const user = await userService.getUserByEmailPublic(testUser.email)
      expect(user).not.toBeNull()
      expect(user?.id).toBe(testUserId)
      expect(user?.email).toBe(testUser.email)
      expect(user?.name).toBe(testUser.name)
      expect(user?.role).toBe(testUser.role)
      expect(user?.settings).toBe(testUser.settings)
      expect(user).not.toHaveProperty('password')
    })

    it('should return null for non-existent email', async () => {
      const user = await userService.getUserByEmailPublic('nonexistent@example.com')
      expect(user).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user', async () => {
      const updateData = {
        name: 'Updated Test User',
        settings: '{"theme": "dark"}'
      }

      const user = await userService.updateUser(testUserId, updateData)
      expect(user).not.toBeNull()
      expect(user?.name).toBe(updateData.name)
      expect(user?.settings).toBe(updateData.settings)
      expect(user?.email).toBe(testUser.email) // email не должен измениться
      expect(user?.role).toBe(testUser.role) // role не должен измениться
      expect(user).not.toHaveProperty('password')
    })

    it('should return null for non-existent user', async () => {
      const user = await userService.updateUser(999999, { name: 'New Name' })
      expect(user).toBeNull()
    })
  })

  describe('deleteUser', () => {
    it('should delete user', async () => {
      // Проверяем, что пользователь существует
      const userBeforeDelete = await userService.getUserById(testUserId)
      expect(userBeforeDelete).not.toBeNull()

      const user = await userService.deleteUser(testUserId)
      expect(user).not.toBeNull()
      expect(user?.id).toBe(testUserId)
      expect(user?.deletedAt).not.toBeNull()

      // Проверяем, что пользователь помечен как удаленный
      const deletedUser = await userService.getUserById(testUserId)
      expect(deletedUser).toBeNull() // getUserById не должен возвращать удаленных пользователей
    })

    it('should return null for non-existent user', async () => {
      const user = await userService.deleteUser(999999)
      expect(user).toBeNull()
    })
  })
}) 