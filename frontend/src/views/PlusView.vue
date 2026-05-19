<template>
  <div class="qala-create-page">
    <div class="qala-create-shell">
      <header class="qala-create-header">
        <div>
          <h1>Создать событие</h1>
          <p>Добавь новое городское событие в Qala</p>
        </div>

        <button
          type="button"
          class="qala-create-close"
          @click="goBack"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </header>

      <form class="qala-create-card" @submit.prevent="submitEvent">
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
              <label>Категория</label>

              <div class="qala-category-grid">
                <button
                  v-for="category in categories"
                  :key="category"
                  type="button"
                  class="qala-category-btn"
                  :class="{ active: form.category === category }"
                  @click="form.category = category"
                >
                  {{ category }}
                </button>
              </div>
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
              <label>Место проведения</label>

              <input
                v-model="form.location"
                type="text"
                class="qala-input"
                placeholder="Например: IT Hub Karaganda"
                required
              />
            </div>

            <div class="qala-form-group">
              <label>Адрес</label>

              <input
                v-model="form.address"
                type="text"
                class="qala-input"
                placeholder="Караганда, проспект Бухар-Жырау 32"
              />
            </div>

            <div class="qala-form-group">
              <label>Ссылка на место</label>

              <input
                v-model.trim="form.locationUrl"
                type="url"
                class="qala-input"
                placeholder="Например: ссылка из Google Maps или 2GIS"
                required
                @blur="validateLocationUrl"
              />

              <small
                class="qala-field-hint"
                :class="{ error: errors.locationUrl }"
              >
                {{ errors.locationUrl || 'Вставь ссылку на место события из Google Maps, 2GIS или другой карты' }}
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

              <button
                type="button"
                class="qala-program-add"
                @click="addProgramItem"
              >
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
              <div
                v-if="form.visitType === 'paid'"
                class="qala-form-group"
              >
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
                  <h3>
                    {{ form.title || 'Название события' }}
                  </h3>

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
                    v-if="isValidLocationUrl"
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
                v-if="previewProgram.length"
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
                    <strong>
                      {{ item.title || 'Название пункта' }}
                    </strong>

                    <p v-if="item.description">
                      {{ item.description }}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </aside>

        <footer class="qala-create-footer">
          <button
            type="button"
            class="qala-secondary-btn"
            @click="resetForm"
          >
            Очистить
          </button>

          <button type="submit" class="qala-primary-btn">
            <i class="bi bi-plus-circle"></i>
            <span>Опубликовать событие</span>
          </button>
        </footer>
      </form>

      <div v-if="isSubmitted" class="qala-success-alert">
        <i class="bi bi-check-circle-fill"></i>
        <span>Событие подготовлено к публикации</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const categories = [
  'Концерты',
  'Образование',
  'Спорт',
  'Бизнес',
  'Выставки',
]

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

const errors = reactive({
  locationUrl: '',
})

let programId = 1

const createEmptyProgramItem = () => ({
  id: programId++,
  time: '',
  title: '',
  description: '',
})

