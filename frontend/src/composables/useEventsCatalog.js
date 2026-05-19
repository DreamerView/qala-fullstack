import { computed, ref, shallowRef } from 'vue'

import {
  ALL_CATEGORY,
  DEFAULT_SAVED_EVENT_IDS,
  DEFAULT_SORT,
  EVENTS,
  EVENT_CATEGORIES,
  EVENT_SORT_OPTIONS,
} from '@/data/eventsCatalog'

const normalizeText = (value) => {
  return String(value || '').trim().toLowerCase()
}

const sortStrategies = {
  popular: (a, b) => b.popularity - a.popularity,
  newest: (a, b) => b.order - a.order,
  nearest: (a, b) => a.order - b.order,
}

export function useEventsCatalog() {
  const events = shallowRef(EVENTS)
  const categories = shallowRef(EVENT_CATEGORIES)
  const sortOptions = shallowRef(EVENT_SORT_OPTIONS)

  const searchQuery = ref('')
  const selectedSort = ref(DEFAULT_SORT)
  const selectedCategory = ref(ALL_CATEGORY)
  const savedEventIds = ref(new Set(DEFAULT_SAVED_EVENT_IDS))

  const hasFilters = computed(() => {
    return Boolean(searchQuery.value.trim()) || selectedCategory.value !== ALL_CATEGORY
  })

  const filteredEvents = computed(() => {
    const query = normalizeText(searchQuery.value)
    const category = selectedCategory.value

    const filtered = events.value.filter((event) => {
      const matchesCategory = category === ALL_CATEGORY || event.category === category

      if (!matchesCategory) {
        return false
      }

      if (!query) {
        return true
      }

      return (
        normalizeText(event.title).includes(query) ||
        normalizeText(event.category).includes(query) ||
        normalizeText(event.location).includes(query)
      )
    })

    const sortFn = sortStrategies[selectedSort.value] || sortStrategies[DEFAULT_SORT]

    return [...filtered].sort(sortFn)
  })

  const resetFilters = () => {
    searchQuery.value = ''
    selectedCategory.value = ALL_CATEGORY
    selectedSort.value = DEFAULT_SORT
  }

  const isSaved = (id) => {
    return savedEventIds.value.has(id)
  }

  const toggleSaved = (id) => {
    const nextSavedIds = new Set(savedEventIds.value)

    if (nextSavedIds.has(id)) {
      nextSavedIds.delete(id)
    } else {
      nextSavedIds.add(id)
    }

    savedEventIds.value = nextSavedIds
  }

  return {
    events,
    categories,
    sortOptions,
    searchQuery,
    selectedSort,
    selectedCategory,
    savedEventIds,
    filteredEvents,
    hasFilters,
    isSaved,
    toggleSaved,
    resetFilters,
  }
}