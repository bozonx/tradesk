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
          type: 'CRYP',
        },
      })

      expect(asset).toBeDefined()
      expect(asset.ticker).toBe('BTC')
      expect(asset.type).toBe('CRYP')
    })

    it('should create stock asset', async () => {
      const asset = await prisma.asset.create({
        data: {
          ticker: 'AAPL',
          type: 'STOK',
        },
      })

      expect(asset).toBeDefined()
      expect(asset.ticker).toBe('AAPL')
      expect(asset.type).toBe('STOK')
    })
  })

  describe('Get Assets', () => {
    it('should get all assets', async () => {
      const assets = await prisma.asset.findMany()

      expect(Array.isArray(assets)).toBe(true)
      expect(assets.length).toBeGreaterThan(0)
    })

    it('should get assets by type', async () => {
      const assets = await prisma.asset.findMany({
        where: {
          type: 'CRYP',
        },
      })

      expect(Array.isArray(assets)).toBe(true)
      assets.forEach(asset => {
        expect(asset.type).toBe('CRYP')
      })
    })

    it('should get asset by ticker', async () => {
      const asset = await prisma.asset.findFirst({
        where: {
          ticker: 'BTC',
        },
      })

      expect(asset).toBeDefined()
      if (!asset) return

      const foundAsset = await prisma.asset.findUnique({
        where: { id: asset.id },
      })

      expect(foundAsset).toBeDefined()
      expect(foundAsset?.ticker).toBe('BTC')
      expect(foundAsset?.type).toBe('CRYP')
    })
  })

  describe('Delete Asset', () => {
    it('should delete asset', async () => {
      const asset = await prisma.asset.findFirst({
        where: {
          ticker: 'BTC',
        },
      })

      expect(asset).toBeDefined()
      if (!asset) return

      const deletedAsset = await prisma.asset.delete({
        where: { id: asset.id },
      })

      expect(deletedAsset).toBeDefined()

      // Verify asset is not returned in queries
      const foundAsset = await prisma.asset.findUnique({
        where: { id: asset.id },
      })

      expect(foundAsset).toBeNull()
    })
  })
}) 