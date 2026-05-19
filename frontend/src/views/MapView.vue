<template>
  <div class="qala-map-page">
    <div class="qala-map-layout">
      <aside class="qala-map-sidebar">
        <header class="qala-map-header">
          <RouterLink to="/events" class="qala-map-back">
            <i class="bi bi-arrow-left"></i>
            <span>Карта событий</span>
          </RouterLink>

          <p>
            Найди события рядом с собой на карте
          </p>
        </header>

        <div class="qala-map-search">
          <i class="bi bi-search qala-map-search-icon"></i>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск событий"
            class="qala-map-search-input"
          />

          <button
            v-if="searchQuery"
            type="button"
            class="qala-map-search-clear"
            aria-label="Очистить поиск"
            @click="searchQuery = ''"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>

        <div class="qala-map-categories">
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            class="qala-map-category"
            :class="{ active: activeCategory === category }"
            @click="activeCategory = category"
          >
            {{ category }}
          </button>
        </div>

        <section class="qala-map-events">
          <div class="qala-map-events-head">
            <strong>{{ filteredEvents.length }}</strong>
            <span>событий найдено</span>
          </div>

          <div v-if="filteredEvents.length" class="qala-map-event-list">
            <RouterLink
              v-for="event in filteredEvents"
              :key="event.id"
              :to="`/events/${event.id}`"
              class="qala-map-event-card"
              :class="{ active: selectedEventId === event.id }"
              @mouseenter="selectedEventId = event.id"
              @focus="selectedEventId = event.id"
            >
              <img
                :src="event.image"
                :alt="event.title"
                class="qala-map-event-image"
              />

              <div class="qala-map-event-body">
                <span class="qala-map-event-category">
                  {{ event.category }}
                </span>

                <h3>{{ event.title }}</h3>

                <p>
                  <i class="bi bi-geo-alt"></i>
                  {{ event.location }}
                </p>

                <div class="qala-map-event-meta">
                  <span>
                    <i class="bi bi-calendar-event"></i>
                    {{ event.date }}
                  </span>

                  <span>
                    <i class="bi bi-clock"></i>
                    {{ event.time }}
                  </span>
                </div>
              </div>
            </RouterLink>
          </div>

          <div v-else class="qala-map-empty">
            <div>
              <i class="bi bi-geo-alt"></i>
            </div>

            <h3>Ничего не найдено</h3>

            <p>
              Попробуй изменить запрос или выбрать другую категорию.
            </p>
          </div>
        </section>
      </aside>

      <main class="qala-map-main">
        <div class="qala-map-frame">
          <iframe
            :src="mapUrl"
            title="Qala events map"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <div class="qala-map-floating-card">
          <div class="qala-map-pin">
            <i class="bi bi-geo-alt-fill"></i>
          </div>

          <div>
            <strong>{{ selectedEvent.title }}</strong>
            <span>{{ selectedEvent.location }}</span>
          </div>

          <RouterLink :to="`/events/${selectedEvent.id}`">
            Подробнее
          </RouterLink>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const searchQuery = ref('')
const activeCategory = ref('Все')
const selectedEventId = ref(1)

const categories = [
  'Все',
  'Концерты',
  'Образование',
  'Спорт',
  'Бизнес',
  'Выставки',
  'Бесплатно',
]

