import './assets/main.css'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { createApp } from 'vue'

import LoginPage from './components/LoginPage.vue'
import SignupPage from './components/SignupPage.vue'
import HomePage from './components/HomePage.vue'

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },
  { path: '/', component: HomePage }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
