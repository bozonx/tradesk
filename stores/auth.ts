import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    getIsAuthenticated: (state) => state.isAuthenticated
  },

  actions: {
    // Установка данных пользователя после успешной авторизации
    setAuth(user: User, token: string) {
      this.user = user
      this.token = token
      this.isAuthenticated = true
      
      // Сохраняем токен в localStorage
      if (process.client) {
        localStorage.setItem('auth_token', token)
      }
    },

    // Выход из системы
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      if (process.client) {
        localStorage.removeItem('auth_token')
      }
    },

    // Проверка авторизации при загрузке приложения
    async checkAuth() {
      if (!process.client) return false
      
      const token = localStorage.getItem('auth_token')
      if (!token) return false

      try {
        // Здесь можно добавить запрос к API для проверки токена
        // const response = await $fetch('/api/auth/verify', {
        //   headers: { Authorization: `Bearer ${token}` }
        // })
        // this.setAuth(response.user, token)
        return true
      } catch (error) {
        this.logout()
        return false
      }
    }
  }
}) 