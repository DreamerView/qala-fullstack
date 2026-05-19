import { computed } from 'vue'
import { useRoute } from 'vue-router'

const LAYOUTS = Object.freeze({
  AUTH: 'auth',
  MAIN: 'main',
})

export function useAppLayout() {
  const route = useRoute()

  const layout = computed(() => {
    return route.meta?.layout === LAYOUTS.AUTH
      ? LAYOUTS.AUTH
      : LAYOUTS.MAIN
  })

  const isAuthLayout = computed(() => {
    return layout.value === LAYOUTS.AUTH
  })

  return {
    layout,
    isAuthLayout,
  }
}