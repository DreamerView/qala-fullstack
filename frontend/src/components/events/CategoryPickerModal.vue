<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="modal fade show d-block qala-category-modal"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      @click.self="closeModal"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-md-down">
        <div class="modal-content qala-category-content">
          <div class="modal-header qala-category-header">
            <button
              v-if="isSubcategoryStep"
              type="button"
              class="qala-back-btn d-md-none"
              @click="goToCategoryStep"
            >
              <i class="bi bi-chevron-left"></i>
            </button>

            <div class="qala-category-title">
              <h5 class="modal-title">
                {{ isSubcategoryStep ? activeCategory?.name : 'Выбрать категорию' }}
              </h5>

              <p>
                {{
                  isSubcategoryStep
                    ? 'Выбери подкатегорию'
                    : 'Сначала выбери основную категорию'
                }}
              </p>
            </div>

            <button
              type="button"
              class="btn-close"
              aria-label="Закрыть"
              @click="closeModal"
            ></button>
          </div>

          <div class="modal-body qala-category-body">
            <div v-if="isLoading" class="qala-category-state">
              <div class="spinner-border spinner-border-sm" role="status"></div>
              <span>Загружаем категории...</span>
            </div>

            <div v-else-if="errorMessage" class="qala-category-state error">
              <i class="bi bi-exclamation-circle"></i>
              <span>{{ errorMessage }}</span>

              <button
                type="button"
                class="btn btn-dark rounded-pill px-4"
                @click="fetchCategories(true)"
              >
                Повторить
              </button>
            </div>

            <div v-else-if="!categories.length" class="qala-category-state">
              <i class="bi bi-inbox"></i>
              <span>Категории пока не найдены</span>
            </div>

            <template v-else>
              <div class="qala-mobile-view d-md-none">
                <div v-if="!isSubcategoryStep" class="qala-mobile-list">
                  <button
                    v-for="category in categories"
                    :key="category.id"
                    type="button"
                    class="qala-mobile-item"
                    :class="{ active: selectedCategoryId === category.id }"
                    @click="openSubcategories(category)"
                  >
                    <span class="qala-mobile-icon">
                      <i :class="category.icon"></i>
                    </span>

                    <span class="qala-mobile-text">
                      <strong>{{ category.name }}</strong>
                      <small>{{ category.subcategories.length }} подкатегорий</small>
                    </span>

                    <i class="bi bi-chevron-right qala-mobile-arrow"></i>
                  </button>
                </div>

                <div v-else class="qala-mobile-list">
                  <button
                    v-for="subcategory in activeSubcategories"
                    :key="subcategory.id"
                    type="button"
                    class="qala-mobile-item"
                    :class="{ active: selectedSubcategoryId === subcategory.id }"
                    @click="selectSubcategory(subcategory)"
                  >
                    <span class="qala-mobile-icon">
                      <i :class="subcategory.icon"></i>
                    </span>

                    <span class="qala-mobile-text">
                      <strong>{{ subcategory.name }}</strong>
                      <small>{{ subcategory.slug }}</small>
                    </span>

                    <i
                      v-if="selectedSubcategoryId === subcategory.id"
                      class="bi bi-check-circle-fill qala-mobile-check"
                    ></i>
                  </button>

                  <button
                    v-if="!activeSubcategories.length && activeCategory"
                    type="button"
                    class="qala-empty-subcategory-btn"
                    @click="selectCategoryOnly"
                  >
                    <i class="bi bi-check-circle"></i>
                    <span>Выбрать {{ activeCategory.name }}</span>
                  </button>
                </div>
              </div>

              <div class="qala-desktop-view d-none d-md-grid">
                <div class="qala-category-list">
                  <button
                    v-for="category in categories"
                    :key="category.id"
                    type="button"
                    class="qala-category-item"
                    :class="{ active: activeCategoryId === category.id }"
                    @click="setActiveCategory(category)"
                  >
                    <span class="qala-category-icon">
                      <i :class="category.icon"></i>
                    </span>

                    <span class="qala-category-text">
                      <strong>{{ category.name }}</strong>
                      <small>{{ category.subcategories.length }} подкатегорий</small>
                    </span>

                    <i class="bi bi-chevron-right qala-category-arrow"></i>
                  </button>
                </div>

                <div class="qala-subcategory-panel">
                  <div class="qala-subcategory-head">
                    <span class="qala-subcategory-head-icon">
                      <i :class="activeCategory?.icon || 'bi bi-grid'"></i>
                    </span>

                    <div>
                      <h6>{{ activeCategory?.name || 'Категория' }}</h6>
                      <p>Выбери более точный тип события</p>
                    </div>
                  </div>

                  <div class="qala-subcategory-grid">
                    <button
                      v-for="subcategory in activeSubcategories"
                      :key="subcategory.id"
                      type="button"
                      class="qala-subcategory-item"
                      :class="{ active: selectedSubcategoryId === subcategory.id }"
                      @click="selectSubcategory(subcategory)"
                    >
                      <span class="qala-subcategory-icon">
                        <i :class="subcategory.icon"></i>
                      </span>

                      <span class="qala-subcategory-text">
                        <strong>{{ subcategory.name }}</strong>
                        <small>{{ subcategory.slug }}</small>
                      </span>

                      <i
                        v-if="selectedSubcategoryId === subcategory.id"
                        class="bi bi-check-circle-fill qala-subcategory-check"
                      ></i>
                    </button>
                  </div>

                  <button
                    v-if="!activeSubcategories.length && activeCategory"
                    type="button"
                    class="qala-empty-subcategory-btn"
                    @click="selectCategoryOnly"
                  >
                    <i class="bi bi-check-circle"></i>
                    <span>Выбрать {{ activeCategory.name }}</span>
                  </button>
                </div>
              </div>
            </template>
          </div>

          <div class="modal-footer qala-category-footer">
            <button type="button" class="btn btn-light rounded-pill px-4" @click="closeModal">
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="modelValue"
      class="modal-backdrop fade show"
    ></div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },

  lang: {
    type: String,
    default: 'ru',
  },

  apiBaseUrl: {
    type: String,
    default: '',
  },

  selectedCategoryId: {
    type: Number,
    default: null,
  },

  selectedSubcategoryId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const categories = ref([])
