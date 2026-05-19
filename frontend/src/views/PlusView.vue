<template>
  <div class="qala-create-page">
    <div class="qala-create-shell">
      <header class="qala-create-header">
        <div>
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>

        <button type="button" class="qala-create-close" @click="goBack">
          <i class="bi bi-x-lg"></i>
        </button>
      </header>

      <div v-if="isLoadingEvent" class="qala-success-alert">
        <i class="bi bi-arrow-repeat"></i>
        <span>Загружаем событие...</span>
      </div>

      <section v-else-if="isEventNotFound" class="qala-not-found">
        <div class="qala-not-found-card">
          <div class="qala-not-found-icon">
            <i class="bi bi-calendar-x"></i>
          </div>

          <h2>Событие не найдено</h2>

          <p>
            Возможно, событие было удалено, скрыто или ссылка больше недействительна.
          </p>

          <div class="qala-not-found-actions">
            <button type="button" class="qala-secondary-btn" @click="router.push('/')">
              <i class="bi bi-house"></i>
              <span>На главную</span>
            </button>

            <button type="button" class="qala-primary-btn" @click="router.push('/create')">
              <i class="bi bi-plus-circle"></i>
              <span>Создать событие</span>
            </button>
          </div>
        </div>
      </section>

      <form v-else class="qala-create-card" @submit.prevent="submitEvent">
        <div class="qala-create-left">
          <section class="qala-upload-section">
            <label class="qala-cover-upload">
              <input
                type="file"
                accept="image/*"
                hidden
                @change="handleImageUpload"
              />

              <img
                v-if="form.image"
                :src="form.image"
                alt="Обложка события"
                class="qala-cover-preview"
              />

              <div v-else class="qala-cover-placeholder">
                <div class="qala-upload-icon">
                  <i class="bi bi-image"></i>
                </div>

                <strong>Добавить обложку</strong>
                <span>PNG, JPG или WEBP</span>
              </div>
            </label>
          </section>

          <section class="qala-form-section">
            <div class="qala-form-group">
              <label>Название события</label>

              <input
                v-model="form.title"
                type="text"
                class="qala-input"
                placeholder="Например: Frontend Meetup Karaganda"
                required
              />
            </div>

            <div class="qala-form-group">
              <label>
                Категория <span class="qala-required">*</span>
              </label>

              <button
                type="button"
                class="qala-location-btn"
                :class="{ error: errors.category }"
                @click="openCategoryModal"
              >
                <span class="qala-location-icon">
                  <i :class="form.subcategoryIcon || form.categoryIcon || 'bi bi-grid'"></i>
                </span>

                <span class="qala-location-content">
                  <strong>{{ form.category || 'Выбрать категорию' }}</strong>
                  <small>{{ form.subcategory || 'Обязательное поле — выбери категорию' }}</small>
                </span>

                <i class="bi bi-chevron-right qala-location-arrow"></i>
              </button>

              <small class="qala-field-hint" :class="{ error: errors.category }">
                {{ errors.category || 'Без выбранной категории событие нельзя опубликовать' }}
              </small>
            </div>

            <div class="qala-form-row">
              <div class="qala-form-group">
                <label>Дата</label>

                <input
                  v-model="form.date"
                  type="date"
                  class="qala-input"
                  required
                />
              </div>

              <div class="qala-form-group">
                <label>Время</label>

                <input
                  v-model="form.time"
                  type="time"
                  class="qala-input"
                  required
                />
              </div>
            </div>

            <div class="qala-form-group">
              <label>
                Локация события <span class="qala-required">*</span>
              </label>

              <button
                type="button"
                class="qala-location-btn"
                :class="{ error: errors.location }"
                @click="openLocationModal"
              >
                <span class="qala-location-icon">
                  <i class="bi bi-geo-alt"></i>
                </span>

                <span class="qala-location-content">
                  <strong>
                    {{ hasSelectedLocation ? form.location : 'Выбрать место на карте' }}
                  </strong>

                  <small>
                    {{
                      hasSelectedLocation
                        ? form.address
                        : 'Обязательное поле — выбери точное место на карте'
                    }}
                  </small>
                </span>

                <i class="bi bi-chevron-right qala-location-arrow"></i>
              </button>

              <small class="qala-field-hint" :class="{ error: errors.location }">
                {{
                  errors.location ||
                  (hasSelectedLocation
                    ? `Координаты: ${Number(form.lat).toFixed(6)}, ${Number(form.lng).toFixed(6)}`
                    : 'Без выбранной локации событие нельзя опубликовать')
                }}
              </small>
            </div>

            <div class="qala-form-group">
              <label>Описание</label>

              <textarea
                v-model="form.description"
                class="qala-textarea"
                rows="5"
                placeholder="Расскажи, что будет на событии, кому оно подходит и почему стоит прийти"
                required
              ></textarea>
            </div>

            <div class="qala-form-group">
              <div class="qala-toggle-row">
                <div>
                  <label>Программа события</label>
                  <small>Включи, если нужно расписать этапы события</small>
                </div>

                <button
                  type="button"
                  class="qala-toggle"
                  :class="{ active: form.hasProgram }"
                  :aria-pressed="form.hasProgram"
                  @click="toggleProgram"
                >
                  <span></span>
                </button>
              </div>
            </div>

            <div v-if="form.hasProgram" class="qala-form-group">
              <label>Программа</label>

              <div class="qala-program-list">
                <div
                  v-for="(item, index) in form.program"
                  :key="item.id"
                  class="qala-program-item"
                >
                  <div class="qala-program-item-top">
                    <strong>Пункт {{ index + 1 }}</strong>

                    <div class="qala-program-actions">
                      <button
                        type="button"
                        class="qala-program-action-btn"
                        :disabled="index === 0"
                        title="Поднять выше"
                        @click="moveProgramItem(index, -1)"
                      >
                        <i class="bi bi-arrow-up"></i>
                      </button>

                      <button
                        type="button"
                        class="qala-program-action-btn"
                        :disabled="index === form.program.length - 1"
                        title="Опустить ниже"
                        @click="moveProgramItem(index, 1)"
                      >
                        <i class="bi bi-arrow-down"></i>
                      </button>

                      <button
                        type="button"
                        class="qala-program-remove"
                        title="Удалить пункт"
                        @click="removeProgramItem(index)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div class="qala-form-row">
                    <div class="qala-form-group">
                      <label>Время</label>

                      <input
                        v-model="item.time"
                        type="time"
                        class="qala-input"
                      />
                    </div>

                    <div class="qala-form-group">
                      <label>Название</label>

                      <input
                        v-model="item.title"
                        type="text"
                        class="qala-input"
                        placeholder="Например: Сбор гостей"
                      />
                    </div>
                  </div>

                  <div class="qala-form-group">
                    <label>Описание</label>

                    <textarea
                      v-model="item.description"
                      class="qala-textarea qala-program-textarea"
                      rows="2"
                      placeholder="Кратко опиши, что будет происходить"
                    ></textarea>
                  </div>
                </div>
              </div>

              <button type="button" class="qala-program-add" @click="addProgramItem">
                <i class="bi bi-plus-lg"></i>
                <span>Добавить пункт</span>
              </button>
            </div>

            <div class="qala-form-group">
              <label>Тип посещения</label>

              <div class="qala-visit-type-grid">
                <button
                  v-for="type in visitTypes"
                  :key="type.value"
                  type="button"
                  class="qala-visit-type-btn"
                  :class="{ active: form.visitType === type.value }"
                  @click="setVisitType(type.value)"
                >
                  <i :class="type.icon"></i>
                  <span>{{ type.label }}</span>
                </button>
              </div>
            </div>

            <div class="qala-form-row">
              <div v-if="form.visitType === 'paid'" class="qala-form-group">
                <label>Цена, ₸</label>

                <input
                  v-model.number="form.price"
                  type="number"
                  min="1"
                  step="1"
                  class="qala-input"
                  placeholder="Например: 3000"
                  required
                />
              </div>

              <div class="qala-form-group">
                <label>Лимит участников</label>

                <input
                  v-model="form.limit"
                  type="number"
                  min="1"
                  class="qala-input"
                  placeholder="100"
                />
              </div>
            </div>
          </section>
        </div>

        <aside class="qala-create-right">
          <section class="qala-preview-section">
            <h2>Предпросмотр</h2>

            <article class="qala-preview-card">
              <div class="qala-preview-image-wrap">
                <img
                  v-if="form.image"
                  :src="form.image"
                  alt="Preview"
                  class="qala-preview-image"
                />

                <div v-else class="qala-preview-empty">
                  <i class="bi bi-image"></i>
                </div>

                <span class="qala-preview-category">
                  {{ form.category || 'Категория' }}
                </span>
              </div>

              <div class="qala-preview-body">
                <div class="qala-preview-date">
                  <span>{{ previewDay }}</span>
                  <small>{{ previewMonth }}</small>
                </div>

                <div class="qala-preview-content">
                  <h3>{{ form.title || 'Название события' }}</h3>

                  <p>
                    <i class="bi bi-geo-alt"></i>
                    {{ form.location || 'Место проведения' }}
                  </p>

                  <div class="qala-preview-meta">
                    <span>
                      <i class="bi bi-clock"></i>
                      {{ form.time || '00:00' }}
                    </span>

                    <span>
                      <i class="bi bi-ticket-perforated"></i>
                      {{ previewPrice }}
                    </span>
                  </div>

                  <a
                    v-if="form.locationUrl"
                    :href="form.locationUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="qala-preview-map-link"
                  >
                    <i class="bi bi-map"></i>
                    <span>Открыть на карте</span>
                  </a>
                </div>
              </div>

              <div
                v-if="form.hasProgram && previewProgram.length"
                class="qala-preview-program"
              >
                <h4>Программа</h4>

                <div
                  v-for="item in previewProgram"
                  :key="item.id"
                  class="qala-preview-program-item"
                >
                  <div class="qala-preview-program-time">
                    {{ item.time || '00:00' }}
                  </div>

                  <div class="qala-preview-program-content">
                    <strong>{{ item.title || 'Название пункта' }}</strong>

                    <p v-if="item.description">
                      {{ item.description }}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <div class="qala-preview-actions">
              <button
                v-if="!isEditMode"
                type="button"
                class="qala-test-btn"
                @click="fillTestData"
              >
                <i class="bi bi-magic"></i>
                <span>Заполнить тестом</span>
              </button>

              <button type="button" class="qala-secondary-btn" @click="resetForm">
                <i class="bi bi-arrow-counterclockwise"></i>
                <span>Очистить</span>
              </button>

              <button
                type="submit"
                class="qala-primary-btn"
                :disabled="isSubmitting"
              >
                <i :class="submitButtonIcon"></i>
                <span>{{ submitButtonText }}</span>
              </button>

              <button
                v-if="isEditMode"
                type="button"
                class="qala-danger-btn"
                @click="openDeleteModal"
              >
                <i class="bi bi-trash3"></i>
                <span>Удалить событие</span>
              </button>
            </div>

            <small v-if="errors.submit" class="qala-field-hint error">
              {{ errors.submit }}
            </small>
          </section>
        </aside>
      </form>

      <div v-if="isSubmitted" class="qala-success-alert">
        <i class="bi bi-check-circle-fill"></i>
        <span>{{ successMessage }}</span>
      </div>
    </div>

    <CategoryPickerModal
      v-model="isCategoryModalOpen"
      lang="kk"
      :selected-category-id="form.categoryId"
      :selected-subcategory-id="form.subcategoryId"
      @select="handleCategorySelect"
    />

    <LocationPickerModal
      v-model="isLocationModalOpen"
      :initial-query="locationSearchQuery"
      :initial-lat="form.lat"
      :initial-lng="form.lng"
      @select="handleLocationSelect"
    />

    <DeleteEventModal
      v-if="isEditMode && !isEventNotFound"
      v-model="isDeleteModalOpen"
      :api-url="API_URL"
      :event-id="eventId"
      :event-title="form.title"
      @deleted="handleEventDeleted"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CategoryPickerModal from '@/components/events/CategoryPickerModal.vue'
