<!-- eslint-disable no-undef -->
<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { getSession } from '../lib/session'
import icon from '../components/CarIcon/icon.png'

const cars = ref([])
const carMarkers = ref([])
const map = ref(null)
const carIcon = L.icon({
  iconUrl: icon,
  iconSize: [50, 50]
})

const searchBar = L.Control.extend({
  onAdd() {
    const container = document.createElement('div')
    const input = document.createElement('input')
    input.type = 'search'

    const searchButton = document.createElement('button')
    searchButton.textContent = 'Search'

    searchButton.addEventListener('click', () => {
      const matchedCar = carMarkers.value.find(
        (car) => car.data.plate.toUpperCase() === input.value.toUpperCase()
      )

      if (matchedCar) {
        matchedCar.marker.openPopup()
        console.log(matchedCar)
      }
    })

    container.appendChild(input)
    container.appendChild(searchButton)
    return container
  },
  onRemove() {}
})

// Fetch cars
onMounted(() => {
  const session = getSession()
  const authToken = 'Bearer ' + session
  const url = new URL('http://localhost:3000/cars')
  fetch(url, {
    method: 'GET',
    headers: {
      authorization: authToken,
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((res) => res.json())
    .then((fetchedCars) => {
      cars.value = fetchedCars
    })
    .catch(console.error.bind(console))
})

// Save an array of objects wich holds reference to the original car data
// and marker object (L.marker)
watch(cars, (newCars) => {
  carMarkers.value = newCars.map((car) => ({
    marker: L.marker([car.position.x, car.position.y], { icon: carIcon }),
    data: car
  }))
  carMarkers.value.forEach((car) => {
    car.marker.bindPopup(car.data.plate).openPopup()
    car.marker.addTo(map.value)
  })
})

// Draw map
onMounted(() => {
  map.value = L.map('map').setView([20.710429418405212, -103.40982443626814], 15)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map.value)

  new searchBar().addTo(map.value)
})

const router = useRouter()
const session = getSession()

if (!session) {
  router.push('/login')
}
</script>

<template>
  <h1>Home</h1>
  <div ref="mapNode" id="map"></div>
  <ul>
    <li v-for="car in cars" :key="car.id">
      {{ car.position }}
    </li>
  </ul>
</template>

<style scoped>
#map {
  width: 100%;
  aspect-ratio: 4 / 3;
  max-width: 40rem;
  margin-inline: auto;
}

.popup {
  color: red;
}
</style>