const activeCategoryId = ref(null)
const isSubcategoryStep = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const hasLoaded = ref(false)

let requestController = null

const activeCategory = computed(() => {
  return categories.value.find((category) => category.id === activeCategoryId.value) || null
})

const activeSubcategories = computed(() => {
  return activeCategory.value?.subcategories || []
})

const endpoint = computed(() => {
  const base = props.apiBaseUrl.replace(/\/$/, '')
  const lang = encodeURIComponent(props.lang || 'ru')

  return `${base}/api/event/categories?lang=${lang}`
})

const normalizeIcon = (icon) => {
  if (!icon) {
    return 'bi bi-grid'
  }

  return icon.startsWith('bi ') ? icon : `bi ${icon}`
}

const sortByOrder = (items) => {
  return [...items].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
}

const normalizeCategories = (items) => {
  return sortByOrder(items).map((category) => ({
    id: Number(category.id),
    slug: String(category.slug || ''),
    name: String(category.name || ''),
    icon: normalizeIcon(category.icon),
    sort_order: Number(category.sort_order || 0),
    subcategories: sortByOrder(category.subcategories || []).map((subcategory) => ({
      id: Number(subcategory.id),
      slug: String(subcategory.slug || ''),
      name: String(subcategory.name || ''),
      icon: normalizeIcon(subcategory.icon),
      sort_order: Number(subcategory.sort_order || 0),
    })),
  }))
}

const syncActiveCategory = () => {
  if (!categories.value.length) {
    activeCategoryId.value = null
    return
  }

  if (props.selectedCategoryId) {
    const selectedCategory = categories.value.find(
      (category) => category.id === props.selectedCategoryId
    )

    if (selectedCategory) {
      activeCategoryId.value = selectedCategory.id
      return
    }
  }

  activeCategoryId.value = categories.value[0].id
}

const fetchCategories = async (force = false) => {
  if (isLoading.value) {
    return
  }

  if (hasLoaded.value && !force) {
    syncActiveCategory()
    return
  }

  if (requestController) {
    requestController.abort()
  }

  requestController = new AbortController()
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(endpoint.value, {
      headers: {
        Accept: 'application/json',
      },
      signal: requestController.signal,
    })

    const result = await response.json().catch(() => null)

    if (!response.ok || !result?.status || !Array.isArray(result.data)) {
      throw new Error(result?.message || 'Не удалось загрузить категории')
    }

    categories.value = normalizeCategories(result.data)
    hasLoaded.value = true
    syncActiveCategory()
  } catch (error) {
    if (error?.name !== 'AbortError') {
      errorMessage.value = error?.message || 'Ошибка загрузки категорий'
    }
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  emit('update:modelValue', false)
}