import LocationPickerModal from '@/components/events/LocationPickerModal.vue'
import DeleteEventModal from '@/components/events/DeleteEventModal.vue'

const route = useRoute()
const router = useRouter()

const API_URL = import.meta.env.VITE_API_URL || '/api'

const visitTypes = [
  {
    value: 'free',
    label: 'Бесплатно',
    icon: 'bi bi-gift',
  },
  {
    value: 'paid',
    label: 'Платно',
    icon: 'bi bi-cash-coin',
  },
]

const months = [
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

const isSubmitted = ref(false)
const isSubmitting = ref(false)
const isLoadingEvent = ref(false)
const isEventNotFound = ref(false)
const isCategoryModalOpen = ref(false)
const isLocationModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const errors = reactive({
  category: '',
  location: '',
  submit: '',
})

let programId = 1

const eventId = computed(() => route.params.id || null)
const isEditMode = computed(() => Boolean(eventId.value))

const pageTitle = computed(() => {
  if (isEventNotFound.value) {
    return 'Событие не найдено'
  }

  return isEditMode.value ? 'Редактировать событие' : 'Создать событие'
})

const pageSubtitle = computed(() => {
  if (isEventNotFound.value) {
    return 'Проверь ссылку или создай новое событие'
  }

  return isEditMode.value
    ? 'Обнови данные городского события в Qala'
    : 'Добавь новое городское событие в Qala'
})

const submitButtonText = computed(() => {
  if (isSubmitting.value) {
    return isEditMode.value ? 'Сохраняем...' : 'Публикуем...'
  }

  return isEditMode.value ? 'Сохранить изменения' : 'Опубликовать событие'
})

const submitButtonIcon = computed(() => {
  if (isSubmitting.value) {
    return 'bi bi-arrow-repeat'
  }

  return isEditMode.value ? 'bi bi-check-circle' : 'bi bi-plus-circle'
})

const successMessage = computed(() => {
  return isEditMode.value
    ? 'Изменения события сохранены'
    : 'Событие подготовлено к публикации'
})

const createEmptyProgramItem = () => ({
  id: programId++,
  time: '',
  title: '',
  description: '',
})

const form = reactive({
  title: '',

  category: '',
  categoryId: null,
  categorySlug: '',
  categoryIcon: '',

  subcategory: '',
  subcategoryId: null,
  subcategorySlug: '',
  subcategoryIcon: '',

  date: '',
  time: '',
  location: '',
  address: '',
  locationUrl: '',
  lat: null,
  lng: null,
  description: '',
  hasProgram: false,
  visitType: 'free',
  price: '',
  limit: '',
  image: '',
  program: [createEmptyProgramItem()],
})

const locationSearchQuery = computed(() => {
  return form.location || form.address || ''
})

const hasSelectedLocation = computed(() => {
  return (
    Boolean(String(form.location || '').trim()) &&
    Boolean(String(form.address || '').trim()) &&
    Boolean(String(form.locationUrl || '').trim()) &&
    Number.isFinite(Number(form.lat)) &&
    Number.isFinite(Number(form.lng))
  )
})

const previewDay = computed(() => {
  if (!form.date) {
    return '31'
  }

  return String(new Date(form.date).getDate()).padStart(2, '0')
})

const previewMonth = computed(() => {
  if (!form.date) {
    return 'МАЙ'
  }

  return months[new Date(form.date).getMonth()]
})

const previewProgram = computed(() => {
  if (!form.hasProgram) {
    return []
  }

  return form.program.filter((item) => item.time || item.title || item.description)
})

const previewPrice = computed(() => {
  if (form.visitType === 'free') {
    return 'Бесплатно'
  }

  if (!form.price || Number(form.price) < 1) {
    return 'Цена не указана'
  }

  return `${Number(form.price).toLocaleString('ru-RU')} ₸`
})

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

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/')
}

