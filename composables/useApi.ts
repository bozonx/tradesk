import { UseFetchOptions } from 'nuxt/app'

interface ApiOptions extends UseFetchOptions<any> {
  // Дополнительные опции для API запросов
  requireAuth?: boolean
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Базовый URL для API запросов
  const baseURL = config.public.apiBase || '/api'

  // Функция для выполнения API запросов
  const fetch = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const { requireAuth = true, ...fetchOptions } = options

    // Добавляем заголовки авторизации если требуется
    if (requireAuth && authStore.getToken) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${authStore.getToken}`
      }
    }

    try {
      const response = await useFetch<T>(`${baseURL}${endpoint}`, {
        ...fetchOptions,
        baseURL
      })

      return response.data.value as T
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  return {
    fetch
  }
} 