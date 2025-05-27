import { defineStore } from 'pinia'

// Определяем интерфейс для пользователя
interface User {
  id: string
  email: string
  name: string
}

// Определяем интерфейс для состояния хранилища
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    // Получаем информацию о текущем пользователе
    currentUser: (state) => state.user,
    
    // Проверяем статус аутентификации
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    // Установка пользователя
    setUser(user: User | null) {
      this.user = user
      this.isAuthenticated = !!user
    },

    // Выход из системы
    async logout() {
      try {
        this.loading = true
        // Здесь будет логика выхода из системы
        this.setUser(null)
      } catch (error) {
        console.error('Logout error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Проверка аутентификации
    async checkAuth() {
      try {
        this.loading = true
        // Здесь будет логика проверки аутентификации
        // const response = await $fetch('/api/auth/check')
        // this.setUser(response.user)
      } catch (error) {
        console.error('Auth check error:', error)
        this.setUser(null)
      } finally {
        this.loading = false
      }
    }
  }
}) 