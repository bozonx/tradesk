import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('Wallet', () => {
  let testUser: any
  let authToken: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcryptjs.hash('test123', 10)
    testUser = await prisma.user.upsert({
      where: { email: 'wallet_test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Wallet Test User',
        role: 'USER',
      },
      create: {
        email: 'wallet_test@example.com',
        password: hashedPassword,
        name: 'Wallet Test User',
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

  describe('Create Wallet', () => {
    it('should create wallet with all fields', async () => {
      const wallet = await prisma.wallet.create({
        data: {
          userId: testUser.id,
          name: 'Test Wallet',
          descr: 'Test wallet description',
          state: 'active',
        },
      })

      expect(wallet).toBeDefined()
      expect(wallet.userId).toBe(testUser.id)
      expect(wallet.name).toBe('Test Wallet')
      expect(wallet.descr).toBe('Test wallet description')
      expect(wallet.state).toBe('active')
      expect(wallet.deletedAt).toBeNull()
    })

    it('should create wallet with minimal data', async () => {
      const wallet = await prisma.wallet.create({
        data: {
          userId: testUser.id,
          name: 'Minimal Wallet',
          state: 'active',
        },
      })

      expect(wallet).toBeDefined()
      expect(wallet.userId).toBe(testUser.id)
      expect(wallet.name).toBe('Minimal Wallet')
      expect(wallet.state).toBe('active')
      expect(wallet.descr).toBeNull()
      expect(wallet.deletedAt).toBeNull()
    })
  })

  describe('Get Wallets', () => {
    it('should get all wallets for user', async () => {
      const wallets = await prisma.wallet.findMany({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(Array.isArray(wallets)).toBe(true)
      expect(wallets.length).toBeGreaterThan(0)
      wallets.forEach(wallet => {
        expect(wallet.userId).toBe(testUser.id)
        expect(wallet.deletedAt).toBeNull()
      })
    })

    it('should get wallet by id', async () => {
      const wallet = await prisma.wallet.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(wallet).toBeDefined()
      if (!wallet) return

      const foundWallet = await prisma.wallet.findUnique({
        where: { id: wallet.id },
      })

      expect(foundWallet).toBeDefined()
      expect(foundWallet?.id).toBe(wallet.id)
      expect(foundWallet?.userId).toBe(testUser.id)
      expect(foundWallet?.deletedAt).toBeNull()
    })
  })

  describe('Update Wallet', () => {
    it('should update wallet details', async () => {
      const wallet = await prisma.wallet.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(wallet).toBeDefined()
      if (!wallet) return

      const updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          name: 'Updated Wallet',
          descr: 'Updated wallet description',
          state: 'inactive',
        },
      })

      expect(updatedWallet).toBeDefined()
      expect(updatedWallet.id).toBe(wallet.id)
      expect(updatedWallet.name).toBe('Updated Wallet')
      expect(updatedWallet.descr).toBe('Updated wallet description')
      expect(updatedWallet.state).toBe('inactive')
    })
  })

  describe('Delete Wallet', () => {
    it('should soft delete wallet', async () => {
      const wallet = await prisma.wallet.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(wallet).toBeDefined()
      if (!wallet) return

      const deletedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { deletedAt: new Date() },
      })

      expect(deletedWallet).toBeDefined()
      expect(deletedWallet.deletedAt).not.toBeNull()

      // Verify wallet is not returned in normal queries
      const foundWallet = await prisma.wallet.findUnique({
        where: { id: wallet.id },
      })

      expect(foundWallet).toBeNull()
    })
  })
}) 