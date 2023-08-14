<script setup>
import { useRouter } from 'vue-router'
import { clearSession, getSession } from './lib/session'
import { computed, ref } from 'vue'

const session = ref(getSession())
const isAuth = computed(() => !!session.value)
const router = useRouter()

function logout() {
  clearSession()
  session.value = null
  router.push('/login')
}
</script>

<template>
  <header class="header">
    <h1 class="text-logo">Spore</h1>
    <nav>
      <ul class="header__list">
        <router-link v-if="!isAuth" to="/login">Login</router-link>
        <button v-else @click="logout">Logout</button>
        <router-link to="/signup">Signup</router-link>
      </ul>
    </nav>
  </header>

  <router-view></router-view>
</template>

<style scoped>
.text-logo {
  font-size: 1.3rem;
  font-weight: 600;
}
.header {
  background-color: rgb(246, 246, 246);
  padding-inline: 0.8rem;
  padding-block: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header__list {
  display: flex;
  list-style: none;
  gap: 1rem;
}
</style>
