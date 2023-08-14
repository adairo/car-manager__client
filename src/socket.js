import { io } from 'socket.io-client'
import { reactive } from 'vue'

export const state = reactive({
  connected: false,
  carPositionUpdates: []
})

const url = 'http://localhost:3000'

export const socket = io(url)

socket.on('connect', () => {
  state.connected = true
})

socket.on('disconnect', () => {
  state.connected = false
})

socket.on('cars:position-updated', (payload) => {
  state.carPositionUpdates.push(payload)
})
