<template>
  <header class="auth-head">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.auth-head {
  margin-bottom: 34px;
}

.auth-head h1 {
  margin: 0;
  color: #2b2b2f;
  font-size: 26px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.auth-head p {
  margin: 16px 0 0;
  color: #6f737a;
  font-size: 16px;
  line-height: 1.45;
  font-weight: 500;
}

@media (max-width: 576px) {
  .auth-head {
    margin-bottom: 30px;
  }

  .auth-head h1 {
    font-size: 25px;
  }

  .auth-head p {
    margin-top: 14px;
    font-size: 15px;
  }
}
</style>