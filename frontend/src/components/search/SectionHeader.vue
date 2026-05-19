<template>
  <div class="ig-section-head">
    <h2>{{ title }}</h2>

    <slot name="right"></slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.ig-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.ig-section-head h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

@media (max-width: 420px) {
  .ig-section-head {
    align-items: flex-end;
  }
}
</style>