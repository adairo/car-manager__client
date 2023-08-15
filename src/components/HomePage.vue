<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { getSession } from '../lib/session'
import icon from '../components/CarIcon/icon.png'
import { socket } from '../socket'
import { useI18n } from 'vue-i18n'
import 'leaflet/dist/leaflet.css'
import {
  LMap,
  LTileLayer,
  LMarker,
  LIcon,
  LPopup,
  LControlLayers,
  LControl
} from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'

const { t } = useI18n()
const cars = ref([])
const map = ref(null)
const searchCarInput = ref()
const router = useRouter()
const session = getSession()

if (!session) {
  router.push('/login')
}

function fetchCars() {
  const authToken = 'Bearer ' + session
  const url = new URL('http://localhost:3000/cars')

  // get cars positions through normal http request
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
    <h1>{{ t('home.carsTitle') }}</h1>
    <l-map
      :zoom="10"
      :min-zoom="9"
      :max-zoom="17"
      ref="map"
      style="width: 100%; height: 500px"
      :center="[20.708692, -103.409774]"
    >
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
</template>

<style scoped>
#map {
  width: 100%;
  position: 'relative';
  aspect-ratio: 4 / 3;
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

/* .search-form__input:focus {
  outline: none;
} */

.container {
  padding: 1.5rem;
}

.popup {
  color: red;
}
</style>
