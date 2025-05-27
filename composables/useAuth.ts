import type { AuthState, LoginCredentials, User } from '~/types/auth'

export const useAuth = () => {
  const state = useState<AuthState>('auth', () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }))

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await $fetch<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      // Сохраняем токен в localStorage
      localStorage.setItem('auth_token', response.token)
      
      // Обновляем состояние
      state.value = {
        user: response.user,
        token: response.token,
        isAuthenticated: true
      }

      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    // Удаляем токен из localStorage
    localStorage.removeItem('auth_token')
    
    // Сбрасываем состояние
    state.value = {
      user: null,
      token: null,
      isAuthenticated: false
    }
  }

  const initAuth = () => {
    // Проверяем наличие токена в localStorage при инициализации
    const token = localStorage.getItem('auth_token')
    if (token) {
      state.value.token = token
      state.value.isAuthenticated = true
      // TODO: Загрузить данные пользователя по токену
    }
  }

  return {
    state,
    login,
    logout,
    initAuth
  }
} 