<template>
  <header
    class="header-block w-100 d-flex justify-content-between"
    :class="headerClasses"
  >
    <div class="min-w-0">
      <component
        :is="headingTag"
        class="header-block__title mb-0 text-dark overflow-wrap-anywhere"
      >
        {{ title }}
      </component>

      <p
        v-if="hasSubtitle"
        class="header-block__subtitle mb-0 mt-2 text-secondary"
      >
        {{ subtitle }}
      </p>
    </div>

    <div
      v-if="hasRightContent"
      class="flex-shrink-0 d-flex align-items-center"
    >
      <slot name="right">
        <RouterLink
          v-if="isLinkAction"
          :to="actionTo"
          class="header-block__action btn btn-light border rounded-pill d-inline-flex align-items-center justify-content-center gap-2 fw-bold text-dark text-decoration-none"
          :aria-label="actionLabel"
        >
          <i
            v-if="actionIcon"
            :class="actionIcon"
            aria-hidden="true"
          ></i>

          <span v-if="actionText">
            {{ actionText }}
          </span>
        </RouterLink>

        <button
          v-else
          type="button"
          class="header-block__action btn btn-light border rounded-pill d-inline-flex align-items-center justify-content-center gap-2 fw-bold text-dark"
          :disabled="disabled"
          :aria-label="actionLabel"
          @click="handleAction"
        >
          <i
            v-if="actionIcon"
            :class="actionIcon"
            aria-hidden="true"
          ></i>

          <span v-if="actionText">
            {{ actionText }}
          </span>
        </button>
      </slot>
    </div>
  </header>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  subtitle: {
    type: String,
    default: '',
  },

  size: {
    type: String,
    default: 'page',
    validator: value => ['page', 'section'].includes(value),
  },

  actionTo: {
    type: [String, Object],
    default: '',
  },

  actionIcon: {
    type: String,
    default: '',
  },

  actionText: {
    type: String,
    default: '',
  },

  actionAriaLabel: {
    type: String,
    default: '',
  },

  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits({
  action: null,
})

const slots = useSlots()

const headingTag = computed(() => {
  return props.size === 'section' ? 'h2' : 'h1'
})

const hasSubtitle = computed(() => {
  return Boolean(props.subtitle?.trim())
})

const hasNamedRightSlot = computed(() => {
  return Boolean(slots.right)
})

const isLinkAction = computed(() => {
  if (typeof props.actionTo === 'string') {
    return Boolean(props.actionTo.trim())
  }

  return Boolean(props.actionTo)
})

const hasDefaultAction = computed(() => {
  return isLinkAction.value || Boolean(props.actionIcon || props.actionText)
})

const hasRightContent = computed(() => {
  return hasNamedRightSlot.value || hasDefaultAction.value
})

const actionLabel = computed(() => {
  return props.actionAriaLabel || props.actionText || props.title
})

const headerClasses = computed(() => [
  `header-block--${props.size}`,
  {
    'header-block--with-subtitle': hasSubtitle.value,
    'header-block--with-action': hasRightContent.value,
  },
])

function handleAction() {
  if (props.disabled) return

  emit('action')
}
</script>

<style scoped>
.header-block {
  gap: 18px;
}

.header-block--page {
  align-items: flex-start;
  margin-bottom: 22px;
}

.header-block--section {
  align-items: center;
  margin-bottom: 14px;
}

.header-block__title {
  font-weight: 850;
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.header-block--page .header-block__title {
  font-size: clamp(25px, 3vw, 30px);
}

.header-block--section .header-block__title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.header-block__subtitle {
  max-width: 720px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.45;
}

.header-block__action {
  min-width: 42px;
  height: 42px;
  padding: 0 15px;
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    opacity 0.18s ease;
}

.header-block__action:hover {
  border-color: #e4e4e4 !important;
  background: #f7f7f7;
  color: #111;
}

.header-block__action:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.2);
  outline-offset: 2px;
}

.header-block__action:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.header-block__action i {
  font-size: 16px;
  line-height: 1;
}

.min-w-0 {
  min-width: 0;
}

.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
}

@media (max-width: 860px) {
  .header-block {
    gap: 14px;
  }

  .header-block--page {
    align-items: center;
    margin-bottom: 18px;
  }

  .header-block__subtitle {
    font-size: 14px;
  }

  .header-block__action {
    width: 42px;
    padding: 0;
  }

  .header-block__action span {
    display: none;
  }
}

@media (max-width: 520px) {
  .header-block {
    gap: 12px;
  }

  .header-block--section {
    align-items: flex-start;
  }

  .header-block--section .header-block__title {
    font-size: 17px;
  }

  .header-block__subtitle {
    margin-top: 5px !important;
  }
}

@media (max-width: 380px) {
  .header-block--with-subtitle.header-block--with-action {
    align-items: flex-start;
  }
}
</style>