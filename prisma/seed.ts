import { PrismaClient } from '@prisma/client'
const bcryptjs = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create test user
  const hashedPassword = await bcryptjs.hash('test123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  })

  // Create assets
  const assets = await Promise.all([
    prisma.asset.upsert({
      where: { ticker: 'BTC' },
      update: {},
      create: {
        ticker: 'BTC',
        type: 'CRYP',
      },
    }),
    prisma.asset.upsert({
      where: { ticker: 'ETH' },
      update: {},
      create: {
        ticker: 'ETH',
        type: 'CRYP',
      },
    }),
    prisma.asset.upsert({
      where: { ticker: 'USDT' },
      update: {},
      create: {
        ticker: 'USDT',
        type: 'CRYP',
      },
    }),
    prisma.asset.upsert({
      where: { ticker: 'USD' },
      update: {},
      create: {
        ticker: 'USD',
        type: 'FIAT',
      },
    }),
  ])

  // Create external entities
  const externalEntities = await Promise.all([
    prisma.externalEntity.upsert({
      where: { trademarkName: 'Binance' },
      update: {},
      create: {
        trademarkName: 'Binance',
        type: 'EXCH',
      },
    }),
    prisma.externalEntity.upsert({
      where: { trademarkName: 'MetaMask' },
      update: {},
      create: {
        trademarkName: 'MetaMask',
        type: 'WCST',
      },
    }),
  ])

  // Create groups
  const groups = await Promise.all([
    prisma.group.upsert({
      where: { id: 1 },
      update: {},
      create: {
        type: 'PORTFOLIO',
        name: 'Main Portfolio Group',
        descr: 'Main group for portfolios',
      },
    }),
    prisma.group.upsert({
      where: { id: 2 },
      update: {},
      create: {
        type: 'STRATEGY',
        name: 'Trading Strategies',
        descr: 'Group for trading strategies',
      },
    }),
  ])

  // Create wallets
  const wallets = await Promise.all([
    prisma.wallet.upsert({
      where: { id: 1 },
      update: {},
      create: {
        userId: user.id,
        name: 'Binance Spot',
        descr: 'Main spot trading wallet',
        externalEntityId: externalEntities[0].id,
        state: 'active',
      },
    }),
    prisma.wallet.upsert({
      where: { id: 2 },
      update: {},
      create: {
        userId: user.id,
        name: 'MetaMask ETH',
        descr: 'Ethereum wallet',
        externalEntityId: externalEntities[1].id,
        state: 'active',
      },
    }),
  ])

  // Create portfolios
  const portfolios = await Promise.all([
    prisma.portfolio.upsert({
      where: { id: 1 },
      update: {},
      create: {
        userId: user.id,
        name: 'Main Portfolio',
        descr: 'Main trading portfolio',
        groupId: groups[0].id,
        state: 'active',
      },
    }),
  ])

  // Create strategies
  const strategies = await Promise.all([
    prisma.strategy.upsert({
      where: { id: 1 },
      update: {},
      create: {
        userId: user.id,
        name: 'BTC/USDT Trading',
        descr: 'Bitcoin trading strategy',
        groupId: groups[1].id,
        state: 'active',
      },
    }),
  ])

  // Create positions
  const positions = await Promise.all([
    prisma.position.upsert({
      where: { id: 1 },
      update: {},
      create: {
        userId: user.id,
        type: 'LONG',
        portfolioId: portfolios[0].id,
        strategyId: strategies[0].id,
        descr: 'BTC long position',
      },
    }),
  ])

  // Create trade orders
  const tradeOrders = await Promise.all([
    prisma.tradeOrder.upsert({
      where: { id: 1 },
      update: {},
      create: {
        userId: user.id,
        fromWalletId: wallets[0].id,
        fromAssetId: assets[3].id, // USDT
        fromValue: 1000,
        toWalletId: wallets[0].id,
        toAssetId: assets[0].id, // BTC
        toValue: 0.05,
        action: 'BUY',
        status: 'FILL',
        positionId: positions[0].id,
        openDate: new Date(),
        fillDate: new Date(),
      },
    }),
  ])

  // Create transactions
  const transactions = await Promise.all([
    prisma.transaction.upsert({
      where: { id: 1 },
      update: {},
      create: {
        userId: user.id,
        date: new Date(),
        positionId: positions[0].id,
        type: 'TRDE',
        status: 'DONE',
        fromWalletId: wallets[0].id,
        fromAssetId: assets[3].id, // USDT
        fromValue: 1000,
        toWalletId: wallets[0].id,
        toAssetId: assets[0].id, // BTC
        toValue: 0.05,
        tradeOrderId: tradeOrders[0].id,
      },
    }),
  ])

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 