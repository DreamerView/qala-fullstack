<template>
  <aside class="qala-event-sidebar">
    <div class="qala-info-card">
      <h2>Детали</h2>

      <div class="qala-info-list">
        <div
          v-for="item in details"
          :key="item.label"
          class="qala-info-item"
        >
          <span class="qala-info-icon">
            <i class="bi" :class="item.icon"></i>
          </span>

          <div>
            <strong>{{ item.value }}</strong>
            <p>{{ item.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="qala-map-preview">
      <div class="qala-map-preview-bg">
        <i class="bi bi-geo-alt-fill"></i>
      </div>

      <div class="qala-map-preview-body">
        <h3>{{ event.place }}</h3>
        <p>{{ event.address || event.location }}</p>

        <button
          type="button"
          class="qala-map-preview-btn"
          :disabled="!hasCoords"
          @click="openMapModal"
        >
          {{ hasCoords ? 'Показать на карте' : 'Координаты не указаны' }}
        </button>
      </div>
    </div>
    <Teleport to="body">
        <EventMapModal ref="mapModalRef" :event="event" />
    </Teleport>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'

import EventMapModal from '@/components/event/EventMapModal.vue'

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
})

const mapModalRef = ref(null)

const toCoord = (value) => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const hasCoords = computed(() => {
  const lat = toCoord(props.event?.lat)
  const lng = toCoord(props.event?.lng ?? props.event?.lon)

  return lat !== null && lng !== null
})

const details = computed(() => [
  {
    icon: 'bi-calendar-event',
    value: props.event.fullDate,
    label: 'Дата проведения',
  },
  {
    icon: 'bi-clock',
    value: props.event.time,
    label: 'Время начала',
  },
  {
    icon: 'bi-people',
    value: props.event.people,
    label: 'Участники',
  },
  {
    icon: 'bi-ticket-perforated',
    value: props.event.price,
    label: 'Стоимость',
  },
])

const openMapModal = () => {
  if (!hasCoords.value) return

  mapModalRef.value?.open()
}
</script>

<style scoped>
.qala-event-sidebar {
  position: sticky;
  top: 74px;
  display: grid;
  gap: 16px;
}

.qala-info-card,
.qala-map-preview {
  overflow: hidden;
  border: 1px solid #eeeeee;
  border-radius: 24px;
  background: #fff;
}

.qala-info-card {
  padding: 18px;
}

.qala-info-card h2 {
  margin: 0 0 16px;
  color: #111;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.qala-info-list {
  display: grid;
  gap: 15px;
}

.qala-info-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.qala-info-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #111;
  background: #f7f7f7;
  font-size: 18px;
}

.qala-info-item strong {
  color: #111;
  font-size: 14px;
  font-weight: 900;
}

.qala-info-item p {
  margin: 3px 0 0;
  color: #8a8a8a;
  font-size: 12px;
  font-weight: 650;
}

.qala-map-preview-bg {
  height: 130px;
  display: grid;
  place-items: center;
  color: #111;
  background:
    radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.28), transparent 32%),
    radial-gradient(circle at 70% 65%, rgba(124, 58, 237, 0.22), transparent 34%),
    #f3f4f6;
  font-size: 32px;
}

.qala-map-preview-body {
  padding: 16px;
}

.qala-map-preview-body h3 {
  margin: 0 0 5px;
  color: #111;
  font-size: 16px;
  font-weight: 900;
}

.qala-map-preview-body p {
  margin: 0 0 14px;
  color: #707070;
  font-size: 13px;
  font-weight: 600;
}

.qala-map-preview-btn {
  width: 100%;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  color: #fff;
  background: #111;
  font-size: 14px;
  font-weight: 850;
  text-decoration: none;
  transition:
    background 0.18s ease,
    opacity 0.18s ease,
    transform 0.18s ease;
}

.qala-map-preview-btn:hover:not(:disabled) {
  background: #222;
  color: #fff;
  transform: translateY(-1px);
}

.qala-map-preview-btn:active:not(:disabled) {
  transform: translateY(0);
}

.qala-map-preview-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (min-width: 861px) and (max-width: 1199px) {
  .qala-event-sidebar {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .qala-event-sidebar {
    position: static;
    width: 100%;
    grid-template-columns: 1fr;
  }

  .qala-info-card,
  .qala-map-preview {
    width: 100%;
  }
}
</style>