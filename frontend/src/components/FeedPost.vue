<template>
  <section class="qala-events-feed">
    <article
      v-for="event in events"
      :key="event.id"
      class="qala-event-card"
    >
      <div class="qala-event-cover">
        <img :src="event.image || placeholderImage" :alt="event.title" />

        <div class="qala-cover-overlay"></div>

        <div class="qala-date-badge">
          <strong>{{ event.day }}</strong>
          <span>{{ event.month }}</span>
        </div>

        <div class="qala-status-badge">
          <i :class="event.statusIcon"></i>
          <span>{{ event.badge }}</span>
        </div>
      </div>

      <div class="qala-event-body">
        <div class="qala-event-header">
          <div class="qala-avatar">
            <img :src="event.avatar || placeholderAvatar" :alt="event.organizer" />
          </div>

          <div class="qala-author">
            <div class="qala-author-name">
              {{ event.organizer }}
            </div>

            <div class="qala-author-location">
              {{ event.city }}, {{ event.address }}
            </div>
          </div>

          <button class="qala-more-btn" type="button" aria-label="More">
            <i class="bi bi-three-dots"></i>
          </button>
        </div>

        <h3 class="qala-event-title">
          {{ event.title }}
        </h3>

        <div class="qala-event-tags">
          <span
            v-for="category in event.categories"
            :key="category"
            class="qala-event-tag"
          >
            {{ category }}
          </span>
        </div>

        <div class="qala-event-info">
          <div class="qala-info-row">
            <i class="bi bi-calendar3"></i>
            <span>{{ event.date }}</span>
          </div>

          <div class="qala-info-row">
            <i class="bi bi-clock"></i>
            <span>{{ event.time }}</span>
          </div>

          <div class="qala-info-row">
            <i class="bi bi-geo-alt"></i>
            <span>{{ event.place }}</span>
          </div>
        </div>

        <p class="qala-event-description">
          {{ event.description }}
        </p>

        <div class="qala-hashtags">
          <span
            v-for="tag in event.tags"
            :key="tag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>

      <footer class="qala-event-footer">
        <div class="qala-stats">
          <span>
            <i class="bi bi-eye"></i>
            {{ event.views }}
          </span>

          <span>
            <i class="bi bi-people"></i>
            {{ event.members }}
          </span>
        </div>

        <div class="qala-actions">
          <button class="qala-primary-btn" type="button">
            <span>Пойду</span>
          </button>

          <button class="qala-secondary-btn" type="button">
            <i class="bi bi-map"></i>
            <span>Маршрут</span>
          </button>

          <button class="qala-icon-btn" type="button" aria-label="Save">
            <i class="bi bi-bookmark"></i>
          </button>
        </div>
      </footer>
    </article>
  </section>
</template>

<script setup>
const placeholderAvatar =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'

const placeholderImage =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80'

const events = [
  {
    id: 1,
    organizer: 'Сейчас кофейня',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    city: 'Караганда',
    address: 'ул. Гоголя, 33',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
    badge: 'Сейчас идет',
    statusIcon: 'bi bi-broadcast',
    title: 'Живая музыка в кофейне',
    categories: ['Концерты', 'Бесплатно'],
    date: 'Сегодня, 24 мая',
    time: '18:00 – 20:00',
    place: 'Кофейня «Сейчас»',
    description:
      'Уютный вечер с живой музыкой, авторскими напитками и теплой атмосферой. Приходите отдохнуть после рабочего дня.',
    tags: ['живаямузыка', 'кофейня', 'вечер'],
    day: '24',
    month: 'мая',
    views: '1.2K',
    members: '134 идут',
  },
  {
    id: 2,
    organizer: 'Clay House',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    city: 'Караганда',
    address: 'ул. Алиханова, 21',
    image:
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80',
    badge: 'Сегодня',
    statusIcon: 'bi bi-calendar-check',
    title: 'Мастер-класс по керамике',
    categories: ['Мастер-классы', 'Платно'],
    date: 'Сегодня, 24 мая',
    time: '14:00 – 16:00',
    place: 'Гончарная мастерская Clay House',
    description:
      'Создайте свою керамическую кружку под руководством мастера. Все материалы входят в стоимость.',
    tags: ['керамика', 'творчество', 'руками'],
    day: '24',
    month: 'мая',
    views: '856',
    members: '42 идут',
  },
  {
    id: 3,
    organizer: 'Киномакс Караганда',
    avatar:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80',
    city: 'Караганда',
    address: 'пр. Назарбаева, 50',
    image:
      'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=900&q=80',
    badge: 'Скоро',
    statusIcon: 'bi bi-clock',
    title: 'Бесплатный кинопоказ',
    categories: ['Кино', 'Бесплатно'],
    date: 'Завтра, 25 мая',
    time: '20:30',
    place: 'Открытая площадка Киномакс',
    description:
      'Вечерний кинопоказ на большом экране под открытым небом. Берите пледы и друзей.',
    tags: ['кино', 'openair', 'вечер'],
    day: '25',
    month: 'мая',
    views: '2.4K',
    members: '318 идут',
  },
]
</script>

