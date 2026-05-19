<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      @click.self="closeModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <div>
              <h5 class="modal-title fw-bold mb-1">
                Удалить событие навсегда?
              </h5>

              <p class="text-muted small mb-0">
                Это действие нельзя будет отменить.
              </p>
            </div>

            <button
              type="button"
              class="btn-close"
              :disabled="isDeleting"
              aria-label="Закрыть"
              @click="closeModal"
            ></button>
          </div>

          <div class="modal-body">
            <div class="alert alert-danger border-0 rounded-4 mb-0">
              <div class="d-flex gap-3">
                <div class="delete-modal-icon">
                  <i class="bi bi-trash3"></i>
                </div>

                <div class="min-w-0">
                  <strong class="d-block mb-1 text-truncate">
                    {{ eventTitle || 'Это событие' }}
                  </strong>

                  <span class="small">
                    Событие и его программа будут полностью удалены из базы данных.
                  </span>
                </div>
              </div>
            </div>

            <div
              v-if="errorMessage"
              class="alert alert-warning border-0 rounded-4 mt-3 mb-0 small"
            >
              {{ errorMessage }}
            </div>
          </div>

          <div class="modal-footer border-0 pt-0">
            <button
              type="button"
              class="btn btn-light rounded-pill px-4"
              :disabled="isDeleting"
              @click="closeModal"
            >
              Отмена
            </button>

            <button
              type="button"
              class="btn btn-danger rounded-pill px-4"
              :disabled="isDeleting"
              @click="deleteEvent"
            >
              <span
                v-if="isDeleting"
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
              ></span>

              {{ isDeleting ? 'Удаляем...' : 'Удалить навсегда' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="modelValue"
      class="modal-backdrop fade show"
    ></div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  apiUrl: {
    type: String,
    required: true,
  },
  eventId: {
    type: [String, Number],
    required: true,
  },
  eventTitle: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'deleted'])

const isDeleting = ref(false)
const errorMessage = ref('')

const lockBody = () => {
  document.body.classList.add('modal-open')
  document.body.style.overflow = 'hidden'
}

const unlockBody = () => {
  document.body.classList.remove('modal-open')
  document.body.style.overflow = ''
}

const closeModal = () => {
  if (isDeleting.value) {
    return
  }

  errorMessage.value = ''
  emit('update:modelValue', false)
}

const deleteEventRequest = async () => {
  const response = await fetch(`${props.apiUrl}/event/delete/${props.eventId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || !data?.status) {
    const error = new Error(data?.message || 'Не удалось удалить событие')
    error.response = data
    error.status = response.status
    throw error
  }

  return data
}

const deleteEvent = async () => {
  if (isDeleting.value) {
    return
  }

  try {
    isDeleting.value = true
    errorMessage.value = ''

    const data = await deleteEventRequest()

    emit('deleted', data)
    emit('update:modelValue', false)
  } catch (err) {
    console.error('Delete event modal error:', err)

    errorMessage.value =
      err?.response?.message ||
      err?.message ||
      'Не удалось удалить событие'
  } finally {
    isDeleting.value = false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      lockBody()
      return
    }

    unlockBody()
  }
)

onBeforeUnmount(() => {
  unlockBody()
})
</script>

<style scoped>
.delete-modal-icon {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: #fff;
  color: #dc3545;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 20px;
}

.min-w-0 {
  min-width: 0;
}
</style>