<template>
  <v-app>
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// Инициализация темы при загрузке приложения
const colorMode = useColorMode()
const vuetify = useVuetify()

// Синхронизация темы Vuetify с системной темой
watch(() => colorMode.value, (newValue) => {
  vuetify.theme.global.name.value = newValue
}, { immediate: true })
</script>

<style>
/* Глобальные стили */
.v-application {
  font-family: 'Inter', sans-serif;
}

/* Стили для темной темы */
.dark {
  background-color: rgb(18, 18, 18);
  color: rgb(255, 255, 255);
}

/* Стили для светлой темы */
.light {
  background-color: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
}
</style> 