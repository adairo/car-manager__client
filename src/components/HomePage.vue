<script setup>
import { useRouter } from 'vue-router'
import { getSession } from '../lib/session'
const router = useRouter()
const session = getSession()

if (!session) {
  router.push('/login')
}
</script>

<template>
  <h1>Home</h1>
</template>