const openCategoryModal = () => {
  errors.category = ''
  errors.submit = ''
  isCategoryModalOpen.value = true
}

const handleCategorySelect = ({ category, subcategory }) => {
  form.category = category?.name || ''
  form.categoryId = category?.id || null
  form.categorySlug = category?.slug || ''
  form.categoryIcon = category?.icon || ''

  form.subcategory = subcategory?.name || ''
  form.subcategoryId = subcategory?.id || null
  form.subcategorySlug = subcategory?.slug || ''
  form.subcategoryIcon = subcategory?.icon || ''

  errors.category = ''
  errors.submit = ''
  isCategoryModalOpen.value = false
}

const openLocationModal = () => {
  errors.location = ''
  errors.submit = ''
  isLocationModalOpen.value = true
}

const handleLocationSelect = (place) => {
  form.location = place.name || ''
  form.address = place.address || ''
  form.locationUrl = place.url || ''
  form.lat = Number.isFinite(Number(place.lat)) ? Number(place.lat) : null
  form.lng = Number.isFinite(Number(place.lng)) ? Number(place.lng) : null

  errors.location = ''
  errors.submit = ''
}

const validateCategory = () => {
  if (!form.categoryId || !form.categorySlug || !form.category) {
    errors.category = 'Выберите категорию события'
    return false
  }

  errors.category = ''
  return true
}

