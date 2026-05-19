<template>
  <section class="qala-events-summary">
    <div>
      <strong>{{ count }}</strong>
      <span>{{ label }}</span>
    </div>

    <button
      v-if="hasFilters"
      type="button"
      class="qala-reset-btn"
      @click="emit('reset')"
    >
      Сбросить
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  count: {
    type: Number,
    default: 0,
  },
  hasFilters: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['reset'])

const label = computed(() => {
  return 'событий найдено'
})
</script>

<style scoped>
.qala-events-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  color: #737373;
  font-size: 14px;
  font-weight: 600;
}

.qala-events-summary strong {
  color: #111;
  margin-right: 4px;
}

.qala-reset-btn {
  border: 0;
  background: transparent;
  padding: 0;
  color: #2563eb;
  font-size: 14px;
  font-weight: 800;
}
</style>