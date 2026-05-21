<template>
  <component
    v-if="isLayoutReady"
    :is="layoutComponent"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useAppLayout, LAYOUTS } from '@/composables/useAppLayout'

import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import FullscreenLayout from '@/layouts/FullscreenLayout.vue'

const { layout, isLayoutReady } = useAppLayout()

const layoutMap = {
  [LAYOUTS.AUTH]: AuthLayout,
  [LAYOUTS.MAIN]: MainLayout,
  [LAYOUTS.FULLSCREEN]: FullscreenLayout,
}

const layoutComponent = computed(() => {
  return layoutMap[layout.value] || MainLayout
})
</script>