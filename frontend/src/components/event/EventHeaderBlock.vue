<template>
  <div class="qala-event-title-block">
    <div class="qala-event-date-card">
      <span>{{ event.day }}</span>
      <small>{{ event.month }}</small>
    </div>

    <div>
      <h1 class="qala-event-title">
        {{ event.title }}
      </h1>

      <p class="qala-event-location">
        <i class="bi bi-geo-alt"></i>
        {{ event.location }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  event: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.qala-event-title-block {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  margin-bottom: 20px;
}

.qala-event-date-card {
  width: 64px;
  height: 68px;
  border-radius: 18px;
  background: #f7f7f7;
  display: grid;
  place-items: center;
  align-content: center;
}

.qala-event-date-card span {
  color: #111;
  font-size: 24px;
  font-weight: 950;
  line-height: 1;
  letter-spacing: -0.05em;
}

.qala-event-date-card small {
  margin-top: 5px;
  color: #737373;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
}

.qala-event-title {
  margin: 0;
  color: #050505;
  font-size: 34px;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.055em;
}

.qala-event-location {
  margin: 10px 0 0;
  color: #707070;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 860px) {
  .qala-event-title-block {
    grid-template-columns: 58px minmax(0, 1fr);
    gap: 13px;
  }

  .qala-event-date-card {
    width: 58px;
    height: 62px;
    border-radius: 17px;
  }

  .qala-event-title {
    font-size: 26px;
  }

  .qala-event-location {
    font-size: 14px;
  }
}

@media (max-width: 420px) {
  .qala-event-title {
    font-size: 24px;
  }
}
</style>