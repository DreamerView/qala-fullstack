<template>
  <div class="qala-event-page">
    <div class="qala-event-shell">
      <EventTopbar
        :show-save="Boolean(event)"
        :is-saved="isSaved"
        @back="goBack"
        @toggle-save="isSaved = !isSaved"
      />

      <EventState v-if="isLoading" type="loading" title="Загружаем событие..." />

      <section v-else-if="event" class="qala-event-detail">
        <EventHero
          :image="event.image"
          :title="event.title"
          :category="event.category"
        />

        <div class="qala-event-content-grid">
          <main class="qala-event-main">
            <EventHeaderBlock :event="event" />

            <EventActions
              :event="event"
              :is-loading="false"
              :message="joinGuardMessage"
              message-type="error"
              @toggle-join="openJoinModal"
              @share="shareEvent"
            />

            <section class="qala-section">
              <h2>О событии</h2>
              <p>{{ event.description }}</p>
            </section>

            <EventProgram v-if="event.program.length" :items="event.program" />
            <EventOrganizer :organizer="event.organizer" />
          </main>

          <EventSidebar :event="event" />
        </div>

        <EventRelated v-if="relatedEvents.length" :items="relatedEvents" />

        <EventJoinConfirmModal
          ref="joinModalRef"
          :event="event"
          :api-url="API_URL"
          @changed="applyJoinChange"
          @auth-required="redirectToSign"
        />
      </section>

      <EventState
        v-else
        type="not-found"
        title="Событие не найдено"
        text="Возможно, событие удалено или ссылка указана неправильно."
        action-text="Вернуться к событиям"
        action-to="/events"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EventTopbar from '@/components/event/EventTopbar.vue'
import EventHero from '@/components/event/EventHero.vue'
import EventHeaderBlock from '@/components/event/EventHeaderBlock.vue'
import EventActions from '@/components/event/EventActions.vue'
import EventProgram from '@/components/event/EventProgram.vue'
import EventOrganizer from '@/components/event/EventOrganizer.vue'
import EventSidebar from '@/components/event/EventSidebar.vue'
import EventRelated from '@/components/event/EventRelated.vue'
import EventState from '@/components/event/EventState.vue'
import EventJoinConfirmModal from '@/components/event/EventJoinConfirmModal.vue'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const MONTHS_SHORT = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
const MONTHS_FULL = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

const EMPTY_DATE = Object.freeze({
  day: '00',
  month: '---',
  fullDate: 'Дата не указана',
  shortDate: 'Дата не указана',
})

const PARTICIPANT_KEYS = ['participants_count', 'participantsCount', 'members_count', 'membersCount']
const LIMIT_KEYS = ['participants_limit', 'participantsLimit', 'limit']

const numberFormatter = new Intl.NumberFormat('ru-RU')

const router = useRouter()
const route = useRoute()

const event = ref(null)
const relatedEvents = ref([])
const isSaved = ref(false)
const isLoading = ref(false)
const joinGuardMessage = ref('')
const joinModalRef = ref(null)

let requestToken = 0
let joinGuardTimer = null

const eventId = computed(() => route.params.id)

const formatNumber = (value) => numberFormatter.format(Number(value) || 0)

const pick = (source, keys, fallback = '') => {
  if (!source) return fallback

  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') return value
  }

  return fallback
}

const boolByKeys = (source, keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return Boolean(source[key])
    }
  }

  return false
}

const toPositiveNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

const toCoord = (value) => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const normalizeDate = (value) => (value ? String(value).slice(0, 10) : '')
const normalizeTime = (value) => (value ? String(value).slice(0, 5) : '')

const buildEventDateTime = (dateValue, timeValue) => {
  const date = normalizeDate(dateValue)
  if (!date) return null

  const time = normalizeTime(timeValue) || '23:59'
  const dateTime = new Date(`${date}T${time}:00`)

  return Number.isNaN(dateTime.getTime()) ? null : dateTime
}

