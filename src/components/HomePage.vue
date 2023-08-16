<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { getSession } from '../lib/session'
import icon from '../components/CarIcon/icon.png'
import { socket } from '../socket'
import { useI18n } from 'vue-i18n'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css'
import 'leaflet-fullscreen/dist/Leaflet.fullscreen'
import {
  LMap,
  LTileLayer,
  LMarker,
  LIcon,
  LPopup,
  LControlLayers,
  LControl
} from '@vue-leaflet/vue-leaflet'

const session = getSession()

if (!session) {
  router.push('/login')
}

const { t } = useI18n()
const cars = ref([])
const map = ref(null)
const searchCarInput = ref()
const router = useRouter()

const mapProps = {
  zoom: 10,
  'min-zoom': 9,
  'max-zoom': 17,
  ref: map,
  style: { width: '100%', height: '500px' },
  center: [20.708692, -103.409774],
  options: { fullscreenControl: true }
}

function fetchCars() {
  const authToken = 'Bearer ' + session
  const url = new URL('http://localhost:3000/cars')

  // get cars positions using normal http request
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
}

// Fetch cars and listen to socket events
onMounted(() => {
  fetchCars()
  socket.on('cars:position-updated', (payload) => {
    const carToUpdateIndex = cars.value.findIndex((car) => car.id === payload.carId)
    cars.value[carToUpdateIndex].position = {
      x: payload.position.lattitude,
      y: payload.position.longitude
    }
  })
})

function formatPosition(position) {
  return `${position.x.toFixed(4)}, ${position.y.toFixed(4)}`
}

function handleSearchCar() {
  const machedCar = cars.value.find((car) => car.id === Number(searchCarInput.value))
  if (!machedCar) {
    return console.log('No car was found')
  }
  map.value.leafletObject.flyTo(L.latLng([machedCar.position.x, machedCar.position.y]), 12)
}
</script>

<template>
  <div class="container">
    <div class="map-container">
      <h1 class="page-title">{{ t('home.carsTitle') }}</h1>
      <l-map v-bind="mapProps">
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        />
        <l-tile-layer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          layer-type="base"
          name="darkMap"
        />

        <l-control-layers />
        <l-marker
          v-for="car in cars"
          :key="car.id"
          :lat-lng="{ lat: car.position.x, lng: car.position.y }"
        >
          <l-icon :icon-url="icon" :icon-size="[50, 50]" />
          <l-popup>
            <div>
              <div>
                <span style="font-weight: 800">Car id: </span>
                <span>{{ car.id }}</span>
              </div>
              <div>
                <span style="font-weight: 800">Plate: </span>
                <span>{{ car.plate }}</span>
              </div>
              <div>
                <span style="font-weight: 800">Latittude: </span>
                <span>{{ car.position.x }}</span>
              </div>
              <div>
                <span style="font-weight: 800">Longitude: </span>
                <span>{{ car.position.y }}</span>
              </div>
            </div>
          </l-popup>
        </l-marker>
        <l-control class="leaflet-control leaflet-demo-control" position="bottomleft">
          <form @submit.prevent="handleSearchCar" class="search-form">
            <input
              class="search-form__input"
              v-model="searchCarInput"
              type="search"
              :placeholder="t('home.searchCarHint')"
            />
            <button class="search-form__button">{{ t('home.searchCarButton') }}</button>
          </form></l-control
        >
      </l-map>
    </div>
    <div class="cars-container">
      <div v-for="car in cars" :key="car.id" class="car-card">
        <div class="car-card__img">
          <img :src="icon" :width="64" :height="64" />
        </div>
        <div class="car-card__content">
          <div class="car-card__plate">{{ car.plate }}</div>
          <div class="car-card__position">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#94a3b8"
              style="width: 16px"
            >
              <path
                fill-rule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                clip-rule="evenodd"
              />
            </svg>

            {{ formatPosition(car.position) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#map {
  width: 100%;
  position: 'relative';
  aspect-ratio: 4 / 3;
}

.map-container {
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.search-form__input {
  padding-inline: 0.6rem;
  padding-block: 0.35rem;
  border-top-left-radius: 0.4rem;
  border-bottom-left-radius: 0.4rem;
  border: 2px solid #94a3b8;
  border-right: none;
}

.search-form__button {
  padding-inline: 0.6rem;
  padding-block: 0.35rem;
  background-color: #f1f5f9;
  border-color: #94a3b8;
  border-top-right-radius: 0.4rem;
  border-bottom-right-radius: 0.4rem;
  color: #334155;
  font-weight: 600;
}

.container {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto;
}

.cars-container {
  padding: 1rem;
  margin-top: 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.car-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  align-items: center;
  border: 1px solid rgb(201, 209, 216);
  border-radius: 0.5rem;
  overflow: hidden;
}

.car-card__img {
  padding-left: 0.5rem;
}

.car-card__content {
  padding: 0.8rem;
  height: 100%;
  background-color: rgb(245, 245, 245);
}

.car-card__plate {
  font-weight: bold;
}

.car-card__position {
  display: flex;
  align-items: center;
  gap: 5px;
}

.popup {
  color: red;
}
</style>
