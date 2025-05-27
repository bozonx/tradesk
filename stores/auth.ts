import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

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
    // Установка данных пользователя
    setUser(user: User | null) {
      this.user = user
      this.isAuthenticated = !!user
    },

    // Установка токена
    setToken(token: string | null) {
      this.token = token
    },

    // Выход из системы
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
    }
  },

  persist: {
    storage: persistedState.localStorage
  }
}) 