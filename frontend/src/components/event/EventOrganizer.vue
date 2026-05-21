<template>
  <section class="qala-section">
    <h2>Организатор</h2>

    <div class="qala-organizer-card">
      <div class="qala-organizer-avatar-placeholder">
        <i class="bi bi-person"></i>
      </div>

      <div class="qala-organizer-info">
        <h3>{{ safeOrganizer.name }}</h3>
        <p>{{ safeOrganizer.description }}</p>
      </div>

      <button type="button" class="qala-follow-btn">
        Подписаться
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  organizer: {
    type: Object,
    default: () => ({}),
  },
})

const safeOrganizer = computed(() => ({
  name: props.organizer?.name || 'Qala Events',
  description: props.organizer?.description || 'Организатор события в Qala.',
}))
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

.qala-organizer-card {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  gap: 13px;
  align-items: center;
  padding: 14px;
  border: 1px solid #eeeeee;
  border-radius: 20px;
}

.qala-organizer-avatar-placeholder {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  background: #f7f7f7;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.qala-organizer-info {
  min-width: 0;
}

.qala-organizer-info h3 {
  margin: 0 0 4px;
  color: #111;
  font-size: 15px;
  font-weight: 900;
}

.qala-organizer-info p {
  margin: 0;
  color: #707070;
  font-size: 13px;
  line-height: 1.4;
}

.qala-follow-btn {
  height: 36px;
  padding: 0 13px;
  border: 0;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 13px;
  font-weight: 850;
}

@media (max-width: 860px) {
  .qala-organizer-card {
    width: 100%;
    grid-template-columns: 50px minmax(0, 1fr);
  }

  .qala-follow-btn {
    grid-column: 1 / -1;
    width: 100%;
  }
}
</style>