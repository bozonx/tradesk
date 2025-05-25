import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('Asset', () => {
  let testUser: any
  let authToken: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcryptjs.hash('test123', 10)
    testUser = await prisma.user.upsert({
      where: { email: 'asset_test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Asset Test User',
        role: 'USER',
      },
      create: {
        email: 'asset_test@example.com',
        password: hashedPassword,
        name: 'Asset Test User',
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

  describe('Create Asset', () => {
    it('should create crypto asset', async () => {
      const asset = await prisma.asset.create({
        data: {
          ticker: 'BTC',
          type: 'CRYPTO',
        },
      })

      expect(asset).toBeDefined()
      expect(asset.ticker).toBe('BTC')
      expect(asset.type).toBe('CRYPTO')
      expect(asset.deletedAt).toBeNull()
    })

    it('should create stock asset', async () => {
      const asset = await prisma.asset.create({
        data: {
          ticker: 'AAPL',
          type: 'STOCK',
        },
      })

      expect(asset).toBeDefined()
      expect(asset.ticker).toBe('AAPL')
      expect(asset.type).toBe('STOCK')
      expect(asset.deletedAt).toBeNull()
    })
  })

  describe('Get Assets', () => {
    it('should get all non-deleted assets', async () => {
      const assets = await prisma.asset.findMany({
        where: {
          deletedAt: null,
        },
      })

      expect(Array.isArray(assets)).toBe(true)
      expect(assets.length).toBeGreaterThan(0)
      assets.forEach(asset => {
        expect(asset.deletedAt).toBeNull()
      })
    })

    it('should get assets by type', async () => {
      const assets = await prisma.asset.findMany({
        where: {
          type: 'CRYPTO',
          deletedAt: null,
        },
      })

      expect(Array.isArray(assets)).toBe(true)
      assets.forEach(asset => {
        expect(asset.type).toBe('CRYPTO')
        expect(asset.deletedAt).toBeNull()
      })
    })

    it('should get asset by ticker', async () => {
      const asset = await prisma.asset.findFirst({
        where: {
          ticker: 'BTC',
          deletedAt: null,
        },
      })

      expect(asset).toBeDefined()
      if (!asset) return

      const foundAsset = await prisma.asset.findUnique({
        where: { id: asset.id },
      })

      expect(foundAsset).toBeDefined()
      expect(foundAsset?.ticker).toBe('BTC')
      expect(foundAsset?.type).toBe('CRYPTO')
      expect(foundAsset?.deletedAt).toBeNull()
    })
  })

  describe('Update Asset', () => {
    it('should update asset description', async () => {
      const asset = await prisma.asset.findFirst({
        where: {
          ticker: 'BTC',
          deletedAt: null,
        },
      })

      expect(asset).toBeDefined()
      if (!asset) return

      const updatedAsset = await prisma.asset.update({
        where: { id: asset.id },
        data: {
          descr: 'Bitcoin cryptocurrency',
        },
      })

      expect(updatedAsset).toBeDefined()
      expect(updatedAsset.id).toBe(asset.id)
      expect(updatedAsset.descr).toBe('Bitcoin cryptocurrency')
    })
  })

  describe('Delete Asset', () => {
    it('should soft delete asset', async () => {
      const asset = await prisma.asset.findFirst({
        where: {
          ticker: 'BTC',
          deletedAt: null,
        },
      })

      expect(asset).toBeDefined()
      if (!asset) return

      const deletedAsset = await prisma.asset.update({
        where: { id: asset.id },
        data: { deletedAt: new Date() },
      })

      expect(deletedAsset).toBeDefined()
      expect(deletedAsset.deletedAt).not.toBeNull()

      // Verify asset is not returned in normal queries
      const foundAsset = await prisma.asset.findUnique({
        where: { id: asset.id },
      })

      expect(foundAsset).toBeNull()
    })
  })
}) 