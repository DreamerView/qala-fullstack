<template>
  <div class="qala-notifications-page">
    <div class="qala-notifications-shell">
      <header class="qala-notifications-header">
        <div>
          <h1>Уведомления</h1>
          <p>Активность по событиям, подпискам и рекомендациям</p>
        </div>

        <button
          type="button"
          class="qala-header-btn"
          @click="markAllAsRead"
        >
          <i class="bi bi-check2-all"></i>
          <span>Прочитать всё</span>
        </button>
      </header>

      <section class="qala-notification-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="qala-notification-tab"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}

          <span v-if="tab.count">
            {{ tab.count }}
          </span>
        </button>
      </section>

      <section v-if="groupedNotifications.length" class="qala-notification-list">
        <div
          v-for="group in groupedNotifications"
          :key="group.title"
          class="qala-notification-group"
        >
          <h2>{{ group.title }}</h2>

          <div class="qala-notification-items">
            <article
              v-for="item in group.items"
              :key="item.id"
              class="qala-notification-item"
              :class="{ unread: !item.read }"
            >
              <RouterLink
                :to="item.to"
                class="qala-notification-avatar-wrap"
              >
                <img
                  :src="item.avatar"
                  :alt="item.name"
                  class="qala-notification-avatar"
                />

                <span class="qala-notification-type">
                  <i :class="item.icon"></i>
                </span>
              </RouterLink>

              <div class="qala-notification-content">
                <RouterLink :to="item.to" class="qala-notification-text">
                  <strong>{{ item.name }}</strong>
                  <span>{{ item.text }}</span>
                </RouterLink>

                <div class="qala-notification-meta">
                  <span>{{ item.time }}</span>
                  <span v-if="item.category">{{ item.category }}</span>
                </div>

                <div
                  v-if="item.actions?.length"
                  class="qala-notification-actions"
                >
                  <button
                    v-for="action in item.actions"
                    :key="action.label"
                    type="button"
                    class="qala-action-btn"
                    :class="action.variant"
                    @click="handleAction(item, action)"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </div>

              <RouterLink
                v-if="item.preview"
                :to="item.to"
                class="qala-notification-preview"
              >
                <img
                  :src="item.preview"
                  :alt="item.previewAlt || item.name"
                />
              </RouterLink>

              <button
                type="button"
                class="qala-notification-more"
                aria-label="Действия"
                @click="toggleRead(item.id)"
              >
                <i
                  class="bi"
                  :class="item.read ? 'bi-circle' : 'bi-circle-fill'"
                ></i>
              </button>
            </article>
          </div>
        </div>
      </section>

      <section v-else class="qala-empty-state">
        <div class="qala-empty-icon">
          <i class="bi bi-bell"></i>
        </div>

        <h3>Уведомлений пока нет</h3>

        <p>
          Когда появятся новые события, подписки или приглашения — они будут здесь.
        </p>

        <RouterLink to="/events" class="qala-empty-btn">
          Смотреть события
        </RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const activeTab = ref('all')

