import { computed } from 'vue'
import { useRoute } from 'vue-router'

export const LAYOUTS = Object.freeze({
  AUTH: 'auth',
  MAIN: 'main',
  FULLSCREEN: 'fullscreen',
})

const DEFAULT_LAYOUT = LAYOUTS.MAIN
const VALID_LAYOUTS = new Set(Object.values(LAYOUTS))

export function useAppLayout() {
  const route = useRoute()

  const isReady = computed(() => {
    return route.name !== undefined || route.matched.length > 0
  })

  const layout = computed(() => {
    if (!isReady.value) return null

    const value = route.meta?.layout

    return VALID_LAYOUTS.has(value) ? value : DEFAULT_LAYOUT
  })

  return {
    layout,
    isLayoutReady: computed(() => layout.value !== null),

    isAuthLayout: computed(() => layout.value === LAYOUTS.AUTH),
    isMainLayout: computed(() => layout.value === LAYOUTS.MAIN),
    isFullscreenLayout: computed(() => layout.value === LAYOUTS.FULLSCREEN),
  }
}