<template>
  <div class="qala-event-page">
    <div class="qala-event-shell">
      <div class="qala-event-topbar">
        <button
          type="button"
          class="qala-back-link"
          @click="goBack"
        >
          <i class="bi bi-arrow-left"></i>
          <span>Назад</span>
        </button>

        <button
          type="button"
          class="qala-icon-btn"
          :class="{ active: isSaved }"
          @click="isSaved = !isSaved"
          aria-label="Сохранить событие"
        >
          <i
            class="bi"
            :class="isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'"
          ></i>
        </button>
      </div>

      <section v-if="event" class="qala-event-detail">
        <div class="qala-event-hero">
          <img
            :src="event.image"
            :alt="event.title"
            class="qala-event-hero-img"
          />

          <div class="qala-event-hero-overlay">
            <span class="qala-event-category">
              {{ event.category }}
            </span>
          </div>
        </div>

        <div class="qala-event-content-grid">
          <main class="qala-event-main">
            <div class="qala-event-title-block">
              <div class="qala-event-date-card">
                <span>{{ event.day }}</span>
                <small>{{ event.month }}</small>
              </div>

              <div>
                <h1 class="qala-event-title">
                  {{ event.title }}
                </h1>

                <p class="qala-event-location">
                  <i class="bi bi-geo-alt"></i>
                  {{ event.location }}
                </p>
              </div>
            </div>

            <div class="qala-event-actions">
              <button type="button" class="qala-primary-btn">
                <i class="bi bi-check2-circle"></i>
                <span>Я пойду</span>
              </button>

              <button type="button" class="qala-secondary-btn">
                <i class="bi bi-send"></i>
                <span>Поделиться</span>
              </button>

              <button
                type="button"
                class="qala-secondary-btn"
                data-bs-toggle="modal"
                data-bs-target="#qalaMapModal"
              >
                <i class="bi bi-map"></i>
                <span>Карта</span>
              </button>
            </div>

            <section class="qala-section">
              <h2>О событии</h2>

              <p>
                {{ event.description }}
              </p>
            </section>

            <section class="qala-section">
              <h2>Программа</h2>

              <div class="qala-program-list">
                <div
                  v-for="item in event.program"
                  :key="item.time"
                  class="qala-program-item"
                >
                  <div class="qala-program-time">
                    {{ item.time }}
                  </div>

                  <div class="qala-program-info">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.text }}</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="qala-section">
              <h2>Организатор</h2>

              <div class="qala-organizer-card">
                <img
                  :src="event.organizer.avatar"
                  :alt="event.organizer.name"
                  class="qala-organizer-avatar"
                />

                <div class="qala-organizer-info">
                  <h3>{{ event.organizer.name }}</h3>
                  <p>{{ event.organizer.description }}</p>
                </div>

                <button type="button" class="qala-follow-btn">
                  Подписаться
                </button>
              </div>
            </section>
          </main>

          <aside class="qala-event-sidebar">
            <div class="qala-info-card">
              <h2>Детали</h2>

              <div class="qala-info-list">
                <div class="qala-info-item">
                  <span class="qala-info-icon">
                    <i class="bi bi-calendar-event"></i>
                  </span>

                  <div>
                    <strong>{{ event.fullDate }}</strong>
                    <p>Дата проведения</p>
                  </div>
                </div>

                <div class="qala-info-item">
                  <span class="qala-info-icon">
                    <i class="bi bi-clock"></i>
                  </span>

                  <div>
                    <strong>{{ event.time }}</strong>
                    <p>Время начала</p>
                  </div>
                </div>

                <div class="qala-info-item">
                  <span class="qala-info-icon">
                    <i class="bi bi-people"></i>
                  </span>

                  <div>
                    <strong>{{ event.people }}</strong>
                    <p>Участников</p>
                  </div>
                </div>

                <div class="qala-info-item">
                  <span class="qala-info-icon">
                    <i class="bi bi-ticket-perforated"></i>
                  </span>

                  <div>
                    <strong>{{ event.price }}</strong>
                    <p>Стоимость</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="qala-map-preview">
              <div class="qala-map-preview-bg">
                <i class="bi bi-geo-alt-fill"></i>
              </div>

              <div class="qala-map-preview-body">
                <h3>{{ event.place }}</h3>
                <p>{{ event.location }}</p>

                <button
                  type="button"
                  class="qala-map-preview-btn"
                  data-bs-toggle="modal"
                  data-bs-target="#qalaMapModal"
                >
                  Показать на карте
                </button>
              </div>
            </div>
          </aside>
        </div>

        <section class="qala-related-section">
          <div class="qala-related-head">
            <h2>Похожие события</h2>

            <RouterLink to="/events">
              Все события
            </RouterLink>
          </div>

          <div class="qala-related-grid">
            <RouterLink
              v-for="item in relatedEvents"
              :key="item.id"
              :to="`/events/${item.id}`"
              class="qala-related-card"
            >
              <img :src="item.image" :alt="item.title" />

              <div>
                <span>{{ item.category }}</span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.date }}</p>
              </div>
            </RouterLink>
          </div>
        </section>
      </section>

      <section v-else class="qala-not-found">
        <div class="qala-not-found-icon">
          <i class="bi bi-calendar-x"></i>
        </div>

        <h1>Событие не найдено</h1>

        <p>
          Возможно, событие удалено или ссылка указана неправильно.
        </p>

        <RouterLink to="/events" class="qala-primary-btn">
          Вернуться к событиям
        </RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isSaved = ref(false)

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/events')
}

