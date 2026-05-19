<template>
  <RouterLink
    :to="eventLink"
    class="qala-event-card card h-100 overflow-hidden text-decoration-none text-dark border rounded-4"
    :aria-label="cardAriaLabel"
  >
    <div class="qala-event-media position-relative overflow-hidden bg-light">
      <img
        v-if="imageSrc"
        :src="imageSrc"
        :alt="imageAlt"
        class="w-100 h-100 object-fit-cover d-block"
        loading="lazy"
        decoding="async"
      />

      <div
        v-else
        class="w-100 h-100 d-grid place-items-center text-secondary fs-2"
        aria-hidden="true"
      >
        <i class="bi bi-image"></i>
      </div>

      <span
        v-if="category"
        class="qala-event-category position-absolute start-0 bottom-0 mb-3 ms-3 badge rounded-pill text-bg-light text-dark fw-bold"
      >
        {{ category }}
      </span>

      <button
        type="button"
        class="qala-save-btn position-absolute top-0 end-0 mt-3 me-3 btn btn-light border-0 rounded-circle d-grid place-items-center p-0"
        :class="{ 'is-saved': saved }"
        :aria-label="saveButtonLabel"
        :aria-pressed="saved"
        @click.prevent.stop="handleToggleSave"
      >
        <i
          class="bi"
          :class="saveIconClass"
          aria-hidden="true"
        ></i>
      </button>
    </div>

    <div class="card-body d-flex gap-3 p-3">
      <time
        class="qala-event-date flex-shrink-0 d-grid place-items-center rounded-4 bg-light text-center"
        :datetime="dateTimeValue"
      >
        <span class="d-block fw-black lh-1">
          {{ day }}
        </span>

        <small class="d-block mt-1 text-secondary fw-bold text-uppercase lh-1">
          {{ month }}
        </small>
      </time>

      <div class="min-w-0 flex-grow-1">
        <h2 class="qala-event-title h6 mb-2 fw-bold text-dark">
          {{ title }}
        </h2>

        <p
          v-if="location"
          class="d-flex align-items-center gap-1 min-w-0 mb-2 text-secondary small"
        >
          <i
            class="bi bi-geo-alt flex-shrink-0 lh-1"
            aria-hidden="true"
          ></i>

          <span class="text-truncate">
            {{ location }}
          </span>
        </p>

        <div class="d-flex flex-wrap gap-2 text-secondary small fw-semibold">
          <span
            v-if="time"
            class="d-inline-flex align-items-center gap-1"
          >
            <i
              class="bi bi-clock lh-1"
              aria-hidden="true"
            ></i>
            {{ time }}
          </span>

          <span
            v-if="people"
            class="d-inline-flex align-items-center gap-1"
          >
            <i
              class="bi bi-people lh-1"
              aria-hidden="true"
            ></i>
            {{ people }}
          </span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    required: true,
    validator: value => Boolean(value?.id),
  },

  saved: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits({
  'toggle-save': id => Boolean(id),
})

const eventId = computed(() => props.event.id)

const eventLink = computed(() => ({
  name: 'event',
  params: {
    id: eventId.value,
  },
}))

const title = computed(() => props.event.title || 'Без названия')
const category = computed(() => props.event.category || '')
const imageSrc = computed(() => props.event.image || '')
const location = computed(() => props.event.location || '')
const time = computed(() => props.event.time || '')
const people = computed(() => props.event.people || '')
const day = computed(() => props.event.day || '--')
const month = computed(() => props.event.month || '')

const dateTimeValue = computed(() => props.event.date || '')
const imageAlt = computed(() => imageSrc.value ? title.value : '')
const cardAriaLabel = computed(() => `Открыть событие: ${title.value}`)

const saveButtonLabel = computed(() => {
  return props.saved
    ? 'Убрать событие из сохранённых'
    : 'Сохранить событие'
})

const saveIconClass = computed(() => {
  return props.saved ? 'bi-bookmark-fill' : 'bi-bookmark'
})

function handleToggleSave() {
  emit('toggle-save', eventId.value)
}
</script>

<style scoped>
.qala-event-card {
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease;
}

.qala-event-card:hover {
  color: inherit;
  border-color: #e3e3e3 !important;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.075);
  transform: translateY(-2px);
}

.qala-event-card:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.25);
  outline-offset: 3px;
}

.qala-event-media {
  aspect-ratio: 16 / 10;
}

.qala-event-category {
  max-width: calc(100% - 72px);
  height: 29px;
  padding: 0 11px;
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  font-size: 12px;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.92) !important;
  backdrop-filter: blur(10px);
}

.qala-save-btn {
  width: 38px;
  height: 38px;
  font-size: 18px;
  line-height: 1;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  transition:
    transform 0.14s ease,
    background-color 0.14s ease;
}

.qala-save-btn:hover {
  background: #ffffff;
  transform: scale(1.04);
}

.qala-save-btn:active {
  transform: scale(0.96);
}

.qala-save-btn:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.25);
  outline-offset: 2px;
}

.qala-event-date {
  width: 54px;
  height: 58px;
}

.qala-event-date span {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.qala-event-date small {
  font-size: 10px;
  font-weight: 900;
}

.qala-event-title {
  display: -webkit-box;
  overflow: hidden;
  font-size: 16px;
  line-height: 1.25;
  letter-spacing: -0.025em;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.min-w-0 {
  min-width: 0;
}

.place-items-center {
  place-items: center;
}

@media (prefers-reduced-motion: reduce) {
  .qala-event-card,
  .qala-save-btn {
    transition: none;
  }
}

@media (hover: none) {
  .qala-event-card:hover {
    border-color: var(--bs-border-color) !important;
    box-shadow: none;
    transform: none;
  }

  .qala-save-btn:hover {
    transform: none;
  }
}

@media (max-width: 420px) {
  .qala-event-media {
    aspect-ratio: 16 / 11;
  }

  .card-body {
    gap: 12px !important;
    padding: 13px !important;
  }

  .qala-event-date {
    width: 50px;
    height: 55px;
    border-radius: 15px !important;
  }

  .qala-event-date span {
    font-size: 19px;
  }

  .qala-event-title {
    margin-bottom: 7px !important;
    font-size: 15px;
  }
}
</style>