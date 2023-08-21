<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref, computed, reactive } from 'vue'
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
  LControl,
  LPolyline
} from '@vue-leaflet/vue-leaflet'
import { xfetch } from '../lib/xfetch'
import { z } from 'zod'

const session = getSession()
const router = useRouter()

if (!session) {
  router.push('/login')
}

const { t, locale } = useI18n()
const cars = ref([])
const mapRef = ref(null)
const registerCarDialog = ref(null)
const editCarDialog = ref(null)

const searchCarInput = ref()

const newCarData = ref({
  plate: '',
  position: { lattitude: '', longitude: '' }
})

const editCarData = ref({
  id: undefined,
  plate: ''
})

const selectedCar = reactive({
  carId: undefined,
  positionHistory: []
})

const timeFormatter = computed(
  () => (
    console.log(locale),
    new Intl.DateTimeFormat(locale.value, { dateStyle: 'short', timeStyle: 'short' })
  )
)

const plateSchema = z
  .string()
  .trim()
  .nonempty()
  .min(7)
  .max(7)
  .regex(/[a-zA-Z0-9]{7}/)
  .transform((plate) => plate.toUpperCase())

const registerCarSchema = z
  .object({
    plate: plateSchema.transform((plate) => plate.toUpperCase()),
    position: z.object({
      lattitude: z.literal('').or(z.coerce.number().min(-90.0).max(90.0)),
      longitude: z.literal('').or(z.coerce.number().min(-180.0).max(180.0))
    })
  })
  .refine((carData) => {
    const { lattitude, longitude } = carData.position
    return (lattitude === '' && longitude === '') || (lattitude !== '' && longitude !== '')
  })
  .transform((carData) => {
    if (carData.position.longitude === '') {
      return { plate: carData.plate }
    }

    return carData
  })

const editCarSchema = z.object({
  id: z.number(),
  plate: plateSchema
})

const mapProps = {
  zoom: 10,
  'min-zoom': 9,
  'max-zoom': 17,
  ref: mapRef,
  style: { width: '100%', height: '500px' },
  center: [20.708692, -103.409774],
  options: { fullscreenControl: true }
}

const url = new URL('http://localhost:3000/cars')
const authToken = 'Bearer ' + session

function fetchCars() {
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
    fetchCars()
    const carToUpdateIndex = cars.value.findIndex((car) => car.id === payload.carId)
    cars.value[carToUpdateIndex].currentPosition = {
      x: payload.position.lattitude,
      y: payload.position.longitude
    }

    if (payload.carId === selectedCar.carId) {
      fetchPositionHistory(payload.carId)
    }
  })
})

function fetchPositionHistory(carId) {
  fetch('http://localhost:3000/position/' + carId, {
    method: 'GET'
  })
    .then((res) => res.json())
    .then((history) => (selectedCar.positionHistory = history))
}

function positionToLatLng(position) {
  return L.latLng([position.x, position.y])
}

function mapFlyTo(latLng, zoom = 12) {
  mapRef.value.leafletObject.flyTo(latLng, zoom)
}

function handleSearchCar() {
  const machedCar = cars.value.find((car) => car.id === Number(searchCarInput.value))
  if (!machedCar) {
    return console.log('No car was found')
  }
  mapFlyTo(positionToLatLng(machedCar.currentPosition))
}