const events = [
  {
    id: 1,
    title: 'Музыкальный вечер Qala Live',
    category: 'Концерты',
    location: 'Караганда, Центральный парк',
    place: 'Центральный парк',
    day: '25',
    month: 'МАЙ',
    fullDate: '25 мая 2026',
    time: '19:00',
    people: '1.2K',
    price: 'от 3 000 ₸',
    date: '25 мая',
    image:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1400&auto=format&fit=crop',
    description:
      'Большой музыкальный вечер под открытым небом с живым звуком, атмосферной сценой, фуд-кортом и уютной зоной отдыха. Отличный вариант провести вечер с друзьями и открыть для себя новых исполнителей города.',
    organizer: {
      name: 'Qala Events',
      description: 'Городская команда, которая собирает лучшие события Караганды.',
      avatar:
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop',
    },
    program: [
      {
        time: '18:30',
        title: 'Сбор гостей',
        text: 'Открытие площадки, музыка и welcome-зона.',
      },
      {
        time: '19:00',
        title: 'Начало концерта',
        text: 'Выступления локальных артистов и приглашённых гостей.',
      },
      {
        time: '21:30',
        title: 'After party',
        text: 'DJ-сет, общение и вечерняя атмосфера парка.',
      },
    ],
  },
  {
    id: 2,
    title: 'Frontend Meetup Karaganda',
    category: 'Образование',
    location: 'IT Hub Karaganda',
    place: 'IT Hub',
    day: '28',
    month: 'МАЙ',
    fullDate: '28 мая 2026',
    time: '18:30',
    people: '430',
    price: 'Бесплатно',
    date: '28 мая',
    image:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1400&auto=format&fit=crop',
    description:
      'Встреча frontend-разработчиков, дизайнеров и продуктовых специалистов. Обсудим Vue, UX, производительность интерфейсов и реальные кейсы разработки городских сервисов.',
    organizer: {
      name: 'Karaganda IT Community',
      description: 'Сообщество разработчиков, дизайнеров и IT-энтузиастов.',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    },
    program: [
      {
        time: '18:30',
        title: 'Нетворкинг',
        text: 'Знакомство участников и короткое вступление.',
      },
      {
        time: '19:00',
        title: 'Доклады',
        text: 'Практические выступления про frontend и продуктовую разработку.',
      },
      {
        time: '20:30',
        title: 'Q&A',
        text: 'Вопросы спикерам и свободное общение.',
      },
    ],
  },
  {
    id: 3,
    title: 'Городской забег',
    category: 'Спорт',
    location: 'Набережная',
    place: 'Набережная',
    day: '01',
    month: 'ИЮН',
    fullDate: '1 июня 2026',
    time: '08:00',
    people: '860',
    price: 'от 1 500 ₸',
    date: '1 июня',
    image:
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1400&auto=format&fit=crop',
    description:
      'Утренний городской забег для всех желающих. Можно участвовать одному, с друзьями или семьёй. Будут разные дистанции, зона разминки и медали для участников.',
    organizer: {
      name: 'Qala Sport',
      description: 'Команда городских спортивных мероприятий.',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
    },
    program: [
      {
        time: '07:30',
        title: 'Регистрация',
        text: 'Выдача номеров и подготовка участников.',
      },
      {
        time: '08:00',
        title: 'Разминка',
        text: 'Общая разминка перед стартом.',
      },
      {
        time: '08:30',
        title: 'Старт',
        text: 'Начало забега по выбранным дистанциям.',
      },
    ],
  },
]

const event = computed(() => {
  const id = Number(route.params.id)

  return events.find((item) => item.id === id) || null
})

const relatedEvents = computed(() => {
  if (!event.value) {
    return []
  }

  return events
    .filter((item) => item.id !== event.value.id)
    .slice(0, 3)
})