const validateLocation = () => {
  if (!hasSelectedLocation.value) {
    errors.location = 'Выберите место проведения на карте'
    return false
  }

  errors.location = ''
  return true
}

const toggleProgram = () => {
  form.hasProgram = !form.hasProgram

  if (form.hasProgram && !form.program.length) {
    form.program = [createEmptyProgramItem()]
  }
}

const setVisitType = (type) => {
  form.visitType = type

  if (type === 'free') {
    form.price = ''
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  if (form.image && form.image.startsWith('blob:')) {
    URL.revokeObjectURL(form.image)
  }

  form.image = URL.createObjectURL(file)
}

const addProgramItem = () => {
  form.program.push(createEmptyProgramItem())
}

const removeProgramItem = (index) => {
  if (form.program.length === 1) {
    form.program[0] = createEmptyProgramItem()
    return
  }

  form.program.splice(index, 1)
}

const moveProgramItem = (index, direction) => {
  const targetIndex = index + direction

  if (targetIndex < 0 || targetIndex >= form.program.length) {
    return
  }

  const [item] = form.program.splice(index, 1)
  form.program.splice(targetIndex, 0, item)
}

const resetCategoryFields = () => {
  form.category = ''
  form.categoryId = null
  form.categorySlug = ''
  form.categoryIcon = ''

  form.subcategory = ''
  form.subcategoryId = null
  form.subcategorySlug = ''
  form.subcategoryIcon = ''
}

const resetForm = () => {
  if (form.image && form.image.startsWith('blob:')) {
    URL.revokeObjectURL(form.image)
  }

  form.title = ''
  resetCategoryFields()
  form.date = ''
  form.time = ''
  form.location = ''
  form.address = ''
  form.locationUrl = ''
  form.lat = null
  form.lng = null
  form.description = ''
  form.hasProgram = false
  form.visitType = 'free'
  form.price = ''
  form.limit = ''
  form.image = ''
  form.program = [createEmptyProgramItem()]

  errors.category = ''
  errors.location = ''
  errors.submit = ''
  isSubmitted.value = false
  isEventNotFound.value = false
}

const fillTestData = () => {
  if (form.image && form.image.startsWith('blob:')) {
    URL.revokeObjectURL(form.image)
  }

  form.title = 'Frontend Meetup Karaganda'
  resetCategoryFields()
  form.date = '2026-05-28'
  form.time = '18:30'
  form.location = 'IT Hub Karaganda'
  form.address = 'Караганда, проспект Бухар-Жырау 32'
  form.locationUrl = 'https://www.openstreetmap.org/?mlat=49.8047&mlon=73.1094#map=17/49.8047/73.1094'
  form.lat = 49.8047
  form.lng = 73.1094
  form.description =
    'Встреча frontend-разработчиков, дизайнеров и продуктовых специалистов. Обсудим Vue, UX, производительность интерфейсов и реальные кейсы разработки городских сервисов.'
  form.hasProgram = true
  form.visitType = 'paid'
  form.price = 3000
  form.limit = 120
  form.image =
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1400&auto=format&fit=crop'
  form.program = [
    {
      id: programId++,
      time: '18:30',
      title: 'Сбор гостей',
      description: 'Регистрация участников, знакомство и свободное общение.',
    },
    {
      id: programId++,
      time: '19:00',
      title: 'Выступление спикеров',
      description: 'Практические доклады про Vue, UX и разработку городских сервисов.',
    },
    {
      id: programId++,
      time: '20:30',
      title: 'Нетворкинг',
      description: 'Обсуждение проектов, обмен контактами и ответы на вопросы.',
    },
  ]

  errors.category = ''
  errors.location = ''
  errors.submit = ''
  isSubmitted.value = false
  isEventNotFound.value = false
}

const buildEventPayload = () => {
  const program = form.hasProgram
    ? form.program
        .filter((item) => item.time || item.title || item.description)
        .map(({ time, title, description }) => ({
          time,
          title,
          description,
        }))
    : []

  return {
    title: form.title.trim(),

    category: form.category,
    categoryId: form.categoryId,
    categorySlug: form.categorySlug,

    subcategory: form.subcategory,
    subcategoryId: form.subcategoryId,
    subcategorySlug: form.subcategorySlug,

    date: form.date,
    time: form.time,

    location: form.location.trim(),
    address: form.address.trim(),
    locationUrl: form.locationUrl.trim(),
    lat: Number(form.lat),
    lng: Number(form.lng),

    description: form.description.trim(),

    hasProgram: form.hasProgram,
    visitType: form.visitType,
    price: form.visitType === 'paid' ? Number(form.price) : 0,
    limit: form.limit ? Number(form.limit) : null,

    image: form.image,
    program,
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

const loadEventRequest = async () => {
  return requestJson(`${API_URL}/event/${eventId.value}`, {
    method: 'GET',
  })
}

const saveEventRequest = async (payload) => {
  const url = isEditMode.value
    ? `${API_URL}/event/update/${eventId.value}`
    : `${API_URL}/event/create`

  const method = isEditMode.value ? 'PUT' : 'POST'

  return requestJson(url, {
    method,
    body: JSON.stringify(payload),
  })
}

const fillFormFromEvent = (eventData) => {
  const event = eventData?.event || eventData
  const program = eventData?.program || event?.program || []

  if (!event) {
    throw new Error('Событие не найдено')
  }

  if (form.image && form.image.startsWith('blob:')) {
    URL.revokeObjectURL(form.image)
  }

  form.title = event.title || ''

  form.category = event.category_name || event.category || ''
  form.categoryId = event.category_id || event.categoryId || null
  form.categorySlug = event.category_slug || event.categorySlug || ''
  form.categoryIcon = event.category_icon || event.categoryIcon || ''

  form.subcategory = event.subcategory_name || event.subcategory || ''
  form.subcategoryId = event.subcategory_id || event.subcategoryId || null
  form.subcategorySlug = event.subcategory_slug || event.subcategorySlug || ''
  form.subcategoryIcon = event.subcategory_icon || event.subcategoryIcon || ''

  form.date = normalizeDate(event.event_date || event.date)
  form.time = normalizeTime(event.event_time || event.time)

  form.location = event.location_title || event.location || ''
  form.address = event.address || ''
  form.locationUrl = event.location_url || event.locationUrl || ''

  form.lat = event.lat !== null && event.lat !== undefined ? Number(event.lat) : null
  form.lng = event.lng !== null && event.lng !== undefined ? Number(event.lng) : null

  form.description = event.description || ''
  form.hasProgram = Boolean(event.has_program ?? event.hasProgram)

  form.visitType = event.visit_type || event.visitType || 'free'
  form.price = form.visitType === 'paid' ? Number(event.price || 0) : ''
  form.limit = event.participants_limit || event.limit || ''

  form.image = event.image_url || event.image || ''

  form.program = Array.isArray(program) && program.length
    ? program.map((item) => ({
        id: programId++,
        time: normalizeTime(item.program_time || item.time),
        title: item.title || '',
        description: item.description || '',
      }))
    : [createEmptyProgramItem()]

  errors.category = ''
  errors.location = ''
  errors.submit = ''
  isSubmitted.value = false
  isEventNotFound.value = false
}

const loadEventForEdit = async () => {
  isEventNotFound.value = false

  if (!isEditMode.value) {
    resetForm()
    return
  }

  try {
    isLoadingEvent.value = true
    errors.submit = ''

    const data = await loadEventRequest()

    if (!data?.data) {
      isEventNotFound.value = true
      return
    }

    fillFormFromEvent(data.data)
  } catch (err) {
    console.error('Load event error:', err)

    if (err?.status === 404) {
      isEventNotFound.value = true
      errors.submit = ''
      return
    }

    errors.submit =
      err?.response?.message ||
      err?.message ||
      'Не удалось загрузить событие'
  } finally {
    isLoadingEvent.value = false
  }
}

const openDeleteModal = () => {
  if (!isEditMode.value || !eventId.value || isEventNotFound.value) {
    return
  }

  errors.submit = ''
  isDeleteModalOpen.value = true
}

const handleEventDeleted = () => {
  isSubmitted.value = false
  router.push('/')
}

const submitEvent = async () => {
  if (isSubmitting.value || isEventNotFound.value) {
    return
  }

  errors.submit = ''

  if (!validateCategory() || !validateLocation()) {
    return
  }

  if (form.visitType === 'paid' && Number(form.price) < 1) {
    return
  }

  const payload = buildEventPayload()

  console.log('Created event:', payload)

  try {
    isSubmitting.value = true

    await saveEventRequest(payload)

    isSubmitted.value = true
  } catch (err) {
    console.error('Save event request error:', err)

    errors.submit =
      err?.response?.message ||
      err?.message ||
      (isEditMode.value
        ? 'Не удалось сохранить изменения'
        : 'Не удалось создать событие')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadEventForEdit()
})

watch(
  () => route.params.id,
  () => {
    loadEventForEdit()
  }
)
</script>

<style scoped>
.qala-create-page {
  --c: #111;
  --muted: #737373;
  --soft: #8a8a8a;
  --line: #eee;
  --bg: #fff;
  --bg2: #fafafa;
  --bg3: #f7f7f7;
  --danger: #ef4444;
  --pill: 999px;
  --tr: 0.16s ease;
  width: 100%;
  min-height: 100vh;
  background: var(--bg);
}

.qala-create-shell {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 28px 32px 56px;
}

.qala-create-header,
.qala-program-item-top,
.qala-program-actions {
  display: flex;
  align-items: center;
}

.qala-create-header {
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.qala-create-header h1,
.qala-create-header p,
.qala-preview-section h2,
.qala-preview-content h3,
.qala-preview-program h4,
.qala-preview-program-content p {
  margin: 0;
}

.qala-create-header h1 {
  color: #050505;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.qala-create-header p {
  margin-top: 7px;
  color: var(--muted);
  font-size: 15px;
  font-weight: 500;
}

.qala-create-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 32px;
  align-items: start;
}

.qala-create-left,
.qala-form-section,
.qala-program-list,
.qala-program-item,
.qala-form-group,
.qala-preview-body,
.qala-preview-actions {
  display: grid;
}

.qala-create-left {
  gap: 24px;
}

.qala-form-section {
  gap: 17px;
}

.qala-form-group {
  gap: 8px;
}

.qala-form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.qala-create-left,
.qala-create-right,
.qala-upload-section,
.qala-form-section,
.qala-preview-section,
.qala-preview-content,
.qala-preview-program-content {
  min-width: 0;
}

.qala-create-right {
  position: sticky;
  top: 24px;
  align-self: start;
}

.qala-create-close,
.qala-upload-icon,
.qala-program-action-btn,
.qala-program-remove,
.qala-preview-empty,
.qala-preview-date,
.qala-preview-program-time {
  display: grid;
  place-items: center;
}

.qala-create-close,
.qala-program-action-btn,
.qala-program-remove {
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: var(--pill);
  background: var(--bg);
}

.qala-create-close {
  width: 42px;
  height: 42px;
  color: var(--c);
  text-decoration: none;
}

.qala-create-close:hover,
.qala-cover-upload:hover,
.qala-visit-type-btn:hover,
.qala-program-add:hover,
.qala-preview-map-link:hover,
.qala-secondary-btn:hover,
.qala-test-btn:hover,
.qala-location-btn:hover {
  background: var(--bg3);
  color: var(--c);
}

.qala-cover-upload {
  position: relative;
  width: 100%;
  height: 280px;
  border: 1px dashed #dcdcdc;
  border-radius: 28px;
  background: var(--bg2);
  display: grid;
  place-items: center;
  overflow: hidden;
  cursor: pointer;
}

.qala-cover-preview,
.qala-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qala-cover-placeholder {
  display: grid;
  place-items: center;
  text-align: center;
  padding: 24px;
}

.qala-upload-icon {
  width: 58px;
  height: 58px;
  margin-bottom: 14px;
  border-radius: var(--pill);
  background: var(--bg);
  color: var(--c);
  font-size: 26px;
  box-shadow: 0 8px 24px #0000000f;
}

.qala-cover-placeholder strong {
  color: var(--c);
  font-size: 17px;
  font-weight: 900;
}

.qala-cover-placeholder span {
  margin-top: 4px;
  color: var(--soft);
  font-size: 13px;
  font-weight: 600;
}

.qala-form-group label {
  color: var(--c);
  font-size: 13px;
  font-weight: 850;
}

.qala-required,
.qala-field-hint.error,
.qala-program-remove {
  color: var(--danger);
}

.qala-field-hint {
  color: var(--soft);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.qala-input,
.qala-textarea {
  width: 100%;
  border: 1px solid var(--line);
  outline: 0;
  border-radius: 15px;
  background: var(--bg);
  color: var(--c);
  font-size: 14px;
  font-weight: 600;
  transition: border-color var(--tr), box-shadow var(--tr);
}

.qala-input {
  height: 46px;
  padding: 0 15px;
}

.qala-textarea {
  resize: vertical;
  min-height: 132px;
  padding: 14px 15px;
  line-height: 1.55;
}

.qala-input:focus,
.qala-textarea:focus {
  border-color: var(--c);
  box-shadow: 0 0 0 4px #0000000a;
}

.qala-input::placeholder,
.qala-textarea::placeholder {
  color: #9a9a9a;
}

.qala-visit-type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.qala-visit-type-btn,
.qala-preview-category,
.qala-preview-map-link,
.qala-primary-btn,
.qala-secondary-btn,
.qala-test-btn,
.qala-danger-btn,
.qala-program-add,
.qala-success-alert {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.qala-visit-type-btn,
.qala-preview-map-link,
.qala-primary-btn,
.qala-secondary-btn,
.qala-test-btn,
.qala-danger-btn,
.qala-success-alert {
  border-radius: var(--pill);
}

.qala-visit-type-btn {
  height: 42px;
  padding: 0 16px;
  gap: 8px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--c);
  font-size: 13px;
  font-weight: 850;
}

.qala-visit-type-btn.active {
  border-color: var(--c);
  background: var(--c);
  color: #fff;
}

.qala-location-btn {
  width: 100%;
  min-height: 64px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--bg2);
  color: var(--c);
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.qala-location-btn.error {
  border-color: var(--danger);
  background: #fff1f2;
}

.qala-location-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--pill);
  background: var(--bg);
  display: grid;
  place-items: center;
  color: var(--c);
  font-size: 20px;
  box-shadow: 0 8px 24px #0000000f;
}

.qala-location-content {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.qala-location-content strong,
.qala-location-content small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qala-location-content strong {
  color: var(--c);
  font-size: 14px;
  font-weight: 900;
}

.qala-location-content small {
  color: var(--soft);
  font-size: 12px;
  font-weight: 600;
}

.qala-location-arrow {
  color: var(--soft);
  font-size: 16px;
}

.qala-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--bg2);
}

.qala-toggle-row small {
  display: block;
  margin-top: 4px;
  color: var(--soft);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
}

.qala-toggle {
  width: 48px;
  height: 28px;
  padding: 3px;
  border: 0;
  border-radius: var(--pill);
  background: #ddd;
  flex-shrink: 0;
  transition: background var(--tr);
}

.qala-toggle span {
  width: 22px;
  height: 22px;
  border-radius: var(--pill);
  background: #fff;
  display: block;
  transition: transform var(--tr);
  box-shadow: 0 2px 8px #00000024;
}

.qala-toggle.active {
  background: var(--c);
}

.qala-toggle.active span {
  transform: translateX(20px);
}

.qala-program-list {
  gap: 12px;
}

.qala-program-item {
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--bg2);
}

