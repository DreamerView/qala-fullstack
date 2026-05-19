<template>
  <div class="qala-event-page">
    <div class="qala-event-shell">
      <div class="qala-event-topbar">
        <button
          type="button"
          class="qala-back-link"
          @click="goBack"
        >
          <i class="bi bi-arrow-left"></i>
          <span>Назад</span>
        </button>

        <button
          v-if="event"
          type="button"
          class="qala-icon-btn"
          :class="{ active: isSaved }"
          aria-label="Сохранить событие"
          @click="isSaved = !isSaved"
        >
          <i
            class="bi"
            :class="isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'"
          ></i>
        </button>
      </div>

      <section v-if="isLoading" class="qala-loading">
        <div class="qala-loading-card">
          <div class="spinner-border spinner-border-sm" aria-hidden="true"></div>
          <span>Загружаем событие...</span>
        </div>
      </section>

      <section v-else-if="event" class="qala-event-detail">
        <div class="qala-event-hero">
          <img
            v-if="event.image"
            :src="event.image"
            :alt="event.title"
            class="qala-event-hero-img"
          />

          <div v-else class="qala-event-hero-empty">
            <i class="bi bi-image"></i>
          </div>

          <div class="qala-event-hero-overlay">
            <span class="qala-event-category">
              {{ event.category }}
            </span>
          </div>
        </div>

        <div class="qala-event-content-grid">
          <main class="qala-event-main">
            <div class="qala-event-title-block">
              <div class="qala-event-date-card">
                <span>{{ event.day }}</span>
                <small>{{ event.month }}</small>
              </div>

              <div>
                <h1 class="qala-event-title">
                  {{ event.title }}
                </h1>

                <p class="qala-event-location">
                  <i class="bi bi-geo-alt"></i>
                  {{ event.location }}
                </p>
              </div>
            </div>

            <div class="qala-event-actions">
              <button type="button" class="qala-primary-btn">
                <i class="bi bi-check2-circle"></i>
                <span>Я пойду</span>
              </button>

              <button type="button" class="qala-secondary-btn" @click="shareEvent">
                <i class="bi bi-send"></i>
                <span>Поделиться</span>
              </button>

              <a
                v-if="event.locationUrl"
                :href="event.locationUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="qala-secondary-btn"
              >
                <i class="bi bi-map"></i>
                <span>Карта</span>
              </a>
            </div>

            <section class="qala-section">
              <h2>О событии</h2>

              <p>
                {{ event.description }}
              </p>
            </section>

            <section v-if="event.program.length" class="qala-section">
              <h2>Программа</h2>

              <div class="qala-program-list">
                <div
                  v-for="item in event.program"
                  :key="item.id"
                  class="qala-program-item"
                >
                  <div class="qala-program-time">
                    {{ item.time }}
                  </div>

                  <div class="qala-program-info">
                    <h3>{{ item.title }}</h3>
                    <p v-if="item.description">{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="qala-section">
              <h2>Организатор</h2>

              <div class="qala-organizer-card">
                <div class="qala-organizer-avatar-placeholder">
                  <i class="bi bi-person"></i>
                </div>

                <div class="qala-organizer-info">
                  <h3>{{ event.organizer.name }}</h3>
                  <p>{{ event.organizer.description }}</p>
                </div>

                <button type="button" class="qala-follow-btn">
                  Подписаться
                </button>
              </div>
            </section>
          </main>

          <aside class="qala-event-sidebar">
            <div class="qala-info-card">
              <h2>Детали</h2>

              <div class="qala-info-list">
                <div class="qala-info-item">
                  <span class="qala-info-icon">
                    <i class="bi bi-calendar-event"></i>
                  </span>

                  <div>
                    <strong>{{ event.fullDate }}</strong>
                    <p>Дата проведения</p>
                  </div>
                </div>

                <div class="qala-info-item">
                  <span class="qala-info-icon">
                    <i class="bi bi-clock"></i>
                  </span>

                  <div>
                    <strong>{{ event.time }}</strong>
                    <p>Время начала</p>
                  </div>
                </div>

                <div class="qala-info-item">
                  <span class="qala-info-icon">
                    <i class="bi bi-people"></i>
                  </span>

                  <div>
                    <strong>{{ event.people }}</strong>
                    <p>Лимит участников</p>
                  </div>
                </div>

                <div class="qala-info-item">
                  <span class="qala-info-icon">
                    <i class="bi bi-ticket-perforated"></i>
                  </span>

                  <div>
                    <strong>{{ event.price }}</strong>
                    <p>Стоимость</p>
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

                <a
                  v-if="event.locationUrl"
                  :href="event.locationUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="qala-map-preview-btn"
                >
                  Показать на карте
                </a>
              </div>
            </div>
          </aside>
        </div>

        <section v-if="relatedEvents.length" class="qala-related-section">
          <div class="qala-related-head">
            <h2>Похожие события</h2>

            <RouterLink to="/events">
              Все события
            </RouterLink>
          </div>

          <div class="qala-related-grid">
            <RouterLink
              v-for="item in relatedEvents"
              :key="item.id"
              :to="`/events/${item.id}`"
              class="qala-related-card"
            >
              <img :src="item.image" :alt="item.title" />

              <div>
                <span>{{ item.category }}</span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.date }}</p>
              </div>
            </RouterLink>
          </div>
        </section>
      </section>

      <section v-else class="qala-not-found">
        <div class="qala-not-found-icon">
          <i class="bi bi-calendar-x"></i>
        </div>

        <h1>Событие не найдено</h1>

        <p>
          Возможно, событие удалено или ссылка указана неправильно.
        </p>

        <RouterLink to="/events" class="qala-primary-btn">
          Вернуться к событиям
        </RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const API_URL = import.meta.env.VITE_API_URL || '/api'

