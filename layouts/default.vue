<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Навигационная панель -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
      <NuxtLink to="/" class="text-xl font-bold">
        TradeSk
      </NuxtLink>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-heroicons-moon-20-solid"
          color="gray"
          variant="ghost"
          @click="toggleColorMode"
        />
        <UButton
          v-if="!isAuthenticated"
          to="/auth/login"
          color="primary"
          variant="solid"
        >
          Login
        </UButton>
        <UButton
          v-else
          color="red"
          variant="soft"
          @click="handleLogout"
        >
          Logout
        </UButton>
      </div>
    </div>

    <!-- Основной контент -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Управление цветовой темой
const colorMode = useColorMode()
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Состояние аутентификации (заглушка)
const isAuthenticated = ref(false)

// Обработчик выхода
const handleLogout = () => {
  // TODO: Реализовать логику выхода
  isAuthenticated.value = false
}
</script> 