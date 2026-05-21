<template>
  <section class="qala-section">
    <h2>Программа</h2>

    <div class="qala-program-list">
      <div
        v-for="item in items"
        :key="item.id"
        class="qala-program-item"
      >
        <div class="qala-program-time">
          {{ item.time }}
        </div>

        <div class="qala-program-info">
          <h3>{{ item.title }}</h3>
          <p v-if="item.description">{{ item.description }}</p>
        </div>
      </div>
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
.qala-section {
  padding: 26px 0;
  border-top: 1px solid #eeeeee;
}

.qala-section h2 {
  margin: 0 0 13px;
  color: #111;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.qala-program-list {
  display: grid;
  gap: 14px;
}

.qala-program-item {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr);
  gap: 14px;
}

.qala-program-time {
  height: 36px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 900;
}

.qala-program-info h3 {
  margin: 0 0 4px;
  color: #111;
  font-size: 15px;
  font-weight: 850;
}

.qala-program-info p {
  margin: 0;
  color: #707070;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 420px) {
  .qala-program-item {
    grid-template-columns: 62px minmax(0, 1fr);
  }
}
</style>