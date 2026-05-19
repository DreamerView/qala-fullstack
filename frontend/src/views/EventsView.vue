<template>
  <main class="events-page">
    <div class="events-shell">
      <HeaderBlock
        title="EventGO"
        subtitle="Найди интересные мероприятия рядом с собой"
        action-to="/map"
        action-icon="bi bi-map"
        action-text="Карта"
      />

      <section class="events-toolbar" aria-label="Фильтры событий">
        <EventsSearch
          v-model="searchQuery"
          placeholder="Поиск по событиям"
        />

        <EventsSortDropdown
          v-model="selectedSort"
          :options="sortOptions"
        />
      </section>

      <CategoryList
        v-model="selectedCategory"
        :categories="categories"
      />

      <EventsSummary
        :count="filteredEvents.length"
        :has-filters="hasFilters"
        @reset="resetFilters"
      />

      <section
        v-if="filteredEvents.length"
        class="events-grid"
        aria-label="Список событий"
      >
        <Card
          v-for="event in filteredEvents"
          :key="event.id"
          v-memo="[event.id, isSaved(event.id)]"
          :event="event"
          :saved="isSaved(event.id)"
          @toggle-save="toggleSaved"
        />
      </section>

      <EmptyState
        v-else
        icon="bi bi-calendar-x"
        title="События не найдены"
        text="Попробуй изменить запрос или выбрать другую категорию."
        button-text="Сбросить фильтры"
        @action="resetFilters"
      />
    </div>
  </main>
</template>

<script setup>
import HeaderBlock from '@/components/global/HeaderBlock.vue'
import CategoryList from '@/components/global/CategoryList.vue'
import Card from '@/components/global/Card.vue'
import EmptyState from '@/components/global/EmptyState.vue'

import EventsSearch from '@/components/events/EventsSearch.vue'
import EventsSortDropdown from '@/components/events/EventsSortDropdown.vue'
import EventsSummary from '@/components/events/EventsSummary.vue'

import { useEventsCatalog } from '@/composables/useEventsCatalog'

const {
  categories,
  sortOptions,
  searchQuery,
  selectedSort,
  selectedCategory,
  filteredEvents,
  hasFilters,
  isSaved,
  toggleSaved,
  resetFilters,
} = useEventsCatalog()
</script>

<style scoped>
.events-page {
  width: 100%;
  min-height: 100vh;
  background: #fff;
}

.events-shell {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 28px 32px 54px;
}

.events-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

@media (min-width: 1800px) {
  .events-shell {
    max-width: 1640px;
  }
}

@media (min-width: 2400px) {
  .events-shell {
    max-width: 1760px;
  }
}

@media (min-width: 861px) and (max-width: 1199px) {
  .events-shell {
    padding: 24px 24px 54px;
  }

  .events-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 860px) {
  .events-shell {
    max-width: none;
    padding: 18px 14px 82px;
  }

  .events-toolbar {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .events-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

@media (max-width: 420px) {
  .events-shell {
    padding-right: 12px;
    padding-left: 12px;
  }
}
</style>