function handleDeleteCar(carId) {
  if (!window.confirm('¿Estás seguro de que quieres eliminar este auto?')) {
    return console.log('delete-car aborted')
  }
  fetch(`http://localhost:3000/cars/${carId}`, {
    method: 'DELETE',
    headers: {
      authorization: authToken,
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(() => {
    cars.value = cars.value.filter((car) => car.id !== carId)
  })
}

function handleToggleDialog() {
  registerCarDialog.value.showModal()
}

function openEditDialog(id) {
  const carToEdit = cars.value.find((car) => car.id === id)
  editCarData.value.id = carToEdit.id
  editCarData.value.plate = carToEdit.plate

  editCarDialog.value.showModal()
}

function closeEditDialog() {
  editCarDialog.value.close()
}

onMounted(() => {
  editCarDialog.value.addEventListener('close', () => {
    editCarData.value.id = undefined
    editCarData.value.plate = ''
  })
})

function handleRegisterCar() {
  const payload = registerCarSchema.safeParse(newCarData.value)
  if (!payload.success) {
    return alert('Hay un error en los datos del formulario')
  }
  xfetch
    .post('http://localhost:3000/cars', {
      body: JSON.stringify(payload.data)
    })
    .then((car) => cars.value.push(car))
    .then(() => {
      newCarData.value.plate = ''
      newCarData.value.position = { lattitude: '', longitude: '' }
      registerCarDialog.value.close()
    })
    .catch((e) => {
      console.log(e)
    })
}

function handleEditCar() {
  const payload = editCarSchema.safeParse(editCarData.value)
  if (!payload.success) {
    return alert('Hay un error en los datos del formulario')
  }
  xfetch
    .patch('http://localhost:3000/cars/' + payload.data.id, {
      body: JSON.stringify(payload.data)
    })
    .then(fetchCars)
    .then(() => editCarDialog.value.close())
    .catch((e) => {
      console.log(e)
    })
}

function handleSelectCar(carId) {
  // mapFlyTo(positionToLatLng(carRef.currentPosition))
  selectedCar.carId = carId
  fetchPositionHistory(carId)
}

function handleFlyToCar(carId) {
  const carTarget = cars.value.find((car) => car.id === carId)
  if (!carTarget) {
    return alert('Operación inválida')
  }

  mapFlyTo(positionToLatLng(carTarget.currentPosition))
}

function formatPosition(latLng) {
  return `${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}`
}
</script>

<template>
  <div class="container">
    <h1 class="page-title">{{ t('home.carsTitle') }}</h1>
    <div class="map-container">
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

        <l-polyline
          :lat-lngs="selectedCar.positionHistory.map((point) => positionToLatLng(point.position))"
        />
        <l-control-layers />
        <!--  <l-marker
          v-for="point in selectedCar.positionHistory"
          :key="point.id"
          :lat-lng="positionToLatLng(point.position)"
        /> -->
        <l-marker
          v-for="car in cars"
          :key="car.id"
          :lat-lng="{ lat: car.currentPosition.x, lng: car.currentPosition.y }"
        >
          <l-icon :icon-url="icon" :icon-size="[50, 50]" />
          <l-popup>
            <div class="car-popup">
              <div class="car-popup__plate">
                {{ car.plate }}
              </div>
              <div class="car-popup__id">
                {{ car.id }}
              </div>

              <div style="display: flex; align-items: center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  class=""
                  style="width: 14px; height: 14px; margin-right: 3px; fill: rgb(135, 153, 170)"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                    clip-rule="evenodd"
                  />
                </svg>

                <span>{{ formatPosition(positionToLatLng(car.currentPosition)) }}</span>
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
      <div class="cars-container">
        <div
          v-for="car in cars"
          :data-selected="selectedCar.carId === car.id"
          :key="car.id"
          @click="handleSelectCar(car.id)"
          class="car-card"
        >
          <div class="car-card__img">
            <img :src="icon" :width="64" :height="64" />
          </div>
          <div class="car-card__content">
            <div class="car-card__plate">{{ car.plate }}</div>
            <div style="margin-top: -0.2rem; margin-bottom: 0.5rem">
              {{
                t('home.createdAtMessage', { time: timeFormatter.format(new Date(car.createdAt)) })
              }}
            </div>
            <div class="car-card__actions">
              <!-- {{ formatPosition(car.position) }} -->
              <button @click.stop="handleDeleteCar(car.id)" class="car-card__button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="car-card__icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>

              <button @click.stop="openEditDialog(car.id)" class="car-card__button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="car-card__icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
                <span>{{ t('home.editCarButton') }}</span>
              </button>
              <button @click.stop="handleFlyToCar(car.id)" class="car-card__button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="car-card__icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span>{{ t('home.locateCarButton') }}</span>
              </button>
            </div>
          </div>
        </div>
        <button @click="handleToggleDialog" class="create-car-button button-full">
          {{ t('home.registerCarButton') }}
        </button>
        <dialog ref="registerCarDialog" class="register-dialog">
          <form class="form" style="box-shadow: none" @submit.prevent="handleRegisterCar">
            <h3 class="form__title">Registrar auto</h3>
            <div class="form__field">
              <label for="newcar-plate">Matrícula</label>
              <input v-model="newCarData.plate" required type="text" />
            </div>
            <div class="form__field">
              <label for="newcar-lat">Latitud</label>
              <input v-model="newCarData.position.lattitude" type="text" inputmode="decimal" />
            </div>
            <div class="form__field">
              <label for="newcar-lat">Longitud</label>
              <input v-model="newCarData.position.longitude" type="text" inputmode="decimal" />
            </div>
            <div class="form__field form-buttons">
              <button @click="registerCarDialog.close()" type="button" class="button">
                Cancelar
              </button>
              <button type="submit" class="button">Guardar</button>
            </div>
          </form>
        </dialog>
        <dialog ref="editCarDialog" class="register-dialog">
          <form class="form" style="box-shadow: none" @submit.prevent="handleEditCar">
            <h3 class="form__title">Editar auto</h3>
            <div class="form__field">
              <label for="newcar-plate">Matrícula</label>
              <input v-model="editCarData.plate" required type="text" />
            </div>

            <div class="form__field form-buttons">
              <button @click="closeEditDialog" type="button" class="button">Cancelar</button>
              <button type="submit" class="button">Guardar</button>
            </div>
          </form>
        </dialog>
      </div>
    </div>
  </div>
</template>

<style scoped>
#map {
  width: 100%;
  aspect-ratio: 4 / 3;
}

.container {
  padding: 1.5rem;
  max-width: 1200px;
  margin-inline: auto;
}

.map-container {
  display: grid;
  grid-template-rows: auto auto;
  gap: 1rem;
  /* grid-template-columns: 1fr 24rem; */
}

@media (min-width: 800px) {
  .map-container {
    grid-template-rows: auto;
    grid-template-columns: 1fr 24rem;
  }
}

.form-buttons {
  display: flex;
  flex-direction: row;
  justify-content: end;
  gap: 0.5rem;
}

.create-car-button {
  padding-block: 0.8rem;
  margin-top: 0.5rem;
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

.cars-container {
  gap: 0.6rem;
  height: 500px;
  overflow-y: scroll;
}

.cars-container > * + * {
  margin-top: 0.3rem;
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
  background-color: rgb(249, 249, 249);
}

.car-card[data-selected='true'] .car-card__content {
  background-color: #7dd3fc;
}

.car-card__plate {
  font-weight: bold;
}

.car-card__actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.car-card__button {
  display: flex;
  align-items: center;
}

.car-card__icon {
  --icon-size: 20px;
  width: var(--icon-size);
  height: var(--icon-size);
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr;
  padding: 0.2rem;
}

.car-popup {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.car-popup__plate {
  font-weight: 800;
  font-size: large;
  margin-bottom: 10px;
}

.car-popup__id {
  position: absolute;
  left: -8px;
  top: 3px;
  width: 20px;
  height: 20px;
}

.register-dialog {
  left: 50vw;
  top: 50vh;
  transform: translate(-50%, -50%);
}

.popup {
  color: red;
}
</style>
