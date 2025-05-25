import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

describe('Transaction', () => {
  let testUser: any
  let testPortfolio: any
  let testPosition: any
  let testWallet: any
  let testAsset: any
  let authToken: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcryptjs.hash('test123', 10)
    testUser = await prisma.user.upsert({
      where: { email: 'transaction_test@example.com' },
      update: {
        password: hashedPassword,
        name: 'Transaction Test User',
        role: 'USER',
      },
      create: {
        email: 'transaction_test@example.com',
        password: hashedPassword,
        name: 'Transaction Test User',
        role: 'USER',
      },
    })

    // Create test portfolio
    testPortfolio = await prisma.portfolio.create({
      data: {
        userId: testUser.id,
        name: 'Test Portfolio',
        descr: 'Test portfolio for transactions',
        state: 'active',
      },
    })

    // Create test position
    testPosition = await prisma.position.create({
      data: {
        userId: testUser.id,
        type: 'LONG',
        descr: 'Test position for transactions',
        portfolioId: testPortfolio.id,
      },
    })

    // Create test wallet
    testWallet = await prisma.wallet.create({
      data: {
        userId: testUser.id,
        name: 'Test Wallet',
        descr: 'Test wallet for transactions',
        state: 'active',
      },
    })

    // Create test asset
    testAsset = await prisma.asset.create({
      data: {
        ticker: 'BTC',
        type: 'CRYPTO',
      },
    })

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  })

  describe('Create Transaction', () => {
    it('should create transaction with all fields', async () => {
      const transaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          type: 'BUY',
          amount: 1.5,
          price: 50000,
          fee: 10,
          descr: 'Test transaction',
          portfolioId: testPortfolio.id,
          positionId: testPosition.id,
          walletId: testWallet.id,
          assetId: testAsset.id,
        },
      })

      expect(transaction).toBeDefined()
      expect(transaction.userId).toBe(testUser.id)
      expect(transaction.type).toBe('BUY')
      expect(transaction.amount).toBe(1.5)
      expect(transaction.price).toBe(50000)
      expect(transaction.fee).toBe(10)
      expect(transaction.descr).toBe('Test transaction')
      expect(transaction.portfolioId).toBe(testPortfolio.id)
      expect(transaction.positionId).toBe(testPosition.id)
      expect(transaction.walletId).toBe(testWallet.id)
      expect(transaction.assetId).toBe(testAsset.id)
      expect(transaction.deletedAt).toBeNull()
    })

    it('should create transaction without position', async () => {
      const transaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          type: 'SELL',
          amount: 0.5,
          price: 55000,
          fee: 5,
          descr: 'Test transaction without position',
          portfolioId: testPortfolio.id,
          walletId: testWallet.id,
          assetId: testAsset.id,
        },
      })

      expect(transaction).toBeDefined()
      expect(transaction.userId).toBe(testUser.id)
      expect(transaction.type).toBe('SELL')
      expect(transaction.amount).toBe(0.5)
      expect(transaction.price).toBe(55000)
      expect(transaction.fee).toBe(5)
      expect(transaction.descr).toBe('Test transaction without position')
      expect(transaction.portfolioId).toBe(testPortfolio.id)
      expect(transaction.positionId).toBeNull()
      expect(transaction.walletId).toBe(testWallet.id)
      expect(transaction.assetId).toBe(testAsset.id)
      expect(transaction.deletedAt).toBeNull()
    })
  })

  describe('Get Transactions', () => {
    it('should get all transactions for user', async () => {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
        include: {
          portfolio: true,
          position: true,
          wallet: true,
          asset: true,
        },
      })

      expect(Array.isArray(transactions)).toBe(true)
      expect(transactions.length).toBeGreaterThan(0)
      transactions.forEach(transaction => {
        expect(transaction.userId).toBe(testUser.id)
        expect(transaction.deletedAt).toBeNull()
        expect(transaction.portfolio).toBeDefined()
        expect(transaction.wallet).toBeDefined()
        expect(transaction.asset).toBeDefined()
      })
    })

    it('should get transaction by id', async () => {
      const transaction = await prisma.transaction.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(transaction).toBeDefined()
      if (!transaction) return

      const foundTransaction = await prisma.transaction.findUnique({
        where: { id: transaction.id },
        include: {
          portfolio: true,
          position: true,
          wallet: true,
          asset: true,
        },
      })

      expect(foundTransaction).toBeDefined()
      expect(foundTransaction?.id).toBe(transaction.id)
      expect(foundTransaction?.userId).toBe(testUser.id)
      expect(foundTransaction?.deletedAt).toBeNull()
      expect(foundTransaction?.portfolio).toBeDefined()
      expect(foundTransaction?.wallet).toBeDefined()
      expect(foundTransaction?.asset).toBeDefined()
    })
  })

  describe('Update Transaction', () => {
    it('should update transaction details', async () => {
      const transaction = await prisma.transaction.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(transaction).toBeDefined()
      if (!transaction) return

      const updatedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          amount: 2.0,
          price: 52000,
          fee: 15,
          descr: 'Updated transaction',
        },
      })

      expect(updatedTransaction).toBeDefined()
      expect(updatedTransaction.id).toBe(transaction.id)
      expect(updatedTransaction.amount).toBe(2.0)
      expect(updatedTransaction.price).toBe(52000)
      expect(updatedTransaction.fee).toBe(15)
      expect(updatedTransaction.descr).toBe('Updated transaction')
    })
  })

  describe('Delete Transaction', () => {
    it('should soft delete transaction', async () => {
      const transaction = await prisma.transaction.findFirst({
        where: {
          userId: testUser.id,
          deletedAt: null,
        },
      })

      expect(transaction).toBeDefined()
      if (!transaction) return

      const deletedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: { deletedAt: new Date() },
      })

      expect(deletedTransaction).toBeDefined()
      expect(deletedTransaction.deletedAt).not.toBeNull()

      // Verify transaction is not returned in normal queries
      const foundTransaction = await prisma.transaction.findUnique({
        where: { id: transaction.id },
      })

      expect(foundTransaction).toBeNull()
    })
  })
}) 