const events = ref([
  {
    id: 1,
    title: 'Музыкальный вечер Qala Live',
    category: 'Концерты',
    location: 'Караганда, Центральный парк',
    date: '25 мая',
    time: '19:00',
    lat: 49.8067,
    lng: 73.0856,
    image:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Frontend Meetup Karaganda',
    category: 'Образование',
    location: 'IT Hub Karaganda',
    date: '28 мая',
    time: '18:30',
    lat: 49.8078,
    lng: 73.1021,
    image:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Городской забег',
    category: 'Спорт',
    location: 'Набережная',
    date: '1 июня',
    time: '08:00',
    lat: 49.815,
    lng: 73.086,
    image:
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Startup Talks',
    category: 'Бизнес',
    location: 'Qala Business Center',
    date: '4 июня',
    time: '17:00',
    lat: 49.802,
    lng: 73.097,
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 5,
    title: 'Арт-выставка молодых художников',
    category: 'Выставки',
    location: 'Галерея современного искусства',
    date: '7 июня',
    time: '12:00',
    lat: 49.81,
    lng: 73.075,
    image:
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 6,
    title: 'Бесплатный мастер-класс по дизайну',
    category: 'Бесплатно',
    location: 'Creative Space',
    date: '10 июня',
    time: '15:00',
    lat: 49.799,
    lng: 73.091,
    image:
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=900&auto=format&fit=crop',
  },
])

const filteredEvents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return events.value.filter((event) => {
    const matchesCategory =
      activeCategory.value === 'Все' || event.category === activeCategory.value

    const matchesQuery =
      !query ||
      event.title.toLowerCase().includes(query) ||
      event.category.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)

    return matchesCategory && matchesQuery
  })
})

const selectedEvent = computed(() => {
  return (
    events.value.find((event) => event.id === selectedEventId.value) ||
    filteredEvents.value[0] ||
    events.value[0]
  )
})

const mapUrl = computed(() => {
  const query = encodeURIComponent(selectedEvent.value.location)

  return `https://www.google.com/maps?q=${query}&output=embed`
})
</script>

<style scoped>
.qala-map-page {
  width: 100%;
  min-height: 100vh;
  background: #fff;
}

.qala-map-layout {
  width: 100%;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 390px minmax(0, 1fr);
}

.qala-map-sidebar {
  height: 100vh;
  border-right: 1px solid #eeeeee;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.qala-map-header {
  padding: 22px 18px 14px;
  flex-shrink: 0;
}

