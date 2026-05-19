<template>
  <div class="auth-switch">
    <span>{{ label }}</span>

    <button type="button" @click="$emit('toggle')">
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },

  buttonText: {
    type: String,
    required: true,
  },
})

defineEmits(['toggle'])
</script>

<style scoped>
.auth-switch {
  margin-top: 28px;
  color: #6f737a;
  font-size: 15px;
  font-weight: 500;
}

.auth-switch button {
  margin-left: 6px;
  border: 0;
  background: transparent;
  color: #2b2b2f;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.auth-switch button:hover {
  text-decoration: underline;
}

@media (max-width: 576px) {
  .auth-switch {
    margin-top: 24px;
    font-size: 14px;
  }

  .auth-switch button {
    font-size: 14px;
  }
}
</style>