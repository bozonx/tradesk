<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Welcome, {{ auth.currentUser?.name || 'User' }}!</span>
            <v-btn
              :icon="colorMode.value === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
              @click="toggleColorMode"
            />
          </v-card-title>
          
          <v-card-text>
            <p class="text-body-1">
              This is your dashboard. You are successfully logged in.
            </p>
          </v-card-text>
          
          <v-card-actions>
            <v-btn
              color="error"
              variant="outlined"
              @click="handleLogout"
            >
              Logout
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const router = useRouter()
const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script> 