watch(
  () => route.params.id,
  () => {
    isSaved.value = false
  }
)
</script>

<style scoped>
.qala-event-page {
  width: 100%;
  min-height: 100vh;
  background: #fff;
}

.qala-event-shell {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 18px 32px 56px;
}

.qala-event-topbar {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.qala-back-link {
  height: 40px;
  padding: 0 13px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #111;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 850;
  cursor: pointer;
}

.qala-back-link:hover {
  background: #f7f7f7;
  color: #111;
}

.qala-icon-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #eeeeee;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.qala-icon-btn:hover,
.qala-icon-btn.active {
  background: #111;
  color: #fff;
  border-color: #111;
}

.qala-event-hero {
  position: relative;
  width: 100%;
  height: 440px;
  border-radius: 28px;
  background: #f3f4f6;
  overflow: hidden;
  margin-bottom: 24px;
}

.qala-event-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.qala-event-hero-overlay {
  position: absolute;
  left: 18px;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.qala-event-category {
  height: 32px;
  padding: 0 13px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #111;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 850;
  backdrop-filter: blur(10px);
}

.qala-event-content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 32px;
  align-items: start;
}

.qala-event-main {
  min-width: 0;
}

.qala-event-title-block {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  margin-bottom: 20px;
}

.qala-event-date-card {
  width: 64px;
  height: 68px;
  border-radius: 18px;
  background: #f7f7f7;
  display: grid;
  place-items: center;
  align-content: center;
}

.qala-event-date-card span {
  color: #111;
  font-size: 24px;
  font-weight: 950;
  line-height: 1;
  letter-spacing: -0.05em;
}

.qala-event-date-card small {
  margin-top: 5px;
  color: #737373;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
}

.qala-event-title {
  margin: 0;
  color: #050505;
  font-size: 34px;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.055em;
}

.qala-event-location {
  margin: 10px 0 0;
  color: #707070;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.qala-event-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}

.qala-primary-btn,
.qala-secondary-btn {
  height: 44px;
  padding: 0 17px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 850;
}

.qala-primary-btn {
  border: 0;
  background: #111;
  color: #fff;
}

.qala-primary-btn:hover {
  background: #222;
  color: #fff;
}

.qala-secondary-btn {
  border: 1px solid #eeeeee;
  background: #fff;
  color: #111;
}

.qala-secondary-btn:hover {
  background: #f7f7f7;
  color: #111;
}

.qala-section {
  padding: 26px 0;
  border-top: 1px solid #eeeeee;
}

.qala-section h2 {
  margin: 0 0 13px;
  color: #111;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.qala-section p {
  margin: 0;
  color: #555;
  font-size: 15px;
  line-height: 1.7;
  font-weight: 500;
}

.qala-program-list {
  display: grid;
  gap: 14px;
}

.qala-program-item {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr);
  gap: 14px;
}

.qala-program-time {
  height: 36px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 900;
}

.qala-program-info h3 {
  margin: 0 0 4px;
  color: #111;
  font-size: 15px;
  font-weight: 850;
}

.qala-program-info p {
  color: #707070;
  font-size: 14px;
  line-height: 1.5;
}

.qala-organizer-card {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  gap: 13px;
  align-items: center;
  padding: 14px;
  border: 1px solid #eeeeee;
  border-radius: 20px;
}

.qala-organizer-avatar {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  object-fit: cover;
}

.qala-organizer-info {
  min-width: 0;
}

.qala-organizer-info h3 {
  margin: 0 0 4px;
  color: #111;
  font-size: 15px;
  font-weight: 900;
}

.qala-organizer-info p {
  color: #707070;
  font-size: 13px;
  line-height: 1.4;
}

.qala-follow-btn {
  height: 36px;
  padding: 0 13px;
  border: 0;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 13px;
  font-weight: 850;
}

.qala-event-sidebar {
  position: sticky;
  top: 74px;
  display: grid;
  gap: 16px;
}

.qala-info-card,
.qala-map-preview {
  border: 1px solid #eeeeee;
  border-radius: 24px;
  background: #fff;
  overflow: hidden;
}

.qala-info-card {
  padding: 18px;
}

.qala-info-card h2 {
  margin: 0 0 16px;
  color: #111;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.qala-info-list {
  display: grid;
  gap: 15px;
}

.qala-info-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.qala-info-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #f7f7f7;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.qala-info-item strong {
  color: #111;
  font-size: 14px;
  font-weight: 900;
}

.qala-info-item p {
  margin: 3px 0 0;
  color: #8a8a8a;
  font-size: 12px;
  font-weight: 650;
}

