<template>
  <section
    v-if="type === 'loading'"
    class="qala-loading"
  >
    <div class="qala-loading-card">
      <div
        class="spinner-border spinner-border-sm"
        aria-hidden="true"
      ></div>

      <span>{{ title }}</span>
    </div>
  </section>

  <section
    v-else
    class="qala-not-found"
  >
    <div class="qala-not-found-icon">
      <i class="bi bi-calendar-x"></i>
    </div>

    <h1>{{ title }}</h1>

    <p v-if="text">
      {{ text }}
    </p>

    <RouterLink
      v-if="actionText && actionTo"
      :to="actionTo"
      class="qala-primary-btn"
    >
      {{ actionText }}
    </RouterLink>
  </section>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'not-found',
    validator: (value) => ['loading', 'not-found'].includes(value),
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
  actionText: {
    type: String,
    default: '',
  },
  actionTo: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.qala-loading {
  min-height: 60vh;
  display: grid;
  place-items: center;
}

.qala-loading-card {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 16px 40px #0000002e;
}

.qala-not-found {
  min-height: 70vh;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  padding: 40px 20px;
}

.qala-not-found-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 999px;
  background: #f7f7f7;
  color: #111;
  display: grid;
  place-items: center;
  font-size: 28px;
}

.qala-not-found h1 {
  margin: 0 0 8px;
  color: #111;
  font-size: 26px;
  font-weight: 900;
}

.qala-not-found p {
  max-width: 360px;
  margin: 0 auto 18px;
  color: #707070;
  font-size: 15px;
  line-height: 1.5;
}

.qala-primary-btn {
  height: 44px;
  padding: 0 17px;
  border: 0;
  border-radius: 999px;
  background: #111;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 850;
}

.qala-primary-btn:hover {
  background: #222;
  color: #fff;
}
</style>