const notifications = ref([
  {
    id: 1,
    group: 'Сегодня',
    type: 'invite',
    read: false,
    name: 'Qala Events',
    text: 'приглашает тебя на Музыкальный вечер Qala Live',
    time: '5 минут назад',
    category: 'Концерты',
    avatar:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=300&auto=format&fit=crop',
    preview:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=500&auto=format&fit=crop',
    previewAlt: 'Музыкальный вечер Qala Live',
    icon: 'bi bi-calendar-plus',
    to: '/events/1',
    actions: [
      {
        label: 'Посмотреть',
        variant: 'primary',
      },
      {
        label: 'Скрыть',
        variant: 'secondary',
      },
    ],
  },
  {
    id: 2,
    group: 'Сегодня',
    type: 'like',
    read: false,
    name: 'Алина',
    text: 'сохранила твоё событие Frontend Meetup Karaganda',
    time: '18 минут назад',
    category: 'Образование',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
    preview:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=500&auto=format&fit=crop',
    previewAlt: 'Frontend Meetup Karaganda',
    icon: 'bi bi-bookmark-heart',
    to: '/events/2',
  },
  {
    id: 3,
    group: 'Сегодня',
    type: 'follow',
    read: true,
    name: 'Karaganda IT Community',
    text: 'начал следить за твоими событиями',
    time: '1 час назад',
    category: 'Подписка',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
    icon: 'bi bi-person-plus',
    to: '/profile',
    actions: [
      {
        label: 'Подписаться',
        variant: 'primary',
      },
    ],
  },
  {
    id: 4,
    group: 'Вчера',
    type: 'event',
    read: true,
    name: 'Qala Sport',
    text: 'добавил новое событие: Городской забег',
    time: 'Вчера, 19:40',
    category: 'Спорт',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop',
    preview:
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=500&auto=format&fit=crop',
    previewAlt: 'Городской забег',
    icon: 'bi bi-calendar-event',
    to: '/events/3',
  },
  {
    id: 5,
    group: 'Вчера',
    type: 'reminder',
    read: false,
    name: 'Напоминание',
    text: 'событие Startup Talks начнётся завтра в 17:00',
    time: 'Вчера, 12:15',
    category: 'Бизнес',
    avatar:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=300&auto=format&fit=crop',
    preview:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=500&auto=format&fit=crop',
    previewAlt: 'Startup Talks',
    icon: 'bi bi-alarm',
    to: '/events/4',
    actions: [
      {
        label: 'Открыть',
        variant: 'primary',
      },
      {
        label: 'Не напоминать',
        variant: 'secondary',
      },
    ],
  },
  {
    id: 6,
    group: 'На этой неделе',
    type: 'recommendation',
    read: true,
    name: 'Qala',
    text: 'подобрала для тебя арт-выставки и бесплатные мастер-классы',
    time: '3 дня назад',
    category: 'Рекомендация',
    avatar:
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=300&auto=format&fit=crop',
    preview:
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=500&auto=format&fit=crop',
    previewAlt: 'Бесплатный мастер-класс по дизайну',
    icon: 'bi bi-stars',
    to: '/events',
  },
])

const tabs = computed(() => {
  const unreadCount = notifications.value.filter((item) => !item.read).length
  const inviteCount = notifications.value.filter((item) => item.type === 'invite').length
  const eventCount = notifications.value.filter((item) => {
    return item.type === 'event' || item.type === 'reminder'
  }).length

  return [
    {
      label: 'Все',
      value: 'all',
      count: notifications.value.length,
    },
    {
      label: 'Новые',
      value: 'unread',
      count: unreadCount,
    },
    {
      label: 'Приглашения',
      value: 'invite',
      count: inviteCount,
    },
    {
      label: 'События',
      value: 'event',
      count: eventCount,
    },
  ]
})

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') {
    return notifications.value
  }

  if (activeTab.value === 'unread') {
    return notifications.value.filter((item) => !item.read)
  }

  if (activeTab.value === 'event') {
    return notifications.value.filter((item) => {
      return item.type === 'event' || item.type === 'reminder'
    })
  }

  return notifications.value.filter((item) => item.type === activeTab.value)
})

const groupedNotifications = computed(() => {
  const groups = []

  filteredNotifications.value.forEach((item) => {
    const group = groups.find((current) => current.title === item.group)

    if (group) {
      group.items.push(item)
      return
    }

    groups.push({
      title: item.group,
      items: [item],
    })
  })

  return groups
})

const markAllAsRead = () => {
  notifications.value = notifications.value.map((item) => ({
    ...item,
    read: true,
  }))
}

const toggleRead = (id) => {
  notifications.value = notifications.value.map((item) => {
    if (item.id !== id) {
      return item
    }

    return {
      ...item,
      read: !item.read,
    }
  })
}

const handleAction = (item, action) => {
  if (action.label === 'Скрыть' || action.label === 'Не напоминать') {
    notifications.value = notifications.value.filter((notification) => {
      return notification.id !== item.id
    })

    return
  }

  item.read = true
}
</script>

