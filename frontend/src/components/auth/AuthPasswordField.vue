<template>
  <div class="auth-password">
    <input
      :value="modelValue"
      class="auth-input"
      :type="isVisible ? 'text' : 'password'"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      @input="emitValue"
    />

    <button
      class="auth-eye-btn"
      type="button"
      :aria-label="isVisible ? 'Скрыть пароль' : 'Показать пароль'"
      :aria-pressed="isVisible"
      @click="toggleVisibility"
    >
      <i :class="isVisible ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },

  placeholder: {
    type: String,
    default: 'Пароль',
  },

  autocomplete: {
    type: String,
    default: 'current-password',
  },
})

const emit = defineEmits(['update:modelValue'])

const isVisible = ref(false)

const emitValue = (event) => {
  emit('update:modelValue', event.target.value)
}

const toggleVisibility = () => {
  isVisible.value = !isVisible.value
}
</script>

<style scoped>
.auth-password {
  position: relative;
}

.auth-input {
  width: 100%;
  height: 62px;
  padding: 0 62px 0 18px;
  border: 1px solid #dce1e6;
  border-radius: 16px;
  outline: none;
  background: #eef2f5;
  color: #2b2b2f;
  font-size: 17px;
  font-weight: 500;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.auth-input::placeholder {
  color: #73777f;
  font-weight: 500;
}

.auth-input:focus {
  border-color: #c7cdd4;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(17, 17, 17, 0.04);
}

.auth-eye-btn {
  position: absolute;
  top: 50%;
  right: 12px;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  transform: translateY(-50%);
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #6f737a;
  cursor: pointer;
}

.auth-eye-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #2b2b2f;
}

.auth-eye-btn i {
  font-size: 19px;
}

@media (max-width: 576px) {
  .auth-input {
    height: 58px;
    border-radius: 15px;
    font-size: 16px;
  }
}
</style>