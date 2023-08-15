//
<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { saveSession } from '../lib/session.js'
import { useI18n } from 'vue-i18n'

const router = useRouter()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password length must be at least 6')
})

const userData = reactive({
  email: '',
  password: ''
})

const errorMap = ref({ email: '', password: '' })
const url = new URL('http://localhost:3000/users/login')
const { t } = useI18n()

function submit() {
  const parsed = loginSchema.safeParse(userData)
  if (parsed.success === false) {
    errorMap.value = parsed.error.formErrors.fieldErrors
    return // prevent request
  }

  const { email, password } = parsed.data
  url.searchParams.set('email', email)
  url.searchParams.set('password', password)

  fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
    .then((res) => res.json())
    .then((data) => {
      if ('error' in data) {
        throw new Error(data.error)
      }

      saveSession(data.token)
      router.push('/')
    })
    .catch((error) => alert(error.message))
}
</script>

<template>
  <main>
    <form class="form form--full-screen" @submit.prevent="submit">
      <div>
        <h1 class="form__title">{{ t('login.formTitle') }}</h1>
        <p>{{ t('login.formDescription') }}</p>
      </div>
      <div class="form__field">
        <label for="email" class="form__label">{{ t('login.emailFieldLabel') }}</label>
        <input v-model="userData.email" required id="email" type="email" class="form__input" />
      </div>

      <div class="form__field">
        <label for="password" class="form__label">{{ t('login.passwordFieldLabel') }}</label>
        <input
          v-model="userData.password"
          required
          id="password"
          type="password"
          class="form__input"
        />
        <p v-if="errorMap.password.length > 0">{{ errorMap.password }}</p>
      </div>

      <div class="form__field">
        <button type="submit" class="button">{{ t('login.formButtonText') }}</button>
      </div>
    </form>
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
}
</style>
