<template>
  <aside class="ig-right">
    <div class="ig-profile">
      <img class="ig-profile-avatar" :src="profile.avatar" alt="profile" />

      <div class="flex-grow-1 overflow-hidden">
        <div class="ig-profile-login text-truncate">
          {{ profile.username }}
        </div>

        <div class="ig-profile-name text-truncate">
          {{ profile.name }}
        </div>

        <div class="ig-profile-name">
          {{ profile.country }}
        </div>
      </div>

      <button class="ig-link-btn">Переключиться</button>
    </div>

    <div class="ig-suggest-head">
      <strong>Рекомендации для вас</strong>
      <button class="ig-all-btn">Все</button>
    </div>

    <div class="ig-suggestions">
      <div
        v-for="user in suggestions"
        :key="user.username"
        class="ig-suggestion"
      >
        <img
          class="ig-suggestion-avatar"
          :src="user.avatar"
          :alt="user.username"
        />

        <div class="flex-grow-1 overflow-hidden">
          <div class="ig-suggestion-login text-truncate">
            {{ user.username }}

            <i
              v-if="user.verified"
              class="bi bi-patch-check-fill text-primary ms-1"
            ></i>
          </div>

          <div class="ig-suggestion-desc text-truncate">
            {{ user.description }}
          </div>
        </div>

        <button class="ig-link-btn">Подписаться</button>
      </div>
    </div>

    <footer class="ig-footer">
      <div>
        Информация · Помощь · Пресса · API · Вакансии ·
        Конфиденциальность · Условия · Места · Язык · Meta Verified
      </div>

      <div class="mt-4">
        © 2026 INSTAGRAM FROM META
      </div>
    </footer>
  </aside>
</template>

<script setup>
defineProps({
  profile: {
    type: Object,
    required: true,
  },
  suggestions: {
    type: Array,
    required: true,
  },
})
</script>

<style scoped>
.ig-right {
  width: 300px;
  padding-top: 16px;
}

.ig-profile {
  display: flex;
  align-items: center;
  gap: 11px;
}

.ig-profile-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.ig-profile-login {
  font-size: 13px;
  font-weight: 700;
  line-height: 17px;
}

.ig-profile-name {
  color: #737373;
  font-size: 13px;
  line-height: 17px;
}

.ig-link-btn {
  border: 0;
  background: transparent;
  color: #0095f6;
  font-size: 12px;
  font-weight: 700;
  padding: 0;
  white-space: nowrap;
}

.ig-link-btn:hover {
  color: #00376b;
}

.ig-suggest-head {
  margin-top: 31px;
  margin-bottom: 17px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ig-suggest-head strong {
  font-size: 15px;
}

.ig-all-btn {
  border: 0;
  background: transparent;
  padding: 0;
  color: #000;
  font-size: 12px;
  font-weight: 700;
}

.ig-suggestions {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.ig-suggestion {
  display: flex;
  align-items: center;
  gap: 11px;
}

.ig-suggestion-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.ig-suggestion-login {
  font-size: 13px;
  font-weight: 700;
  line-height: 17px;
}

.ig-suggestion-desc {
  color: #737373;
  font-size: 12px;
  line-height: 16px;
}

.ig-footer {
  margin-top: 42px;
  color: #737373;
  font-size: 12px;
  line-height: 18px;
}

@media (max-width: 1180px) {
  .ig-right {
    display: none;
  }
}
</style>