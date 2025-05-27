export interface User {
  id: number
  email: string
  name: string | null
  role: string
  settings: string | null
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterResponse {
  user: User
  token: string
}

export interface AuthError {
  message: string
  code?: string
} 