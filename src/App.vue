<script setup>
import { useRouter } from 'vue-router'
import { clearSession, getSession } from './lib/session'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const session = ref(getSession())
const isAuth = computed(() => !!session.value)
const router = useRouter()
const { t } = useI18n()

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
        <div class="lang-selector">
          <label aria-label="select language"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="lang-icon"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
              />
            </svg>
          </label>
          <select v-model="$i18n.locale">
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        <router-link v-if="!isAuth" to="/login">{{ t('home.loginLink') }}</router-link>
        <button v-else @click="logout">{{ t('home.logoutLink') }}</button>
        <router-link v-if="!isAuth" to="/signup">{{ t('home.signupLink') }}</router-link>
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

.lang-icon {
  width: 24px;
  height: 24px;
}
.header {
  background-color: rgb(237, 237, 237);
  padding-inline: 0.8rem;
  padding-block: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lang-selector {
  display: flex;
  gap: 5px;
  align-items: center;
}

.header__list {
  display: flex;
  list-style: none;
  align-items: center;
  gap: 1rem;
}
</style>
