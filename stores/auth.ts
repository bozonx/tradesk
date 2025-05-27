import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
  },

  actions: {
    async login(email: string, password: string) {
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        })

        this.token = response.token
        this.user = response.user

        // Сохраняем токен в localStorage
        localStorage.setItem('auth_token', response.token)
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    async logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('auth_token')
    },

    async checkAuth() {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          // Проверяем валидность токена
          const response = await $fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          this.token = token
          this.user = response.user
        } catch (error) {
          this.logout()
        }
      }
    },
  },
}) 