.qala-program-item-top {
  justify-content: space-between;
  gap: 12px;
}

.qala-program-item-top strong,
.qala-preview-program-content strong {
  color: var(--c);
  font-size: 13px;
  font-weight: 900;
}

.qala-program-actions {
  gap: 6px;
  flex-shrink: 0;
}

.qala-program-action-btn,
.qala-program-remove {
  width: 34px;
  height: 34px;
  transition: background var(--tr), border-color var(--tr), color var(--tr), opacity var(--tr);
}

.qala-program-action-btn {
  color: var(--c);
}

.qala-program-action-btn:hover:not(:disabled) {
  background: #f2f2f2;
  border-color: #dcdcdc;
}

.qala-program-action-btn:disabled {
  color: #c5c5c5;
  background: #f8f8f8;
  cursor: not-allowed;
  opacity: 0.7;
}

.qala-program-remove:hover {
  background: #fff1f2;
  border-color: #fecdd3;
}

.qala-program-textarea {
  min-height: 86px;
}

.qala-program-add {
  width: 100%;
  height: 42px;
  margin-top: 4px;
  border: 1px dashed #d9d9d9;
  border-radius: 16px;
  background: var(--bg);
  color: var(--c);
  gap: 8px;
  font-size: 13px;
  font-weight: 850;
}

