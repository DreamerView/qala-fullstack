<template>
  <main class="ig-search-page">
    <div class="ig-search-shell">
      <header class="ig-search-header">
        <HeaderBlock title="Поиск" />

        <SearchBox
          v-model="searchQuery"
          placeholder="Поиск событий, мест и людей"
          @clear="clearSearch"
        />
      </header>

      <CategoryList
        v-model="activeCategory"
        :categories="SEARCH_CATEGORIES"
      />

      <section v-if="isRecentVisible" class="ig-search-section">
        <SectionHeader title="Недавние">
          <template #right>
            <button
              type="button"
              class="ig-clear-btn"
              :disabled="!recentSearches.length"
              @click="clearRecentSearches"
            >
              Очистить всё
            </button>
          </template>
        </SectionHeader>

        <RecentSearchList
          v-if="recentSearches.length"
          :items="recentSearches"
          @select="selectRecentSearch"
        />

        <EmptyState
          v-else
          icon="bi bi-clock-history"
          title="История поиска пуста"
          text="Когда ты начнёшь искать события, они появятся здесь."
        />
      </section>

      <section class="ig-search-section">
        <SectionHeader :title="resultsTitle">
          <template #right>
            <span class="ig-results-count">
              {{ filteredEvents.length }} найдено
            </span>
          </template>
        </SectionHeader>

        <div v-if="hasResults" class="ig-results-grid">
          <Card
            v-for="event in filteredEvents"
            :key="event.id"
            :event="event"
          />
        </div>

        <EmptyState
          v-else
          icon="bi bi-search"
          :title="emptyState.title"
          :text="emptyState.text"
        />
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'

import Card from '@/components/global/Card.vue'
import EmptyState from '@/components/global/EmptyState.vue'
import HeaderBlock from '@/components/global/HeaderBlock.vue'
import CategoryList from '@/components/global/CategoryList.vue'
import SearchBox from '@/components/search/SearchBox.vue'
import SectionHeader from '@/components/search/SectionHeader.vue'
import RecentSearchList from '@/components/search/RecentSearchList.vue'

import { SEARCH_CATEGORIES } from '@/data/searchCategories'
import { MOCK_EVENTS } from '@/data/mockEvents'
import { useEventSearch } from '@/composables/useEventSearch'

const {
  searchQuery,
  activeCategory,
  recentSearches,
  filteredEvents,
  clearSearch,
  clearRecentSearches,
  selectRecentSearch,
} = useEventSearch({
  events: MOCK_EVENTS,
  defaultCategory: SEARCH_CATEGORIES[0],
  initialRecentSearches: [
    'Концерт в Караганде',
    'IT meetup',
    'Выставка',
    'Бесплатные события',
  ],
})

const hasResults = computed(() => filteredEvents.value.length > 0)
const isRecentVisible = computed(() => !searchQuery.value.trim())

const resultsTitle = computed(() =>
  searchQuery.value.trim() ? 'Результаты' : 'Популярное рядом',
)

const emptyState = computed(() => {
  if (searchQuery.value.trim()) {
    return {
      title: 'Ничего не найдено',
      text: 'Попробуй изменить запрос или выбрать другую категорию.',
    }
  }

  return {
    title: 'События не найдены',
    text: 'Попробуй выбрать другую категорию.',
  }
})
</script>

<style scoped>
.ig-search-page {
  width: 100%;
  min-height: 100vh;
  background: #fff;
}

.ig-search-shell {
  width: 100%;
  max-width: 1480px;
  margin-inline: auto;
  padding: 28px 32px 48px;
}

.ig-search-header {
  margin-bottom: 18px;
}

.ig-search-section {
  margin-bottom: 30px;
}

.ig-search-section:last-child {
  margin-bottom: 0;
}

.ig-clear-btn {
  padding: 0;
  border: 0;
  background: transparent;
  color: #2563eb;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  transition:
    color 0.18s ease,
    opacity 0.18s ease;
}

.ig-clear-btn:hover:not(:disabled) {
  color: #1d4ed8;
}

.ig-clear-btn:disabled {
  cursor: default;
  opacity: 0.45;
}

.ig-results-count {
  color: #8e8e8e;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.ig-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}

/* LARGE DESKTOP / 4K */
@media (min-width: 1800px) {
  .ig-search-shell {
    max-width: 1640px;
  }
}

/* ULTRA WIDE / 8K */
@media (min-width: 2400px) {
  .ig-search-shell {
    max-width: 1760px;
  }
}

/* TABLET */
@media (min-width: 861px) and (max-width: 1199px) {
  .ig-search-shell {
    padding: 24px 24px 48px;
  }

  .ig-results-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

/* MOBILE */
@media (max-width: 860px) {
  .ig-search-shell {
    max-width: none;
    padding: 18px 14px 82px;
  }

  .ig-results-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

@media (max-width: 420px) {
  .ig-search-shell {
    padding-inline: 12px;
  }
}
</style>