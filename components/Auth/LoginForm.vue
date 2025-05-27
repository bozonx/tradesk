<template>
  <div class="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Login</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <UFormGroup label="Email" name="email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            :error="errors.email"
          />
        </UFormGroup>
      </div>

      <div>
        <UFormGroup label="Password" name="password">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            :error="errors.password"
          />
        </UFormGroup>
      </div>

      <UButton
        type="submit"
        color="primary"
        block
        :loading="loading"
      >
        Login
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const router = useRouter()

// Состояние формы
const form = ref({
  email: '',
  password: ''
})

// Состояние ошибок
const errors = ref({
  email: '',
  password: ''
})

// Состояние загрузки
const loading = ref(false)

// Обработка отправки формы
async function handleSubmit() {
  loading.value = true
  errors.value = { email: '', password: '' }

  try {
    // Здесь будет запрос к API
    // const response = await $fetch('/api/auth/login', {
    //   method: 'POST',
    //   body: form.value
    // })
    
    // Временная имитация успешной авторизации
    const mockResponse = {
      user: {
        id: '1',
        email: form.value.email,
        name: 'Test User'
      },
      token: 'mock_token'
    }

    auth.setAuth(mockResponse.user, mockResponse.token)
    router.push('/')
  } catch (error: any) {
    // Обработка ошибок
    if (error.data?.errors) {
      errors.value = error.data.errors
    } else {
      errors.value.email = 'Invalid credentials'
    }
  } finally {
    loading.value = false
  }
}
</script> 