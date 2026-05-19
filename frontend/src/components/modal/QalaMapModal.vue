<template>
  <div
    id="qalaMapModal"
    class="modal fade qala-map-modal"
    tabindex="-1"
    aria-labelledby="qalaMapModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content border-0">
        <div class="modal-header qala-map-header">
          <button
            type="button"
            class="qala-map-back"
            data-bs-dismiss="modal"
            aria-label="Назад"
          >
            <span class="qala-map-back-icon">
              <SvgIcon name="arrow-left" :size="16" />
            </span>

            <span id="qalaMapModalLabel" class="qala-map-title">
              Карта событий
            </span>
          </button>
        </div>

        <div class="modal-body p-0">
          <iframe
            class="qala-google-map"
            :src="mapUrl"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SvgIcon from '@/components/SvgIcon.vue'

const mapUrl = 'https://www.google.com/maps?q=Karaganda,Kazakhstan&output=embed'
</script>

<style scoped>
.qala-map-header {
  min-height: 48px;
  padding: 0 22px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid #e9e9e9;
  z-index: 2;
  display: flex;
  align-items: center;
}

.qala-map-back {
  border: 0;
  padding: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #111;
  cursor: pointer;
}

.qala-map-back-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #2563eb;
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

.qala-map-back:hover .qala-map-back-icon {
  transform: translateX(-2px);
}

.qala-map-back-icon :deep(.svg-icon) {
  font-size: 20px;
}

.qala-map-title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1;
}

.qala-google-map {
  width: 100%;
  height: calc(100vh - 72px);
  border: 0;
  display: block;
}

@media (max-width: 768px) {
  .qala-map-header {
    min-height: 48px;
    padding: 0 16px;
  }

  .qala-map-back-icon {
    width: 34px;
    height: 34px;
  }

  .qala-map-back-icon :deep(.svg-icon) {
    font-size: 19px;
  }

  .qala-map-title {
    font-size: 17px;
  }

  .qala-google-map {
    height: calc(100vh - 64px);
  }
}
</style>