.qala-program-add:hover {
  border-color: #cfcfcf;
}

.qala-preview-section {
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--bg);
  padding: 16px;
}

.qala-preview-section h2 {
  margin-bottom: 14px;
  color: var(--c);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.qala-preview-card {
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
  background: var(--bg);
}

.qala-preview-image-wrap {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #f3f4f6;
  overflow: hidden;
}

.qala-preview-empty {
  width: 100%;
  height: 100%;
  color: #b0b0b0;
  font-size: 34px;
}

.qala-preview-category {
  position: absolute;
  left: 12px;
  bottom: 12px;
  height: 28px;
  padding: 0 11px;
  background: #ffffffeb;
  color: var(--c);
  font-size: 12px;
  font-weight: 850;
  backdrop-filter: blur(10px);
}

.qala-preview-body {
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 12px;
  padding: 14px;
}

.qala-preview-date {
  width: 52px;
  height: 56px;
  border-radius: 16px;
  background: var(--bg3);
  align-content: center;
}

.qala-preview-date span {
  color: var(--c);
  font-size: 20px;
  font-weight: 950;
  line-height: 1;
  letter-spacing: -0.04em;
}

.qala-preview-date small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
}

.qala-preview-content h3 {
  margin-bottom: 8px;
  color: var(--c);
  font-size: 15px;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.qala-preview-content p {
  margin: 0 0 10px;
  color: #707070;
  font-size: 13px;
  font-weight: 600;
}

.qala-preview-content p,
.qala-preview-meta,
.qala-preview-meta span,
.qala-preview-map-link {
  display: flex;
  align-items: center;
}

.qala-preview-content p,
.qala-preview-meta span {
  gap: 5px;
}

.qala-preview-meta {
  flex-wrap: wrap;
  gap: 9px;
  color: #555;
  font-size: 12px;
  font-weight: 750;
}

.qala-preview-map-link {
  width: fit-content;
  min-height: 32px;
  margin-top: 12px;
  padding: 0 12px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--c);
  gap: 7px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 850;
}

