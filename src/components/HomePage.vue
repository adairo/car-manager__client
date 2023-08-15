<!-- eslint-disable no-undef -->
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

/* const searchBar = L.Control.extend({
  onAdd() {
    const searchForm = document.createElement('form')
    const input = document.createElement('input')
    input.type = 'search'

    const searchButton = document.createElement('button')
    searchButton.textContent = t('home.searchCarButton')
    searchButton.type = 'submit'

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const carId = Number(input.value)
      const matchedCar = carMarkers.value.find((car) => Number(car.data.id) === Number(input.value))
      if (!matchedCar) {
        return console.error('Car with id ' + carId + ' does not exist')
      }

      const position = matchedCar.marker.getLatLng()
      map.value.flyTo(position, 12)
      // const popup = matchedCar.marker.getPopup()
      // console.log({ popup })
      // map.value.openPopup(matchedCar.marker.getPopup())
      matchedCar.marker.openPopup()
      // L.popup().setLatLng(position).setContent('Hi').openOn(map.value)
    })

    searchForm.appendChild(input)
    searchForm.appendChild(searchButton)
    return searchForm
  },
  onRemove() {}
}) */

function fetchCars() {
  const session = getSession()
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
    const carToUpdateIndex = carMarkers.value.findIndex((car) => car.data.id === payload.carId)
    carMarkers.value[carToUpdateIndex].marker.setLatLng(
      L.latLng(payload.position.lattitude, payload.position.longitude)
    )
  })
})

function handleSearchCar() {
  const machedCar = cars.value.find((car) => car.id === Number(searchCarInput.value))
  if (!machedCar) {
    return console.log('No car was found')
  }
  map.value.leafletObject.flyTo(L.latLng([machedCar.position.x, machedCar.position.y]))
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

    <!-- <div ref="mapNode" id="map"></div> -->
  </div>
  <!-- <ul>
    <li v-for="car in cars" :key="car.id">
      {{ car }}
    </li>
  </ul>
  <button @click="openCarPopup">open</button> -->
</template>

<style scoped>
#map {
  width: 100%;
  position: 'relative';
  aspect-ratio: 4 / 3;
}

.search-form__input {
  padding-inline: 0.6rem;
  padding-block: 0.3rem;
  border-top-left-radius: 0.4rem;
  border-bottom-left-radius: 0.4rem;
  border: 2px solid lightslategray;
  border-right: none;
}

.search-form__button {
  padding-inline: 0.6rem;
  padding-block: 0.3rem;
  background-color: darkslategray;
  border-color: darkslategray;
  border-top-right-radius: 0.4rem;
  border-bottom-right-radius: 0.4rem;
  color: white;
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
