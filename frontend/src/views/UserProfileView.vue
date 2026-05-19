<template>
  <div class="qala-profile-page">
    <div class="qala-profile-shell">
      <section class="qala-profile-header">
        <div class="qala-profile-avatar-wrap">
          <img
            :src="profile.avatar"
            :alt="profile.name"
            class="qala-profile-avatar"
          />
        </div>

        <div class="qala-profile-content">
          <div class="qala-profile-top">
            <div class="qala-profile-title">
              <h1>{{ profile.name }}</h1>
              <p>@{{ profile.username }}</p>
            </div>

            <div class="qala-profile-actions">
              <button type="button" class="qala-edit-btn">
                <i class="bi bi-pencil-square"></i>
                <span>Редактировать</span>
              </button>

              <button type="button" class="qala-icon-btn" aria-label="Настройки">
                <i class="bi bi-gear"></i>
              </button>
            </div>
          </div>

          <div class="qala-profile-stats">
            <button
              v-for="stat in stats"
              :key="stat.label"
              type="button"
              class="qala-profile-stat"
            >
              <strong>{{ stat.value }}</strong>
              <span>{{ stat.label }}</span>
            </button>
          </div>

          <div class="qala-profile-about">
            <p class="qala-profile-bio">
              {{ profile.bio }}
            </p>

            <div class="qala-profile-meta">
              <span>
                <i class="bi bi-geo-alt"></i>
                {{ profile.city }}
              </span>

              <span>
                <i class="bi bi-calendar3"></i>
                {{ profile.joinedAt }}
              </span>

              <span>
                <i class="bi bi-link-45deg"></i>
                {{ profile.website }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="qala-profile-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="qala-profile-tab"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </section>

      <section v-if="activeItems.length" class="qala-profile-grid">
        <RouterLink
          v-for="event in activeItems"
          :key="event.id"
          :to="`/events/${event.id}`"
          class="qala-profile-event"
        >
          <div class="qala-profile-event-img-wrap">
            <img
              :src="event.image"
              :alt="event.title"
              class="qala-profile-event-img"
            />

            <div class="qala-profile-event-overlay">
              <span class="qala-profile-event-badge">
                {{ event.category }}
              </span>
            </div>
          </div>
        </RouterLink>
      </section>

      <section v-else class="qala-profile-empty">
        <div class="qala-profile-empty-icon">
          <i :class="emptyState.icon"></i>
        </div>

        <h3>{{ emptyState.title }}</h3>

        <p>{{ emptyState.text }}</p>

        <RouterLink to="/events" class="qala-empty-btn">
          Смотреть события
        </RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const activeTab = ref('events')

const profile = {
  name: 'Темирхан Рустемов',
  username: 'temirkhan.onyx',
  city: 'Караганда, Казахстан',
  joinedAt: 'с мая 2026',
  website: 'qala.kz',
  bio:
    'Люблю городские события, IT-встречи, уютные места и проекты, которые делают жизнь людей проще.',
  avatar:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
}

const stats = [
  {
    label: 'событий',
    value: '12',
  },
  {
    label: 'подписок',
    value: '248',
  },
  {
    label: 'сохранено',
    value: '36',
  },
]

const tabs = [
  {
    label: 'Мои события',
    value: 'events',
    icon: 'bi bi-grid-3x3-gap',
  },
  {
    label: 'Сохранённые',
    value: 'saved',
    icon: 'bi bi-bookmark',
  },
  {
    label: 'Посещённые',
    value: 'visited',
    icon: 'bi bi-check2-circle',
  },
]

const myEvents = [
  {
    id: 1,
    title: 'Музыкальный вечер Qala Live',
    category: 'Концерты',
    location: 'Караганда, Центральный парк',
    date: '25 мая',
    people: '1.2K',
    image:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Frontend Meetup Karaganda',
    category: 'Образование',
    location: 'IT Hub Karaganda',
    date: '28 мая',
    people: '430',
    image:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Startup Talks',
    category: 'Бизнес',
    location: 'Qala Business Center',
    date: '4 июня',
    people: '250',
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop',
  },
]

const savedEvents = [
  {
    id: 3,
    title: 'Городской забег',
    category: 'Спорт',
    location: 'Набережная',
    date: '1 июня',
    people: '860',
    image:
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 5,
    title: 'Арт-выставка молодых художников',
    category: 'Выставки',
    location: 'Галерея современного искусства',
    date: '7 июня',
    people: '640',
    image:
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1200&auto=format&fit=crop',
  },
]

const visitedEvents = []

const activeItems = computed(() => {
  if (activeTab.value === 'events') {
    return myEvents
  }

  if (activeTab.value === 'saved') {
    return savedEvents
  }

  return visitedEvents
})

const emptyState = computed(() => {
  if (activeTab.value === 'visited') {
    return {
      icon: 'bi bi-check2-circle',
      title: 'Пока нет посещённых событий',
      text: 'Когда ты отметишь участие или посетишь событие, оно появится здесь.',
    }
  }

  if (activeTab.value === 'saved') {
    return {
      icon: 'bi bi-bookmark',
      title: 'Нет сохранённых событий',
      text: 'Сохраняй интересные мероприятия, чтобы быстро вернуться к ним позже.',
    }
  }

  return {
    icon: 'bi bi-calendar-event',
    title: 'Событий пока нет',
    text: 'Создай или добавь первое событие в свой профиль.',
  }
})
</script>

<style scoped>
.qala-profile-page {
  width: 100%;
  min-height: 100vh;
  background: #fff;
}

.qala-profile-shell {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 34px 32px 64px;
}

.qala-profile-header {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 42px;
  align-items: start;
  padding: 12px 0 38px;
  border-bottom: 1px solid #eeeeee;
}

.qala-profile-avatar-wrap {
  width: 172px;
  height: 172px;
  border-radius: 999px;
  padding: 4px;
  background:
    conic-gradient(
      from 180deg,
      #38bdf8,
      #2563eb,
      #7c3aed,
      #06b6d4,
      #38bdf8
    );
}

.qala-profile-avatar {
  width: 100%;
  height: 100%;
  border: 5px solid #fff;
  border-radius: 999px;
  object-fit: cover;
  background: #f3f4f6;
  display: block;
}

.qala-profile-content {
  min-width: 0;
  padding-top: 8px;
}

.qala-profile-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.qala-profile-title {
  min-width: 0;
}

.qala-profile-title h1 {
  margin: 0;
  color: #050505;
  font-size: 34px;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.055em;
}

.qala-profile-title p {
  margin: 7px 0 0;
  color: #737373;
  font-size: 15px;
  font-weight: 750;
}

.qala-profile-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.qala-edit-btn {
  height: 40px;
  padding: 0 17px;
  border: 0;
  border-radius: 10px;
  background: #111;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 850;
  white-space: nowrap;
}

.qala-edit-btn:hover {
  background: #222;
}

.qala-icon-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  background: #fff;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 18px;
  flex-shrink: 0;
}

