import { describe, it, expect, beforeEach } from 'vitest'
import { PortfolioService } from '../services/portfolio.service'
import { UserService } from '../services/user.service'
import { AuthService } from '../services/auth.service'
import { prisma } from './setup'
import { testUsers, testPortfolios } from './testData'
import type { TestUserResult } from './types'

const portfolioService = new PortfolioService()
const userService = new UserService()
const authService = new AuthService()

let userId1: number
let userId2: number
let portfolioId: number

// Вспомогательная функция для пересоздания пользователя
async function ensureUser(userData: typeof testUsers[0]): Promise<number> {
  let user = await userService.getUserByEmailPublic(userData.email)
  if (!user) {
    const reg = await authService.register(userData) as TestUserResult
    return reg.user.id
  }
  return user.id
}

describe('Portfolio Service', () => {
  beforeEach(async () => {
    // Создаем тестовых пользователей
    userId1 = await ensureUser(testUsers[0])
    userId2 = await ensureUser(testUsers[1])
    testPortfolios[0].userId = userId1
    testPortfolios[1].userId = userId2
  })

  describe('createPortfolio', () => {
    it('should create portfolio with valid data', async () => {
      const portfolio = await portfolioService.createPortfolio(testPortfolios[0])
      expect(portfolio).toHaveProperty('name', testPortfolios[0].name)
      expect(portfolio).toHaveProperty('descr', testPortfolios[0].descr)
      expect(portfolio).toHaveProperty('userId', userId1)
      expect(portfolio).toHaveProperty('isArchived', testPortfolios[0].isArchived)
      expect(portfolio).toHaveProperty('createdAt')
      expect(portfolio).toHaveProperty('updatedAt')
      expect(portfolio.deletedAt).toBeNull()
      portfolioId = portfolio.id
    })

    it('should not create portfolio with invalid data', async () => {
      const invalidPortfolio = {
        ...testPortfolios[0],
        name: '',
        userId: userId1
      }
      await expect(portfolioService.createPortfolio(invalidPortfolio)).rejects.toThrow()
    })

    it('should not create portfolio with duplicate name for same user', async () => {
      await portfolioService.createPortfolio(testPortfolios[0])
      await expect(portfolioService.createPortfolio(testPortfolios[0])).rejects.toThrow('Portfolio with this name already exists')
    })

    it('should create portfolio with same name for different user', async () => {
      await portfolioService.createPortfolio(testPortfolios[0])
      const portfolio = await portfolioService.createPortfolio({
        ...testPortfolios[0],
        userId: userId2
      })
      expect(portfolio).toHaveProperty('name', testPortfolios[0].name)
      expect(portfolio).toHaveProperty('userId', userId2)
    })

    it('should not create portfolio for non-existent user', async () => {
      await expect(portfolioService.createPortfolio({
        ...testPortfolios[0],
        userId: 999999
      })).rejects.toThrow('User not found')
    })
  })

  describe('getUserPortfolios', () => {
    it('should get user portfolios', async () => {
      await portfolioService.createPortfolio(testPortfolios[0])
      const portfolios = await portfolioService.getUserPortfolios(userId1)
      expect(Array.isArray(portfolios)).toBe(true)
      expect(portfolios.length).toBeGreaterThan(0)
      expect(portfolios[0]).toHaveProperty('name', testPortfolios[0].name)
      expect(portfolios[0]).toHaveProperty('descr', testPortfolios[0].descr)
      expect(portfolios[0]).toHaveProperty('userId', userId1)
      expect(portfolios[0]).toHaveProperty('isArchived', testPortfolios[0].isArchived)
      expect(portfolios[0]).toHaveProperty('createdAt')
      expect(portfolios[0]).toHaveProperty('updatedAt')
      expect(portfolios[0].deletedAt).toBeNull()
    })

    it('should return empty array for non-existent user', async () => {
      const portfolios = await portfolioService.getUserPortfolios(999999)
      expect(Array.isArray(portfolios)).toBe(true)
      expect(portfolios.length).toBe(0)
    })

    it('should not return portfolios of other users', async () => {
      await portfolioService.createPortfolio({ ...testPortfolios[0], userId: userId2 })
      const portfolios = await portfolioService.getUserPortfolios(userId2)
      expect(Array.isArray(portfolios)).toBe(true)
      expect(portfolios.length).toBe(1)
      expect(portfolios[0].userId).toBe(userId2)
    })
  })

  describe('getPortfolioById', () => {
    it('should get portfolio by id', async () => {
      const created = await portfolioService.createPortfolio(testPortfolios[0])
      const portfolio = await portfolioService.getPortfolioById(created.id)
      expect(portfolio).not.toBeNull()
      expect(portfolio?.id).toBe(created.id)
      expect(portfolio?.name).toBe(testPortfolios[0].name)
      expect(portfolio?.descr).toBe(testPortfolios[0].descr)
      expect(portfolio?.userId).toBe(userId1)
      expect(portfolio?.isArchived).toBe(testPortfolios[0].isArchived)
      expect(portfolio).toHaveProperty('createdAt')
      expect(portfolio).toHaveProperty('updatedAt')
      expect(portfolio?.deletedAt).toBeNull()
    })

    it('should return null for non-existent portfolio', async () => {
      const portfolio = await portfolioService.getPortfolioById(999999)
      expect(portfolio).toBeNull()
    })
  })

  describe('updatePortfolio', () => {
    it('should update portfolio with valid data', async () => {
      const created = await portfolioService.createPortfolio(testPortfolios[0])
      const updateData = {
        name: 'Updated Test Portfolio',
        descr: 'Updated test portfolio description'
      }
      const portfolio = await portfolioService.updatePortfolio(created.id, updateData)
      expect(portfolio).not.toBeNull()
      expect(portfolio?.name).toBe(updateData.name)
      expect(portfolio?.descr).toBe(updateData.descr)
      expect(portfolio?.userId).toBe(userId1)
      expect(portfolio?.isArchived).toBe(testPortfolios[0].isArchived)
    })

    it('should not update portfolio with invalid data', async () => {
      const created = await portfolioService.createPortfolio(testPortfolios[0])
      const updateData = {
        name: ''
      }
      await expect(portfolioService.updatePortfolio(created.id, updateData)).rejects.toThrow()
    })

    it('should return null for non-existent portfolio', async () => {
      const portfolio = await portfolioService.updatePortfolio(999999, { name: 'New Name' })
      expect(portfolio).toBeNull()
    })

    it('should not update portfolio with duplicate name', async () => {
      await portfolioService.createPortfolio({ ...testPortfolios[0], name: 'First Portfolio', userId: userId1 })
      const second = await portfolioService.createPortfolio({ ...testPortfolios[0], name: 'Second Portfolio', userId: userId1 })
      await expect(portfolioService.updatePortfolio(second.id, { name: 'First Portfolio' })).rejects.toThrow('Portfolio with this name already exists')
    })

    it('should update portfolio archive status', async () => {
      const created = await portfolioService.createPortfolio(testPortfolios[0])
      const portfolio = await portfolioService.updatePortfolio(created.id, { isArchived: true })
      expect(portfolio).not.toBeNull()
      expect(portfolio?.isArchived).toBe(true)
      // Проверяем, что портфолио не возвращается в списке активных
      const activePortfolios = await portfolioService.getUserPortfolios(userId1)
      expect(activePortfolios.find(p => p.id === created.id)).toBeUndefined()
    })
  })

  describe('deletePortfolio', () => {
    it('should delete portfolio', async () => {
      const created = await portfolioService.createPortfolio(testPortfolios[0])
      const portfolioBeforeDelete = await portfolioService.getPortfolioById(created.id)
      expect(portfolioBeforeDelete).not.toBeNull()
      const portfolio = await portfolioService.deletePortfolio(created.id)
      expect(portfolio).not.toBeNull()
      expect(portfolio?.id).toBe(created.id)
      expect(portfolio?.deletedAt).not.toBeNull()
      // Проверяем, что портфолио помечено как удаленное
      const deletedPortfolio = await portfolioService.getPortfolioById(created.id)
      expect(deletedPortfolio).toBeNull()
    })

    it('should return null for non-existent portfolio', async () => {
      const portfolio = await portfolioService.deletePortfolio(999999)
      expect(portfolio).toBeNull()
    })
  })
}) 