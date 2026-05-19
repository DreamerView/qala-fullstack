import { computed, ref, shallowRef } from 'vue'

const normalizeSearchText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

const isAllCategory = (category, defaultCategory) => category === defaultCategory

const eventMatchesCategory = (event, activeCategory, defaultCategory) =>
  isAllCategory(activeCategory, defaultCategory) || event.category === activeCategory

const eventMatchesQuery = (event, query) => {
  if (!query) return true

  return [event.title, event.category, event.location]
    .some((value) => normalizeSearchText(value).includes(query))
}

export function useEventSearch({
  events = [],
  defaultCategory = 'Все',
  initialRecentSearches = [],
} = {}) {
  const searchQuery = ref('')
  const activeCategory = ref(defaultCategory)
  const recentSearches = ref([...initialRecentSearches])
  const eventList = shallowRef(events)

  const normalizedQuery = computed(() => normalizeSearchText(searchQuery.value))

  const filteredEvents = computed(() =>
    eventList.value.filter((event) => {
      const matchesCategory = eventMatchesCategory(
        event,
        activeCategory.value,
        defaultCategory,
      )

      const matchesQuery = eventMatchesQuery(event, normalizedQuery.value)

      return matchesCategory && matchesQuery
    }),
  )

  const clearSearch = () => {
    searchQuery.value = ''
  }

  const clearRecentSearches = () => {
    recentSearches.value = []
  }

  const selectRecentSearch = (item) => {
    searchQuery.value = item
  }

  return {
    searchQuery,
    activeCategory,
    recentSearches,
    filteredEvents,
    clearSearch,
    clearRecentSearches,
    selectRecentSearch,
  }
}