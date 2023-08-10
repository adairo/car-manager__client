<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'

const router = useRouter()

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password length must be at least 6')
})

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
    <form class="form" @submit.prevent="submit">
      <div>
        <h1 class="form__title">Signup</h1>
        <p>Signup with email and password</p>
      </div>
      <div class="form__field">
        <label for="email" class="form__label">Email</label>
        <input v-model="userData.email" required id="email" type="email" class="form__input" />
      </div>

      <div class="form__field">
        <label for="password" class="form__label">Password</label>
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
        <button type="submit" class="button">Register</button>
      </div>
    </form>
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
}

.form {
  /* border: 1px solid gray; */
  border-radius: 0.5rem;
  box-shadow: 1px 1px 4px lightslategrey;
  max-width: 20rem;
  padding: 1rem;
  margin-inline: auto;
}

.form__title {
  font-weight: 800;
  font-size: large;
}

.button {
  padding-block: 0.6rem;
}

.form > * + * {
  margin-top: 1.2rem;
}

.form__field {
  display: flex;
  flex-direction: column;
}
</style>
