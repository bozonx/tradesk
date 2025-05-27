<template>
  <div class="max-w-md mx-auto">
    <UCard>
      <template #header>
        <h2 class="text-2xl font-bold text-center">Login to TradeSk</h2>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <UFormGroup label="Email">
          <UInput
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </UFormGroup>

        <UFormGroup label="Password">
          <UInput
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </UFormGroup>

        <div class="flex items-center justify-between">
          <UCheckbox
            v-model="rememberMe"
            label="Remember me"
          />
          <NuxtLink
            to="/forgot-password"
            class="text-sm text-primary-500 hover:text-primary-600"
          >
            Forgot password?
          </NuxtLink>
        </div>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="loading"
        >
          Sign In
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?
          <NuxtLink
            to="/register"
            class="text-primary-500 hover:text-primary-600"
          >
            Sign up
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// Состояние формы
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

// Получаем доступ к хранилищу аутентификации
const auth = useAuthStore()
const router = useRouter()

// Обработка отправки формы
async function handleLogin() {
  try {
    loading.value = true
    // Здесь будет логика входа
    // const response = await $fetch('/api/auth/login', {
    //   method: 'POST',
    //   body: { email: email.value, password: password.value }
    // })
    // auth.setUser(response.user)
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
    // Здесь будет обработка ошибок
  } finally {
    loading.value = false
  }
}
</script> 