import './assets/main.css'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import LoginPage from './components/LoginPage.vue'
import SignupPage from './components/SignupPage.vue'
import HomePage from './components/HomePage.vue'
import CarsPage from './components/CarsPage.vue'

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },
  { path: '/cars', component: CarsPage },
  { path: '/', component: HomePage }
]

const messages = {
  en: {
    home: {
      carsTitle: 'My cars',
      searchCarButton: 'Search',
      searchCarHint: 'Enter the car id',
      loginLink: 'Login',
      logoutLink: 'Logout',
      signupLink: 'Signup',
      registerCarButton: 'Register new car',
      createdAtMessage: 'Registered at {time}',
      editCarButton: 'Edit',
      locateCarButton: 'Locate'
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
      searchCarButton: 'Buscar',
      loginLink: 'Iniciar sesión',
      logoutLink: 'Salir',
      signupLink: 'Registrarse',
      searchCarHint: 'Ingresa el id del auto',
      registerCarButton: 'Registrar nuevo auto',
      createdAtMessage: 'Registrado el {time}',
      editCarButton: 'Editar',
      locateCarButton: 'Localizar'
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
