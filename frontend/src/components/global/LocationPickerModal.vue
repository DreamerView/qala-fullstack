<template>
  <div
    id="locationPickerModal"
    ref="modalEl"
    class="modal fade"
    tabindex="-1"
    aria-hidden="true"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
  >
    <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
      <div class="modal-content ig-modal">
        <div class="modal-header ig-header">
          <div>
            <h5 class="modal-title ig-title">
              Выберите город
            </h5>

            <p class="ig-subtitle">
              Qala покажет события рядом с вами.
            </p>
          </div>
        </div>

        <div class="modal-body ig-body">
          <div class="ig-search">
            <i class="bi bi-search"></i>

            <input
              v-model.trim="search"
              type="text"
              placeholder="Поиск города"
              autocomplete="off"
              @input="handleSearch"
            />
          </div>

          <div
            v-if="isLoading"
            class="ig-state"
          >
            <div class="spinner-border spinner-border-sm"></div>
            <span>Ищем...</span>
          </div>

          <div
            v-else-if="items.length"
            class="ig-list"
          >
            <button
              v-for="item in items"
              :key="item.id"
              type="button"
              class="ig-city"
              :class="{ active: selectedCity?.id === item.id }"
              @click="selectCity(item)"
            >
              <span class="ig-city-info">
                <span class="ig-city-name">
                  {{ item.name }}
                </span>

                <span
                  v-if="getCitySubtitle(item)"
                  class="ig-city-subtitle"
                >
                  {{ getCitySubtitle(item) }}
                </span>
              </span>

              <i
                v-if="selectedCity?.id === item.id"
                class="bi bi-check-circle-fill"
              ></i>
            </button>
          </div>

          <div
            v-else-if="search.length >= 2"
            class="ig-empty"
          >
            <strong>Город не найден</strong>
            <span>Попробуйте написать название по-другому.</span>
          </div>

          <div
            v-else
            class="ig-empty"
          >
            <strong>Где вы хотите смотреть события?</strong>
            <span>Начните писать название города.</span>
          </div>
        </div>

        <div class="modal-footer ig-footer">
          <button
            type="button"
            class="ig-btn primary"
            :disabled="!selectedCity"
            @click="saveLocation"
          >
            Выбрать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Modal } from 'bootstrap'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const STORAGE_KEY = 'qala_city'

const modalEl = ref(null)
const modal = ref(null)

const search = ref('')
const items = ref([])
const selectedCity = ref(null)
const isLoading = ref(false)

let timer = null

onMounted(async () => {
  await nextTick()

  if (!modalEl.value) return

  modal.value = Modal.getOrCreateInstance(modalEl.value, {
    backdrop: 'static',
    keyboard: false,
  })

  if (!localStorage.getItem(STORAGE_KEY)) {
    modal.value.show()
  }
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  modal.value?.dispose()
})

function handleSearch() {
  clearTimeout(timer)

  selectedCity.value = null

  if (search.value.length < 2) {
    items.value = []
    return
  }

  timer = setTimeout(fetchCities, 300)
}

async function fetchCities() {
  try {
    isLoading.value = true

    const params = new URLSearchParams({
      q: search.value,
      lang: 'ru',
      limit: '10',
    })

    const res = await fetch(`/api/geo/search?${params.toString()}`)
    const data = await res.json()

    items.value = data?.data?.items || []
  } catch (err) {
    console.error('LocationPickerModal:', err)
    items.value = []
  } finally {
    isLoading.value = false
  }
}

function selectCity(city) {
  selectedCity.value = city
}

function saveLocation() {
  if (!selectedCity.value) return

  localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCity.value))

  window.dispatchEvent(
    new CustomEvent('qala:city-selected', {
      detail: selectedCity.value,
    }),
  )

  modal.value?.hide()
}

function getCitySubtitle(item) {
  return [item?.region?.name, item?.country?.name].filter(Boolean).join(', ')
}
</script>

<style scoped>
.ig-modal {
  border: 0;
  border-radius: 18px;
  background: #fff;
  overflow: hidden;
}

.ig-header {
  padding: 22px 22px 12px;
  border-bottom: 1px solid #efefef;
}

.ig-title {
  margin: 0;
  color: #262626;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.ig-subtitle {
  margin: 5px 0 0;
  color: #737373;
  font-size: 13px;
  line-height: 1.4;
}

.ig-body {
  padding: 16px 22px;
}

.ig-search {
  height: 42px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 12px;
  background: #efefef;
  color: #8e8e8e;
}

.ig-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #262626;
  font-size: 14px;
}

.ig-search input::placeholder {
  color: #8e8e8e;
}

.ig-list {
  margin-top: 14px;
  max-height: 280px;
  overflow-y: auto;
}

.ig-city {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border: 0;
  border-bottom: 1px solid #efefef;
  background: transparent;
  text-align: left;
}

.ig-city:last-child {
  border-bottom: 0;
}

.ig-city-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.ig-city-name {
  color: #262626;
  font-size: 14px;
  font-weight: 600;
}

.ig-city-subtitle {
  margin-top: 2px;
  color: #8e8e8e;
  font-size: 12px;
}

.ig-city i {
  color: #262626;
  font-size: 18px;
}

.ig-city.active .ig-city-name {
  color: #262626;
  font-weight: 700;
}

.ig-state,
.ig-empty {
  min-height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #8e8e8e;
  text-align: center;
  font-size: 13px;
}

.ig-empty strong {
  color: #262626;
  font-size: 14px;
}

.ig-footer {
  padding: 12px 22px 22px;
  border-top: 1px solid #efefef;
}

.ig-btn {
  width: 100%;
  height: 42px;
  border: 0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
}

.ig-btn.primary {
  background: #000;
  color: #fff;
}

.ig-btn.primary:disabled {
  background: #dbdbdb;
  color: #fff;
  cursor: not-allowed;
}

@media (max-width: 575.98px) {
  .ig-modal {
    min-height: 100%;
    border-radius: 0;
  }

  .ig-list {
    max-height: 50vh;
  }
}
</style>