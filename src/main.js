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
      carsTitle: 'My cars',
      searchCarButton: 'Search id',
      loginLink: 'Login',
      logoutLink: 'Logout',
      signupLink: 'Signup'
    },
    login: {
      formTitle: 'Login',
      formDescription: 'Enter your credentials',
      emailFieldLabel: 'Email',
      passwordFieldLabel: 'Password',
      formButtonText: 'Submit data'
    },
    signup: {
      formTitle: 'Signup',
      formDescription: 'Signup with email and password',
      emailFieldLabel: 'Email',
      passwordFieldLabel: 'Password',
      formButtonText: 'Submit data'
    }
  },
  es: {
    home: {
      carsTitle: 'Mis autos',
      searchCarButton: 'Buscar id',
      loginLink: 'Iniciar sesión',
      logoutLink: 'Salir',
      signupLink: 'Registrarse'
    },
    login: {
      formTitle: 'Inicia sesión',
      formDescription: 'Ingresa tus credenciales',
      emailFieldLabel: 'Correo',
      passwordFieldLabel: 'Contraseña',
      formButtonText: 'Enviar información'
    },
    signup: {
      formTitle: 'Registrarse',
      formDescription: 'Crear cuenta con correo y contraseña',
      emailFieldLabel: 'Correo',
      passwordFieldLabel: 'Contraseña',
      formButtonText: 'Enviar información'
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
