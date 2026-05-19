<template>
  <div class="ig-recent-list">
    <button
      v-for="item in items"
      :key="item"
      type="button"
      class="ig-recent-item"
      @click="$emit('select', item)"
    >
      <span class="ig-recent-icon">
        <i class="bi bi-clock-history"></i>
      </span>

      <span class="ig-recent-text">{{ item }}</span>

      <span class="ig-recent-arrow">
        <i class="bi bi-arrow-up-left"></i>
      </span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['select'])
</script>

<style scoped>
.ig-recent-list {
  display: grid;
  gap: 4px;
}

.ig-recent-item {
  width: 100%;
  height: 50px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #111;
  display: grid;
  grid-template-columns: 42px 1fr 32px;
  align-items: center;
  text-align: left;
}

.ig-recent-item:hover {
  background: #f8f8f8;
}

.ig-recent-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  color: #8e8e8e;
  font-size: 18px;
}

.ig-recent-text {
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ig-recent-arrow {
  color: #a3a3a3;
  font-size: 16px;
  display: grid;
  place-items: center;
}
</style>