<template>
  <aside class="ig-sidebar" aria-label="Главное меню">
    <div class="ig-sidebar-inner">
      <div class="ig-sidebar-content">
        <RouterLink to="/" class="ig-logo" aria-label="Qala">
          <SvgIcon name="instagram" :size="28" />
        </RouterLink>

        <nav class="ig-sidebar-scroll" aria-label="Навигация">
          <RouterLink
            v-for="item in normalizedMenu"
            :key="item.key"
            :to="item.to"
            class="ig-menu-item"
            :class="{ active: item.isActive }"
            :aria-current="item.isActive ? 'page' : undefined"
          >
            <span class="ig-menu-icon">
              <SvgIcon :name="item.currentIcon" :size="24" />

              <span v-if="item.badge" class="ig-badge">
                {{ item.badge }}
              </span>
            </span>

            <span class="ig-menu-text">
              {{ item.title }}
            </span>
          </RouterLink>
        </nav>
      </div>

      <div class="ig-sidebar-actions">
        <button class="ig-menu-item" type="button">
          <span class="ig-menu-icon">
            <SvgIcon name="menu" :size="24" />
          </span>

          <span class="ig-menu-text">Ещё</span>
        </button>

        <button class="ig-menu-item" type="button">
          <span class="ig-menu-icon">
            <SvgIcon name="grid" :size="24" />
          </span>

          <span class="ig-menu-text text-truncate">
            Другие продукты ...
          </span>
        </button>
      </div>
    </div>
  </aside>

  <nav class="ig-mobile-nav" aria-label="Мобильная навигация">
    <RouterLink
      v-for="item in mobileMenu"
      :key="item.key"
      :to="item.to"
      class="ig-mobile-item"
      :class="{ active: item.isActive }"
      :aria-label="item.title"
      :aria-current="item.isActive ? 'page' : undefined"
    >
      <SvgIcon :name="item.currentIcon" :size="30" />

      <span v-if="item.badge" class="ig-mobile-badge">
        {{ item.badge }}
      </span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SvgIcon from './SvgIcon.vue'

const MOBILE_ICON_ORDER = [
  'home',
  'search',
  'plus',
  'heart',
  'user-circle',
]

const route = useRoute()

