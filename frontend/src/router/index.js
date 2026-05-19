import { createRouter, createWebHistory } from 'vue-router'

import { useAuth } from '@/composables/useAuth'

import SearchView from '@/views/SearchView.vue'
import EventsView from '@/views/EventsView.vue'
import EventView from '@/views/EventView.vue'
import MapView from '@/views/MapView.vue'
import UserProfileView from '@/views/UserProfileView.vue'
import PlusView from '@/views/PlusView.vue'
import NotificationView from '@/views/NotificationView.vue'
import PublicProfileView from '@/views/PublicProfileView.vue'
import SignUpView from '@/views/SignUpView.vue'

const routes = [
  {
    path: '/sign',
    name: 'sign',
    component: SignUpView,
    meta: {
      title: 'Вход',
      layout: 'auth',
      guestOnly: true,
    },
  },
  {
    path: '/',
    name: 'home',
    component: EventsView,
    meta: {
      title: 'Главная',
      requiresAuth: true,
    },
  },
  {
    path: '/events',
    name: 'events',
    component: EventsView,
    meta: {
      title: 'События',
      requiresAuth: true,
    },
  },
  {
    path: '/events/:id',
    name: 'event',
    component: EventView,
    meta: {
      title: 'Событие',
      requiresAuth: true,
    },
  },
  {
    path: '/search',
    name: 'search',
    component: SearchView,
    meta: {
      title: 'Поиск',
      requiresAuth: true,
    },
  },
  {
    path: '/map',
    name: 'map',
    component: MapView,
    meta: {
      title: 'Карта',
      requiresAuth: true,
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: UserProfileView,
    meta: {
      title: 'Профиль',
      requiresAuth: true,
    },
  },
  {
    path: '/create',
    name: 'create',
    component: PlusView,
    meta: {
      title: 'Создать',
      layout: 'auth',
      requiresAuth: true,
    },
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: NotificationView,
    meta: {
      title: 'Уведомления',
      requiresAuth: true,
    },
  },
  {
    path: '/u/:nickname',
    name: 'public-profile',
    component: PublicProfileView,
    meta: {
      title: 'Профиль',
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return {
      top: 0,
      behavior: 'smooth',
    }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuth()

  document.title = to.meta.title ? `${to.meta.title} · Qala` : 'Qala'

  await auth.initializeAuth()

  const isLoggedIn = auth.isAuthenticated.value

  if (to.meta.requiresAuth && !isLoggedIn) {
    return {
      name: 'sign',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.meta.guestOnly && isLoggedIn) {
    return typeof to.query.redirect === 'string'
      ? to.query.redirect
      : '/'
  }

  return true
})

export default router