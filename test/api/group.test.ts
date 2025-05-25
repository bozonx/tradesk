import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('Group', () => {
  let testUser: any
  let authToken: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcryptjs.hash('test123', 10)
    testUser = await prisma.user.upsert({
      where: { email: 'group_test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Group Test User',
        role: 'USER',
      },
      create: {
        email: 'group_test@example.com',
        password: hashedPassword,
        name: 'Group Test User',
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

  describe('Create Group', () => {
    it('should create a portfolio group', async () => {
      const groupData = {
        type: 'PORTFOLIO',
        name: 'Test Portfolio Group',
        descr: 'Test group for portfolios',
      }

      const group = await prisma.group.create({
        data: groupData,
        include: {
          portfolios: true,
          positions: true,
          strategies: true,
        },
      })

      expect(group).toBeDefined()
      expect(group.type).toBe(groupData.type)
      expect(group.name).toBe(groupData.name)
      expect(group.descr).toBe(groupData.descr)
      expect(Array.isArray(group.portfolios)).toBe(true)
      expect(Array.isArray(group.positions)).toBe(true)
      expect(Array.isArray(group.strategies)).toBe(true)
    })

    it('should create a strategy group', async () => {
      const groupData = {
        type: 'STRATEGY',
        name: 'Test Strategy Group',
        descr: 'Test group for strategies',
      }

      const group = await prisma.group.create({
        data: groupData,
        include: {
          portfolios: true,
          positions: true,
          strategies: true,
        },
      })

      expect(group).toBeDefined()
      expect(group.type).toBe(groupData.type)
      expect(group.name).toBe(groupData.name)
      expect(group.descr).toBe(groupData.descr)
    })

    it('should create a position group', async () => {
      const groupData = {
        type: 'POSITION',
        name: 'Test Position Group',
        descr: 'Test group for positions',
      }

      const group = await prisma.group.create({
        data: groupData,
        include: {
          portfolios: true,
          positions: true,
          strategies: true,
        },
      })

      expect(group).toBeDefined()
      expect(group.type).toBe(groupData.type)
      expect(group.name).toBe(groupData.name)
      expect(group.descr).toBe(groupData.descr)
    })
  })

  describe('Get Groups', () => {
    it('should get all groups', async () => {
      const groups = await prisma.group.findMany({
        include: {
          portfolios: true,
          positions: true,
          strategies: true,
        },
      })

      expect(Array.isArray(groups)).toBe(true)
      expect(groups.length).toBeGreaterThan(0)
      groups.forEach(group => {
        expect(group.type).toBeDefined()
        expect(['PORTFOLIO', 'STRATEGY', 'POSITION']).toContain(group.type)
        expect(group.name).toBeDefined()
        expect(Array.isArray(group.portfolios)).toBe(true)
        expect(Array.isArray(group.positions)).toBe(true)
        expect(Array.isArray(group.strategies)).toBe(true)
      })
    })

    it('should get groups by type', async () => {
      const portfolioGroups = await prisma.group.findMany({
        where: { type: 'PORTFOLIO' },
        include: {
          portfolios: true,
          positions: true,
          strategies: true,
        },
      })

      expect(Array.isArray(portfolioGroups)).toBe(true)
      portfolioGroups.forEach(group => {
        expect(group.type).toBe('PORTFOLIO')
      })
    })
  })

  describe('Update Group', () => {
    it('should update group', async () => {
      const group = await prisma.group.findFirst()
      expect(group).toBeDefined()
      if (!group) return

      const updateData = {
        name: 'Updated Group Name',
        descr: 'Updated group description',
      }

      const updatedGroup = await prisma.group.update({
        where: { id: group.id },
        data: updateData,
        include: {
          portfolios: true,
          positions: true,
          strategies: true,
        },
      })

      expect(updatedGroup).toBeDefined()
      expect(updatedGroup.name).toBe(updateData.name)
      expect(updatedGroup.descr).toBe(updateData.descr)
    })
  })

  describe('Delete Group', () => {
    it('should delete group', async () => {
      const group = await prisma.group.findFirst()
      expect(group).toBeDefined()
      if (!group) return

      await prisma.group.delete({
        where: { id: group.id },
      })

      const deletedGroup = await prisma.group.findUnique({
        where: { id: group.id },
      })

      expect(deletedGroup).toBeNull()
    })
  })
}) 