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
          :category="event.eventTypeLabel"
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
              <h2>{{ event.aboutTitle }}</h2>
              <p>{{ event.description }}</p>
            </section>

            <section v-if="event.detailItems.length" class="qala-section">
              <h2>Детали</h2>

              <div class="qala-detail-grid">
                <div
                  v-for="item in event.detailItems"
                  :key="item.label"
                  class="qala-detail-card"
                >
                  <span>
                    <i :class="item.icon"></i>
                  </span>

                  <div>
                    <strong>{{ item.value }}</strong>
                    <small>{{ item.label }}</small>
                  </div>
                </div>
              </div>
            </section>

            <EventProgram v-if="event.program.length" :items="event.program" />

            <section v-if="event.polls.length" class="qala-section">
              <h2>Опрос</h2>

              <div class="qala-poll-list">
                <article
                  v-for="poll in event.polls"
                  :key="poll.id"
                  class="qala-poll-card"
                >
                  <div class="qala-poll-head">
                    <div>
                      <strong>{{ poll.question }}</strong>
                      <small>{{ poll.pollTypeLabel }}</small>
                    </div>

                    <span v-if="poll.isActive" class="qala-status-pill">
                      Активен
                    </span>
                  </div>

                  <div class="qala-poll-options">
                    <button
                      v-for="option in poll.options"
                      :key="option.id"
                      type="button"
                      class="qala-poll-option"
                      disabled
                    >
                      {{ option.text }}
                    </button>
                  </div>
                </article>
              </div>
            </section>

            <section v-if="event.registrationQuestions.length" class="qala-section">
              <h2>Вопросы при записи</h2>

              <div class="qala-question-list">
                <div
                  v-for="question in event.registrationQuestions"
                  :key="question.id"
                  class="qala-question-card"
                >
                  <div>
                    <strong>{{ question.question }}</strong>
                    <small>
                      {{ question.inputTypeLabel }}
                      <template v-if="question.isRequired"> · обязательно</template>
                    </small>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="event.contactItems.length || event.externalUrl" class="qala-section">
              <h2>Контакты</h2>

              <div class="qala-contact-list">
                <a
                  v-for="item in event.contactItems"
                  :key="item.label"
                  :href="item.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="qala-contact-card"
                >
                  <span>
                    <i :class="item.icon"></i>
                  </span>

                  <div>
                    <strong>{{ item.value }}</strong>
                    <small>{{ item.label }}</small>
                  </div>
                </a>

                <a
                  v-if="event.externalUrl"
                  :href="event.externalUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="qala-contact-card"
                >
                  <span>
                    <i class="bi bi-link-45deg"></i>
                  </span>

                  <div>
                    <strong>Открыть ссылку</strong>
                    <small>Внешний сайт или регистрация</small>
                  </div>
                </a>
              </div>
            </section>

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
const DEFAULT_EVENT_IMAGE = '/event.png'

