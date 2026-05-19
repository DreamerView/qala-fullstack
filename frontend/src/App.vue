<template>
  <AuthLayout v-if="isAuthLayout" />
  <MainLayout v-else />
</template>

<script setup>
import { useAppLayout } from '@/composables/useAppLayout'

import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'

const { isAuthLayout } = useAppLayout()
</script>