<template>
  <Teleport to="body">
    <div
      ref="modalEl"
      class="modal fade"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-fullscreen">
        <div class="modal-content qala-map-modal-content">
          <div class="modal-header qala-map-modal-header">
            <div>
              <h5 class="modal-title">Найти место на карте</h5>
              <p>Найди место через поиск или поставь точку вручную</p>
            </div>

            <button
              type="button"
              class="btn-close"
              aria-label="Закрыть"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div class="modal-body qala-map-modal-body">
            <div class="qala-map-search">
              <input
                v-model.trim="query"
                type="text"
                class="form-control qala-map-input"
                placeholder="Например: IT Hub Karaganda"
                @keyup.enter="searchPlaces"
              />

              <button
                type="button"
                class="btn qala-map-search-btn"
                :disabled="isLoading || !query"
                @click="searchPlaces"
              >
                <span
                  v-if="isLoading"
                  class="spinner-border spinner-border-sm"
                  aria-hidden="true"
                ></span>

                <i v-else class="bi bi-search"></i>
                <span>Найти</span>
              </button>
            </div>

            <div v-if="error" class="qala-map-error">
              {{ error }}
            </div>

            <div v-if="selectedCoords" class="qala-map-selected">
              <i class="bi bi-geo-alt-fill"></i>
              <span>
                Точка выбрана:
                {{ selectedCoords.lat.toFixed(6) }},
                {{ selectedCoords.lng.toFixed(6) }}
              </span>
            </div>

            <div class="qala-map-layout">
              <div class="qala-map-results">
                <button
                  v-for="place in places"
                  :key="place.place_id"
                  type="button"
                  class="qala-map-result"
                  :class="{ active: selectedPlace?.place_id === place.place_id }"
                  @click="selectPlace(place)"
                >
                  <strong>{{ getPlaceTitle(place) }}</strong>
                  <span>{{ place.display_name }}</span>
                </button>

                <div v-if="!places.length && !isLoading" class="qala-map-empty">
                  <i class="bi bi-geo-alt"></i>
                  <strong>Пока нет результатов</strong>
                  <span>Введите адрес и нажмите “Найти”</span>
                </div>
              </div>

              <div class="qala-map-wrap">
                <div ref="mapEl" class="qala-map"></div>

                <div class="qala-map-help">
                  <i class="bi bi-cursor"></i>
                  <span>Кликни по карте или перетащи маркер, чтобы уточнить точку</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer qala-map-modal-footer">
            <button
              type="button"
              class="btn qala-map-cancel-btn"
              data-bs-dismiss="modal"
            >
              Отмена
            </button>

            <button
              type="button"
              class="btn qala-map-apply-btn"
              :disabled="!selectedCoords"
              @click="applyPlace"
            >
              <i class="bi bi-check2-circle"></i>
              <span>Выбрать место</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Modal } from 'bootstrap'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  initialQuery: {
    type: String,
    default: '',
  },
  initialLat: {
    type: [Number, String],
    default: null,
  },
  initialLng: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const modalEl = ref(null)
const mapEl = ref(null)

const query = ref('')
const places = ref([])
const selectedPlace = ref(null)
const selectedCoords = ref(null)
const isLoading = ref(false)
const error = ref('')

let modal = null
let map = null
let marker = null

const defaultCenter = [49.8047, 73.1094]