.qala-icon-btn:hover {
  background: #f7f7f7;
}

.qala-profile-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 34px;
  margin-bottom: 22px;
}

.qala-profile-stat {
  padding: 0;
  border: 0;
  background: transparent;
  color: #111;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  cursor: pointer;
}

.qala-profile-stat strong {
  color: #111;
  font-size: 17px;
  font-weight: 900;
  line-height: 1;
}

.qala-profile-stat span {
  color: #333;
  font-size: 15px;
  font-weight: 600;
}

.qala-profile-stat:hover span {
  color: #111;
}

.qala-profile-about {
  max-width: 760px;
}

.qala-profile-bio {
  margin: 0 0 13px;
  color: #111;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 550;
}

.qala-profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #737373;
}

.qala-profile-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #737373;
  font-size: 13px;
  font-weight: 700;
}

.qala-profile-meta i {
  font-size: 14px;
}

.qala-profile-tabs {
  height: 60px;
  border-bottom: 1px solid #eeeeee;
  display: flex;
  justify-content: center;
  gap: 42px;
  margin-bottom: 26px;
}

.qala-profile-tab {
  position: relative;
  height: 60px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #737373;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.qala-profile-tab::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: transparent;
}

.qala-profile-tab.active {
  color: #111;
}

.qala-profile-tab.active::after {
  background: #111;
}

.qala-profile-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.qala-profile-event {
  position: relative;
  min-width: 0;
  background: #f3f4f6;
  color: inherit;
  text-decoration: none;
  overflow: hidden;
}

.qala-profile-event:hover {
  color: inherit;
}

.qala-profile-event-img-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #f3f4f6;
  overflow: hidden;
}

.qala-profile-event-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.22s ease;
}

.qala-profile-event:hover .qala-profile-event-img {
  transform: scale(1.04);
}

.qala-profile-event-overlay {
  position: absolute;
  inset: 0;
  padding: 14px;
  display: flex;
  align-items: flex-end;
  background: linear-gradient(
    180deg,
    transparent 45%,
    rgba(0, 0, 0, 0.45)
  );
  opacity: 0;
  transition: opacity 0.18s ease;
}

.qala-profile-event:hover .qala-profile-event-overlay {
  opacity: 1;
}

