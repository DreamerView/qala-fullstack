<template>
  <div
    ref="modalEl"
    class="modal fade qala-join-modal"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <button
          type="button"
          class="qala-modal-close"
          aria-label="Закрыть"
          :disabled="isLoading"
          @click="close"
        >
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="modal-body">
          <div class="qala-modal-icon" :class="{ active: initialJoined }">
            <i :class="initialJoined ? 'bi bi-person-dash' : 'bi bi-person-check'"></i>
          </div>

          <h3>{{ title }}</h3>
          <p>{{ text }}</p>

          <div v-if="message" class="qala-modal-alert" :class="messageType">
            {{ message }}
          </div>

          <div class="qala-modal-actions">
            <button
              type="button"
              class="btn qala-btn-light"
              :disabled="isLoading"
              @click="close"
            >
              Назад
            </button>

            <button
              type="button"
              class="btn qala-btn-dark"
              :disabled="isLoading"
              @click="confirm"
            >
              <span
                v-if="isLoading"
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
              ></span>
              <span>{{ buttonText }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    default: null,
  },
  apiUrl: {
    type: String,
    default: '/api',
  },
})

const emit = defineEmits(['changed', 'auth-required'])

const JOIN_KEYS = ['is_participant', 'isParticipant', 'joined', 'is_joined']

const modalEl = ref(null)
const modalInstance = ref(null)

const isLoading = ref(false)
const message = ref('')
const messageType = ref('success')
const initialJoined = ref(false)

const title = computed(() => (
  initialJoined.value ? 'Отменить запись?' : 'Записаться на событие?'
))

const text = computed(() => (
  initialJoined.value
    ? 'Вы действительно хотите отменить свою запись на это событие?'
    : 'После подтверждения вы будете записаны на это событие.'
))

const buttonText = computed(() => {
  if (isLoading.value) return 'Сохраняем...'
  return initialJoined.value ? 'Отменить запись' : 'Да, записаться'
})

const getBootstrapModal = async () => {
  if (!modalEl.value) return null

  const options = {
    backdrop: 'static',
    keyboard: false,
  }

  if (window.bootstrap?.Modal) {
    return window.bootstrap.Modal.getOrCreateInstance(modalEl.value, options)
  }

  const bootstrap = await import('bootstrap')
  return bootstrap.Modal.getOrCreateInstance(modalEl.value, options)
}

const pickBool = (source, keys, fallback = false) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return Boolean(source[key])
    }
  }

  return fallback
}

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || data?.status === false) {
    const error = new Error(data?.message || 'Ошибка запроса')
    error.status = response.status
    error.response = data
    throw error
  }

  return data
}

const reset = () => {
  message.value = ''
  messageType.value = 'success'
}

const setMessage = (textValue, type = 'success') => {
  message.value = textValue
  messageType.value = type
}

const close = () => {
  if (isLoading.value) return
  modalInstance.value?.hide()
}

const open = async () => {
  if (!props.event?.id) return

  reset()
  initialJoined.value = Boolean(props.event.isParticipant)

  await nextTick()

  modalInstance.value = await getBootstrapModal()
  modalInstance.value?.show()
}

const confirm = async () => {
  const currentEvent = props.event
  if (!currentEvent?.id || isLoading.value) return

  isLoading.value = true
  reset()

  try {
    const response = await requestJson(`${props.apiUrl}/event/join/${currentEvent.id}`, {
      method: 'POST',
    })

    const payload = response?.data || response
    const nextState = pickBool(payload, JOIN_KEYS, !initialJoined.value)

    const participantsCount = nextState
      ? Number(currentEvent.participantsCount || 0) + 1
      : Math.max(0, Number(currentEvent.participantsCount || 0) - 1)

    emit('changed', {
      isParticipant: nextState,
      participantsCount,
    })

    setMessage(
      nextState ? 'Отлично, вы записаны' : 'Запись отменена',
      'success'
    )

    window.setTimeout(() => {
      modalInstance.value?.hide()
    }, 650)
  } catch (error) {
    console.error('Join event error:', error)

    if (error.status === 401) {
      emit('auth-required')
      modalInstance.value?.hide()
      return
    }

    setMessage(error.message || 'Не удалось изменить запись', 'error')
  } finally {
    isLoading.value = false
  }
}

defineExpose({ open, close })

onBeforeUnmount(() => {
  modalInstance.value?.dispose?.()
})
</script>

<style scoped>
.qala-join-modal :deep(.modal-dialog) {
  max-width: 430px;
}

.modal-content {
  position: relative;
  overflow: hidden;
  border: 0;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
}

.modal-body {
  padding: 34px 28px 26px;
  text-align: center;
}

.qala-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  color: #111;
  background: #f5f5f5;
  transition: background 0.18s ease, opacity 0.18s ease;
}

.qala-modal-close:hover,
.qala-modal-close:focus,
.qala-modal-close:active {
  color: #111;
  background: #eee;
  box-shadow: none;
}

.qala-modal-close:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.qala-modal-icon {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  margin: 0 auto 18px;
  border-radius: 50%;
  color: #fff;
  background: #111;
  font-size: 30px;
}

.qala-modal-icon.active {
  background: #dc3545;
}

h3 {
  margin: 0 0 9px;
  color: #111;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

p {
  max-width: 330px;
  margin: 0 auto;
  color: #666;
  font-size: 14px;
  line-height: 1.55;
  font-weight: 500;
}

.qala-modal-alert {
  margin-top: 18px;
  padding: 11px 13px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
}

.qala-modal-alert.success {
  color: #137333;
  background: #e8f5ee;
}

.qala-modal-alert.error {
  color: #b42318;
  background: #fff1f0;
}

.qala-modal-actions {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 10px;
  margin-top: 24px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    opacity 0.16s ease;
}

.qala-btn-light,
.qala-btn-light:hover,
.qala-btn-light:focus,
.qala-btn-light:active,
.qala-btn-light:focus-visible {
  border: 1px solid #e5e5e5;
  color: #111;
  background: #f7f7f7;
  box-shadow: none;
}

.qala-btn-light:hover {
  border-color: #dedede;
  background: #eee;
}

.qala-btn-light:active {
  border-color: #d8d8d8;
  background: #e9e9e9;
}

.qala-btn-dark,
.qala-btn-dark:hover,
.qala-btn-dark:focus,
.qala-btn-dark:active,
.qala-btn-dark:focus-visible {
  border: 1px solid #111;
  color: #fff;
  background: #111;
  box-shadow: none;
}

.qala-btn-dark:hover {
  border-color: #262626;
  background: #262626;
}

.qala-btn-dark:active {
  border-color: #000;
  background: #000;
}

.btn:disabled,
.btn:disabled:hover,
.btn:disabled:focus,
.btn:disabled:active {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 520px) {
  .qala-join-modal :deep(.modal-dialog) {
    max-width: none;
    margin: 12px;
  }

  .modal-body {
    padding: 32px 20px 22px;
  }

  .qala-modal-actions {
    grid-template-columns: 1fr;
  }
}
</style>