<template>
  <div class="ig-shell">
    <section class="ig-feed">
      <StoriesBar :stories="stories" />
      <FeedPost :post="post" />
    </section>

    <RightSidebar
      :profile="profile"
      :suggestions="suggestions"
    />
  </div>
</template>

<script setup>
import StoriesBar from '@/components/StoriesBar.vue'
import FeedPost from '@/components/FeedPost.vue'
import RightSidebar from '@/components/RightSidebar.vue'

import {
  stories,
  post,
  profile,
  suggestions,
} from '@/data/instagramData'
</script>

<style scoped>
.ig-shell {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding-top: 24px;
  display: grid;
  grid-template-columns: 620px 300px;
  column-gap: 62px;
  align-items: start;
}

.ig-feed {
  min-width: 0;
}

@media (max-width: 1180px) {
  .ig-shell {
    grid-template-columns: 620px;
    max-width: 620px;
  }
}

@media (max-width: 860px) {
  .ig-shell {
    width: 100%;
    max-width: 460px;
    grid-template-columns: minmax(0, 1fr);
    padding-top: 18px;
    padding-left: 0;
    padding-right: 0;
    margin: 0 auto;
  }

  .ig-feed {
    width: 100%;
    max-width: 460px;
    min-width: 0;
    overflow-x: hidden;
  }
}
</style>