.qala-map-back {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #111;
  text-decoration: none;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.qala-map-back:hover {
  color: #111;
}

.qala-map-header p {
  margin: 6px 0 0;
  color: #737373;
  font-size: 14px;
  font-weight: 500;
}

.qala-map-search {
  position: relative;
  height: 46px;
  margin: 0 18px 12px;
  border-radius: 15px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
}

.qala-map-search-icon {
  position: absolute;
  left: 16px;
  color: #8e8e8e;
  font-size: 16px;
}

.qala-map-search-input {
  width: 100%;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  padding: 0 46px 0 44px;
  color: #111;
  font-size: 14px;
  font-weight: 600;
}

.qala-map-search-input::placeholder {
  color: #8e8e8e;
}

.qala-map-search-clear {
  position: absolute;
  right: 8px;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: #d9d9d9;
  color: #555;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.qala-map-categories {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 18px 14px;
  scrollbar-width: none;
  flex-shrink: 0;
}

.qala-map-categories::-webkit-scrollbar {
  display: none;
}

.qala-map-category {
  flex: 0 0 auto;
  height: 34px;
  padding: 0 14px;
  border: 1px solid #ececec;
  border-radius: 999px;
  background: #fff;
  color: #111;
  font-size: 13px;
  font-weight: 750;
  white-space: nowrap;
}

.qala-map-category.active {
  border-color: #111;
  background: #111;
  color: #fff;
}

.qala-map-events {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 0 14px 18px;
}

.qala-map-events-head {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #737373;
  font-size: 13px;
  font-weight: 650;
  margin-bottom: 12px;
  padding: 0 4px;
}

.qala-map-events-head strong {
  color: #111;
}

.qala-map-event-list {
  display: grid;
  gap: 11px;
}

.qala-map-event-card {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 12px;
  padding: 9px;
  border: 1px solid #eeeeee;
  border-radius: 18px;
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;
}

.qala-map-event-card:hover,
.qala-map-event-card.active {
  background: #fafafa;
  border-color: #dedede;
  color: inherit;
  transform: translateY(-1px);
}

.qala-map-event-image {
  width: 88px;
  height: 88px;
  border-radius: 14px;
  object-fit: cover;
  background: #f3f4f6;
}

.qala-map-event-body {
  min-width: 0;
}

.qala-map-event-category {
  display: inline-flex;
  margin-bottom: 5px;
  color: #737373;
  font-size: 11px;
  font-weight: 850;
}

.qala-map-event-body h3 {
  margin: 0 0 6px;
  color: #111;
  font-size: 14px;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.qala-map-event-body p {
  margin: 0 0 7px;
  color: #707070;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.qala-map-event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #555;
  font-size: 11px;
  font-weight: 750;
}

.qala-map-event-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.qala-map-main {
  position: relative;
  min-width: 0;
  height: 100vh;
  background: #f3f4f6;
  overflow: hidden;
}

.qala-map-frame {
  width: 100%;
  height: 100%;
}

.qala-map-frame iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
  filter: saturate(0.95) contrast(1.02);
}

.qala-map-floating-card {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 24px;
  max-width: 560px;
  min-height: 72px;
  padding: 12px 14px;
  border: 1px solid rgba(238, 238, 238, 0.9);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.qala-map-pin {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background:
    conic-gradient(
      from 180deg,
      #38bdf8,
      #2563eb,
      #7c3aed,
      #06b6d4,
      #38bdf8
    );
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 20px;
}

.qala-map-floating-card strong {
  display: block;
  color: #111;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.2;
}

.qala-map-floating-card span {
  display: block;
  margin-top: 3px;
  color: #707070;
  font-size: 13px;
  font-weight: 600;
}

.qala-map-floating-card a {
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 13px;
  font-weight: 850;
}

.qala-map-empty {
  min-height: 260px;
  border: 1px dashed #e5e5e5;
  border-radius: 20px;
  background: #fafafa;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  padding: 28px 18px;
}

.qala-map-empty div {
  width: 54px;
  height: 54px;
  margin-bottom: 13px;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.qala-map-empty h3 {
  margin: 0 0 6px;
  color: #111;
  font-size: 17px;
  font-weight: 900;
}

.qala-map-empty p {
  max-width: 260px;
  margin: 0;
  color: #777;
  font-size: 13px;
  line-height: 1.45;
}

@media (max-width: 1080px) {
  .qala-map-layout {
    grid-template-columns: 340px minmax(0, 1fr);
  }
}

@media (max-width: 860px) {
  .qala-map-layout {
    min-height: calc(100vh - 56px);
    display: flex;
    flex-direction: column;
  }

  .qala-map-sidebar {
    width: 100%;
    height: auto;
    max-height: none;
    border-right: 0;
    border-bottom: 1px solid #eeeeee;
    overflow: visible;
  }

  .qala-map-header {
    padding: 16px 14px 12px;
  }

  .qala-map-back {
    font-size: 19px;
  }

  .qala-map-search {
    margin-left: 14px;
    margin-right: 14px;
  }

  .qala-map-categories {
    padding-left: 14px;
    padding-right: 14px;
  }

  .qala-map-events {
    display: none;
  }

  .qala-map-main {
    height: calc(100vh - 205px - 56px);
    min-height: 420px;
  }

  .qala-map-floating-card {
    left: 12px;
    right: 12px;
    bottom: 12px;
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .qala-map-pin {
    width: 42px;
    height: 42px;
    border-radius: 15px;
  }

  .qala-map-floating-card a {
    grid-column: 1 / -1;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 420px) {
  .qala-map-header {
    padding-left: 12px;
    padding-right: 12px;
  }

  .qala-map-search {
    margin-left: 12px;
    margin-right: 12px;
  }

  .qala-map-categories {
    padding-left: 12px;
    padding-right: 12px;
  }

  .qala-map-main {
    height: calc(100vh - 205px - 56px);
    min-height: 390px;
  }
}
</style>