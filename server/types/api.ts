import { User, Portfolio, Position, Transaction, Strategy, Group, Asset, TradeOrder, Wallet, ExternalEntity } from '@prisma/client'

export type ApiResponse<T> = {
  data: T
  message?: string
  error?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type QueryParams = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filter?: Record<string, any>
}

// Include types for relations
export type UserWithRelations = User & {
  portfolios?: Portfolio[]
  positions?: Position[]
  transactions?: Transaction[]
  strategies?: Strategy[]
  tradeOrders?: TradeOrder[]
  wallets?: Wallet[]
}

export type PortfolioWithRelations = Portfolio & {
  user?: User
  group?: Group
  positions?: Position[]
}

export type PositionWithRelations = Position & {
  user?: User
  group?: Group
  portfolio?: Portfolio
  strategy?: Strategy
  transactions?: Transaction[]
  tradeOrders?: TradeOrder[]
}

export type TransactionWithRelations = Transaction & {
  user?: User
  position?: Position
  partialOf?: Transaction
  partialTransactions?: Transaction[]
  feeOf?: Transaction
  feeTransactions?: Transaction[]
  tradeOrder?: TradeOrder
  fromWallet?: Wallet
  toWallet?: Wallet
  fromAsset?: Asset
  toAsset?: Asset
}

export type StrategyWithRelations = Strategy & {
  user?: User
  group?: Group
  positions?: Position[]
}

export type GroupWithRelations = Group & {
  portfolios?: Portfolio[]
  positions?: Position[]
  strategies?: Strategy[]
}

export type AssetWithRelations = Asset & {
  fromTransactions?: Transaction[]
  toTransactions?: Transaction[]
  fromTradeOrders?: TradeOrder[]
  toTradeOrders?: TradeOrder[]
}

export type TradeOrderWithRelations = TradeOrder & {
  user?: User
  position?: Position
  fromWallet?: Wallet
  toWallet?: Wallet
  fromAsset?: Asset
  toAsset?: Asset
  transactions?: Transaction[]
}

export type WalletWithRelations = Wallet & {
  user?: User
  externalEntity?: ExternalEntity
  fromTransactions?: Transaction[]
  toTransactions?: Transaction[]
  fromTradeOrders?: TradeOrder[]
  toTradeOrders?: TradeOrder[]
}

export type ExternalEntityWithRelations = ExternalEntity & {
  wallets?: Wallet[]
} 