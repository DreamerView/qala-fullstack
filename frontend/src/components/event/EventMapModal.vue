<template>
  <div
    ref="modalEl"
    class="modal fade qala-map-modal"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-heading">
            <h5 class="modal-title">Локация события</h5>
            <p class="modal-subtitle">{{ placeTitle }}</p>
          </div>

          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Закрыть"
          />
        </div>

        <div class="modal-body">
          <div v-if="hasCoords" ref="mapEl" class="qala-map" />

          <div v-else class="qala-map-empty">
            <i class="bi bi-geo-alt"></i>
            <h6>Координаты не указаны</h6>
            <p>Организатор пока не добавил точную точку на карте.</p>
          </div>
        </div>

        <div class="modal-footer">
          <template v-if="hasCoords">
            <div class="map-footer-info">
              <strong>Найти в удобной карте</strong>
              <span>{{ coords.lat }}, {{ coords.lng }}</span>
            </div>

            <div class="map-footer-actions">
              <a
                v-for="link in mapLinks"
                :key="link.title"
                :href="link.url"
                class="map-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i :class="link.icon"></i>
                {{ link.title }}
              </a>

              <button
                type="button"
                class="map-close-btn"
                data-bs-dismiss="modal"
              >
                Закрыть
              </button>
            </div>
          </template>

          <button
            v-else
            type="button"
            class="map-close-btn"
            data-bs-dismiss="modal"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import 'leaflet/dist/leaflet.css'

import { Modal } from 'bootstrap'
import L from 'leaflet'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    default: null,
  },
})

const modalEl = ref(null)
const mapEl = ref(null)

let modal = null
let map = null
let marker = null

const toCoord = (value) => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const coords = computed(() => {
  const lat = toCoord(props.event?.lat)
  const lng = toCoord(props.event?.lng ?? props.event?.lon)

  return { lat, lng }
})

const hasCoords = computed(() => {
  return coords.value.lat !== null && coords.value.lng !== null
})

const placeTitle = computed(() => {
  return props.event?.address || props.event?.location || props.event?.place || 'Место не указано'
})

const mapLinks = computed(() => {
  if (!hasCoords.value) return []

  const { lat, lng } = coords.value
  const point = `${lat},${lng}`

  return [
    {
      title: '2GIS',
      icon: 'bi bi-compass',
      url: `https://2gis.kz/search/${point}`,
    },
    {
      title: 'Google Maps',
      icon: 'bi bi-google',
      url: `https://www.google.com/maps/search/?api=1&query=${point}`,
    },
    {
      title: 'Яндекс Карты',
      icon: 'bi bi-map',
      url: `https://yandex.kz/maps/?text=${point}`,
    },
  ]
})

const markerIcon = L.divIcon({
  className: 'qala-map-marker',
  html: '<span></span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

const getModal = () => {
  if (!modal && modalEl.value) {
    modal = new Modal(modalEl.value, {
      backdrop: true,
      keyboard: true,
    })
  }

  return modal
}

const setMapView = () => {
  if (!map || !hasCoords.value) return

  const point = [coords.value.lat, coords.value.lng]

  map.setView(point, 16)

  if (!marker) {
    marker = L.marker(point, { icon: markerIcon }).addTo(map)
    return
  }

  marker.setLatLng(point)
}

const createMap = () => {
  if (!mapEl.value || map || !hasCoords.value) return

  map = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map)

  L.control.zoom({
    position: 'topright',
  }).addTo(map)

  setMapView()
}

const refreshMap = async () => {
  if (!hasCoords.value) return

  await nextTick()

  createMap()

  if (!map) return

  map.invalidateSize()
  setMapView()
}

const open = () => {
  getModal()?.show()
}

const handleShown = () => {
  refreshMap()
}

onMounted(() => {
  modalEl.value?.addEventListener('shown.bs.modal', handleShown)
})

onBeforeUnmount(() => {
  modalEl.value?.removeEventListener('shown.bs.modal', handleShown)

  marker?.remove()
  map?.remove()
  modal?.dispose()

  marker = null
  map = null
  modal = null
})

watch(coords, () => {
  refreshMap()
})

defineExpose({ open })
</script>

<style scoped>
.qala-map-modal :deep(.modal-content) {
  height: 100vh;
  border: 0;
  border-radius: 0;
  background: #fff;
}

.modal-header {
  min-height: 74px;
  align-items: center;
  gap: 14px;
  padding: 14px 22px;
  border-bottom: 1px solid #eee;
  background: #fff;
}

.modal-heading {
  min-width: 0;
}

.modal-title {
  margin: 0;
  color: #111;
  font-size: 19px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.modal-subtitle {
  max-width: 900px;
  margin: 4px 0 0;
  overflow: hidden;
  color: #777;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-body {
  min-height: 0;
  flex: 1 1 auto;
  padding: 0;
  overflow: hidden;
}

.qala-map {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: #f5f5f5;
}

.qala-map-empty {
  width: 100%;
  height: 100%;
  min-height: 360px;
  display: grid;
  place-items: center;
  align-content: center;
  padding: 36px;
  text-align: center;
  background: #fafafa;
}

.qala-map-empty i {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  margin-bottom: 16px;
  border-radius: 50%;
  color: #111;
  background: #f1f1f1;
  font-size: 27px;
}

.qala-map-empty h6 {
  margin: 0 0 6px;
  color: #111;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.qala-map-empty p {
  max-width: 340px;
  margin: 0;
  color: #777;
  font-size: 14px;
  line-height: 1.55;
  font-weight: 600;
}

.modal-footer {
  min-height: 78px;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 18px;
  border-top: 1px solid #eee;
  background: #fff;
}

.map-footer-info {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.map-footer-info strong {
  color: #111;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.025em;
}

.map-footer-info span {
  overflow: hidden;
  color: #777;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-footer-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.map-link,
.map-close-btn {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 850;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    opacity 0.18s ease,
    transform 0.18s ease;
}

.map-link {
  border: 1px solid #e9e9e9;
  color: #111;
  background: #fafafa;
}

.map-link:hover {
  border-color: #ddd;
  color: #111;
  background: #f2f2f2;
  transform: translateY(-1px);
}

.map-link i {
  font-size: 14px;
}

.map-close-btn {
  border: 0;
  color: #fff;
  background: #111;
}

.map-close-btn:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

:deep(.leaflet-control-zoom) {
  overflow: hidden;
  border: 0;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
}

:deep(.leaflet-control-zoom a) {
  border: 0;
  color: #111;
  font-weight: 900;
}

:deep(.leaflet-control-attribution) {
  border-radius: 10px 0 0 0;
  font-size: 10px;
}

:deep(.qala-map-marker) {
  display: grid;
  place-items: center;
}

:deep(.qala-map-marker span) {
  width: 22px;
  height: 22px;
  display: block;
  border: 5px solid #111;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}

@media (max-width: 860px) {
  .modal-header {
    min-height: 66px;
    padding: 12px 16px;
  }

  .modal-title {
    font-size: 17px;
  }

  .modal-subtitle {
    max-width: calc(100vw - 76px);
    font-size: 13px;
  }

  .modal-footer {
    align-items: stretch;
    flex-direction: column;
    min-height: auto;
    padding: 12px;
  }

  .map-footer-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-content: stretch;
    width: 100%;
  }

  .map-link,
  .map-close-btn {
    width: 100%;
  }

  .map-close-btn {
    grid-column: 1 / -1;
  }
}

@media (max-width: 420px) {
  .map-footer-actions {
    grid-template-columns: 1fr;
  }
}
</style>