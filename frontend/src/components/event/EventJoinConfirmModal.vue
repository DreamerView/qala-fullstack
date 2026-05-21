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
          <div class="qala-modal-icon" :class="{ active: isLeaving }">
            <i :class="modalIcon"></i>
          </div>

          <span v-if="eventTypeLabel" class="qala-modal-type">
            {{ eventTypeLabel }}
          </span>

          <h3>{{ title }}</h3>
          <p>{{ text }}</p>

          <div v-if="statusHint" class="qala-modal-hint">
            <i class="bi bi-info-circle"></i>
            <span>{{ statusHint }}</span>
          </div>

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
              class="btn"
              :class="isLeaving ? 'qala-btn-danger' : 'qala-btn-dark'"
              :disabled="isLoading || isJoinDisabled"
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
const COUNT_KEYS = ['participants_count', 'participantsCount']
const STATUS_KEYS = ['participant_status', 'participantStatus']

const EVENT_TYPE_META = Object.freeze({
  event: {
    label: 'Мероприятие',
    joinTitle: 'Записаться на мероприятие?',
    leaveTitle: 'Отменить запись?',
    joinText: 'После подтверждения вы будете записаны на это мероприятие.',
    leaveText: 'Вы действительно хотите отменить свою запись на это мероприятие?',
    joinButton: 'Да, записаться',
    leaveButton: 'Отменить запись',
    joinSuccess: 'Отлично, вы записаны',
    leaveSuccess: 'Запись отменена',
    icon: 'bi bi-person-check',
    leaveIcon: 'bi bi-person-dash',
  },

  meeting: {
    label: 'Встреча',
    joinTitle: 'Пойти на встречу?',
    leaveTitle: 'Отменить участие?',
    joinText: 'После подтверждения организатор увидит, что вы собираетесь прийти.',
    leaveText: 'Вы действительно хотите отменить участие во встрече?',
    joinButton: 'Да, я пойду',
    leaveButton: 'Не пойду',
    joinSuccess: 'Отлично, вы идёте',
    leaveSuccess: 'Участие отменено',
    icon: 'bi bi-people',
    leaveIcon: 'bi bi-person-dash',
  },

  activity: {
    label: 'Активность',
    joinTitle: 'Присоединиться к активности?',
    leaveTitle: 'Отменить участие?',
    joinText: 'После подтверждения вы будете добавлены в список участников активности.',
    leaveText: 'Вы действительно хотите отменить участие в этой активности?',
    joinButton: 'Присоединиться',
    leaveButton: 'Отменить участие',
    joinSuccess: 'Отлично, вы присоединились',
    leaveSuccess: 'Участие отменено',
    icon: 'bi bi-lightning-charge',
    leaveIcon: 'bi bi-person-dash',
  },

  plan: {
    label: 'План',
    joinTitle: 'Показать интерес?',
    leaveTitle: 'Убрать интерес?',
    joinText: 'Организатор увидит, что вам интересна эта идея. Это поможет понять, стоит ли проводить событие.',
    leaveText: 'Вы действительно хотите убрать интерес к этому плану?',
    joinButton: 'Мне интересно',
    leaveButton: 'Больше не интересно',
    joinSuccess: 'Интерес отмечен',
    leaveSuccess: 'Интерес убран',
    icon: 'bi bi-chat-square-heart',
    leaveIcon: 'bi bi-chat-square',
  },

  announcement: {
    label: 'Анонс',
    joinTitle: 'Анонс',
    leaveTitle: 'Анонс',
    joinText: 'Для анонса запись недоступна. Это информационная публикация.',
    leaveText: 'Для анонса запись недоступна. Это информационная публикация.',
    joinButton: 'Понятно',
    leaveButton: 'Понятно',
    joinSuccess: '',
    leaveSuccess: '',
    icon: 'bi bi-megaphone',
    leaveIcon: 'bi bi-megaphone',
    disabled: true,
  },
})

const STATUS_META = Object.freeze({
  joined: {
    isActive: true,
    success: 'Отлично, вы записаны',
    hint: '',
  },

  approved: {
    isActive: true,
    success: 'Участие подтверждено',
    hint: 'Ваше участие уже подтверждено.',
  },

  pending: {
    isActive: true,
    success: 'Заявка отправлена',
    hint: 'Организатор должен подтвердить вашу заявку.',
  },

  waitlist: {
    isActive: true,
    success: 'Вы добавлены в лист ожидания',
    hint: 'Сейчас мест нет, но вы в листе ожидания.',
  },

  cancelled: {
    isActive: false,
    success: 'Запись отменена',
    hint: '',
  },

  rejected: {
    isActive: false,
    success: 'Заявка отклонена',
    hint: 'Организатор отклонил вашу заявку.',
  },
})

const modalEl = ref(null)
const modalInstance = ref(null)

const isLoading = ref(false)
const message = ref('')
const messageType = ref('success')
const initialJoined = ref(false)
const initialStatus = ref(null)

const eventType = computed(() => {
  return String(props.event?.eventType || props.event?.event_type || 'event').trim()
})

const eventMeta = computed(() => {
  return EVENT_TYPE_META[eventType.value] || EVENT_TYPE_META.event
})

const eventTypeLabel = computed(() => {
  return props.event?.eventTypeLabel || eventMeta.value.label
})

const currentStatus = computed(() => {
  return (
    initialStatus.value ||
    props.event?.participantStatus ||
    props.event?.participant_status ||
    null
  )
})

const currentStatusMeta = computed(() => {
  return STATUS_META[currentStatus.value] || null
})

