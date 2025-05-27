<template>
  <div class="max-w-md mx-auto">
    <UCard>
      <template #header>
        <h2 class="text-2xl font-bold text-center">
          Login to TradeSk
        </h2>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UFormGroup label="Email" name="email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </UFormGroup>

        <div class="flex items-center justify-between">
          <UCheckbox
            v-model="form.remember"
            label="Remember me"
          />
          <UButton
            to="/auth/forgot-password"
            variant="link"
            color="primary"
          >
            Forgot password?
          </UButton>
        </div>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="isLoading"
        >
          Login
        </UButton>
      </form>

      <template #footer>
        <div class="text-center">
          <span class="text-gray-600 dark:text-gray-400">
            Don't have an account?
          </span>
          <UButton
            to="/auth/register"
            variant="link"
            color="primary"
          >
            Register
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// Состояние формы
const form = ref({
  email: '',
  password: '',
  remember: false
})

// Состояние загрузки
const isLoading = ref(false)

// Обработчик отправки формы
const handleSubmit = async () => {
  try {
    isLoading.value = true
    // TODO: Реализовать логику авторизации
    console.log('Form submitted:', form.value)
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script> 