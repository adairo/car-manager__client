import './assets/main.css'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import LoginPage from './components/LoginPage.vue'
import SignupPage from './components/SignupPage.vue'
import HomePage from './components/HomePage.vue'

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },
  { path: '/', component: HomePage }
]

const messages = {
  en: {
    home: {
      carsTitle: 'My cars'
    }
  },
  es: {
    home: {
      carsTitle: 'Mis autos'
    }
  }
}

const i18n = createI18n({
  locale: 'es',
  fallbackLocale: 'en',
  messages,
  allowComposition: true
})

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