const isSaved = ref(false)
const isLoading = ref(false)
const event = ref(null)
const relatedEvents = ref([])

const monthsShort = [
  'ЯНВ',
  'ФЕВ',
  'МАР',
  'АПР',
  'МАЙ',
  'ИЮН',
  'ИЮЛ',
  'АВГ',
  'СЕН',
  'ОКТ',
  'НОЯ',
  'ДЕК',
]

const monthsFull = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const eventId = computed(() => route.params.id)

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/events')
}

const normalizeDate = (value) => {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 10)
}

const normalizeTime = (value) => {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 5)
}

const formatDateParts = (dateValue) => {
  const normalized = normalizeDate(dateValue)

  if (!normalized) {
    return {
      day: '00',
      month: '---',
      fullDate: 'Дата не указана',
      shortDate: 'Дата не указана',
    }
  }

  const date = new Date(`${normalized}T00:00:00`)
  const day = String(date.getDate()).padStart(2, '0')
  const monthIndex = date.getMonth()
  const year = date.getFullYear()

  return {
    day,
    month: monthsShort[monthIndex] || '---',
    fullDate: `${date.getDate()} ${monthsFull[monthIndex] || ''} ${year}`,
    shortDate: `${date.getDate()} ${monthsFull[monthIndex] || ''}`,
  }
}

const formatPrice = (eventData) => {
  const visitType = eventData.visit_type || eventData.visitType

  if (visitType === 'free') {
    return 'Бесплатно'
  }

  const price = Number(eventData.price || 0)

  if (!price) {
    return 'Цена не указана'
  }

  return `${price.toLocaleString('ru-RU')} ₸`
}

const formatPeople = (eventData) => {
  const limit = eventData.participants_limit || eventData.limit

  if (!limit) {
    return 'Без лимита'
  }

  return Number(limit).toLocaleString('ru-RU')
}

