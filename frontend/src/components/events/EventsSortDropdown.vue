<template>
  <div class="dropdown">
    <button
      class="qala-sort-btn dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <i class="bi bi-sliders"></i>
      <span>{{ activeOption.label }}</span>
    </button>

    <ul class="dropdown-menu dropdown-menu-end">
      <li v-for="option in options" :key="option.value">
        <button
          type="button"
          class="dropdown-item"
          :class="{ active: modelValue === option.value }"
          @click="emit('update:modelValue', option.value)"
        >
          {{ option.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const activeOption = computed(() => {
  return props.options.find((item) => item.value === props.modelValue) || props.options[0]
})
</script>

<style scoped>
.qala-sort-btn {
  height: 48px;
  padding: 0 15px;
  border: 1px solid #ececec;
  border-radius: 15px;
  background: #fff;
  color: #111;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}

.qala-sort-btn:hover {
  background: #f8f8f8;
}

.dropdown-item {
  font-size: 14px;
  font-weight: 600;
}

.dropdown-item.active {
  background: #111;
  color: #fff;
}

@media (max-width: 860px) {
  .qala-sort-btn {
    width: 100%;
    justify-content: center;
  }

  .dropdown {
    width: 100%;
  }
}
</style>