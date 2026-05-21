<template>
  <div class="qala-event-hero">
    <img
      v-if="image"
      :src="image"
      :alt="title"
      class="qala-event-hero-img"
      loading="eager"
      decoding="async"
    />

    <div v-else class="qala-event-hero-empty">
      <img
        src="/event.png"
        :alt="title"
        class="qala-event-hero-img"
        loading="eager"
        decoding="async"
      />
    </div>

    <div class="qala-event-hero-overlay">
      <span class="qala-event-category">
        {{ category }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  image: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: 'Событие',
  },
  category: {
    type: String,
    default: 'Категория',
  },
})
</script>

<style scoped>
.qala-event-hero {
  position: relative;
  width: 100%;
  height: 360px;
  border-radius: 28px;
  background: #f3f4f6;
  overflow: hidden;
  margin-bottom: 24px;
}

.qala-event-hero-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
}

.qala-event-hero-empty {
  width: 100%;
  height: 100%;
}

.qala-event-hero-overlay {
  position: absolute;
  left: 18px;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2;
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

@media (min-width: 1600px) {
  .qala-event-hero {
    height: 460px;
  }
}

@media (min-width: 1900px) {
  .qala-event-hero {
    height: 480px;
  }
}

@media (min-width: 861px) and (max-width: 1199px) {
  .qala-event-hero {
    height: 300px;
  }
}

@media (max-width: 860px) {
  .qala-event-hero {
    height: auto;
    aspect-ratio: 16 / 9;
    border-radius: 22px;
    margin-bottom: 20px;
  }
}
</style>