const mapProgramItem = (item) => {
  return {
    id: item.id || `${item.program_time || item.time}-${item.title}`,
    time: normalizeTime(item.program_time || item.time),
    title: item.title || 'Пункт программы',
    description: item.description || item.text || '',
  }
}

const mapEventFromApi = (payload) => {
  const eventData = payload?.event || payload
  const programData = payload?.program || eventData?.program || []

  if (!eventData) {
    return null
  }

  const dateParts = formatDateParts(eventData.event_date || eventData.date)

  return {
    id: eventData.id,
    title: eventData.title || 'Без названия',
    category: eventData.category_name || eventData.category || 'Категория',
    subcategory: eventData.subcategory_name || eventData.subcategory || '',
    location: eventData.location_title || eventData.location || 'Место не указано',
    address: eventData.address || '',
    place: eventData.location_title || eventData.location || 'Место проведения',
    locationUrl: eventData.location_url || eventData.locationUrl || '',
    lat: eventData.lat !== null && eventData.lat !== undefined ? Number(eventData.lat) : null,
    lng: eventData.lng !== null && eventData.lng !== undefined ? Number(eventData.lng) : null,
    day: dateParts.day,
    month: dateParts.month,
    fullDate: dateParts.fullDate,
    date: dateParts.shortDate,
    time: normalizeTime(eventData.event_time || eventData.time) || '00:00',
    people: formatPeople(eventData),
    price: formatPrice(eventData),
    image: eventData.image_url || eventData.image || '',
    description: eventData.description || 'Описание события пока не добавлено.',
    organizer: {
      name: eventData.organizer_name || 'Qala Events',
      description: eventData.organizer_description || 'Организатор события в Qala.',
    },
    program: Array.isArray(programData)
      ? programData.map(mapProgramItem)
      : [],
  }
}

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || data?.status === false) {
    const error = new Error(data?.message || 'Ошибка запроса')
    error.response = data
    error.status = response.status
    throw error
  }

  return data
}

const loadEvent = async () => {
  if (!eventId.value) {
    event.value = null
    relatedEvents.value = []
    return
  }

  try {
    isLoading.value = true
    event.value = null
    relatedEvents.value = []

    const data = await requestJson(`${API_URL}/event/${eventId.value}`, {
      method: 'GET',
    })

    const mappedEvent = mapEventFromApi(data?.data)

    event.value = mappedEvent
  } catch (err) {
    console.error('Load event detail error:', err)

    event.value = null
    relatedEvents.value = []
  } finally {
    isLoading.value = false
  }
}

const shareEvent = async () => {
  if (!event.value) {
    return
  }

  const shareData = {
    title: event.value.title,
    text: event.value.description,
    url: window.location.href,
  }

  if (navigator.share) {
    await navigator.share(shareData).catch(() => {})
    return
  }

  await navigator.clipboard?.writeText(window.location.href).catch(() => {})
}

onMounted(() => {
  loadEvent()
})

watch(
  () => route.params.id,
  () => {
    isSaved.value = false
    loadEvent()
  }
)
</script>

<style scoped>
.qala-event-page {
  width: 100%;
  min-height: 100vh;
  background: #fff;
}

.qala-event-shell {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 18px 32px 56px;
}

