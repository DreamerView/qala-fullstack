<template>
  <div class="auth-dots" aria-label="Шаг регистрации">
    <span
      v-for="item in total"
      :key="item"
      :class="{ active: item === current }"
      :aria-current="item === current ? 'step' : undefined"
    ></span>
  </div>
</template>

<script setup>
defineProps({
  current: {
    type: Number,
    required: true,
  },

  total: {
    type: Number,
    default: 3,
  },
})
</script>

<style scoped>
.auth-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
}

.auth-dots span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #dce1e6;
  transition:
    width 0.18s ease,
    background 0.18s ease;
}

.auth-dots span.active {
  width: 24px;
  background: #636363;
}
</style>