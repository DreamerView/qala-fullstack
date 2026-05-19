<template>
  <div class="auth-logo" aria-hidden="true">
    <div class="auth-logo-inner">
      <span>Q</span>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.auth-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.auth-logo-inner {
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  border: 3px solid #edf0f3;
  border-radius: 22px;
  background: #050505;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.auth-logo-inner span {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 3px solid #ffffff;
  border-radius: 50%;
  color: #ffffff;
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}

@media (max-width: 576px) {
  .auth-logo {
    margin-bottom: 22px;
  }

  .auth-logo-inner {
    width: 72px;
    height: 72px;
    border-radius: 21px;
  }

  .auth-logo-inner span {
    width: 42px;
    height: 42px;
    font-size: 25px;
  }
}
</style>