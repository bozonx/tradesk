<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="text-xl font-bold">TradeSk</NuxtLink>
      </template>
      
      <template #right>
        <UButton
          :icon="colorMode.value === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'"
          color="gray"
          variant="ghost"
          @click="toggleColorMode"
        />
        <UButton
          icon="i-heroicons-user"
          color="gray"
          variant="ghost"
          to="/profile"
        />
      </template>
    </UHeader>

    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <UFooter>
      <template #left>
        <span class="text-sm text-gray-500">© 2024 TradeSk. All rights reserved.</span>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
// Используем встроенный composable для управления цветовой темой
const colorMode = useColorMode()

// Функция для переключения темы
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script> 