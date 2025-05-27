<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Инициализация авторизации при загрузке приложения
const auth = useAuthStore()

onMounted(async () => {
  await auth.checkAuth()
})
</script> 