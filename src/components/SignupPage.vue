<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { z } from 'zod'

const router = useRouter()

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password length must be at least 6')
})

const { t } = useI18n()

const userData = reactive({
  email: '',
  password: ''
})

const errorMap = ref({ email: '', password: '' })

function submit() {
  const parsed = signupSchema.safeParse(userData)
  if (parsed.success === false) {
    errorMap.value = parsed.error.formErrors.fieldErrors
    return // prevent request
  }

  fetch('http://localhost:3000/users/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data)
  })
    .then((res) => res.json())
    .then((data) => {
      if ('error' in data) {
        throw new Error(data.error)
      }
    })
    .then(() => {
      router.push('/')
    })
    .catch((error) => alert(error.message))
}
</script>

<template>
  <main>
    <form class="form form--full-screen" @submit.prevent="submit">
      <div>
        <h1 class="form__title">{{ t('signup.formTitle') }}</h1>
        <p>{{ t('signup.formDescription') }}</p>
      </div>
      <div class="form__field">
        <label for="email" class="form__label">{{ t('signup.emailFieldLabel') }}</label>
        <input v-model="userData.email" required id="email" type="email" class="form__input" />
      </div>

      <div class="form__field">
        <label for="password" class="form__label">{{ t('signup.passwordFieldLabel') }}</label>
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
        <button type="submit" class="button">{{ t('signup.formButtonText') }}</button>
      </div>
    </form>
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
}
</style>
