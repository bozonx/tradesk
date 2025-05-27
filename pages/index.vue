<template>
  <div class="space-y-8">
    <!-- Hero секция -->
    <section class="text-center py-12">
      <h1 class="text-4xl font-bold mb-4">Welcome to TradeSk</h1>
      <p class="text-xl text-gray-600 dark:text-gray-400">Your professional trading platform</p>
    </section>

    <!-- Основные функции -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard v-for="feature in features" :key="feature.title">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon :name="feature.icon" class="text-primary-500" />
            <h3 class="text-lg font-semibold">{{ feature.title }}</h3>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-400">{{ feature.description }}</p>
      </UCard>
    </section>

    <!-- Призыв к действию -->
    <section class="text-center py-8">
      <UButton
        size="lg"
        color="primary"
        to="/register"
      >
        Get Started
      </UButton>
    </section>
  </div>
</template>

<script setup lang="ts">
// Определяем основные функции платформы
const features = [
  {
    title: 'Real-time Trading',
    description: 'Execute trades with real-time market data and instant order execution.',
    icon: 'i-heroicons-chart-bar'
  },
  {
    title: 'Advanced Analytics',
    description: 'Access powerful tools and insights to make informed trading decisions.',
    icon: 'i-heroicons-presentation-chart-line'
  },
  {
    title: 'Secure Platform',
    description: 'Trade with confidence using our enterprise-grade security infrastructure.',
    icon: 'i-heroicons-shield-check'
  }
]
</script> 