const goToCategoryStep = () => {
  isSubcategoryStep.value = false
}

const setActiveCategory = (category) => {
  activeCategoryId.value = category.id
}

const openSubcategories = (category) => {
  activeCategoryId.value = category.id

  if (!category.subcategories.length) {
    selectCategoryOnly()
    return
  }

  isSubcategoryStep.value = true
}

const selectSubcategory = (subcategory) => {
  if (!activeCategory.value) {
    return
  }

  emit('select', {
    category: activeCategory.value,
    subcategory,
  })

  closeModal()
}

const selectCategoryOnly = () => {
  if (!activeCategory.value) {
    return
  }

  emit('select', {
    category: activeCategory.value,
    subcategory: null,
  })

  closeModal()
}

const handleEscape = (event) => {
  if (event.key !== 'Escape' || !props.modelValue) {
    return
  }

  if (isSubcategoryStep.value) {
    goToCategoryStep()
    return
  }

  closeModal()
}

const setBodyLock = (value) => {
  document.body.classList.toggle('modal-open', value)
  document.body.style.overflow = value ? 'hidden' : ''
  document.body.style.paddingRight = ''
}

watch(
  () => props.modelValue,
  (value) => {
    setBodyLock(value)

    if (value) {
      isSubcategoryStep.value = false
      fetchCategories()
    }
  }
)

watch(
  () => props.selectedCategoryId,
  syncActiveCategory
)