<style scoped>
.qala-notifications-page {
  width: 100%;
  min-height: 100vh;
  background: #fff;
}

.qala-notifications-shell {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 28px 32px 56px;
}

.qala-notifications-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.qala-notifications-header h1 {
  margin: 0;
  color: #050505;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.qala-notifications-header p {
  margin: 7px 0 0;
  color: #737373;
  font-size: 15px;
  font-weight: 500;
}

.qala-header-btn {
  height: 42px;
  padding: 0 15px;
  border: 1px solid #eeeeee;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 850;
  white-space: nowrap;
}

.qala-header-btn:hover {
  background: #f7f7f7;
}

.qala-notification-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 18px;
  margin-bottom: 4px;
  scrollbar-width: none;
}

.qala-notification-tabs::-webkit-scrollbar {
  display: none;
}

.qala-notification-tab {
  flex: 0 0 auto;
  height: 37px;
  padding: 0 14px;
  border: 1px solid #eeeeee;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 800;
}

.qala-notification-tab.active {
  border-color: #111;
  background: #111;
  color: #fff;
}

.qala-notification-tab span {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 900;
}

.qala-notification-tab.active span {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.qala-notification-list {
  width: 100%;
  display: grid;
  gap: 24px;
}

.qala-notification-group {
  width: 100%;
}

.qala-notification-group h2 {
  margin: 0 0 12px;
  color: #111;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.qala-notification-items {
  width: 100%;
  display: grid;
  gap: 8px;
}

.qala-notification-item {
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) 132px 28px;
  gap: 15px;
  align-items: center;
  padding: 14px;
  border: 1px solid transparent;
  border-radius: 22px;
  background: #fff;
}

.qala-notification-item:hover {
  background: #fafafa;
}

.qala-notification-item.unread {
  border-color: #eeeeee;
  background: #fbfbfb;
}

.qala-notification-item.unread::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 50%;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #2563eb;
  transform: translateY(-50%);
}

.qala-notification-avatar-wrap {
  position: relative;
  width: 58px;
  height: 58px;
  color: inherit;
  text-decoration: none;
}

.qala-notification-avatar {
  width: 58px;
  height: 58px;
  border-radius: 999px;
  object-fit: cover;
  background: #f3f4f6;
  display: block;
}

.qala-notification-type {
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 24px;
  height: 24px;
  border: 3px solid #fff;
  border-radius: 999px;
  background: #111;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 11px;
}

.qala-notification-content {
  min-width: 0;
}

.qala-notification-text {
  color: #111;
  text-decoration: none;
  font-size: 15px;
  line-height: 1.45;
}

.qala-notification-text:hover {
  color: #111;
}

.qala-notification-text strong {
  font-weight: 900;
}

.qala-notification-text span {
  margin-left: 4px;
  color: #333;
  font-weight: 500;
}

.qala-notification-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
  color: #8a8a8a;
  font-size: 12px;
  font-weight: 650;
}

.qala-notification-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
}

.qala-action-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 850;
}

.qala-action-btn.primary {
  border: 0;
  background: #111;
  color: #fff;
}

.qala-action-btn.secondary {
  border: 1px solid #eeeeee;
  background: #fff;
  color: #111;
}

.qala-action-btn.secondary:hover {
  background: #f7f7f7;
}

.qala-notification-preview {
  width: 132px;
  height: 86px;
  border-radius: 18px;
  overflow: hidden;
  background: #f3f4f6;
  color: inherit;
  text-decoration: none;
}

.qala-notification-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.qala-notification-more {
  width: 28px;
  height: 28px;
  border: 0;
  background: transparent;
  color: #2563eb;
  display: grid;
  place-items: center;
  font-size: 10px;
}

.qala-notification-more .bi-circle {
  color: #d1d5db;
  font-size: 14px;
}

.qala-empty-state {
  min-height: 360px;
  border: 1px dashed #e5e5e5;
  border-radius: 24px;
  background: #fafafa;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  padding: 36px 20px;
}

