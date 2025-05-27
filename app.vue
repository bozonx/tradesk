<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

// Проверяем авторизацию при загрузке приложения
onMounted(async () => {
  await auth.checkAuth()
})
</script> 