<template>
  <div class="ig-stories">
    <div
      v-for="story in stories"
      :key="story.username"
      class="ig-story"
    >
      <button class="ig-story-button">
        <span class="ig-story-ring">
          <span class="ig-story-inner">
            <img :src="story.avatar" :alt="story.username" />
          </span>
        </span>
      </button>

      <div class="ig-story-name">
        {{ story.username }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stories: {
    type: Array,
    required: true,
  },
})
</script>

<style scoped>
.ig-stories {
  width: 620px;
  height: 116px;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  overflow: hidden;
  padding-left: 0;
  margin-bottom: 1rem;
}

.ig-story {
  width: 80px;
  min-width: 80px;
  text-align: center;
}

.ig-story-button {
  width: 80px;
  height: 80px;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.ig-story-ring {
  width: 80px;
  height: 80px;
  padding: 3px;
  display: block;
  border-radius: 50%;
  background: conic-gradient(
  from 180deg,
  #38bdf8,
  #2563eb,
  #7c3aed,
  #06b6d4,
  #38bdf8
);
  position: relative;
}

.ig-story-ring::before {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background:
    conic-gradient(
      from 180deg,
      #00f5ff,
      #7c3aed,
      #ff2bd6,
      #ffb703,
      #39ff14,
      #00f5ff
    );
  filter: blur(8px);
  opacity: 0.45;
  z-index: -1;
}

.ig-story-inner {
  width: 100%;
  height: 100%;
  display: block;
  padding: 3px;
  border-radius: 50%;
  background: #fff;
}

.ig-story-inner img {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.ig-story-name {
  width: 80px;
  margin-top: 0.2rem;
  font-size: 13px;
  line-height: 17px;
  color: #262626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 860px) {
  .ig-stories {
    width: 100%;
    max-width: 460px;
    padding: 0 0.5rem;
    gap: 1rem;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .ig-stories::-webkit-scrollbar {
    display: none;
  }

  .ig-story {
    width: 80px;
    min-width: 80px;
  }

  .ig-story-button,
  .ig-story-ring {
    width: 80px;
    height: 80px;
  }

  .ig-story-name {
    width: 80px;
    font-size: 13px;
  }
}
</style>