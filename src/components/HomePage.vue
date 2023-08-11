<!-- eslint-disable no-undef -->
<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { getSession } from '../lib/session'

onMounted(() => {
  const map = L.map('map').setView([51.505, -0.09], 13)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map)
})

const router = useRouter()
const session = getSession()

if (!session) {
  router.push('/login')
}
</script>

<template>
  <h1>Home</h1>
  <div id="map"></div>
</template>

<style scoped>
#map {
  width: 100%;
  aspect-ratio: 4 / 3;
  max-width: 40rem;
  margin-inline: auto;
}
</style>