.qala-preview-program {
  margin: 0 14px 14px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.qala-preview-program h4 {
  margin-bottom: 12px;
  color: var(--c);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.025em;
}

.qala-preview-program-item {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 10px;
}

.qala-preview-program-item + .qala-preview-program-item {
  margin-top: 12px;
}

.qala-preview-program-time {
  height: 34px;
  border-radius: var(--pill);
  background: #f3f4f6;
  color: var(--c);
  font-size: 12px;
  font-weight: 900;
}

.qala-preview-program-content strong {
  display: block;
  line-height: 1.25;
}

.qala-preview-program-content p {
  margin-top: 4px;
  color: #666;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.qala-preview-actions {
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 12px;
}

.qala-primary-btn,
.qala-secondary-btn,
.qala-test-btn,
.qala-danger-btn {
  width: 100%;
  min-height: 44px;
  padding: 0 17px;
  gap: 8px;
  font-size: 14px;
  font-weight: 850;
}

.qala-primary-btn {
  border: 0;
  background: var(--c);
  color: #fff;
}

.qala-primary-btn:hover {
  background: #222;
}

.qala-primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.qala-secondary-btn,
.qala-test-btn {
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--c);
}

.qala-test-btn {
  border-color: #dcdcdc;
  background: var(--bg2);
}

