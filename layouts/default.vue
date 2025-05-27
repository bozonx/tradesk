<template>
  <div :class="['min-h-screen transition-colors duration-200', colorMode.value === 'dark' ? 'dark' : '']">
    <!-- Навигационная панель -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
      <NuxtLink to="/" class="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
        TradeSk
      </NuxtLink>
      <div class="flex items-center gap-2">
        <UButton
          :icon="colorMode.value === 'dark' ? 'i-heroicons-sun-20-solid' : 'i-heroicons-moon-20-solid'"
          color="gray"
          variant="ghost"
          class="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
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
  // Принудительно переключаем тему
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  // Обновляем значение
  colorMode.value = colorMode.preference
}

// Состояние аутентификации (заглушка)
const isAuthenticated = ref(false)

// Обработчик выхода
const handleLogout = () => {
  // TODO: Реализовать логику выхода
  isAuthenticated.value = false
}
</script> 