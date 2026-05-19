<template>
  <button
    class="qala-map-button"
    type="button"
    data-bs-toggle="modal"
    data-bs-target="#qalaMapModal"
  >
    <span class="qala-map-icon">
      <SvgIcon name="compass" />
    </span>

    <strong>Показать на карте</strong>
  </button>
</template>

<script setup>
import SvgIcon from './SvgIcon.vue'
</script>

<style scoped>
.qala-map-button {
  position: fixed;
  right: 48px;
  bottom: 25px;
  height: 58px;
  padding: 0 22px 0 18px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 4px 22px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  gap: 11px;
  z-index: 90;
  color: #111;
  font-size: 16px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.qala-map-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
  background: #fafafa;
}

.qala-map-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.18);
}

.qala-map-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #2563eb, #7c3aed);
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.qala-map-button :deep(.svg-icon) {
  font-size: 19px;
}

.qala-map-button strong {
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

@media (max-width: 1180px) {
  .qala-map-button {
    right: 24px;
    bottom: 24px;
  }
}

@media (max-width: 768px) {
  .qala-map-button {
    display: none;
  }
}
</style>