.qala-map-preview-bg {
  height: 130px;
  background:
    radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.28), transparent 32%),
    radial-gradient(circle at 70% 65%, rgba(124, 58, 237, 0.22), transparent 34%),
    #f3f4f6;
  display: grid;
  place-items: center;
  color: #111;
  font-size: 32px;
}

.qala-map-preview-body {
  padding: 16px;
}

.qala-map-preview-body h3 {
  margin: 0 0 5px;
  color: #111;
  font-size: 16px;
  font-weight: 900;
}

.qala-map-preview-body p {
  margin: 0 0 14px;
  color: #707070;
  font-size: 13px;
  font-weight: 600;
}

.qala-map-preview-btn {
  width: 100%;
  height: 40px;
  border: 0;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 14px;
  font-weight: 850;
}

.qala-related-section {
  margin-top: 34px;
  padding-top: 26px;
  border-top: 1px solid #eeeeee;
}

.qala-related-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.qala-related-head h2 {
  margin: 0;
  color: #111;
  font-size: 21px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.qala-related-head a {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  font-weight: 850;
}

.qala-related-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.qala-related-card {
  min-width: 0;
  border: 1px solid #eeeeee;
  border-radius: 18px;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
}

.qala-related-card img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
}

.qala-related-card div {
  padding: 12px;
}

.qala-related-card span {
  color: #707070;
  font-size: 12px;
  font-weight: 800;
}

.qala-related-card h3 {
  margin: 4px 0 6px;
  color: #111;
  font-size: 14px;
  font-weight: 900;
  line-height: 1.25;
}

.qala-related-card p {
  margin: 0;
  color: #777;
  font-size: 12px;
  font-weight: 700;
}

.qala-not-found {
  min-height: 70vh;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  padding: 40px 20px;
}

.qala-not-found-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 999px;
  background: #f7f7f7;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 28px;
}

.qala-not-found h1 {
  margin: 0 0 8px;
  color: #111;
  font-size: 26px;
  font-weight: 900;
}

.qala-not-found p {
  max-width: 360px;
  margin: 0 auto 18px;
  color: #707070;
  font-size: 15px;
  line-height: 1.5;
}

@media (min-width: 1600px) {
  .qala-event-shell {
    max-width: 1640px;
  }

  .qala-event-hero {
    height: 460px;
  }

  .qala-event-content-grid {
    grid-template-columns: minmax(0, 1fr) 380px;
  }
}

@media (min-width: 1900px) {
  .qala-event-shell {
    max-width: 1760px;
  }

  .qala-event-hero {
    height: 480px;
  }

  .qala-event-content-grid {
    grid-template-columns: minmax(0, 1fr) 400px;
  }
}

@media (min-width: 861px) and (max-width: 1199px) {
  .qala-event-shell {
    padding: 16px 24px 56px;
  }

  .qala-event-content-grid {
    grid-template-columns: 1fr;
  }

  .qala-event-sidebar {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .qala-event-hero {
    height: 360px;
  }
}

@media (max-width: 860px) {
  .qala-event-page {
    width: 100%;
    overflow-x: hidden;
  }

  .qala-event-shell {
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 12px 14px 82px;
  }

  .qala-event-topbar {
    top: 0;
    height: 52px;
    margin-bottom: 12px;
    padding: 0 2px;
  }

  .qala-event-hero {
    width: 100%;
    height: auto;
    border-radius: 22px;
    aspect-ratio: 4 / 3;
    margin-bottom: 20px;
  }

  .qala-event-content-grid {
    width: 100%;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .qala-event-title-block {
    grid-template-columns: 58px minmax(0, 1fr);
    gap: 13px;
  }

  .qala-event-date-card {
    width: 58px;
    height: 62px;
    border-radius: 17px;
  }

  .qala-event-title {
    font-size: 26px;
  }

  .qala-event-location {
    font-size: 14px;
  }

  .qala-event-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .qala-primary-btn,
  .qala-secondary-btn {
    width: 100%;
  }

  .qala-event-sidebar {
    position: static;
    width: 100%;
    grid-template-columns: 1fr;
  }

  .qala-info-card,
  .qala-map-preview,
  .qala-organizer-card,
  .qala-related-card {
    width: 100%;
  }

  .qala-organizer-card {
    grid-template-columns: 50px minmax(0, 1fr);
  }

  .qala-follow-btn {
    grid-column: 1 / -1;
    width: 100%;
  }

  .qala-related-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .qala-event-shell {
    width: 100%;
    max-width: none;
    padding-left: 12px;
    padding-right: 12px;
  }

  .qala-event-title {
    font-size: 24px;
  }

  .qala-program-item {
    grid-template-columns: 62px minmax(0, 1fr);
  }
}
</style>