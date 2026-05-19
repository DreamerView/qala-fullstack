<template>
  <div class="auth-page">
    <main class="auth-shell">
      <section class="auth-box">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.auth-page {
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  color: #2b2b2f;
}

.auth-shell {
  width: 100%;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.auth-box {
  width: 100%;
  max-width: 440px;
  margin-top: -30px;
  text-align: center;
}

@media (max-width: 576px) {
  .auth-shell {
    align-items: flex-start;
    padding: 82px 22px 28px;
  }

  .auth-box {
    max-width: none;
    margin-top: 0;
  }
}
</style>