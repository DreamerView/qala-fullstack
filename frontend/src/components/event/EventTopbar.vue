<template>
  <div class="qala-event-topbar">
    <button
      type="button"
      class="qala-back-link"
      @click="$emit('back')"
    >
      <i class="bi bi-arrow-left"></i>
      <span>Назад</span>
    </button>

    <button
      v-if="showSave"
      type="button"
      class="qala-icon-btn"
      :class="{ active: isSaved }"
      :aria-label="isSaved ? 'Убрать из сохранённых' : 'Сохранить событие'"
      @click="$emit('toggle-save')"
    >
      <i
        class="bi"
        :class="isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'"
      ></i>
    </button>
  </div>
</template>

<script setup>
defineProps({
  showSave: {
    type: Boolean,
    default: false,
  },
  isSaved: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['back', 'toggle-save'])
</script>

<style scoped>
.qala-event-topbar {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.qala-back-link {
  height: 40px;
  padding: 0 13px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #111;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 850;
  cursor: pointer;
}

.qala-back-link:hover {
  background: #f7f7f7;
  color: #111;
}

.qala-icon-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #eeeeee;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.qala-icon-btn:hover,
.qala-icon-btn.active {
  background: #111;
  color: #fff;
  border-color: #111;
}

@media (max-width: 860px) {
  .qala-event-topbar {
    height: 52px;
    margin-bottom: 12px;
    padding: 0 2px;
  }
}
</style>