.qala-danger-btn {
  border: 1px solid #fecdd3;
  background: #fff1f2;
  color: #dc2626;
}

.qala-danger-btn:hover {
  background: #ffe4e6;
  color: #b91c1c;
}

.qala-success-alert {
  position: fixed;
  left: 50%;
  bottom: 28px;
  z-index: 300;
  transform: translateX(-50%);
  min-height: 46px;
  padding: 0 17px;
  background: var(--c);
  color: #fff;
  gap: 9px;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 16px 40px #0000002e;
}

.qala-success-alert i {
  color: #22c55e;
}

.qala-not-found {
  min-height: 520px;
  display: grid;
  place-items: center;
  padding: 40px 0;
}

.qala-not-found-card {
  width: 100%;
  max-width: 460px;
  padding: 34px 24px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: var(--bg);
  text-align: center;
}

.qala-not-found-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 18px;
  border-radius: var(--pill);
  background: var(--bg3);
  color: var(--c);
  display: grid;
  place-items: center;
  font-size: 34px;
}

.qala-not-found-card h2 {
  margin: 0;
  color: var(--c);
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.qala-not-found-card p {
  margin: 10px auto 22px;
  max-width: 360px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.qala-not-found-actions {
  display: grid;
  gap: 10px;
}

@media (min-width: 1600px) {
  .qala-create-shell {
    max-width: 1640px;
  }

  .qala-create-card {
    grid-template-columns: minmax(0, 1fr) 440px;
  }

  .qala-cover-upload {
    height: 300px;
  }
}

@media (min-width: 1900px) {
  .qala-create-shell {
    max-width: 1760px;
  }

  .qala-create-card {
    grid-template-columns: minmax(0, 1fr) 460px;
  }

  .qala-cover-upload {
    height: 320px;
  }
}

@media (max-width: 1199px) {
  .qala-create-shell {
    padding: 24px 24px 56px;
  }

  .qala-create-card {
    grid-template-columns: 1fr;
  }

  .qala-create-right {
    position: static;
  }
}

@media (max-width: 860px) {
  .qala-create-page {
    overflow-x: hidden;
  }

  .qala-create-shell {
    max-width: none;
    margin: 0;
    padding: 18px 14px 82px;
  }

  .qala-create-header {
    margin-bottom: 18px;
  }

  .qala-create-header h1 {
    font-size: 25px;
  }

  .qala-create-header p {
    font-size: 14px;
  }

  .qala-create-card {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .qala-create-left,
  .qala-create-right,
  .qala-upload-section,
  .qala-form-section,
  .qala-preview-section {
    width: 100%;
  }

  .qala-cover-upload {
    height: auto;
    aspect-ratio: 4 / 3;
    border-radius: 22px;
  }

  .qala-form-row {
    grid-template-columns: 1fr;
  }

  .qala-visit-type-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .qala-visit-type-btn,
  .qala-success-alert {
    justify-content: center;
  }

  .qala-success-alert {
    left: 12px;
    right: 12px;
    bottom: 70px;
    transform: none;
  }
}

@media (max-width: 520px) {
  .qala-program-item-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .qala-program-actions {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .qala-program-action-btn,
  .qala-program-remove {
    width: 100%;
    height: 38px;
    border-radius: 14px;
  }
}

@media (max-width: 420px) {
  .qala-create-shell {
    max-width: none;
    padding-inline: 12px;
  }

  .qala-preview-body {
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 10px;
  }

  .qala-preview-date {
    width: 48px;
    height: 52px;
  }

  .qala-preview-program-item {
    grid-template-columns: 54px minmax(0, 1fr);
  }
}
</style>