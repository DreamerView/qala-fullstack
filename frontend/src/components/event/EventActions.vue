<template>
  <div class="qala-event-actions">
    <button
      type="button"
      class="qala-primary-btn"
      :class="{ joined: event.isParticipant }"
      :disabled="isLoading"
      @click="$emit('toggle-join')"
    >
      <span
        v-if="isLoading"
        class="spinner-border spinner-border-sm"
        aria-hidden="true"
      ></span>

      <i
        v-else
        class="bi"
        :class="event.isParticipant ? 'bi-check-circle-fill' : 'bi-check2-circle'"
      ></i>

      <span>{{ joinButtonText }}</span>
    </button>

    <button
      type="button"
      class="qala-secondary-btn"
      @click="$emit('share')"
    >
      <i class="bi bi-send"></i>
      <span>Поделиться</span>
    </button>

    <a
      v-if="event.locationUrl"
      :href="event.locationUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="qala-secondary-btn"
    >
      <i class="bi bi-map"></i>
      <span>Карта</span>
    </a>
  </div>

  <div
    v-if="message"
    class="qala-join-message"
    :class="{ error: messageType === 'error' }"
  >
    {{ message }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  },
  messageType: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error'].includes(value),
  },
})

defineEmits(['toggle-join', 'share'])

const joinButtonText = computed(() => {
  if (props.isLoading) return 'Обновляем...'
  return props.event?.isParticipant ? 'Вы идёте' : 'Я пойду'
})
</script>

<style scoped>
.qala-event-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.qala-primary-btn,
.qala-secondary-btn {
  height: 44px;
  padding: 0 17px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 850;
}

.qala-primary-btn {
  border: 0;
  background: #111;
  color: #fff;
}

.qala-primary-btn:hover {
  background: #222;
  color: #fff;
}

.qala-primary-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.qala-primary-btn.joined {
  background: #16a34a;
  color: #fff;
}

.qala-primary-btn.joined:hover {
  background: #15803d;
}

.qala-secondary-btn {
  border: 1px solid #eeeeee;
  background: #fff;
  color: #111;
}

.qala-secondary-btn:hover {
  background: #f7f7f7;
  color: #111;
}

.qala-join-message {
  margin-bottom: 18px;
  padding: 10px 14px;
  border-radius: 14px;
  background: #ecfdf5;
  color: #047857;
  font-size: 13px;
  font-weight: 800;
}

.qala-join-message.error {
  background: #fef2f2;
  color: #dc2626;
}

@media (max-width: 860px) {
  .qala-event-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .qala-primary-btn,
  .qala-secondary-btn {
    width: 100%;
  }
}
</style>