<template>
  <div class="qala-search-box">
    <i class="bi bi-search qala-search-icon"></i>

    <input
      :value="modelValue"
      type="text"
      class="qala-search-input"
      :placeholder="placeholder"
      @input="emit('update:modelValue', $event.target.value)"
    />

    <button
      v-if="modelValue"
      type="button"
      class="qala-search-clear"
      aria-label="Очистить поиск"
      @click="emit('update:modelValue', '')"
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

const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.qala-search-box {
  position: relative;
  height: 48px;
  border-radius: 15px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.qala-search-icon {
  position: absolute;
  left: 17px;
  color: #8e8e8e;
  font-size: 17px;
}

.qala-search-input {
  width: 100%;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  padding: 0 48px 0 46px;
  color: #111;
  font-size: 15px;
  font-weight: 500;
}

.qala-search-input::placeholder {
  color: #8e8e8e;
}

.qala-search-clear {
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
</style>