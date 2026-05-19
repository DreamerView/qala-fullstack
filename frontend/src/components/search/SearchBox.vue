<template>
  <div class="ig-search-box">
    <i class="bi bi-search ig-search-icon"></i>

    <input
      :value="modelValue"
      type="text"
      class="ig-search-input"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <button
      v-if="modelValue"
      type="button"
      class="ig-search-clear"
      aria-label="Очистить поиск"
      @click="$emit('clear')"
    >
      <i class="bi bi-x"></i>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Поиск',
  },
})

defineEmits(['update:modelValue', 'clear'])
</script>

<style scoped>
.ig-search-box {
  position: relative;
  height: 48px;
  border-radius: 14px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.ig-search-icon {
  position: absolute;
  left: 17px;
  color: #8e8e8e;
  font-size: 17px;
}

.ig-search-input {
  width: 100%;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  padding: 0 48px 0 46px;
  color: #111;
  font-size: 15px;
}

.ig-search-input::placeholder {
  color: #8e8e8e;
}

.ig-search-clear {
  position: absolute;
  right: 9px;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: #d9d9d9;
  color: #555;
  display: grid;
  place-items: center;
  font-size: 18px;
  line-height: 1;
}

@media (max-width: 860px) {
  .ig-search-box {
    height: 46px;
    border-radius: 13px;
  }
}
</style>