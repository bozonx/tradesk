import type { TestUserData, TestPortfolioData } from './types'

// Тестовые пользователи
export const testUsers: TestUserData[] = [
  {
    email: 'test1@example.com',
    password: 'testpassword123',
    name: 'Test User 1',
    role: 'USER',
    settings: '{}'
  },
  {
    email: 'test2@example.com',
    password: 'testpassword123',
    name: 'Test User 2',
    role: 'USER',
    settings: '{}'
  }
]

// Тестовые портфели
export const testPortfolios: TestPortfolioData[] = [
  {
    name: 'Test Portfolio 1',
    descr: 'Test portfolio 1 description',
    userId: 0, // Будет установлено после создания пользователя
    isArchived: false
  },
  {
    name: 'Test Portfolio 2',
    descr: 'Test portfolio 2 description',
    userId: 0, // Будет установлено после создания пользователя
    isArchived: false
  }
] 