const getJoinDateProblem = (startsAt) => {
  if (!startsAt) {
    return 'Запись недоступна: дата события указана некорректно.'
  }

  if (startsAt.getTime() < Date.now()) {
    return 'Запись недоступна: событие уже прошло.'
  }

  return ''
}

const formatDateParts = (value) => {
  const normalized = normalizeDate(value)
  if (!normalized) return EMPTY_DATE

  const date = new Date(`${normalized}T00:00:00`)
  if (Number.isNaN(date.getTime())) return EMPTY_DATE

  const dayNumber = date.getDate()
  const monthIndex = date.getMonth()
  const monthName = MONTHS_FULL[monthIndex] || ''
  const year = date.getFullYear()

  return {
    day: String(dayNumber).padStart(2, '0'),
    month: MONTHS_SHORT[monthIndex] || '---',
    fullDate: `${dayNumber} ${monthName} ${year}`,
    shortDate: `${dayNumber} ${monthName}`,
  }
}

const formatPrice = (data) => {
  if (pick(data, ['visit_type', 'visitType']) === 'free') return 'Бесплатно'

  const price = Number(pick(data, ['price'], 0))
  return price > 0 ? `${formatNumber(price)} ₸` : 'Цена не указана'
}

const formatPeople = (countValue, limitValue) => {
  const count = toPositiveNumber(countValue)
  const limit = toPositiveNumber(limitValue)

  if (limit) return `${formatNumber(count)} / ${formatNumber(limit)}`
  return count ? formatNumber(count) : 'Пока нет участников'
}

const mapProgramItem = (item = {}) => {
  const time = normalizeTime(pick(item, ['program_time', 'time']))
  const title = pick(item, ['title'], 'Пункт программы')

  return {
    id: pick(item, ['id'], `${time || 'time'}-${title}`),
    time,
    title,
    description: pick(item, ['description', 'text']),
  }
}

const mapEvent = (payload) => {
  const data = payload?.event || payload
  if (!data) return null

  const eventDate = normalizeDate(pick(data, ['event_date', 'date']))
  const eventTime = normalizeTime(pick(data, ['event_time', 'time']))
  const startsAt = buildEventDateTime(eventDate, eventTime)
  const dateParts = formatDateParts(eventDate)
  const program = payload?.program || data.program || []

  const participantsCount = toPositiveNumber(pick(data, PARTICIPANT_KEYS, 0))
  const participantsLimit = toPositiveNumber(pick(data, LIMIT_KEYS, 0))
  const location = pick(data, ['location_title', 'location'], 'Место не указано')

  return {
    id: data.id,
    title: pick(data, ['title'], 'Без названия'),

    category: pick(data, ['category_name', 'category'], 'Категория'),
    subcategory: pick(data, ['subcategory_name', 'subcategory']),

    location,
    address: pick(data, ['address']),
    place: location || 'Место проведения',
    locationUrl: pick(data, ['location_url', 'locationUrl']),

    lat: toCoord(pick(data, ['lat', 'latitude'])),
    lng: toCoord(pick(data, ['lng', 'lon', 'longitude'])),

    day: dateParts.day,
    month: dateParts.month,
    fullDate: dateParts.fullDate,
    date: dateParts.shortDate,
    eventDate,
    eventTime,
    startsAt,
    joinDateProblem: getJoinDateProblem(startsAt),
    time: eventTime || '00:00',

    participantsCount,
    participantsLimit,
    people: formatPeople(participantsCount, participantsLimit),

    price: formatPrice(data),
    image: pick(data, ['image_url', 'image']),
    description: pick(data, ['description'], 'Описание события пока не добавлено.'),

    isParticipant: boolByKeys(data, [
      'is_participant',
      'isParticipant',
      'joined',
      'is_joined',
    ]),

    organizer: {
      name: pick(data, ['organizer_name'], 'Qala Events'),
      description: pick(data, ['organizer_description'], 'Организатор события в Qala.'),
    },

    program: Array.isArray(program) ? program.map(mapProgramItem) : [],
  }
}

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || data?.status === false) {
    const error = new Error(data?.message || 'Ошибка запроса')
    error.status = response.status
    error.response = data
    throw error
  }

  return data
}

