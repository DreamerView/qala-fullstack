<template>
  <Teleport to="body">
    <QalaMapModal />
    <LocationPickerModal />
  </Teleport>

  <div class="ig-app">
    <InstagramSidebar :menu="menu" />

    <main class="ig-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import InstagramSidebar from '@/components/InstagramSidebar.vue'
import QalaMapModal from '@/components/modal/QalaMapModal.vue'
import LocationPickerModal from '../components/global/LocationPickerModal.vue';

import { menu } from '@/data/instagramData'
</script>

<style scoped>
.ig-app {
  min-height: 100vh;
  background: var(--app-bg);
}

.ig-main {
  min-height: 100vh;
  margin-left: var(--sidebar-width-open);
  width: calc(100% - var(--sidebar-width-open));
  overflow-x: clip;
  transition:
    margin-left var(--transition-fast),
    width var(--transition-fast);
}

@media (min-width: 861px) and (max-width: 1199px) {
  .ig-main {
    margin-left: var(--sidebar-width-compact);
    width: calc(100% - var(--sidebar-width-compact));
  }
}

@media (max-width: 860px) {
  .ig-main {
    width: 100%;
    margin-left: 0;
    padding-bottom: var(--mobile-nav-height);
    overflow-x: clip;
  }
}
</style>