<style scoped>
.qala-events-feed {
  width: 100%;
  display: grid;
  gap: 18px;
}

.qala-event-card {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.qala-event-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #f1f5f9;
  overflow: hidden;
}

.qala-event-cover img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.qala-cover-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      rgba(15, 23, 42, 0.02) 0%,
      rgba(15, 23, 42, 0.08) 48%,
      rgba(15, 23, 42, 0.44) 100%
    ),
    linear-gradient(
      135deg,
      rgba(56, 189, 248, 0.16) 0%,
      rgba(37, 99, 235, 0.12) 40%,
      rgba(124, 58, 237, 0.16) 75%,
      rgba(6, 182, 212, 0.12) 100%
    );
  pointer-events: none;
}

.qala-date-badge {
  position: absolute;
  left: 14px;
  top: 14px;
  width: 58px;
  height: 64px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.14);
}

.qala-date-badge strong {
  font-size: 25px;
  line-height: 26px;
  font-weight: 900;
}

.qala-date-badge span {
  color: #64748b;
  font-size: 13px;
  line-height: 16px;
  font-weight: 700;
}

.qala-status-badge {
  position: absolute;
  left: 14px;
  bottom: 14px;
  height: 31px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 750;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.qala-event-body {
  padding: 15px 16px 13px;
}

.qala-event-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.qala-avatar {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 50%;
  overflow: hidden;
  background: #e2e8f0;
}

.qala-avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.qala-author {
  min-width: 0;
  flex: 1;
}

.qala-author-name {
  color: #0f172a;
  font-size: 14px;
  line-height: 18px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qala-author-location {
  color: #64748b;
  font-size: 12.5px;
  line-height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qala-more-btn {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #64748b;
  display: grid;
  place-items: center;
}

.qala-more-btn:hover {
  background: #f1f5f9;
}

.qala-more-btn i {
  font-size: 18px;
}

.qala-event-title {
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 22px;
  line-height: 1.16;
  font-weight: 900;
  letter-spacing: -0.35px;
}

.qala-event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 13px;
}

.qala-event-tag {
  height: 27px;
  padding: 0 11px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  display: inline-flex;
  align-items: center;
  font-size: 12.5px;
  font-weight: 800;
}

.qala-event-tag:first-child {
  background: #eff6ff;
  color: #2563eb;
}

.qala-event-info {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}

.qala-info-row {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  color: #334155;
  font-size: 14px;
  line-height: 18px;
  font-weight: 600;
}

.qala-info-row i {
  width: 17px;
  min-width: 17px;
  color: #2563eb;
  font-size: 15px;
  text-align: center;
}

.qala-info-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qala-event-description {
  margin: 0;
  color: #334155;
  font-size: 14px;
  line-height: 1.45;
}

.qala-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 11px;
}

.qala-hashtags span {
  color: #2563eb;
  font-size: 13px;
  line-height: 17px;
  font-weight: 700;
}

.qala-event-footer {
  min-height: 58px;
  padding: 10px 16px;
  border-top: 1px solid #eef2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.qala-stats {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.qala-stats span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.qala-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qala-primary-btn,
.qala-secondary-btn,
.qala-icon-btn {
  height: 37px;
  border: 0;
  border-radius: 11px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 13.5px;
  line-height: 1;
  font-weight: 800;
}

.qala-primary-btn {
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.2);
}

.qala-secondary-btn {
  background: #eff6ff;
  color: #2563eb;
}

.qala-icon-btn {
  width: 37px;
  padding: 0;
  background: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.qala-primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.25);
}

.qala-secondary-btn:hover,
.qala-icon-btn:hover {
  background: #e0f2fe;
}

.qala-primary-btn,
.qala-secondary-btn,
.qala-icon-btn {
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

@media (max-width: 620px) {
  .qala-event-card {
    max-width: 100%;
    border-left: 0;
    border-right: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .qala-event-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .qala-actions {
    width: 100%;
  }

  .qala-primary-btn,
  .qala-secondary-btn {
    flex: 1;
  }

  .qala-icon-btn {
    min-width: 37px;
  }
}

@media (max-width: 420px) {
  .qala-event-body {
    padding: 14px 12px 12px;
  }

  .qala-event-footer {
    padding: 10px 12px;
  }

  .qala-event-title {
    font-size: 20px;
  }

  .qala-info-row span {
    white-space: normal;
  }
}
</style>