const isActiveStatus = computed(() => {
  if (currentStatusMeta.value) {
    return currentStatusMeta.value.isActive
  }

  return initialJoined.value
})

const isLeaving = computed(() => {
  return Boolean(isActiveStatus.value && !eventMeta.value.disabled)
})

const isJoinDisabled = computed(() => {
  return Boolean(eventMeta.value.disabled)
})

const modalIcon = computed(() => {
  return isLeaving.value ? eventMeta.value.leaveIcon : eventMeta.value.icon
})

const title = computed(() => {
  if (eventMeta.value.disabled) {
    return eventMeta.value.joinTitle
  }

  return isLeaving.value ? eventMeta.value.leaveTitle : eventMeta.value.joinTitle
})

const text = computed(() => {
  if (eventMeta.value.disabled) {
    return eventMeta.value.joinText
  }

  return isLeaving.value ? eventMeta.value.leaveText : eventMeta.value.joinText
})

const statusHint = computed(() => {
  if (eventMeta.value.disabled) {
    return 'Эта публикация создана только для информирования.'
  }

  if (currentStatusMeta.value?.hint) {
    return currentStatusMeta.value.hint
  }

  if (props.event?.accessType === 'approval_required' || props.event?.access_type === 'approval_required') {
    return 'После отправки заявки организатор должен будет подтвердить ваше участие.'
  }

  if (props.event?.allowWaitlist || props.event?.allow_waitlist) {
    return 'Если мест не останется, вы можете попасть в лист ожидания.'
  }

  return ''
})

const buttonText = computed(() => {
  if (isLoading.value) {
    return 'Сохраняем...'
  }

  if (eventMeta.value.disabled) {
    return eventMeta.value.joinButton
  }

  return isLeaving.value ? eventMeta.value.leaveButton : eventMeta.value.joinButton
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

const pick = (source, keys, fallback = null) => {
  if (!source) return fallback

  for (const key of keys) {
    const value = source[key]

    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return fallback
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
    const err = new Error(data?.message || 'Ошибка запроса')
    err.status = response.status
    err.response = data
    throw err
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

  initialStatus.value =
    props.event.participantStatus ||
    props.event.participant_status ||
    null

  const statusMeta = STATUS_META[initialStatus.value] || null

  initialJoined.value =
    statusMeta?.isActive ??
    Boolean(props.event.isParticipant)

  await nextTick()

  modalInstance.value = await getBootstrapModal()
  modalInstance.value?.show()
}

const getSuccessMessage = (payload, nextStatus, nextState) => {
  const backendMessage = payload?.message

  if (backendMessage) {
    return backendMessage
  }

  if (nextStatus && STATUS_META[nextStatus]?.success) {
    return STATUS_META[nextStatus].success
  }

  return nextState ? eventMeta.value.joinSuccess : eventMeta.value.leaveSuccess
}

const confirm = async () => {
  const currentEvent = props.event

  if (!currentEvent?.id || isLoading.value) return

  if (eventMeta.value.disabled) {
    close()
    return
  }

  isLoading.value = true
  reset()

  try {
    const response = await requestJson(`${props.apiUrl}/event/join/${currentEvent.id}`, {
      method: 'POST',
    })

    const payload = response?.data || response

    const nextStatus = pick(payload, STATUS_KEYS, null)
    const statusMeta = STATUS_META[nextStatus] || null

    const nextState =
      statusMeta?.isActive ??
      pickBool(payload, JOIN_KEYS, !initialJoined.value)

    const backendCount = pick(payload, COUNT_KEYS, null)

    const participantsCount = Number.isFinite(Number(backendCount))
      ? Number(backendCount)
      : Number(currentEvent.participantsCount || 0)

    initialJoined.value = Boolean(nextState)
    initialStatus.value = nextStatus

    emit('changed', {
      isParticipant: nextState,
      participantStatus: nextStatus,
      participant_status: nextStatus,
      participantsCount,
      participants_count: participantsCount,
    })

    setMessage(getSuccessMessage(payload, nextStatus, nextState), 'success')

    window.setTimeout(() => {
      modalInstance.value?.hide()
    }, 700)
  } catch (err) {
    console.error('Join event error:', err)

    if (err.status === 401) {
      emit('auth-required')
      modalInstance.value?.hide()
      return
    }

    setMessage(err.message || 'Не удалось изменить запись', 'error')
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
  margin: 0 auto 12px;
  border-radius: 50%;
  color: #fff;
  background: #111;
  font-size: 30px;
}

.qala-modal-icon.active {
  background: #dc3545;
}

.qala-modal-type {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  margin-bottom: 12px;
  padding: 0 12px;
  border-radius: 999px;
  color: #111;
  background: #f5f5f5;
  font-size: 12px;
  font-weight: 850;
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

.qala-modal-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 340px;
  margin: 16px auto 0;
  padding: 11px 13px;
  border-radius: 14px;
  color: #555;
  background: #f7f7f7;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.4;
  text-align: left;
}

.qala-modal-hint i {
  margin-top: 1px;
  color: #111;
  flex-shrink: 0;
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

.qala-btn-danger,
.qala-btn-danger:hover,
.qala-btn-danger:focus,
.qala-btn-danger:active,
.qala-btn-danger:focus-visible {
  border: 1px solid #dc3545;
  color: #fff;
  background: #dc3545;
  box-shadow: none;
}

.qala-btn-danger:hover {
  border-color: #bb2d3b;
  background: #bb2d3b;
}

.qala-btn-danger:active {
  border-color: #a52834;
  background: #a52834;
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