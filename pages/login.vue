<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-card-title class="text-center text-h5 py-4">
            Login
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="handleSubmit" ref="form">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                :rules="emailRules"
                required
                variant="outlined"
              />
              
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                :rules="passwordRules"
                required
                variant="outlined"
              />
              
              <v-alert
                v-if="error"
                type="error"
                class="mt-3"
                closable
              >
                {{ error }}
              </v-alert>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="px-4 pb-4">
            <v-btn
              block
              color="primary"
              size="large"
              type="submit"
              :loading="loading"
              @click="handleSubmit"
            >
              Login
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
const form = ref()
const loading = ref(false)
const error = ref('')

const email = ref('')
const password = ref('')

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
]

async function handleSubmit() {
  const { valid } = await form.value.validate()
  
  if (!valid) return
  
  loading.value = true
  error.value = ''
  
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (e: any) {
    error.value = e.message || 'An error occurred during login'
  } finally {
    loading.value = false
  }
}
</script> 