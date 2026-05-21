<template>
  <section class="qala-related-section">
    <div class="qala-related-head">
      <h2>Похожие события</h2>

      <RouterLink to="/events">
        Все события
      </RouterLink>
    </div>

    <div class="qala-related-grid">
      <RouterLink
        v-for="item in items"
        :key="item.id"
        :to="`/events/${item.id}`"
        class="qala-related-card"
      >
        <img
          :src="item.image"
          :alt="item.title"
          loading="lazy"
          decoding="async"
        />

        <div>
          <span>{{ item.category }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.date }}</p>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
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

@media (max-width: 860px) {
  .qala-related-grid {
    grid-template-columns: 1fr;
  }

  .qala-related-card {
    width: 100%;
  }
}
</style>