.qala-event-topbar {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.qala-back-link {
  height: 40px;
  padding: 0 13px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #111;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 850;
  cursor: pointer;
}

.qala-back-link:hover {
  background: #f7f7f7;
  color: #111;
}

.qala-icon-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #eeeeee;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.qala-icon-btn:hover,
.qala-icon-btn.active {
  background: #111;
  color: #fff;
  border-color: #111;
}

.qala-loading {
  min-height: 60vh;
  display: grid;
  place-items: center;
}

.qala-loading-card {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 16px 40px #0000002e;
}

.qala-event-hero {
  position: relative;
  width: 100%;
  height: 440px;
  border-radius: 28px;
  background: #f3f4f6;
  overflow: hidden;
  margin-bottom: 24px;
}

.qala-event-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.qala-event-hero-empty {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #b0b0b0;
  font-size: 42px;
}

.qala-event-hero-overlay {
  position: absolute;
  left: 18px;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.qala-event-category {
  height: 32px;
  padding: 0 13px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #111;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 850;
  backdrop-filter: blur(10px);
}

.qala-event-content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 32px;
  align-items: start;
}

.qala-event-main {
  min-width: 0;
}

.qala-event-title-block {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  margin-bottom: 20px;
}

.qala-event-date-card {
  width: 64px;
  height: 68px;
  border-radius: 18px;
  background: #f7f7f7;
  display: grid;
  place-items: center;
  align-content: center;
}

.qala-event-date-card span {
  color: #111;
  font-size: 24px;
  font-weight: 950;
  line-height: 1;
  letter-spacing: -0.05em;
}

.qala-event-date-card small {
  margin-top: 5px;
  color: #737373;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
}

.qala-event-title {
  margin: 0;
  color: #050505;
  font-size: 34px;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.055em;
}

.qala-event-location {
  margin: 10px 0 0;
  color: #707070;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.qala-event-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}

.qala-primary-btn,
.qala-secondary-btn {
  height: 44px;
  padding: 0 17px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 850;
}

.qala-primary-btn {
  border: 0;
  background: #111;
  color: #fff;
}

.qala-primary-btn:hover {
  background: #222;
  color: #fff;
}

.qala-secondary-btn {
  border: 1px solid #eeeeee;
  background: #fff;
  color: #111;
}

.qala-secondary-btn:hover {
  background: #f7f7f7;
  color: #111;
}

.qala-section {
  padding: 26px 0;
  border-top: 1px solid #eeeeee;
}

.qala-section h2 {
  margin: 0 0 13px;
  color: #111;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.qala-section p {
  margin: 0;
  color: #555;
  font-size: 15px;
  line-height: 1.7;
  font-weight: 500;
}

.qala-program-list {
  display: grid;
  gap: 14px;
}

.qala-program-item {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr);
  gap: 14px;
}

.qala-program-time {
  height: 36px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 900;
}

.qala-program-info h3 {
  margin: 0 0 4px;
  color: #111;
  font-size: 15px;
  font-weight: 850;
}

.qala-program-info p {
  color: #707070;
  font-size: 14px;
  line-height: 1.5;
}

.qala-organizer-card {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  gap: 13px;
  align-items: center;
  padding: 14px;
  border: 1px solid #eeeeee;
  border-radius: 20px;
}

.qala-organizer-avatar-placeholder {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  background: #f7f7f7;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.qala-organizer-info {
  min-width: 0;
}

.qala-organizer-info h3 {
  margin: 0 0 4px;
  color: #111;
  font-size: 15px;
  font-weight: 900;
}

.qala-organizer-info p {
  color: #707070;
  font-size: 13px;
  line-height: 1.4;
}

.qala-follow-btn {
  height: 36px;
  padding: 0 13px;
  border: 0;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 13px;
  font-weight: 850;
}

.qala-event-sidebar {
  position: sticky;
  top: 74px;
  display: grid;
  gap: 16px;
}

.qala-info-card,
.qala-map-preview {
  border: 1px solid #eeeeee;
  border-radius: 24px;
  background: #fff;
  overflow: hidden;
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
  border-radius: 14px;
  background: #f7f7f7;
  color: #111;
  display: grid;
  place-items: center;
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
  background:
    radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.28), transparent 32%),
    radial-gradient(circle at 70% 65%, rgba(124, 58, 237, 0.22), transparent 34%),
    #f3f4f6;
  display: grid;
  place-items: center;
  color: #111;
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
  border: 0;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 14px;
  font-weight: 850;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.qala-map-preview-btn:hover {
  background: #222;
  color: #fff;
}