const MONTHS_SHORT = [
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

const MONTHS_FULL = [
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

const EMPTY_DATE = Object.freeze({
  day: '00',
  month: '---',
  fullDate: 'Дата не указана',
  shortDate: 'Дата не указана',
})

const EVENT_TYPES = Object.freeze({
  EVENT: 'event',
  MEETING: 'meeting',
  ANNOUNCEMENT: 'announcement',
  ACTIVITY: 'activity',
  PLAN: 'plan',
})

const EVENT_TYPE_META = Object.freeze({
  [EVENT_TYPES.EVENT]: {
    label: 'Мероприятие',
    text: 'Полноценное событие с программой, записью и участниками',
    aboutTitle: 'О мероприятии',
    joinLabel: 'Записаться',
    leaveLabel: 'Отменить запись',
    pendingLabel: 'Заявка отправлена',
    waitlistLabel: 'В листе ожидания',
    dateRequired: true,
    canJoin: true,
  },

  [EVENT_TYPES.MEETING]: {
    label: 'Встреча',
    text: 'Встреча людей в определённом месте',
    aboutTitle: 'О встрече',
    joinLabel: 'Я пойду',
    leaveLabel: 'Не пойду',
    pendingLabel: 'Заявка отправлена',
    waitlistLabel: 'В листе ожидания',
    dateRequired: true,
    canJoin: true,
  },

  [EVENT_TYPES.ANNOUNCEMENT]: {
    label: 'Анонс',
    text: 'Новость, открытие, запуск или важное объявление',
    aboutTitle: 'Об анонсе',
    joinLabel: 'Подробнее',
    leaveLabel: 'Скрыть интерес',
    pendingLabel: 'Интерес отправлен',
    waitlistLabel: 'В листе ожидания',
    dateRequired: true,
    canJoin: false,
  },

  [EVENT_TYPES.ACTIVITY]: {
    label: 'Активность',
    text: 'Совместное действие: спорт, прогулка, волонтёрство или поездка',
    aboutTitle: 'Об активности',
    joinLabel: 'Присоединиться',
    leaveLabel: 'Отменить участие',
    pendingLabel: 'Заявка отправлена',
    waitlistLabel: 'В листе ожидания',
    dateRequired: true,
    canJoin: true,
  },

  [EVENT_TYPES.PLAN]: {
    label: 'План',
    text: 'Идея, где сначала собирают интерес и выбирают детали',
    aboutTitle: 'Об идее',
    joinLabel: 'Мне интересно',
    leaveLabel: 'Больше не интересно',
    pendingLabel: 'Интерес отправлен',
    waitlistLabel: 'В листе ожидания',
    dateRequired: true,
    canJoin: true,
  },
})

const LANGUAGE_LABELS = Object.freeze({
  ru: 'Русский',
  kk: 'Қазақша',
  en: 'English',
  mixed: 'Смешанный',
})

const ACCESS_LABELS = Object.freeze({
  open: 'Свободная запись',
  link_only: 'Только по ссылке',
  approval_required: 'С подтверждением',
  invite_only: 'Только по приглашению',
})

const PARTICIPANT_STATUS_META = Object.freeze({
  joined: {
    label: 'Вы записаны',
    isParticipant: true,
  },
  approved: {
    label: 'Участие подтверждено',
    isParticipant: true,
  },
  pending: {
    label: 'Заявка на рассмотрении',
    isParticipant: true,
  },
  waitlist: {
    label: 'Вы в листе ожидания',
    isParticipant: true,
  },
  rejected: {
    label: 'Заявка отклонена',
    isParticipant: false,
  },
  cancelled: {
    label: 'Запись отменена',
    isParticipant: false,
  },
})

const INPUT_TYPE_LABELS = Object.freeze({
  text: 'Текстовый ответ',
  number: 'Число',
  select: 'Выбор из списка',
  checkbox: 'Чекбокс',
  textarea: 'Большой текст',
})

const POLL_TYPE_LABELS = Object.freeze({
  single: 'Можно выбрать один вариант',
  multiple: 'Можно выбрать несколько вариантов',
})

const DEFAULT_EVENT_TYPE = EVENT_TYPES.EVENT
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

const normalizeEventType = (value) => {
  const type = String(value || DEFAULT_EVENT_TYPE).trim().toLowerCase()
  return EVENT_TYPE_META[type] ? type : DEFAULT_EVENT_TYPE
}

const normalizeUrl = (value) => {
  const url = String(value || '').trim()
  return /^https?:\/\//i.test(url) ? url : ''
}

const normalizeTelegram = (value) => {
  const clean = String(value || '').trim()
  if (!clean) return ''

  if (/^https?:\/\//i.test(clean)) return clean

  return `https://t.me/${clean.replace(/^@/, '')}`
}

const normalizeWhatsapp = (value) => {
  const clean = String(value || '').trim()
  if (!clean) return ''

  if (/^https?:\/\//i.test(clean)) return clean

  const digits = clean.replace(/[^\d]/g, '')
  return digits ? `https://wa.me/${digits}` : ''
}

const normalizePhone = (value) => {
  const clean = String(value || '').trim()
  return clean ? `tel:${clean.replace(/\s/g, '')}` : ''
}

const getEventTypeMeta = (type) => EVENT_TYPE_META[type] || EVENT_TYPE_META[DEFAULT_EVENT_TYPE]

const buildEventDateTime = (dateValue, timeValue) => {
  const date = normalizeDate(dateValue)
  const time = normalizeTime(timeValue)

  if (!date || !time) return null

  const dateTime = new Date(`${date}T${time}:00`)

  return Number.isNaN(dateTime.getTime()) ? null : dateTime
}

const getJoinDateProblem = ({ startsAt, eventType, registrationDeadline, cancelledAt }) => {
  const meta = getEventTypeMeta(eventType)

  if (!meta.canJoin) {
    return 'Запись для этого типа публикации недоступна.'
  }

  if (cancelledAt) {
    return 'Запись недоступна: событие отменено.'
  }

  if (meta.dateRequired && !startsAt) {
    return 'Запись недоступна: дата и время указаны некорректно.'
  }

  if (startsAt && startsAt.getTime() < Date.now()) {
    return 'Запись недоступна: событие уже прошло.'
  }

  if (registrationDeadline && registrationDeadline.getTime() < Date.now()) {
    return 'Запись недоступна: регистрация уже закрыта.'
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

const formatDuration = (minutes) => {
  const value = toPositiveNumber(minutes)
  if (!value) return ''

  const hours = Math.floor(value / 60)
  const rest = value % 60

  if (hours && rest) return `${hours} ч ${rest} мин`
  if (hours) return `${hours} ч`
  return `${rest} мин`
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

const mapPollOption = (option = {}) => {
  return {
    id: pick(option, ['id'], Math.random().toString(36).slice(2)),
    text: pick(option, ['option_text', 'text'], 'Вариант'),
  }
}

const mapPoll = (poll = {}) => {
  const pollType = pick(poll, ['poll_type', 'pollType'], 'single')
  const options = Array.isArray(poll.options) ? poll.options : []

  return {
    id: pick(poll, ['id'], Math.random().toString(36).slice(2)),
    question: pick(poll, ['question'], 'Опрос'),
    pollType,
    pollTypeLabel: POLL_TYPE_LABELS[pollType] || POLL_TYPE_LABELS.single,
    isActive: Boolean(pick(poll, ['is_active', 'isActive'], true)),
    closesAt: pick(poll, ['closes_at', 'closesAt']),
    options: options.map(mapPollOption),
  }
}

const mapRegistrationQuestion = (question = {}) => {
  const inputType = pick(question, ['input_type', 'inputType'], 'text')

  return {
    id: pick(question, ['id'], Math.random().toString(36).slice(2)),
    question: pick(question, ['question'], 'Вопрос'),
    inputType,
    inputTypeLabel: INPUT_TYPE_LABELS[inputType] || INPUT_TYPE_LABELS.text,
    isRequired: Boolean(pick(question, ['is_required', 'isRequired'], false)),
    options: Array.isArray(question.options) ? question.options : [],
  }
}

const buildDetailItems = ({
  eventType,
  duration,
  ageLimit,
  language,
  accessType,
  registrationRequired,
  registrationDeadline,
  visibility,
  cancelledAt,
}) => {
  const items = []

  if (duration) {
    items.push({
      icon: 'bi bi-hourglass-split',
      label: 'Длительность',
      value: duration,
    })
  }

  if (ageLimit) {
    items.push({
      icon: 'bi bi-shield-check',
      label: 'Возраст',
      value: ageLimit,
    })
  }

  if (language) {
    items.push({
      icon: 'bi bi-translate',
      label: 'Язык',
      value: LANGUAGE_LABELS[language] || language,
    })
  }

  if (eventType !== EVENT_TYPES.ANNOUNCEMENT && accessType) {
    items.push({
      icon: 'bi bi-person-check',
      label: 'Запись',
      value: ACCESS_LABELS[accessType] || 'Свободная запись',
    })
  }

  if (registrationRequired) {
    items.push({
      icon: 'bi bi-check2-circle',
      label: 'Участие',
      value: 'Запись обязательна',
    })
  }

  if (registrationDeadline) {
    items.push({
      icon: 'bi bi-calendar2-x',
      label: 'Дедлайн записи',
      value: registrationDeadline,
    })
  }

  if (visibility === 'unlisted') {
    items.push({
      icon: 'bi bi-link-45deg',
      label: 'Доступ',
      value: 'Только по ссылке',
    })
  }

  if (visibility === 'private') {
    items.push({
      icon: 'bi bi-lock',
      label: 'Доступ',
      value: 'Приватно',
    })
  }

  if (cancelledAt) {
    items.push({
      icon: 'bi bi-x-circle',
      label: 'Статус',
      value: 'Отменено',
    })
  }

  return items
}

const buildContactItems = (data) => {
  const phone = pick(data, ['contact_phone', 'contactPhone'])
  const whatsapp = pick(data, ['contact_whatsapp', 'contactWhatsapp'])
  const telegram = pick(data, ['contact_telegram', 'contactTelegram'])

  return [
    phone && {
      icon: 'bi bi-telephone',
      label: 'Телефон',
      value: phone,
      href: normalizePhone(phone),
    },
    whatsapp && {
      icon: 'bi bi-whatsapp',
      label: 'WhatsApp',
      value: whatsapp,
      href: normalizeWhatsapp(whatsapp),
    },
    telegram && {
      icon: 'bi bi-telegram',
      label: 'Telegram',
      value: telegram,
      href: normalizeTelegram(telegram),
    },
  ].filter((item) => item && item.href)
}

const mapEvent = (payload) => {
  const data = payload?.event || payload
  if (!data) return null

  const eventType = normalizeEventType(pick(data, ['event_type', 'eventType']))
  const eventTypeMeta = getEventTypeMeta(eventType)

  const eventDate = normalizeDate(pick(data, ['event_date', 'date']))
  const eventTime = normalizeTime(pick(data, ['event_time', 'time']))
  const startsAt = buildEventDateTime(eventDate, eventTime)
  const dateParts = formatDateParts(eventDate)

  const program = payload?.program || data.program || []
  const polls = payload?.polls || data.polls || []
  const registrationQuestions =
    payload?.registration_questions ||
    payload?.registrationQuestions ||
    data.registration_questions ||
    data.registrationQuestions ||
    []

  const participantsCount = toPositiveNumber(pick(data, PARTICIPANT_KEYS, 0))
  const participantsLimit = toPositiveNumber(pick(data, LIMIT_KEYS, 0))

  const location = pick(data, ['location_title', 'location'], 'Место не указано')
  const category = pick(data, ['category_name', 'category'], 'Категория')
  const image = pick(data, ['image_url', 'image'])
  const language = pick(data, ['language'], 'ru')
  const duration = formatDuration(pick(data, ['duration_minutes', 'durationMinutes']))
  const ageLimit = pick(data, ['age_limit', 'ageLimit'])
  const accessType = pick(data, ['access_type', 'accessType'], 'open')
  const visibility = pick(data, ['visibility'], 'public')
  const participantStatus = pick(data, ['participant_status', 'participantStatus'])
  const participantMeta = PARTICIPANT_STATUS_META[participantStatus] || null
  const registrationDeadlineRaw = pick(data, ['registration_deadline', 'registrationDeadline'])
  const registrationDeadlineDate = registrationDeadlineRaw ? new Date(registrationDeadlineRaw) : null
  const registrationDeadline =
    registrationDeadlineDate && !Number.isNaN(registrationDeadlineDate.getTime())
      ? `${formatDateParts(registrationDeadlineRaw).fullDate}, ${normalizeTime(registrationDeadlineRaw)}`
      : ''

  const cancelledAt = pick(data, ['cancelled_at', 'cancelledAt'])

  const externalUrl = normalizeUrl(pick(data, ['external_url', 'externalUrl']))

  return {
    id: data.id,
    title: pick(data, ['title'], 'Без названия'),

    eventType,
    eventTypeLabel: eventTypeMeta.label,
    eventTypeText: eventTypeMeta.text,
    eventTypeCanJoin: eventTypeMeta.canJoin,
    aboutTitle: eventTypeMeta.aboutTitle,
    joinLabel:
      participantStatus === 'pending'
        ? eventTypeMeta.pendingLabel
        : participantStatus === 'waitlist'
          ? eventTypeMeta.waitlistLabel
          : eventTypeMeta.joinLabel,
    leaveLabel: eventTypeMeta.leaveLabel,

    category,
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
    time: eventTime || 'Время не указано',

    duration,
    ageLimit,
    language,
    languageLabel: LANGUAGE_LABELS[language] || language,

    accessType,
    accessTypeLabel: ACCESS_LABELS[accessType] || ACCESS_LABELS.open,
    registrationRequired: Boolean(pick(data, ['registration_required', 'registrationRequired'], false)),
    registrationDeadline,
    registrationDeadlineRaw,

    visibility,
    allowComments: Boolean(pick(data, ['allow_comments', 'allowComments'], true)),
    allowShare: Boolean(pick(data, ['allow_share', 'allowShare'], true)),
    allowWaitlist: Boolean(pick(data, ['allow_waitlist', 'allowWaitlist'], false)),

    participantsCount,
    participantsLimit,
    people: formatPeople(participantsCount, participantsLimit),

    price: formatPrice(data),

    image: image || DEFAULT_EVENT_IMAGE,
    imageUrl: image || DEFAULT_EVENT_IMAGE,
    hasCustomImage: Boolean(image),

    description: pick(data, ['description'], 'Описание события пока не добавлено.'),

    participantStatus,
    participantStatusLabel: participantMeta?.label || '',
    isParticipant:
      participantMeta?.isParticipant ??
      boolByKeys(data, ['is_participant', 'isParticipant', 'joined', 'is_joined']),

    joinDateProblem: getJoinDateProblem({
      startsAt,
      eventType,
      registrationDeadline: registrationDeadlineDate,
      cancelledAt,
    }),

    cancelledAt,
    cancelReason: pick(data, ['cancel_reason', 'cancelReason']),

    externalUrl,
    contactItems: buildContactItems(data),

    organizer: {
      name: pick(data, ['organizer_name'], 'Qala Events'),
      description: pick(data, ['organizer_description'], 'Организатор события в Qala.'),
    },

    detailItems: buildDetailItems({
      eventType,
      duration,
      ageLimit,
      language,
      accessType,
      registrationRequired: Boolean(pick(data, ['registration_required', 'registrationRequired'], false)),
      registrationDeadline,
      visibility,
      cancelledAt,
    }),

    program: Array.isArray(program) ? program.map(mapProgramItem) : [],
    polls: Array.isArray(polls) ? polls.map(mapPoll) : [],
    registrationQuestions: Array.isArray(registrationQuestions)
      ? registrationQuestions.map(mapRegistrationQuestion)
      : [],
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

const applyJoinChange = ({ isParticipant, participantsCount, participantStatus, participant_status }) => {
  if (!event.value) return

  const nextStatus = participantStatus || participant_status || null
  const statusMeta = PARTICIPANT_STATUS_META[nextStatus] || null

  event.value.participantStatus = nextStatus
  event.value.participantStatusLabel = statusMeta?.label || ''
  event.value.isParticipant = statusMeta?.isParticipant ?? Boolean(isParticipant)

  if (nextStatus === 'pending') {
    event.value.joinLabel = getEventTypeMeta(event.value.eventType).pendingLabel
  } else if (nextStatus === 'waitlist') {
    event.value.joinLabel = getEventTypeMeta(event.value.eventType).waitlistLabel
  } else {
    event.value.joinLabel = getEventTypeMeta(event.value.eventType).joinLabel
  }

  if (Number.isFinite(Number(participantsCount))) {
    event.value.participantsCount = Math.max(0, Number(participantsCount))
  }

  clearJoinGuard()
  syncPeople()
}

const openJoinModal = () => {
  if (!event.value) return

  if (!event.value.eventTypeCanJoin) {
    showJoinGuard('Запись для этого типа публикации недоступна.')
    return
  }

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

.qala-detail-grid,
.qala-contact-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.qala-detail-card,
.qala-contact-card,
.qala-question-card {
  min-width: 0;
  padding: 14px;
  border: 1px solid #eee;
  border-radius: 18px;
  background: #fafafa;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.qala-contact-card {
  color: inherit;
  text-decoration: none;
  transition: background 0.16s ease, border-color 0.16s ease;
}

.qala-contact-card:hover {
  background: #f7f7f7;
  border-color: #dedede;
}

.qala-detail-card > span,
.qala-contact-card > span {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: 0 8px 22px #0000000d;
}

.qala-detail-card div,
.qala-contact-card div,
.qala-question-card div {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.qala-detail-card strong,
.qala-contact-card strong,
.qala-question-card strong {
  color: #111;
  font-size: 14px;
  font-weight: 900;
  line-height: 1.25;
}

.qala-detail-card small,
.qala-contact-card small,
.qala-question-card small {
  color: #777;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.35;
}

.qala-poll-list,
.qala-question-list {
  display: grid;
  gap: 12px;
}

.qala-poll-card {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 20px;
  background: #fafafa;
}

.qala-poll-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.qala-poll-head strong {
  display: block;
  color: #111;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.3;
}

.qala-poll-head small {
  display: block;
  margin-top: 4px;
  color: #777;
  font-size: 12px;
  font-weight: 650;
}

.qala-status-pill {
  min-height: 28px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 12px;
  font-weight: 850;
  white-space: nowrap;
}

.qala-poll-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.qala-poll-option {
  min-height: 34px;
  padding: 0 13px;
  border: 1px solid #e7e7e7;
  border-radius: 999px;
  background: #fff;
  color: #111;
  font-size: 13px;
  font-weight: 750;
  opacity: 1;
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

  .qala-detail-grid,
  .qala-contact-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .qala-event-shell {
    padding-inline: 12px;
  }
}
</style>