<template>
  <nav
    class="category-tabs d-flex gap-2 w-100 overflow-x-auto overflow-y-hidden pb-3"
    aria-label="Категории"
  >
    <button
      v-for="category in normalizedCategories"
      :key="category.value"
      type="button"
      class="category-tabs__button btn btn-sm rounded-pill fw-bold flex-shrink-0 text-nowrap px-3"
      :class="getButtonClass(category.value)"
      :aria-pressed="isActive(category.value)"
      @click="selectCategory(category.value)"
    >
      {{ category.label }}
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },

  categories: {
    type: Array,
    required: true,
    validator: items => {
      return items.every(item => {
        if (typeof item === 'string') return true

        return (
          item &&
          typeof item === 'object' &&
          typeof item.value === 'string' &&
          typeof item.label === 'string'
        )
      })
    },
  },
})

const emit = defineEmits({
  'update:modelValue': value => typeof value === 'string',
})

const normalizedCategories = computed(() => {
  return props.categories.map(category => {
    if (typeof category === 'string') {
      return {
        label: category,
        value: category,
      }
    }

    return {
      label: category.label,
      value: category.value,
    }
  })
})

const isActive = value => props.modelValue === value

const getButtonClass = value => {
  return isActive(value)
    ? 'btn-dark border-dark'
    : 'btn-light border'
}

const selectCategory = value => {
  if (isActive(value)) return

  emit('update:modelValue', value)
}
</script>

<style scoped>
.category-tabs {
  padding-top: 2px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tabs__button {
  height: 36px;
  line-height: 1;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.category-tabs__button:hover {
  border-color: #111 !important;
}

.category-tabs__button:active {
  transform: scale(0.97);
}

.category-tabs__button:focus-visible {
  outline: 3px solid rgba(17, 17, 17, 0.18);
  outline-offset: 2px;
}

@media (max-width: 576px) {
  .category-tabs {
    padding-bottom: 14px !important;
  }

  .category-tabs__button {
    height: 34px;
    padding-right: 13px !important;
    padding-left: 13px !important;
    font-size: 13px;
  }
}
</style>