.qala-related-section {
  margin-top: 34px;
  padding-top: 26px;
  border-top: 1px solid #eeeeee;
}

.qala-related-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.qala-related-head h2 {
  margin: 0;
  color: #111;
  font-size: 21px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.qala-related-head a {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  font-weight: 850;
}

.qala-related-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.qala-related-card {
  min-width: 0;
  border: 1px solid #eeeeee;
  border-radius: 18px;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
}

.qala-related-card img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
}

.qala-related-card div {
  padding: 12px;
}

.qala-related-card span {
  color: #707070;
  font-size: 12px;
  font-weight: 800;
}

.qala-related-card h3 {
  margin: 4px 0 6px;
  color: #111;
  font-size: 14px;
  font-weight: 900;
  line-height: 1.25;
}

.qala-related-card p {
  margin: 0;
  color: #777;
  font-size: 12px;
  font-weight: 700;
}

.qala-not-found {
  min-height: 70vh;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  padding: 40px 20px;
}

.qala-not-found-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 999px;
  background: #f7f7f7;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 28px;
}

.qala-not-found h1 {
  margin: 0 0 8px;
  color: #111;
  font-size: 26px;
  font-weight: 900;
}

.qala-not-found p {
  max-width: 360px;
  margin: 0 auto 18px;
  color: #707070;
  font-size: 15px;
  line-height: 1.5;
}

@media (min-width: 1600px) {
  .qala-event-shell {
    max-width: 1640px;
  }

  .qala-event-hero {
    height: 460px;
  }

  .qala-event-content-grid {
    grid-template-columns: minmax(0, 1fr) 380px;
  }
}

@media (min-width: 1900px) {
  .qala-event-shell {
    max-width: 1760px;
  }

  .qala-event-hero {
    height: 480px;
  }

  .qala-event-content-grid {
    grid-template-columns: minmax(0, 1fr) 400px;
  }
}

@media (min-width: 861px) and (max-width: 1199px) {
  .qala-event-shell {
    padding: 16px 24px 56px;
  }

  .qala-event-content-grid {
    grid-template-columns: 1fr;
  }

  .qala-event-sidebar {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .qala-event-hero {
    height: 360px;
  }
}

@media (max-width: 860px) {
  .qala-event-page {
    width: 100%;
    overflow-x: hidden;
  }

  .qala-event-shell {
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 12px 14px 82px;
  }

  .qala-event-topbar {
    top: 0;
    height: 52px;
    margin-bottom: 12px;
    padding: 0 2px;
  }

  .qala-event-hero {
    width: 100%;
    height: auto;
    border-radius: 22px;
    aspect-ratio: 4 / 3;
    margin-bottom: 20px;
  }

  .qala-event-content-grid {
    width: 100%;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .qala-event-title-block {
    grid-template-columns: 58px minmax(0, 1fr);
    gap: 13px;
  }

  .qala-event-date-card {
    width: 58px;
    height: 62px;
    border-radius: 17px;
  }

  .qala-event-title {
    font-size: 26px;
  }

  .qala-event-location {
    font-size: 14px;
  }

  .qala-event-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .qala-primary-btn,
  .qala-secondary-btn {
    width: 100%;
  }

  .qala-event-sidebar {
    position: static;
    width: 100%;
    grid-template-columns: 1fr;
  }

  .qala-info-card,
  .qala-map-preview,
  .qala-organizer-card,
  .qala-related-card {
    width: 100%;
  }

  .qala-organizer-card {
    grid-template-columns: 50px minmax(0, 1fr);
  }

  .qala-follow-btn {
    grid-column: 1 / -1;
    width: 100%;
  }

  .qala-related-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .qala-event-shell {
    width: 100%;
    max-width: none;
    padding-left: 12px;
    padding-right: 12px;
  }

  .qala-event-title {
    font-size: 24px;
  }

  .qala-program-item {
    grid-template-columns: 62px minmax(0, 1fr);
  }
}
</style>