const props = defineProps({
  menu: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const isActivePath = (item) => {
  if (!item.to) return false

  const currentPath = normalizePath(route.path)
  const targetPath = normalizePath(item.to)

  if (item.exact) {
    return currentPath === targetPath
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

const normalizePath = (path) => {
  if (!path || path === '/') return '/'

  return String(path).replace(/\/+$/, '')
}

const normalizedMenu = computed(() => {
  return props.menu
    .filter((item) => item?.title && item?.icon)
    .map((item) => {
      const isActive = isActivePath(item)

      return {
        ...item,
        to: item.to || '/',
        key: item.key || item.name || item.title,
        isActive,
        currentIcon: isActive && item.activeIcon ? item.activeIcon : item.icon,
      }
    })
})

const mobileMenu = computed(() => {
  return MOBILE_ICON_ORDER
    .map((icon) => normalizedMenu.value.find((item) => item.icon === icon))
    .filter(Boolean)
})
</script>

<style scoped>
.ig-sidebar {
  --sidebar-width: 220px;
  --sidebar-collapsed-width: 72px;
  --sidebar-padding-x: 13px;
  --sidebar-padding-top: 26px;
  --sidebar-padding-bottom: 22px;
  --item-height: 45px;
  --item-radius: 8px;
  --item-gap: 15px;
  --icon-width: 46px;
  --menu-gap: 16px;
  --color-text: #111;
  --color-hover: #f7f7f7;
  --color-border: #ededed;
  --color-badge: #ff3040;

  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar-width);
  background: #fff;
  z-index: 100;
  overflow: hidden;
  transition: width 0.22s ease;
}

.ig-sidebar-inner {
  width: var(--sidebar-width);
  height: 100%;
  min-height: 0;
  padding: var(--sidebar-padding-top) var(--sidebar-padding-x)
    var(--sidebar-padding-bottom);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ig-sidebar-content {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ig-logo {
  width: var(--icon-width);
  min-width: var(--icon-width);
  height: var(--icon-width);
  margin-bottom: 22px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--color-text);
  text-decoration: none;
}

.ig-sidebar-scroll {
  min-height: 0;
  flex: 1;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: var(--menu-gap);
  overflow: hidden auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.ig-sidebar:hover .ig-sidebar-scroll {
  scrollbar-color: #cfcfcf transparent;
}

.ig-sidebar-scroll::-webkit-scrollbar {
  width: 5px;
}

.ig-sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.ig-sidebar-scroll::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
}

.ig-sidebar:hover .ig-sidebar-scroll::-webkit-scrollbar-thumb {
  background: #d1d1d1;
}

.ig-sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: #b8b8b8;
}

.ig-sidebar-actions {
  padding-top: 18px;
  display: flex;
  flex-direction: column;
  gap: var(--menu-gap);
  flex-shrink: 0;
}

.ig-menu-item {
  width: 100%;
  height: var(--item-height);
  padding: 0;
  border: 0;
  border-radius: var(--item-radius);
  background: transparent;
  color: #000;
  display: flex;
  align-items: center;
  gap: var(--item-gap);
  font-size: 16px;
  line-height: 1.2;
  white-space: nowrap;
  text-align: left;
  text-decoration: none;
}

.ig-menu-item:hover {
  background: var(--color-hover);
  color: #000;
}

.ig-menu-item.active {
  font-weight: 700;
}

.ig-menu-icon {
  position: relative;
  width: var(--icon-width);
  min-width: var(--icon-width);
  height: var(--item-height);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--color-text);
}

.ig-menu-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.ig-badge,
.ig-mobile-badge {
  min-width: 19px;
  height: 19px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--color-badge);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.ig-badge {
  position: absolute;
  top: 4px;
  right: 4px;
}

.ig-mobile-nav {
  display: none;
}

@media (max-height: 760px) {
  .ig-sidebar {
    --sidebar-padding-top: 20px;
    --sidebar-padding-bottom: 18px;
    --menu-gap: 10px;
  }

  .ig-logo {
    margin-bottom: 16px;
  }

  .ig-sidebar-actions {
    padding-top: 12px;
  }
}

@media (max-height: 640px) {
  .ig-sidebar {
    --item-height: 42px;
    --menu-gap: 6px;
  }
}

@media (min-width: 861px) and (max-width: 1199px) {
  .ig-sidebar {
    width: var(--sidebar-collapsed-width);
  }

  .ig-sidebar:hover {
    width: var(--sidebar-width);
  }

  .ig-menu-text {
    opacity: 0;
    transform: translateX(-6px);
    pointer-events: none;
  }

  .ig-sidebar:hover .ig-menu-text {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }
}

@media (max-width: 860px) {
  .ig-sidebar {
    display: none;
  }

  .ig-mobile-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: calc(56px + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: #fff;
    border-top: 0.1px solid #ededed;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    align-items: center;
    z-index: 200;
  }

  .ig-mobile-item {
    position: relative;
    width: 100%;
    height: 56px;
    border: 0;
    padding: 0;
    background: transparent;
    color: #111;
    display: grid;
    place-items: center;
    text-decoration: none;
  }

  .ig-mobile-item.active {
    color: #000;
  }

  .ig-mobile-item.active :deep(.svg-icon) {
    transform: scale(1.03);
  }

  .ig-mobile-badge {
    position: absolute;
    top: 9px;
    left: 50%;
    min-width: 18px;
    height: 18px;
    margin-left: 7px;
    padding: 0 5px;
    font-size: 10px;
  }
}
</style>