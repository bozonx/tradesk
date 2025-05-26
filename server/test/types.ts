import type { User, Portfolio } from '@prisma/client'

// Типы для тестовых данных
export type TestUserData = {
  email: string
  password: string
  name: string
  role: 'USER' | 'ADMIN'
  settings: string
}

export type TestPortfolioData = {
  name: string
  descr: string
  userId: number
  isArchived: boolean
}

// Типы для результатов тестов
export type TestUserResult = {
  user: User
  token: string
}

export type TestPortfolioResult = Portfolio 