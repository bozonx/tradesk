// Типы для авторизации
export type User = {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

export type LoginCredentials = {
  email: string
  password: string
}

export type AuthResponse = {
  user: User
  token: string
}

export type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
} 