const form = reactive({
  title: '',
  category: 'Концерты',
  date: '',
  time: '',
  location: '',
  address: '',
  locationUrl: '',
  description: '',
  visitType: 'free',
  price: '',
  limit: '',
  image: '',
  program: [createEmptyProgramItem()],
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/')
}

const isUrl = (value) => {
  if (!value) {
    return false
  }

  try {
    const url = new URL(value)

    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const isValidLocationUrl = computed(() => {
  return isUrl(form.locationUrl)
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
  return form.program.filter((item) => {
    return item.time || item.title || item.description
  })
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

const validateLocationUrl = () => {
  if (!form.locationUrl) {
    errors.locationUrl = 'Ссылка на место обязательна'
    return false
  }

  if (!isUrl(form.locationUrl)) {
    errors.locationUrl = 'Введите корректную ссылку, например из Google Maps или 2GIS'
    return false
  }

  errors.locationUrl = ''
  return true
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

const resetForm = () => {
  form.title = ''
  form.category = 'Концерты'
  form.date = ''
  form.time = ''
  form.location = ''
  form.address = ''
  form.locationUrl = ''
  form.description = ''
  form.visitType = 'free'
  form.price = ''
  form.limit = ''
  form.image = ''
  form.program = [createEmptyProgramItem()]

  errors.locationUrl = ''
  isSubmitted.value = false
}

const submitEvent = () => {
  if (!validateLocationUrl()) {
    return
  }

  if (form.visitType === 'paid' && Number(form.price) < 1) {
    return
  }

  const program = form.program
    .filter((item) => {
      return item.time || item.title || item.description
    })
    .map(({ time, title, description }) => {
      return {
        time,
        title,
        description,
      }
    })

  const payload = {
    title: form.title.trim(),
    category: form.category,
    date: form.date,
    time: form.time,
    location: form.location.trim(),
    address: form.address.trim(),
    locationUrl: form.locationUrl.trim(),
    description: form.description.trim(),
    visitType: form.visitType,
    price: form.visitType === 'paid' ? Number(form.price) : 0,
    limit: form.limit ? Number(form.limit) : null,
    image: form.image,
    program,
  }

  isSubmitted.value = true

  console.log('Created event:', payload)
}
</script>

<style scoped>
.qala-create-page {
  width: 100%;
  min-height: 100vh;
  background: #fff;
}

.qala-create-shell {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 28px 32px 56px;
}

.qala-create-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.qala-create-header h1 {
  margin: 0;
  color: #050505;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.qala-create-header p {
  margin: 7px 0 0;
  color: #737373;
  font-size: 15px;
  font-weight: 500;
}

.qala-create-close {
  width: 42px;
  height: 42px;
  border: 1px solid #eeeeee;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: grid;
  place-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.qala-create-close:hover {
  background: #f7f7f7;
  color: #111;
}

.qala-create-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 32px;
  align-items: start;
}

.qala-create-left,
.qala-create-right,
.qala-upload-section,
.qala-form-section,
.qala-preview-section {
  min-width: 0;
}

.qala-create-left {
  display: grid;
  gap: 24px;
}

.qala-create-right {
  position: sticky;
  top: 24px;
  align-self: start;
}

.qala-cover-upload {
  position: relative;
  width: 100%;
  height: 280px;
  border: 1px dashed #dcdcdc;
  border-radius: 28px;
  background: #fafafa;
  display: grid;
  place-items: center;
  overflow: hidden;
  cursor: pointer;
}

.qala-cover-upload:hover {
  background: #f7f7f7;
}

.qala-cover-preview {
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
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 26px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.qala-cover-placeholder strong {
  color: #111;
  font-size: 17px;
  font-weight: 900;
}

.qala-cover-placeholder span {
  margin-top: 4px;
  color: #8a8a8a;
  font-size: 13px;
  font-weight: 600;
}

.qala-form-section {
  display: grid;
  gap: 17px;
}

.qala-form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.qala-form-group {
  display: grid;
  gap: 8px;
}

.qala-form-group label {
  color: #111;
  font-size: 13px;
  font-weight: 850;
}

.qala-field-hint {
  color: #8a8a8a;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.qala-field-hint.error {
  color: #ef4444;
}

.qala-input,
.qala-textarea {
  width: 100%;
  border: 1px solid #eeeeee;
  outline: none;
  border-radius: 15px;
  background: #fff;
  color: #111;
  font-size: 14px;
  font-weight: 600;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease;
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
  border-color: #111;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.04);
}

.qala-input::placeholder,
.qala-textarea::placeholder {
  color: #9a9a9a;
}

.qala-category-grid,
.qala-visit-type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.qala-category-btn {
  height: 36px;
  padding: 0 14px;
  border: 1px solid #eeeeee;
  border-radius: 999px;
  background: #fff;
  color: #111;
  font-size: 13px;
  font-weight: 800;
}

.qala-category-btn.active {
  border-color: #111;
  background: #111;
  color: #fff;
}

.qala-visit-type-btn {
  height: 42px;
  padding: 0 16px;
  border: 1px solid #eeeeee;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 850;
}

.qala-visit-type-btn:hover {
  background: #f7f7f7;
}

.qala-visit-type-btn.active {
  border-color: #111;
  background: #111;
  color: #fff;
}

.qala-program-list {
  display: grid;
  gap: 12px;
}

.qala-program-item {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid #eeeeee;
  border-radius: 20px;
  background: #fafafa;
}

.qala-program-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.qala-program-item-top strong {
  color: #111;
  font-size: 13px;
  font-weight: 900;
}

.qala-program-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.qala-program-action-btn,
.qala-program-remove {
  width: 34px;
  height: 34px;
  border: 1px solid #eeeeee;
  border-radius: 999px;
  background: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    opacity 0.16s ease;
}

.qala-program-action-btn {
  color: #111;
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

.qala-program-remove {
  color: #ef4444;
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
  background: #fff;
  color: #111;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 850;
}

.qala-program-add:hover {
  background: #f7f7f7;
  border-color: #cfcfcf;
}

.qala-preview-section {
  border: 1px solid #eeeeee;
  border-radius: 24px;
  background: #fff;
  padding: 16px;
}

.qala-preview-section h2 {
  margin: 0 0 14px;
  color: #111;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.qala-preview-card {
  border: 1px solid #eeeeee;
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
}

.qala-preview-image-wrap {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #f3f4f6;
  overflow: hidden;
}

.qala-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qala-preview-empty {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #b0b0b0;
  font-size: 34px;
}

.qala-preview-category {
  position: absolute;
  left: 12px;
  bottom: 12px;
  height: 28px;
  padding: 0 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #111;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 850;
  backdrop-filter: blur(10px);
}

.qala-preview-body {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 12px;
  padding: 14px;
}

.qala-preview-date {
  width: 52px;
  height: 56px;
  border-radius: 16px;
  background: #f7f7f7;
  display: grid;
  place-items: center;
  align-content: center;
}

.qala-preview-date span {
  color: #111;
  font-size: 20px;
  font-weight: 950;
  line-height: 1;
  letter-spacing: -0.04em;
}

.qala-preview-date small {
  margin-top: 4px;
  color: #737373;
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
}

.qala-preview-content {
  min-width: 0;
}

.qala-preview-content h3 {
  margin: 0 0 8px;
  color: #111;
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
  display: flex;
  align-items: center;
  gap: 5px;
}

.qala-preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  color: #555;
  font-size: 12px;
  font-weight: 750;
}

.qala-preview-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.qala-preview-map-link {
  width: fit-content;
  margin-top: 12px;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid #eeeeee;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 850;
}

.qala-preview-map-link:hover {
  background: #f7f7f7;
  color: #111;
}

.qala-preview-program {
  margin: 0 14px 14px;
  padding-top: 14px;
  border-top: 1px solid #eeeeee;
}

.qala-preview-program h4 {
  margin: 0 0 12px;
  color: #111;
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
  border-radius: 999px;
  background: #f3f4f6;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 900;
}

.qala-preview-program-content {
  min-width: 0;
}

.qala-preview-program-content strong {
  display: block;
  color: #111;
  font-size: 13px;
  font-weight: 900;
  line-height: 1.25;
}

.qala-preview-program-content p {
  margin: 4px 0 0;
  color: #666;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.qala-create-footer {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
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
}

.qala-secondary-btn {
  border: 1px solid #eeeeee;
  background: #fff;
  color: #111;
}

.qala-secondary-btn:hover {
  background: #f7f7f7;
}

.qala-success-alert {
  position: fixed;
  left: 50%;
  bottom: 28px;
  z-index: 300;
  transform: translateX(-50%);
  min-height: 46px;
  padding: 0 17px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

.qala-success-alert i {
  color: #22c55e;
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

  .qala-preview-section {
    position: static;
  }
}

@media (max-width: 860px) {
  .qala-create-page {
    width: 100%;
    overflow-x: hidden;
  }

  .qala-create-shell {
    width: 100%;
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
    width: 100%;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .qala-create-left,
  .qala-create-right,
  .qala-upload-section,
  .qala-form-section,
  .qala-preview-section,
  .qala-create-footer {
    width: 100%;
  }

  .qala-cover-upload {
    width: 100%;
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

  .qala-visit-type-btn {
    justify-content: center;
  }

  .qala-preview-section {
    position: static;
  }

  .qala-create-footer {
    position: sticky;
    bottom: 66px;
    z-index: 20;
    display: grid;
    grid-template-columns: 1fr;
    padding: 12px;
    margin: 0 -12px;
    border: 1px solid #eeeeee;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(18px);
  }

  .qala-primary-btn,
  .qala-secondary-btn {
    width: 100%;
  }

  .qala-success-alert {
    left: 12px;
    right: 12px;
    bottom: 70px;
    transform: none;
    justify-content: center;
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
    width: 100%;
    max-width: none;
    padding-left: 12px;
    padding-right: 12px;
  }

  .qala-category-grid {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .qala-category-grid::-webkit-scrollbar {
    display: none;
  }

  .qala-category-btn {
    flex: 0 0 auto;
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