watch(
  () => [props.lang, props.apiBaseUrl],
  () => {
    categories.value = []
    activeCategoryId.value = null
    isSubcategoryStep.value = false
    errorMessage.value = ''
    hasLoaded.value = false

    if (props.modelValue) {
      fetchCategories(true)
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleEscape)

  if (props.modelValue) {
    setBodyLock(true)
    fetchCategories()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
  setBodyLock(false)

  if (requestController) {
    requestController.abort()
  }
})
</script>

<style scoped>
.qala-category-modal {
  z-index: 1055;
}

.qala-category-content {
  border: 0;
  border-radius: 26px;
  overflow: hidden;
  box-shadow: 0 24px 80px #00000024;
}

.qala-category-header {
  min-height: 72px;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 20px 14px;
  border-bottom: 1px solid #eee;
}

.qala-category-title {
  min-width: 0;
  flex: 1;
}

.qala-category-title h5 {
  margin: 0;
  color: #111;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.qala-category-title p {
  margin: 5px 0 0;
  color: #737373;
  font-size: 13px;
  font-weight: 600;
}

.qala-back-btn {
  width: 36px;
  height: 36px;
  margin-top: -4px;
  border: 1px solid #eee;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.qala-category-body {
  padding: 16px 20px;
}

.qala-category-state {
  min-height: 240px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 12px;
  color: #737373;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.qala-category-state.error {
  color: #ef4444;
}

.qala-category-state i {
  font-size: 28px;
}

.qala-desktop-view {
  grid-template-columns: 310px minmax(0, 1fr);
  gap: 16px;
  min-height: 420px;
}

.qala-category-list,
.qala-subcategory-grid,
.qala-mobile-list {
  display: grid;
  align-content: start;
  gap: 10px;
}

.qala-category-list {
  max-height: 520px;
  overflow-y: auto;
  padding-right: 4px;
}

.qala-category-item,
.qala-subcategory-item,
.qala-empty-subcategory-btn,
.qala-mobile-item {
  width: 100%;
  border: 1px solid #eee;
  background: #fff;
  color: #111;
  text-align: left;
  transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}

.qala-category-item,
.qala-mobile-item {
  min-height: 64px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 18px;
}

.qala-category-item:hover,
.qala-subcategory-item:hover,
.qala-empty-subcategory-btn:hover,
.qala-mobile-item:hover {
  background: #fafafa;
  border-color: #dedede;
}

.qala-category-item.active,
.qala-mobile-item.active {
  background: #111;
  border-color: #111;
  color: #fff;
}

.qala-category-icon,
.qala-subcategory-head-icon,
.qala-subcategory-icon,
.qala-mobile-icon {
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #f7f7f7;
  color: #111;
}

.qala-category-icon,
.qala-mobile-icon {
  width: 42px;
  height: 42px;
  font-size: 19px;
}

.qala-category-item.active .qala-category-icon,
.qala-mobile-item.active .qala-mobile-icon {
  background: #ffffff1c;
  color: #fff;
}

.qala-category-text,
.qala-subcategory-text,
.qala-mobile-text {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.qala-category-text strong,
.qala-category-text small,
.qala-subcategory-text strong,
.qala-subcategory-text small,
.qala-mobile-text strong,
.qala-mobile-text small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qala-category-text strong,
.qala-mobile-text strong {
  font-size: 14px;
  font-weight: 900;
}

.qala-category-text small,
.qala-mobile-text small {
  color: #858585;
  font-size: 12px;
  font-weight: 600;
}

.qala-category-item.active .qala-category-text small,
.qala-mobile-item.active .qala-mobile-text small {
  color: #ffffffb3;
}

.qala-category-arrow,
.qala-mobile-arrow {
  color: #aaa;
  font-size: 14px;
}

.qala-mobile-check {
  color: #22c55e;
  font-size: 18px;
}

.qala-subcategory-panel {
  min-width: 0;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 22px;
  background: #fafafa;
}

.qala-subcategory-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.qala-subcategory-head-icon {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  background: #fff;
  font-size: 21px;
  box-shadow: 0 8px 24px #0000000f;
}

.qala-subcategory-head h6 {
  margin: 0;
  color: #111;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.qala-subcategory-head p {
  margin: 4px 0 0;
  color: #737373;
  font-size: 13px;
  font-weight: 600;
}

.qala-subcategory-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.qala-subcategory-item {
  min-height: 72px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 11px;
  padding: 11px 12px;
  border-radius: 18px;
}

.qala-subcategory-item.active {
  border-color: #111;
  background: #111;
  color: #fff;
}

.qala-subcategory-icon {
  width: 42px;
  height: 42px;
  background: #fff;
  font-size: 19px;
}

.qala-subcategory-item.active .qala-subcategory-icon {
  background: #ffffff1c;
  color: #fff;
}

.qala-subcategory-text strong {
  font-size: 14px;
  font-weight: 900;
}

.qala-subcategory-text small {
  color: #858585;
  font-size: 12px;
  font-weight: 600;
}

.qala-subcategory-item.active .qala-subcategory-text small {
  color: #ffffffb3;
}

.qala-subcategory-check {
  color: #22c55e;
  font-size: 18px;
}

.qala-empty-subcategory-btn {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 850;
}

.qala-category-footer {
  padding: 14px 20px 18px;
  border-top: 1px solid #eee;
}

@media (max-width: 767px) {
  .qala-category-modal .modal-dialog {
    margin: 0;
  }

  .qala-category-content {
    height: 100%;
    border-radius: 0;
    box-shadow: none;
  }

  .qala-category-header {
    position: sticky;
    top: 0;
    z-index: 2;
    align-items: flex-start;
    min-height: 68px;
    padding: 16px 14px 12px;
    background: #fff;
  }

  .qala-category-title h5 {
    font-size: 18px;
    line-height: 1.2;
  }

  .qala-category-title p {
    font-size: 12px;
  }

  .qala-category-body {
    height: calc(100vh - 132px);
    overflow-y: auto;
    padding: 12px 14px 16px;
  }

  .qala-mobile-list {
    gap: 9px;
  }

  .qala-mobile-item {
    min-height: 62px;
    border-radius: 16px;
  }

  .qala-category-footer {
    position: sticky;
    bottom: 0;
    z-index: 2;
    justify-content: stretch;
    padding: 12px 14px max(14px, env(safe-area-inset-bottom));
    background: #fff;
  }

  .qala-category-footer .btn {
    width: 100%;
    min-height: 44px;
  }
}

@media (max-width: 420px) {
  .qala-category-header {
    padding-inline: 12px;
  }

  .qala-category-body {
    padding-inline: 12px;
  }

  .qala-mobile-item {
    grid-template-columns: 40px minmax(0, 1fr) 18px;
    gap: 10px;
    padding: 10px;
  }

  .qala-mobile-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}
</style>