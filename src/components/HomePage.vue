<!-- eslint-disable no-undef -->
<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { getSession } from '../lib/session'
import icon from '../components/CarIcon/icon.png'
import { socket } from '../socket'

const cars = ref([])
const map = ref(null)
const carMarkers = ref([])
const carIcon = L.icon({
  iconUrl: icon,
  iconSize: [50, 50]
})

const router = useRouter()
const session = getSession()

if (!session) {
  router.push('/login')
}

const searchBar = L.Control.extend({
  onAdd() {
    const searchForm = document.createElement('form')
    const input = document.createElement('input')
    input.type = 'search'

    const searchButton = document.createElement('button')
    searchButton.textContent = 'Search plate'
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
})

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

function createCarPopup(carData) {
  return `
  <div>
    <div class="car-popover">
      <div>
        <strong style="font-weight: 800;">Car id</strong>
        <span>${carData.id}</span>
        </div>
      </div>  

      <div>
        <strong style="font-weight: 800;">Plate</strong>
        <span>${carData.plate}</span>
        </div>
      </div>
      
      <div>
        <strong style="font-weight: 800;">Lattitude</strong>
        <span>${carData.position.x}</span>
        </div>
      </div> 
      
      <div>
        <strong style="font-weight: 800;">Lattitude</strong>
        <span>${carData.position.y}</span>
        </div>
      </div>  
  </div>
  `
}
// Save an array of objects wich holds reference to the original car data
// and marker object (L.marker)
watch(cars, (newCars) => {
  carMarkers.value = newCars.map((car) => ({
    marker: L.marker([car.position.x, car.position.y], { icon: carIcon }),
    data: car
  }))
  carMarkers.value.forEach((car) => {
    car.marker.bindPopup(createCarPopup(car.data)).openPopup()
    car.marker.addTo(map.value)
  })
})

// Draw map
onMounted(() => {
  const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  })

  var alidadeSmoothDark = L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    {
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }
  )

  map.value = L.map('map', {
    center: [20.710429418405212, -103.40982443626814],
    layers: [openStreetMap, alidadeSmoothDark],
    minZoom: 9,
    zoom: 10,
    maxZoom: 17
  })

  const baseMaps = {
    openStreetMap,
    'dark map': alidadeSmoothDark
  }

  const layerControl = L.control.layers(baseMaps)
  layerControl.addTo(map.value)
  new searchBar().addTo(map.value)
  /* map.value.on('click', (e) => {
    L.popup().setLatLng(e.latlng).setContent(`${e.latlng.lat}, ${e.latlng.lng}`).openOn(map.value)
  }) */
})
</script>

<template>
  <div class="container">
    <h1>My cars</h1>
    <div ref="mapNode" id="map"></div>
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

.container {
  padding: 1.5rem;
}

.popup {
  color: red;
}
</style>
