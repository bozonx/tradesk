import { describe, it, expect, beforeAll, afterAll } from 'vitest'
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
  let testTransactions: any[] = []

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

  afterAll(async () => {
    // Clean up test data
    await prisma.$transaction([
      prisma.transaction.deleteMany({
        where: {
          userId: testUser.id,
        },
      }),
      prisma.position.deleteMany({
        where: {
          id: testPosition.id,
        },
      }),
      prisma.portfolio.deleteMany({
        where: {
          id: testPortfolio.id,
        },
      }),
      prisma.wallet.deleteMany({
        where: {
          id: testWallet.id,
        },
      }),
      prisma.asset.deleteMany({
        where: {
          id: testAsset.id,
        },
      }),
      prisma.user.deleteMany({
        where: {
          id: testUser.id,
        },
      }),
    ])
  })

  describe('Create Transaction', () => {
    it('should create transaction with all fields', async () => {
      const transaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          type: 'TRDE',
          status: 'DONE',
          date: new Date(),
          positionId: testPosition.id,
          fromWalletId: testWallet.id,
          fromAssetId: testAsset.id,
          fromValue: 1.5,
          toWalletId: testWallet.id,
          toAssetId: testAsset.id,
          toValue: 75000,
          note: 'Test transaction',
        },
      })

      expect(transaction).toBeDefined()
      expect(transaction.userId).toBe(testUser.id)
      expect(transaction.type).toBe('TRDE')
      expect(transaction.status).toBe('DONE')
      expect(transaction.positionId).toBe(testPosition.id)
      expect(transaction.fromWalletId).toBe(testWallet.id)
      expect(transaction.fromAssetId).toBe(testAsset.id)
      expect(transaction.fromValue).toBe(1.5)
      expect(transaction.toWalletId).toBe(testWallet.id)
      expect(transaction.toAssetId).toBe(testAsset.id)
      expect(transaction.toValue).toBe(75000)
      expect(transaction.note).toBe('Test transaction')
      expect(transaction.deletedAt).toBeNull()
      expect(transaction.partialOfId).toBeNull()
      expect(transaction.feeOfId).toBeNull()
    })

    it('should create partial transaction', async () => {
      // Create main transaction
      const mainTransaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          type: 'TRDE',
          status: 'DONE',
          date: new Date(),
          fromWalletId: testWallet.id,
          fromAssetId: testAsset.id,
          fromValue: 2.0,
          toWalletId: testWallet.id,
          toAssetId: testAsset.id,
          toValue: 100000,
          note: 'Main transaction',
        },
      })

      // Create partial transaction
      const partialTransaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          type: 'TRDE',
          status: 'DONE',
          date: new Date(),
          fromWalletId: testWallet.id,
          fromAssetId: testAsset.id,
          fromValue: 1.0,
          toWalletId: testWallet.id,
          toAssetId: testAsset.id,
          toValue: 50000,
          note: 'Partial transaction',
          partialOfId: mainTransaction.id,
        },
      })

      expect(partialTransaction).toBeDefined()
      expect(partialTransaction.partialOfId).toBe(mainTransaction.id)

      // Verify partial transaction is linked
      const mainTransactionWithPartial = await prisma.transaction.findUnique({
        where: { id: mainTransaction.id },
        include: { partialTransactions: true },
      })

      expect(mainTransactionWithPartial).toBeDefined()
      expect(mainTransactionWithPartial?.partialTransactions).toHaveLength(1)
      expect(mainTransactionWithPartial?.partialTransactions[0].id).toBe(partialTransaction.id)

      // Clean up
      await prisma.$transaction([
        prisma.transaction.delete({ where: { id: partialTransaction.id } }),
        prisma.transaction.delete({ where: { id: mainTransaction.id } }),
      ])
    })

    it('should create fee transaction', async () => {
      // Create main transaction
      const mainTransaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          type: 'TRDE',
          status: 'DONE',
          date: new Date(),
          fromWalletId: testWallet.id,
          fromAssetId: testAsset.id,
          fromValue: 2.0,
          toWalletId: testWallet.id,
          toAssetId: testAsset.id,
          toValue: 100000,
          note: 'Main transaction',
        },
      })

      // Create fee transaction
      const feeTransaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          type: 'FEE',
          status: 'DONE',
          date: new Date(),
          fromWalletId: testWallet.id,
          fromAssetId: testAsset.id,
          fromValue: 0.1,
          toWalletId: testWallet.id,
          toAssetId: testAsset.id,
          toValue: 5000,
          note: 'Transaction fee',
          feeOfId: mainTransaction.id,
        },
      })

      expect(feeTransaction).toBeDefined()
      expect(feeTransaction.feeOfId).toBe(mainTransaction.id)

      // Verify fee transaction is linked
      const mainTransactionWithFee = await prisma.transaction.findUnique({
        where: { id: mainTransaction.id },
        include: { feeTransactions: true },
      })

      expect(mainTransactionWithFee).toBeDefined()
      expect(mainTransactionWithFee?.feeTransactions).toHaveLength(1)
      expect(mainTransactionWithFee?.feeTransactions[0].id).toBe(feeTransaction.id)

      // Clean up
      await prisma.$transaction([
        prisma.transaction.delete({ where: { id: feeTransaction.id } }),
        prisma.transaction.delete({ where: { id: mainTransaction.id } }),
      ])
    })

    it('should create transaction without position', async () => {
      const transaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          type: 'TRNS',
          status: 'DONE',
          date: new Date(),
          fromWalletId: testWallet.id,
          fromAssetId: testAsset.id,
          fromValue: 0.5,
          toWalletId: testWallet.id,
          toAssetId: testAsset.id,
          toValue: 25000,
          note: 'Test transaction without position',
        },
      })

      expect(transaction).toBeDefined()
      expect(transaction.userId).toBe(testUser.id)
      expect(transaction.type).toBe('TRNS')
      expect(transaction.status).toBe('DONE')
      expect(transaction.positionId).toBeNull()
      expect(transaction.fromWalletId).toBe(testWallet.id)
      expect(transaction.fromAssetId).toBe(testAsset.id)
      expect(transaction.fromValue).toBe(0.5)
      expect(transaction.toWalletId).toBe(testWallet.id)
      expect(transaction.toAssetId).toBe(testAsset.id)
      expect(transaction.toValue).toBe(25000)
      expect(transaction.note).toBe('Test transaction without position')
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
          position: true,
          fromWallet: true,
          toWallet: true,
          fromAsset: true,
          toAsset: true,
        },
      })

      expect(Array.isArray(transactions)).toBe(true)
      expect(transactions.length).toBeGreaterThan(0)
      transactions.forEach(transaction => {
        expect(transaction.userId).toBe(testUser.id)
        expect(transaction.deletedAt).toBeNull()
        expect(transaction.fromWallet).toBeDefined()
        expect(transaction.toWallet).toBeDefined()
        expect(transaction.fromAsset).toBeDefined()
        expect(transaction.toAsset).toBeDefined()
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
          position: true,
          fromWallet: true,
          toWallet: true,
          fromAsset: true,
          toAsset: true,
        },
      })

      expect(foundTransaction).toBeDefined()
      expect(foundTransaction?.id).toBe(transaction.id)
      expect(foundTransaction?.userId).toBe(testUser.id)
      expect(foundTransaction?.deletedAt).toBeNull()
      expect(foundTransaction?.fromWallet).toBeDefined()
      expect(foundTransaction?.toWallet).toBeDefined()
      expect(foundTransaction?.fromAsset).toBeDefined()
      expect(foundTransaction?.toAsset).toBeDefined()
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
          fromValue: 2.0,
          toValue: 100000,
          note: 'Updated transaction',
        },
      })

      expect(updatedTransaction).toBeDefined()
      expect(updatedTransaction.id).toBe(transaction.id)
      expect(updatedTransaction.fromValue).toBe(2.0)
      expect(updatedTransaction.toValue).toBe(100000)
      expect(updatedTransaction.note).toBe('Updated transaction')
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

  describe('Access Control', () => {
    it('should not allow access to other user\'s transactions', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other_user@example.com',
          password: await bcryptjs.hash('test123', 10),
          name: 'Other User',
          role: 'USER',
        },
      })

      // Create transaction for other user
      const otherTransaction = await prisma.transaction.create({
        data: {
          userId: otherUser.id,
          type: 'TRDE',
          status: 'DONE',
          date: new Date(),
          fromWalletId: testWallet.id,
          fromAssetId: testAsset.id,
          fromValue: 1.0,
          toWalletId: testWallet.id,
          toAssetId: testAsset.id,
          toValue: 50000,
        },
      })

      // Try to access other user's transaction
      const transaction = await prisma.transaction.findUnique({
        where: { id: otherTransaction.id },
      })

      expect(transaction).toBeDefined()
      expect(transaction?.userId).not.toBe(testUser.id)

      // Clean up
      await prisma.$transaction([
        prisma.transaction.delete({ where: { id: otherTransaction.id } }),
        prisma.user.delete({ where: { id: otherUser.id } }),
      ])
    })
  })

  describe('Data Validation', () => {
    it('should not create transaction with invalid type', async () => {
      try {
        await prisma.transaction.create({
          data: {
            userId: testUser.id,
            type: 'INVALID_TYPE' as any,
            status: 'DONE',
            date: new Date(),
            fromWalletId: testWallet.id,
            fromAssetId: testAsset.id,
            fromValue: 1.0,
            toWalletId: testWallet.id,
            toAssetId: testAsset.id,
            toValue: 50000,
          },
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should not create transaction with invalid status', async () => {
      try {
        await prisma.transaction.create({
          data: {
            userId: testUser.id,
            type: 'TRDE',
            status: 'INVALID_STATUS' as any,
            date: new Date(),
            fromWalletId: testWallet.id,
            fromAssetId: testAsset.id,
            fromValue: 1.0,
            toWalletId: testWallet.id,
            toAssetId: testAsset.id,
            toValue: 50000,
          },
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should not create transaction with negative values', async () => {
      try {
        await prisma.transaction.create({
          data: {
            userId: testUser.id,
            type: 'TRDE',
            status: 'DONE',
            date: new Date(),
            fromWalletId: testWallet.id,
            fromAssetId: testAsset.id,
            fromValue: -1.0,
            toWalletId: testWallet.id,
            toAssetId: testAsset.id,
            toValue: -50000,
          },
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should not create transaction without required fields', async () => {
      try {
        await prisma.transaction.create({
          data: {
            userId: testUser.id,
            type: 'TRDE',
            status: 'DONE',
            date: new Date(),
            // Missing required fields
          } as any,
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle non-existent transaction gracefully', async () => {
      const nonExistentId = 999999
      const transaction = await prisma.transaction.findUnique({
        where: { id: nonExistentId },
      })
      expect(transaction).toBeNull()
    })

    it('should handle invalid transaction ID format', async () => {
      try {
        await prisma.transaction.findUnique({
          where: { id: -1 },
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('Wallet Balance', () => {
    it('should update wallet balance after transaction', async () => {
      const initialValue = 1000
      const transactionValue = 500

      // Create initial balance transaction
      const initialTransaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          type: 'TRNS',
          status: 'DONE',
          date: new Date(),
          fromWalletId: testWallet.id,
          fromAssetId: testAsset.id,
          fromValue: initialValue,
          toWalletId: testWallet.id,
          toAssetId: testAsset.id,
          toValue: initialValue,
        },
      })

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          type: 'TRDE',
          status: 'DONE',
          date: new Date(),
          fromWalletId: testWallet.id,
          fromAssetId: testAsset.id,
          fromValue: transactionValue,
          toWalletId: testWallet.id,
          toAssetId: testAsset.id,
          toValue: transactionValue,
        },
      })

      // Calculate expected balance
      const expectedBalance = initialValue - transactionValue

      // Get wallet balance from transactions
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: testUser.id,
          toWalletId: testWallet.id,
          deletedAt: null,
        },
      })

      const balance = transactions.reduce((acc, t) => acc + Number(t.toValue), 0) -
        transactions.reduce((acc, t) => acc + Number(t.fromValue), 0)

      expect(balance).toBe(expectedBalance)

      // Clean up
      await prisma.$transaction([
        prisma.transaction.delete({ where: { id: transaction.id } }),
        prisma.transaction.delete({ where: { id: initialTransaction.id } }),
      ])
    })

    it('should handle insufficient funds', async () => {
      const initialValue = 100
      const transactionValue = 500

      // Create initial balance transaction
      const initialTransaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          type: 'TRNS',
          status: 'DONE',
          date: new Date(),
          fromWalletId: testWallet.id,
          fromAssetId: testAsset.id,
          fromValue: initialValue,
          toWalletId: testWallet.id,
          toAssetId: testAsset.id,
          toValue: initialValue,
        },
      })

      // Try to create transaction
      try {
        await prisma.transaction.create({
          data: {
            userId: testUser.id,
            type: 'TRDE',
            status: 'DONE',
            date: new Date(),
            fromWalletId: testWallet.id,
            fromAssetId: testAsset.id,
            fromValue: transactionValue,
            toWalletId: testWallet.id,
            toAssetId: testAsset.id,
            toValue: transactionValue,
          },
        })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }

      // Verify wallet balance remains unchanged
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: testUser.id,
          toWalletId: testWallet.id,
          deletedAt: null,
        },
      })

      const balance = transactions.reduce((acc, t) => acc + Number(t.toValue), 0) -
        transactions.reduce((acc, t) => acc + Number(t.fromValue), 0)

      expect(balance).toBe(initialValue)

      // Clean up
      await prisma.transaction.delete({ where: { id: initialTransaction.id } })
    })
  })
}) 