.qala-profile-event-badge {
  height: 29px;
  padding: 0 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #111;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 850;
  backdrop-filter: blur(10px);
}

.qala-profile-empty {
  min-height: 360px;
  border: 1px dashed #e5e5e5;
  border-radius: 26px;
  background: #fafafa;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  padding: 40px 20px;
}

.qala-profile-empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 15px;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 27px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.qala-profile-empty h3 {
  margin: 0 0 7px;
  color: #111;
  font-size: 19px;
  font-weight: 900;
}

.qala-profile-empty p {
  max-width: 360px;
  margin: 0 auto 18px;
  color: #777;
  font-size: 14px;
  line-height: 1.5;
}

.qala-empty-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 14px;
  font-weight: 850;
}

.qala-empty-btn:hover {
  background: #222;
  color: #fff;
}

@media (min-width: 1600px) {
  .qala-profile-shell {
    max-width: 1640px;
  }

  .qala-profile-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (min-width: 1900px) {
  .qala-profile-shell {
    max-width: 1760px;
  }
}

@media (max-width: 1200px) {
  .qala-profile-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* MOBILE */
@media (max-width: 860px) {
  .qala-profile-shell {
    width: 100%;
    max-width: none;
    padding: 16px 0 82px;
  }

  .qala-profile-header {
    display: block;
    padding: 0 20px 24px;
    border-bottom: 1px solid #eeeeee;
  }

  .qala-profile-avatar-wrap {
    width: 92px;
    height: 92px;
    padding: 3px;
    float: left;
    margin: 0 18px 10px 0;
  }

  .qala-profile-avatar {
    border-width: 4px;
  }

  .qala-profile-content {
    min-width: 0;
    padding-top: 2px;
  }

  .qala-profile-top {
    display: block;
    margin-bottom: 14px;
  }

  .qala-profile-title h1 {
    margin: 0;
    font-size: 22px;
    line-height: 1.12;
    letter-spacing: -0.045em;
  }

  .qala-profile-title p {
    margin: 5px 0 0;
    color: #737373;
    font-size: 13px;
    font-weight: 750;
  }

  .qala-profile-actions {
    clear: both;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 42px;
    gap: 8px;
    margin-top: 16px;
  }

  .qala-edit-btn {
    width: 100%;
    height: 40px;
    justify-content: center;
    border-radius: 10px;
  }

  .qala-icon-btn {
    width: 42px;
    height: 40px;
    border-radius: 10px;
  }

  .qala-profile-stats {
    clear: both;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    margin: 18px 0 18px;
    padding: 14px 0;
    border-top: 1px solid #eeeeee;
    border-bottom: 1px solid #eeeeee;
  }

  .qala-profile-stat {
    display: grid;
    justify-items: center;
    gap: 3px;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .qala-profile-stat strong {
    font-size: 17px;
    font-weight: 900;
    line-height: 1;
  }

  .qala-profile-stat span {
    color: #555;
    font-size: 12px;
    font-weight: 650;
  }

  .qala-profile-about {
    clear: both;
    max-width: none;
  }

  .qala-profile-bio {
    margin: 0 0 12px;
    color: #111;
    font-size: 14px;
    line-height: 1.5;
    font-weight: 550;
  }

  .qala-profile-meta {
    display: grid;
    gap: 8px;
    color: #737373;
  }

  .qala-profile-meta span {
    font-size: 13px;
    font-weight: 700;
  }

  .qala-profile-tabs {
    height: 54px;
    justify-content: flex-start;
    gap: 28px;
    overflow-x: auto;
    scrollbar-width: none;
    padding: 0 20px;
    margin-bottom: 4px;
  }

  .qala-profile-tabs::-webkit-scrollbar {
    display: none;
  }

  .qala-profile-tab {
    height: 54px;
    flex: 0 0 auto;
    font-size: 12px;
  }

  .qala-profile-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 3px;
  }

  .qala-profile-event-overlay {
    display: none;
  }

  .qala-profile-event:hover .qala-profile-event-img {
    transform: none;
  }
}

@media (max-width: 420px) {
  .qala-profile-header {
    padding-left: 16px;
    padding-right: 16px;
  }

  .qala-profile-avatar-wrap {
    width: 78px;
    height: 78px;
    margin-right: 14px;
  }

  .qala-profile-title h1 {
    font-size: 20px;
  }

  .qala-profile-title p {
    font-size: 12px;
  }

  .qala-profile-actions {
    grid-template-columns: 1fr 40px;
  }

  .qala-edit-btn,
  .qala-icon-btn {
    height: 38px;
  }

  .qala-icon-btn {
    width: 40px;
  }

  .qala-profile-stats {
    margin-top: 16px;
  }
}
</style>