const clearJoinGuard = () => {
  joinGuardMessage.value = ''

  if (joinGuardTimer) {
    clearTimeout(joinGuardTimer)
    joinGuardTimer = null
  }
}

const showJoinGuard = (message) => {
  joinGuardMessage.value = message

  if (joinGuardTimer) clearTimeout(joinGuardTimer)

  joinGuardTimer = setTimeout(() => {
    joinGuardMessage.value = ''
    joinGuardTimer = null
  }, 4500)
}

const resetEvent = () => {
  event.value = null
  relatedEvents.value = []
  clearJoinGuard()
}

const syncPeople = () => {
  if (!event.value) return

  event.value.people = formatPeople(
    event.value.participantsCount,
    event.value.participantsLimit
  )
}

const applyJoinChange = ({ isParticipant, participantsCount }) => {
  if (!event.value) return

  event.value.isParticipant = Boolean(isParticipant)

  if (Number.isFinite(Number(participantsCount))) {
    event.value.participantsCount = Math.max(0, Number(participantsCount))
  }

  clearJoinGuard()
  syncPeople()
}

const openJoinModal = () => {
  if (!event.value) return

  if (!event.value.isParticipant && event.value.joinDateProblem) {
    showJoinGuard(event.value.joinDateProblem)
    return
  }

  joinModalRef.value?.open()
}

const redirectToSign = () => {
  router.push({
    path: '/sign',
    query: { redirect: route.fullPath },
  })
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/events')
}

const loadEvent = async () => {
  const id = eventId.value
  const token = ++requestToken

  if (!id) {
    resetEvent()
    return
  }

  isLoading.value = true
  resetEvent()

  try {
    const response = await requestJson(`${API_URL}/event/${id}`)

    if (token !== requestToken) return

    event.value = mapEvent(response?.data)
  } catch (error) {
    if (token !== requestToken) return

    console.error('Load event detail error:', error)
    resetEvent()
  } finally {
    if (token === requestToken) isLoading.value = false
  }
}

const shareEvent = async () => {
  if (!event.value) return

  const url = window.location.href

  try {
    if (navigator.share) {
      await navigator.share({
        title: event.value.title,
        text: event.value.description,
        url,
      })
      return
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
    }
  } catch {
    // Пользователь мог закрыть системное окно share.
  }
}

onMounted(loadEvent)

onBeforeUnmount(() => {
  if (joinGuardTimer) clearTimeout(joinGuardTimer)
})

watch(eventId, () => {
  isSaved.value = false
  loadEvent()
})
</script>

<style scoped>
.qala-event-page {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background: #fff;
}

.qala-event-shell {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 18px 32px 56px;
}

.qala-event-detail,
.qala-event-main {
  width: 100%;
  min-width: 0;
}

.qala-event-content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 32px;
  align-items: start;
}

.qala-section {
  padding: 26px 0;
  border-top: 1px solid #eee;
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

@media (min-width: 1600px) {
  .qala-event-shell {
    max-width: 1640px;
  }

  .qala-event-content-grid {
    grid-template-columns: minmax(0, 1fr) 380px;
  }
}

@media (min-width: 1900px) {
  .qala-event-shell {
    max-width: 1760px;
  }

  .qala-event-content-grid {
    grid-template-columns: minmax(0, 1fr) 400px;
  }
}

@media (max-width: 1199px) {
  .qala-event-shell {
    padding: 16px 24px 56px;
  }

  .qala-event-content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .qala-event-shell {
    max-width: none;
    margin: 0;
    padding: 12px 14px 82px;
  }

  .qala-event-content-grid {
    gap: 20px;
  }
}

@media (max-width: 420px) {
  .qala-event-shell {
    padding-inline: 12px;
  }
}
</style>