.qala-empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 15px;
  border-radius: 999px;
  background: #fff;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 28px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.qala-empty-state h3 {
  margin: 0 0 7px;
  color: #111;
  font-size: 19px;
  font-weight: 900;
}

.qala-empty-state p {
  max-width: 340px;
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

/* LARGE DESKTOP / 4K */
@media (min-width: 1800px) {
  .qala-notifications-shell {
    max-width: 1640px;
  }

  .qala-notification-item {
    grid-template-columns: 62px minmax(0, 1fr) 150px 30px;
  }

  .qala-notification-avatar-wrap,
  .qala-notification-avatar {
    width: 62px;
    height: 62px;
  }

  .qala-notification-preview {
    width: 150px;
    height: 94px;
  }
}

/* ULTRA WIDE / 8K */
@media (min-width: 2400px) {
  .qala-notifications-shell {
    max-width: 1760px;
  }

  .qala-notification-item {
    grid-template-columns: 64px minmax(0, 1fr) 168px 30px;
  }

  .qala-notification-avatar-wrap,
  .qala-notification-avatar {
    width: 64px;
    height: 64px;
  }

  .qala-notification-preview {
    width: 168px;
    height: 104px;
  }
}

/* TABLET */
@media (min-width: 861px) and (max-width: 1199px) {
  .qala-notifications-shell {
    padding: 24px 24px 56px;
  }

  .qala-notification-item {
    grid-template-columns: 54px minmax(0, 1fr) 96px 26px;
    gap: 13px;
    padding: 12px;
    border-radius: 20px;
  }

  .qala-notification-avatar-wrap,
  .qala-notification-avatar {
    width: 54px;
    height: 54px;
  }

  .qala-notification-preview {
    width: 96px;
    height: 72px;
    border-radius: 16px;
  }

  .qala-notification-text {
    font-size: 14px;
  }
}

/* MOBILE */
@media (max-width: 860px) {
  .qala-notifications-page {
    width: 100%;
    overflow-x: hidden;
  }

  .qala-notifications-shell {
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 18px 14px 82px;
  }

  .qala-notifications-header {
    align-items: center;
    margin-bottom: 18px;
  }

  .qala-notifications-header h1 {
    font-size: 25px;
  }

  .qala-notifications-header p {
    font-size: 14px;
  }

  .qala-header-btn {
    width: 42px;
    padding: 0;
    justify-content: center;
  }

  .qala-header-btn span {
    display: none;
  }

  .qala-notification-list,
  .qala-notification-group,
  .qala-notification-items {
    width: 100%;
  }

  .qala-notification-item {
    width: 100%;
    grid-template-columns: 50px minmax(0, 1fr) 58px;
    gap: 11px;
    padding: 10px;
    border-radius: 18px;
  }

  .qala-notification-avatar-wrap,
  .qala-notification-avatar {
    width: 50px;
    height: 50px;
  }

  .qala-notification-preview {
    width: 58px;
    height: 58px;
    border-radius: 14px;
  }

  .qala-notification-more {
    position: absolute;
    right: 8px;
    top: 8px;
  }

  .qala-notification-text {
    font-size: 13px;
  }

  .qala-notification-actions {
    gap: 6px;
  }

  .qala-action-btn {
    height: 31px;
    padding: 0 10px;
    font-size: 12px;
  }
}

@media (max-width: 420px) {
  .qala-notifications-shell {
    width: 100%;
    max-width: none;
    padding-left: 12px;
    padding-right: 12px;
  }

  .qala-notification-item {
    grid-template-columns: 46px minmax(0, 1fr);
  }

  .qala-notification-avatar-wrap,
  .qala-notification-avatar {
    width: 46px;
    height: 46px;
  }

  .qala-notification-preview {
    grid-column: 2 / -1;
    width: 100%;
    height: 130px;
    margin-top: 4px;
  }

  .qala-notification-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .qala-action-btn {
    width: 100%;
  }
}
</style>