const markerIcon = L.divIcon({
  className: 'qala-leaflet-marker',
  html: '<div></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

const hasInitialCoords = () => {
  const lat = Number(props.initialLat)
  const lng = Number(props.initialLng)

  return Number.isFinite(lat) && Number.isFinite(lng)
}

const getInitialCoords = () => {
  return {
    lat: Number(props.initialLat),
    lng: Number(props.initialLng),
  }
}

const getPlaceTitle = (place) => {
  return place?.name || place?.display_name?.split(',')?.[0] || 'Выбранная точка'
}

const getManualAddress = () => {
  return query.value || props.initialQuery || 'Точка выбрана вручную'
}

const buildOsmUrl = (lat, lng) => {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`
}

const resetModalState = () => {
  query.value = props.initialQuery || ''
  error.value = ''
  places.value = []
  selectedPlace.value = null
  selectedCoords.value = null

  if (marker) {
    marker.remove()
    marker = null
  }
}

const initMap = async () => {
  await nextTick()

  if (!mapEl.value) {
    return
  }

  if (map) {
    setTimeout(() => map.invalidateSize(), 150)
    return
  }

  map = L.map(mapEl.value, {
    zoomControl: true,
    attributionControl: true,
  }).setView(defaultCenter, 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map)

  map.on('click', (event) => {
    const { lat, lng } = event.latlng

    if (!selectedPlace.value) {
      selectedPlace.value = {
        place_id: `manual-${Date.now()}`,
        name: 'Выбранная точка',
        display_name: getManualAddress(),
        isManual: true,
      }
    }

    setMarker(lat, lng, false)
  })

  setTimeout(() => map.invalidateSize(), 150)
}

const setMarker = (lat, lng, shouldCenter = true) => {
  if (!map) {
    return
  }

  if (!marker) {
    marker = L.marker([lat, lng], {
      icon: markerIcon,
      draggable: true,
    }).addTo(map)

    marker.on('dragend', () => {
      const position = marker.getLatLng()

      selectedCoords.value = {
        lat: position.lat,
        lng: position.lng,
      }
    })
  } else {
    marker.setLatLng([lat, lng])
  }

  selectedCoords.value = { lat, lng }

  if (shouldCenter) {
    map.setView([lat, lng], 16)
  }
}

const searchPlaces = async () => {
  if (!query.value || isLoading.value) {
    return
  }

  isLoading.value = true
  error.value = ''
  selectedPlace.value = null
  selectedCoords.value = null

  if (marker) {
    marker.remove()
    marker = null
  }

  try {
    const params = new URLSearchParams({
      q: query.value,
      format: 'jsonv2',
      addressdetails: '1',
      limit: '7',
    })

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)

    if (!response.ok) {
      throw new Error('Search failed')
    }

    places.value = await response.json()

    if (!places.value.length) {
      error.value = 'Ничего не найдено. Попробуйте написать адрес подробнее.'
      return
    }

    selectPlace(places.value[0])
  } catch {
    error.value = 'Не удалось выполнить поиск. Попробуйте ещё раз.'
  } finally {
    isLoading.value = false
  }
}

const selectPlace = (place) => {
  selectedPlace.value = place

  const lat = Number(place.lat)
  const lng = Number(place.lon)

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    setMarker(lat, lng)
  }
}

const applyPlace = () => {
  if (!selectedCoords.value) {
    return
  }

  const lat = Number(selectedCoords.value.lat)
  const lng = Number(selectedCoords.value.lng)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return
  }

  const address = selectedPlace.value?.display_name || getManualAddress()

  emit('select', {
    name: selectedPlace.value ? getPlaceTitle(selectedPlace.value) : 'Выбранная точка',
    address,
    lat,
    lng,
    url: buildOsmUrl(lat, lng),
    raw: selectedPlace.value,
  })

  modal?.hide()
}

const openModal = async () => {
  resetModalState()
  modal?.show()

  await nextTick()
  await initMap()

  if (hasInitialCoords()) {
    const { lat, lng } = getInitialCoords()

    selectedPlace.value = {
      place_id: `saved-${lat}-${lng}`,
      name: query.value || 'Сохранённая точка',
      display_name: query.value || 'Сохранённая точка',
      isSaved: true,
    }

    setMarker(lat, lng)
    return
  }

  if (query.value) {
    await searchPlaces()
  }
}

const closeModal = () => {
  modal?.hide()
}

onMounted(() => {
  if (!modalEl.value) {
    return
  }

  modal = new Modal(modalEl.value, {
    backdrop: true,
    keyboard: true,
    focus: true,
  })

  modalEl.value.addEventListener('shown.bs.modal', () => {
    setTimeout(() => map?.invalidateSize(), 150)
  })

  modalEl.value.addEventListener('hidden.bs.modal', () => {
    emit('update:modelValue', false)
  })

  if (props.modelValue) {
    openModal()
  }
})

onBeforeUnmount(() => {
  modal?.dispose()
  modal = null

  if (map) {
    map.remove()
    map = null
  }
})

watch(
  () => props.modelValue,
  (value) => {
    if (!modal) {
      return
    }

    if (value) {
      openModal()
      return
    }

    closeModal()
  },
)
</script>

<style scoped>
.qala-map-modal-content {
  height: 100vh;
  border: 0;
  border-radius: 0;
  background: #fff;
}

.qala-map-modal-header {
  min-height: 72px;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #eee;
}

.qala-map-modal-header h5,
.qala-map-modal-header p {
  margin: 0;
}

.qala-map-modal-header h5 {
  color: #111;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.qala-map-modal-header p {
  margin-top: 4px;
  color: #737373;
  font-size: 13px;
  font-weight: 600;
}

.qala-map-modal-body {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 14px;
}

.qala-map-search {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 130px;
  gap: 10px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.qala-map-input {
  height: 44px;
  border: 1px solid #eee;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: none;
}

.qala-map-input:focus {
  border-color: #111;
  box-shadow: 0 0 0 4px #0000000a;
}

.qala-map-search-btn,
.qala-map-apply-btn,
.qala-map-cancel-btn {
  min-height: 44px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 850;
}

.qala-map-search-btn,
.qala-map-apply-btn {
  border: 0;
  background: #111;
  color: #fff;
}

.qala-map-search-btn:hover,
.qala-map-apply-btn:hover {
  background: #222;
  color: #fff;
}

.qala-map-search-btn:disabled,
.qala-map-apply-btn:disabled {
  background: #d4d4d4;
  color: #fff;
}

.qala-map-cancel-btn {
  border: 1px solid #eee;
  background: #fff;
  color: #111;
}

.qala-map-cancel-btn:hover {
  background: #f7f7f7;
}

.qala-map-error,
.qala-map-selected {
  margin-bottom: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.qala-map-error {
  background: #fff1f2;
  color: #ef4444;
}

.qala-map-selected {
  background: #f7f7f7;
  color: #111;
  display: flex;
  align-items: center;
  gap: 8px;
}

.qala-map-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 12px;
}

.qala-map-results {
  min-height: 0;
  overflow: auto;
  padding-right: 2px;
  display: grid;
  align-content: start;
  gap: 8px;
}

.qala-map-result {
  width: 100%;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 16px;
  background: #fff;
  text-align: left;
}

.qala-map-result:hover,
.qala-map-result.active {
  border-color: #111;
  background: #fafafa;
}

.qala-map-result strong {
  display: block;
  margin-bottom: 4px;
  color: #111;
  font-size: 13px;
  font-weight: 900;
}

.qala-map-result span {
  display: block;
  color: #737373;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.45;
}

.qala-map-empty {
  min-height: 220px;
  border: 1px dashed #ddd;
  border-radius: 18px;
  background: #fafafa;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  padding: 18px;
}

.qala-map-empty i {
  color: #b0b0b0;
  font-size: 30px;
  margin-bottom: 8px;
}

.qala-map-empty strong {
  color: #111;
  font-size: 14px;
  font-weight: 900;
}

.qala-map-empty span {
  margin-top: 4px;
  color: #8a8a8a;
  font-size: 12px;
  font-weight: 600;
}

.qala-map-wrap {
  position: relative;
  min-width: 0;
  min-height: 0;
}

.qala-map {
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: 18px;
  overflow: hidden;
  background: #f3f4f6;
}

.qala-map-help {
  position: absolute;
  left: 12px;
  bottom: 12px;
  z-index: 500;
  max-width: calc(100% - 24px);
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #ffffffeb;
  color: #111;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 800;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px #0000001a;
}

.qala-map-modal-footer {
  min-height: 72px;
  padding: 14px 18px;
  border-top: 1px solid #eee;
  background: #fff;
}

:global(.qala-leaflet-marker) {
  border-radius: 999px;
}

:global(.qala-leaflet-marker div) {
  width: 26px;
  height: 26px;
  border: 5px solid #111;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 8px 24px #00000033;
}

@media (max-width: 991px) {
  .qala-map-modal-body {
    overflow: auto;
  }

  .qala-map-layout {
    grid-template-columns: 1fr;
  }

  .qala-map-results {
    max-height: 220px;
  }

  .qala-map-wrap,
  .qala-map {
    min-height: 420px;
  }
}

@media (max-width: 520px) {
  .qala-map-modal-header {
    min-height: 68px;
    padding: 12px 14px;
  }

  .qala-map-modal-header h5 {
    font-size: 18px;
  }

  .qala-map-modal-header p {
    font-size: 12px;
  }

  .qala-map-modal-body {
    padding: 12px;
  }

  .qala-map-search {
    grid-template-columns: 1fr;
  }

  .qala-map-wrap,
  .qala-map {
    min-height: 380px;
  }

  .qala-map-help {
    right: 12px;
    border-radius: 16px;
    line-height: 1.3;
    padding: 8px 10px;
  }

  .qala-map-modal-footer {
    min-height: 72px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .qala-map-cancel-btn,
  .qala-map-apply-btn {
    width: 100%;
  }
}
</style>