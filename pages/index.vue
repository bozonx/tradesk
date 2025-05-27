<template>
  <div class="space-y-8">
    <!-- Заголовок -->
    <UCard>
      <template #header>
        <h1 class="text-3xl font-bold">
          Welcome to TradeSk
        </h1>
      </template>
      
      <p class="text-gray-600 dark:text-gray-400">
        Your all-in-one trading platform
      </p>
    </UCard>

    <!-- Основные функции -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="feature in features" :key="feature.title">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon :name="feature.icon" class="text-primary-500" />
            <h3 class="text-xl font-semibold">{{ feature.title }}</h3>
          </div>
        </template>
        
        <p class="text-gray-600 dark:text-gray-400">
          {{ feature.description }}
        </p>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
// Список основных функций
const features = [
  {
    title: 'Real-time Trading',
    description: 'Trade with real-time market data and instant execution',
    icon: 'i-heroicons-chart-bar'
  },
  {
    title: 'Portfolio Management',
    description: 'Track and manage your investments in one place',
    icon: 'i-heroicons-briefcase'
  },
  {
    title: 'Market Analysis',
    description: 'Access advanced tools for market analysis and research',
    icon: 'i-heroicons-presentation-chart-line'
  }
]
</script> 