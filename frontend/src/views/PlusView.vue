<template>
  <div class="qala-create-page">
    <div class="qala-create-shell">
      <header class="qala-create-header">
        <div>
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>

        <button type="button" class="qala-create-close" @click="goBack">
          <i class="bi bi-x-lg"></i>
        </button>
      </header>

      <div v-if="isLoadingEvent" class="qala-success-alert">
        <i class="bi bi-arrow-repeat"></i>
        <span>Загружаем событие...</span>
      </div>

      <section v-else-if="isEventNotFound" class="qala-not-found">
        <div class="qala-not-found-card">
          <div class="qala-not-found-icon">
            <i class="bi bi-calendar-x"></i>
          </div>

          <h2>Событие не найдено</h2>
          <p>Возможно, событие было удалено, скрыто или ссылка больше недействительна.</p>

          <div class="qala-not-found-actions">
            <button type="button" class="qala-secondary-btn" @click="router.push('/')">
              <i class="bi bi-house"></i>
              <span>На главную</span>
            </button>

            <button type="button" class="qala-primary-btn" @click="router.push('/create')">
              <i class="bi bi-plus-circle"></i>
              <span>Создать событие</span>
            </button>
          </div>
        </div>
      </section>

      <section v-else-if="showTypeGate" class="qala-type-gate">
        <div class="qala-type-gate-head">
          <span>Шаг 1</span>
          <h2>Что вы хотите создать?</h2>
          <p>Выберите формат. Потом внутри формы его можно будет поменять.</p>
        </div>

        <div class="qala-event-type-grid">
          <button
            v-for="type in eventTypes"
            :key="type.value"
            type="button"
            class="qala-event-type-card"
            @click="chooseEventType(type.value)"
          >
            <span class="qala-event-type-icon">
              <i :class="type.icon"></i>
            </span>

            <span>
              <strong>{{ type.label }}</strong>
              <small>{{ type.description }}</small>
            </span>

            <i class="bi bi-arrow-right-short"></i>
          </button>
        </div>
      </section>

      <form v-else class="qala-create-card" @submit.prevent="submitEvent">
        <div class="qala-create-left">
          <section v-if="activeTypeConfig.showCover" class="qala-upload-section">
            <label class="qala-cover-upload">
              <input type="file" accept="image/*" hidden @change="handleImageUpload" />

              <img
                v-if="form.image"
                :src="form.image"
                alt="Обложка события"
                class="qala-cover-preview"
              />

              <div v-else class="qala-cover-placeholder">
                <div class="qala-upload-icon">
                  <i class="bi bi-image"></i>
                </div>

                <strong>Добавить обложку</strong>
                <span>Необязательно · PNG, JPG или WEBP</span>
              </div>
            </label>
          </section>

          <section class="qala-form-section">
            <div class="qala-form-group">
              <label>Тип публикации</label>

              <div class="qala-current-type">
                <button
                  v-for="type in eventTypes"
                  :key="type.value"
                  type="button"
                  class="qala-current-type-btn"
                  :class="{ active: form.eventType === type.value }"
                  @click="setEventType(type.value)"
                >
                  <i :class="type.icon"></i>
                  <span>{{ type.label }}</span>
                </button>
              </div>

              <small class="qala-field-hint">
                {{ activeTypeConfig.helper }}
              </small>
            </div>

            <div class="qala-form-group">
              <label>
                {{ activeTypeConfig.titleLabel }}
                <span class="qala-required">*</span>
              </label>

              <input
                v-model.trim="form.title"
                type="text"
                class="qala-input"
                :placeholder="activeTypeConfig.titlePlaceholder"
                required
              />
            </div>

            <div class="qala-form-group">
              <label>
                Категория <span class="qala-required">*</span>
              </label>

              <button
                type="button"
                class="qala-location-btn"
                :class="{ error: errors.category }"
                @click="openCategoryModal"
              >
                <span class="qala-location-icon">
                  <i :class="form.subcategoryIcon || form.categoryIcon || 'bi bi-grid'"></i>
                </span>

                <span class="qala-location-content">
                  <strong>{{ form.category || 'Выбрать категорию' }}</strong>
                  <small>{{ form.subcategory || 'Обязательное поле — выбери категорию' }}</small>
                </span>

                <i class="bi bi-chevron-right qala-location-arrow"></i>
              </button>

              <small class="qala-field-hint" :class="{ error: errors.category }">
                {{ errors.category || 'Без выбранной категории публикацию нельзя сохранить' }}
              </small>
            </div>

            <div class="qala-form-row">
              <div class="qala-form-group">
                <label>
                  {{ activeTypeConfig.dateLabel }}
                  <span class="qala-required">*</span>
                </label>

                <input v-model="form.date" type="date" class="qala-input" required />
              </div>

              <div class="qala-form-group">
                <label>
                  {{ activeTypeConfig.timeLabel }}
                  <span class="qala-required">*</span>
                </label>

                <input v-model="form.time" type="time" class="qala-input" required />
              </div>
            </div>

            <div class="qala-form-group">
              <label>
                {{ activeTypeConfig.locationLabel }}
                <span class="qala-required">*</span>
              </label>

              <button
                type="button"
                class="qala-location-btn"
                :class="{ error: errors.location }"
                @click="openLocationModal"
              >
                <span class="qala-location-icon">
                  <i class="bi bi-geo-alt"></i>
                </span>

                <span class="qala-location-content">
                  <strong>
                    {{ hasSelectedLocation ? form.location : 'Выбрать место на карте' }}
                  </strong>

                  <small>
                    {{ hasSelectedLocation ? form.address : activeTypeConfig.locationHint }}
                  </small>
                </span>

                <i class="bi bi-chevron-right qala-location-arrow"></i>
              </button>

              <small class="qala-field-hint" :class="{ error: errors.location }">
                {{
                  errors.location ||
                  (hasSelectedLocation
                    ? `Координаты: ${Number(form.lat).toFixed(6)}, ${Number(form.lng).toFixed(6)}`
                    : activeTypeConfig.locationHint)
                }}
              </small>
            </div>

            <div class="qala-form-group">
              <label>
                {{ activeTypeConfig.descriptionLabel }}
                <span class="qala-required">*</span>
              </label>

              <textarea
                v-model.trim="form.description"
                class="qala-textarea"
                rows="5"
                :placeholder="activeTypeConfig.descriptionPlaceholder"
                required
              ></textarea>
            </div>

            <section class="qala-inner-section">
              <div class="qala-section-title">
                <h3>Детали публикации</h3>
                <p>{{ activeTypeConfig.detailsHint }}</p>
              </div>

              <div class="qala-form-row">
                <div v-if="activeTypeConfig.showDuration" class="qala-form-group">
                  <label>
                    Длительность
                    <span class="qala-optional">необязательно</span>
                  </label>

                  <input
                    v-model.number="form.durationMinutes"
                    type="number"
                    min="1"
                    step="1"
                    class="qala-input"
                    placeholder="Например: 120 минут"
                  />
                </div>

                <div v-if="activeTypeConfig.showAgeLimit" class="qala-form-group">
                  <label>
                    Возраст
                    <span class="qala-optional">необязательно</span>
                  </label>

                  <select v-model="form.ageLimit" class="qala-input">
                    <option value="">Без ограничения</option>
                    <option v-for="item in ageLimits" :key="item" :value="item">
                      {{ item }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="qala-form-row">
                <div class="qala-form-group">
                  <label>Язык</label>

                  <select v-model="form.language" class="qala-input">
                    <option v-for="item in languages" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </option>
                  </select>
                </div>

                <div class="qala-form-group">
                  <label>Видимость</label>

                  <select v-model="form.visibility" class="qala-input">
                    <option value="public">Публично</option>
                    <option value="unlisted">Только по ссылке</option>
                    <option value="private">Приватно</option>
                  </select>
                </div>
              </div>
            </section>

            <section
              v-if="activeTypeConfig.showProgram"
              class="qala-inner-section"
            >
              <div class="qala-toggle-row">
                <div>
                  <label>Программа события</label>
                  <small>Включи, если нужно расписать этапы события</small>
                </div>

                <button
                  type="button"
                  class="qala-toggle"
                  :class="{ active: form.hasProgram }"
                  :aria-pressed="form.hasProgram"
                  @click="toggleProgram"
                >
                  <span></span>
                </button>
              </div>

              <div v-if="form.hasProgram" class="qala-program-list">
                <div
                  v-for="(item, index) in form.program"
                  :key="item.id"
                  class="qala-program-item"
                >
                  <div class="qala-program-item-top">
                    <strong>Пункт {{ index + 1 }}</strong>

                    <div class="qala-program-actions">
                      <button
                        type="button"
                        class="qala-program-action-btn"
                        :disabled="index === 0"
                        @click="moveProgramItem(index, -1)"
                      >
                        <i class="bi bi-arrow-up"></i>
                      </button>

                      <button
                        type="button"
                        class="qala-program-action-btn"
                        :disabled="index === form.program.length - 1"
                        @click="moveProgramItem(index, 1)"
                      >
                        <i class="bi bi-arrow-down"></i>
                      </button>

                      <button
                        type="button"
                        class="qala-program-remove"
                        @click="removeProgramItem(index)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div class="qala-form-row">
                    <div class="qala-form-group">
                      <label>
                        Время
                        <span class="qala-optional">необязательно</span>
                      </label>

                      <input v-model="item.time" type="time" class="qala-input" />
                    </div>

                    <div class="qala-form-group">
                      <label>
                        Название
                        <span class="qala-required">*</span>
                      </label>

                      <input
                        v-model.trim="item.title"
                        type="text"
                        class="qala-input"
                        placeholder="Например: Сбор гостей"
                      />
                    </div>
                  </div>

                  <div class="qala-form-group">
                    <label>
                      Описание
                      <span class="qala-optional">необязательно</span>
                    </label>

                    <textarea
                      v-model.trim="item.description"
                      class="qala-textarea qala-program-textarea"
                      rows="2"
                      placeholder="Кратко опиши, что будет происходить"
                    ></textarea>
                  </div>
                </div>

                <button type="button" class="qala-program-add" @click="addProgramItem">
                  <i class="bi bi-plus-lg"></i>
                  <span>Добавить пункт</span>
                </button>
              </div>
            </section>

            <section
              v-if="activeTypeConfig.showVisitType || activeTypeConfig.showLimit || activeTypeConfig.showRegistration"
              class="qala-inner-section"
            >
              <div class="qala-section-title">
                <h3>Участие</h3>
                <p>{{ activeTypeConfig.participationHint }}</p>
              </div>

              <div v-if="activeTypeConfig.showVisitType" class="qala-form-group">
                <label>Тип посещения</label>

                <div class="qala-visit-type-grid">
                  <button
                    v-for="type in visitTypes"
                    :key="type.value"
                    type="button"
                    class="qala-visit-type-btn"
                    :class="{ active: form.visitType === type.value }"
                    @click="setVisitType(type.value)"
                  >
                    <i :class="type.icon"></i>
                    <span>{{ type.label }}</span>
                  </button>
                </div>
              </div>

              <div class="qala-form-row">
                <div
                  v-if="activeTypeConfig.showPrice && form.visitType === 'paid'"
                  class="qala-form-group"
                >
                  <label>
                    Цена, ₸
                    <span class="qala-required">*</span>
                  </label>

                  <input
                    v-model.number="form.price"
                    type="number"
                    min="1"
                    step="1"
                    class="qala-input"
                    placeholder="Например: 3000"
                    required
                  />
                </div>

                <div v-if="activeTypeConfig.showLimit" class="qala-form-group">
                  <label>
                    {{ activeTypeConfig.limitLabel }}
                    <span class="qala-optional">необязательно</span>
                  </label>

                  <input
                    v-model.number="form.limit"
                    type="number"
                    min="1"
                    class="qala-input"
                    :placeholder="activeTypeConfig.limitPlaceholder"
                  />
                </div>
              </div>

              <div v-if="activeTypeConfig.showRegistration" class="qala-form-row">
                <div class="qala-form-group">
                  <label>Запись</label>

                  <select v-model="form.accessType" class="qala-input">
                    <option value="open">Свободная запись</option>
                    <option value="approval_required">С подтверждением</option>
                    <option value="link_only">Только по ссылке</option>
                    <option value="invite_only">Только по приглашению</option>
                  </select>
                </div>

                <div class="qala-form-group">
                  <label>
                    Дедлайн записи
                    <span class="qala-optional">необязательно</span>
                  </label>

                  <input
                    v-model="form.registrationDeadline"
                    type="datetime-local"
                    class="qala-input"
                  />
                </div>
              </div>

              <div v-if="activeTypeConfig.showRegistration" class="qala-switch-grid">
                <label class="qala-switch-card">
                  <input v-model="form.registrationRequired" type="checkbox" />
                  <span>
                    <strong>Запись обязательна</strong>
                    <small>Пользователь должен нажать “Я пойду”</small>
                  </span>
                </label>

                <label class="qala-switch-card">
                  <input v-model="form.allowWaitlist" type="checkbox" />
                  <span>
                    <strong>Лист ожидания</strong>
                    <small>Если лимит заполнен, можно ждать место</small>
                  </span>
                </label>
              </div>
            </section>

            <section v-if="activeTypeConfig.showPolls" class="qala-inner-section">
              <div class="qala-section-title">
                <h3>Опрос</h3>
                <p>Подходит для плана: выбрать дату, место, формат или проверить интерес.</p>
              </div>

              <div class="qala-toggle-row">
                <div>
                  <label>Добавить опрос</label>
                  <small>Особенно полезно для планов и идей</small>
                </div>

                <button
                  type="button"
                  class="qala-toggle"
                  :class="{ active: form.hasPoll }"
                  :aria-pressed="form.hasPoll"
                  @click="togglePoll"
                >
                  <span></span>
                </button>
              </div>

              <div v-if="form.hasPoll" class="qala-program-list">
                <div
                  v-for="(poll, pollIndex) in form.polls"
                  :key="poll.id"
                  class="qala-program-item"
                >
                  <div class="qala-program-item-top">
                    <strong>Опрос {{ pollIndex + 1 }}</strong>

                    <button
                      type="button"
                      class="qala-program-remove"
                      @click="removePoll(pollIndex)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>

                  <div class="qala-form-group">
                    <label>
                      Вопрос
                      <span class="qala-required">*</span>
                    </label>

                    <input
                      v-model.trim="poll.question"
                      type="text"
                      class="qala-input"
                      placeholder="Например: Какую дату выбрать?"
                    />
                  </div>

                  <div class="qala-form-group">
                    <label>Тип выбора</label>

                    <select v-model="poll.pollType" class="qala-input">
                      <option value="single">Один вариант</option>
                      <option value="multiple">Несколько вариантов</option>
                    </select>
                  </div>

                  <div class="qala-program-list">
                    <div
                      v-for="(option, optionIndex) in poll.options"
                      :key="option.id"
                      class="qala-inline-option"
                    >
                      <input
                        v-model.trim="option.text"
                        type="text"
                        class="qala-input"
                        :placeholder="`Вариант ${optionIndex + 1}`"
                      />

                      <button
                        type="button"
                        class="qala-mini-danger"
                        :disabled="poll.options.length <= 2"
                        @click="removePollOption(pollIndex, optionIndex)"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="qala-program-add"
                    @click="addPollOption(pollIndex)"
                  >
                    <i class="bi bi-plus-lg"></i>
                    <span>Добавить вариант</span>
                  </button>
                </div>

                <button type="button" class="qala-program-add" @click="addPoll">
                  <i class="bi bi-plus-lg"></i>
                  <span>Добавить ещё опрос</span>
                </button>
              </div>
            </section>

            <section v-if="activeTypeConfig.showRegistrationQuestions" class="qala-inner-section">
              <div class="qala-section-title">
                <h3>Вопросы при записи</h3>
                <p>Организатор может заранее спросить нужную информацию у участника.</p>
              </div>

              <div class="qala-toggle-row">
                <div>
                  <label>Добавить вопросы</label>
                  <small>Например: опыт, размер группы, комментарий, пожелания</small>
                </div>

                <button
                  type="button"
                  class="qala-toggle"
                  :class="{ active: form.hasRegistrationQuestions }"
                  :aria-pressed="form.hasRegistrationQuestions"
                  @click="toggleRegistrationQuestions"
                >
                  <span></span>
                </button>
              </div>

              <div v-if="form.hasRegistrationQuestions" class="qala-program-list">
                <div
                  v-for="(question, index) in form.registrationQuestions"
                  :key="question.id"
                  class="qala-program-item"
                >
                  <div class="qala-program-item-top">
                    <strong>Вопрос {{ index + 1 }}</strong>

                    <button
                      type="button"
                      class="qala-program-remove"
                      @click="removeRegistrationQuestion(index)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>

                  <div class="qala-form-group">
                    <label>
                      Текст вопроса
                      <span class="qala-required">*</span>
                    </label>

                    <input
                      v-model.trim="question.question"
                      type="text"
                      class="qala-input"
                      placeholder="Например: Сколько человек будет с вами?"
                    />
                  </div>

                  <div class="qala-form-row">
                    <div class="qala-form-group">
                      <label>Тип поля</label>

                      <select v-model="question.inputType" class="qala-input">
                        <option value="text">Текст</option>
                        <option value="number">Число</option>
                        <option value="textarea">Большой текст</option>
                        <option value="select">Выбор</option>
                        <option value="checkbox">Чекбокс</option>
                      </select>
                    </div>

                    <label class="qala-switch-card compact">
                      <input v-model="question.isRequired" type="checkbox" />
                      <span>
                        <strong>Обязательный</strong>
                        <small>Без ответа нельзя записаться</small>
                      </span>
                    </label>
                  </div>

                  <div
                    v-if="['select', 'checkbox'].includes(question.inputType)"
                    class="qala-program-list"
                  >
                    <div
                      v-for="(option, optionIndex) in question.options"
                      :key="option.id"
                      class="qala-inline-option"
                    >
                      <input
                        v-model.trim="option.text"
                        type="text"
                        class="qala-input"
                        :placeholder="`Вариант ${optionIndex + 1}`"
                      />

                      <button
                        type="button"
                        class="qala-mini-danger"
                        :disabled="question.options.length <= 1"
                        @click="removeRegistrationOption(index, optionIndex)"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>

                    <button
                      type="button"
                      class="qala-program-add"
                      @click="addRegistrationOption(index)"
                    >
                      <i class="bi bi-plus-lg"></i>
                      <span>Добавить вариант</span>
                    </button>
                  </div>
                </div>

                <button type="button" class="qala-program-add" @click="addRegistrationQuestion">
                  <i class="bi bi-plus-lg"></i>
                  <span>Добавить вопрос</span>
                </button>
              </div>
            </section>

            <section v-if="activeTypeConfig.showContacts" class="qala-inner-section">
              <div class="qala-section-title">
                <h3>Контакты и ссылка</h3>
                <p>{{ activeTypeConfig.contactsHint }}</p>
              </div>

              <div class="qala-form-row">
                <div class="qala-form-group">
                  <label>
                    Телефон
                    <span class="qala-optional">необязательно</span>
                  </label>

                  <input
                    v-model.trim="form.contactPhone"
                    type="tel"
                    class="qala-input"
                    placeholder="+7..."
                  />
                </div>

                <div class="qala-form-group">
                  <label>
                    WhatsApp
                    <span class="qala-optional">необязательно</span>
                  </label>

                  <input
                    v-model.trim="form.contactWhatsapp"
                    type="text"
                    class="qala-input"
                    placeholder="+7... или ссылка"
                  />
                </div>
              </div>

              <div class="qala-form-row">
                <div class="qala-form-group">
                  <label>
                    Telegram
                    <span class="qala-optional">необязательно</span>
                  </label>

                  <input
                    v-model.trim="form.contactTelegram"
                    type="text"
                    class="qala-input"
                    placeholder="@username"
                  />
                </div>

                <div class="qala-form-group">
                  <label>
                    Внешняя ссылка
                    <span class="qala-optional">необязательно</span>
                  </label>

                  <input
                    v-model.trim="form.externalUrl"
                    type="url"
                    class="qala-input"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </section>

            <section class="qala-inner-section">
              <div class="qala-section-title">
                <h3>Настройки</h3>
                <p>Небольшие правила отображения публикации.</p>
              </div>

              <div class="qala-switch-grid">
                <label class="qala-switch-card">
                  <input v-model="form.allowComments" type="checkbox" />
                  <span>
                    <strong>Комментарии</strong>
                    <small>Разрешить обсуждение</small>
                  </span>
                </label>

                <label class="qala-switch-card">
                  <input v-model="form.allowShare" type="checkbox" />
                  <span>
                    <strong>Поделиться</strong>
                    <small>Разрешить отправку ссылки</small>
                  </span>
                </label>
              </div>
            </section>
          </section>
        </div>

        <aside class="qala-create-right">
          <section class="qala-preview-section">
            <h2>Предпросмотр</h2>

            <article class="qala-preview-card">
              <div v-if="activeTypeConfig.showCover" class="qala-preview-image-wrap">
                <img
                  v-if="form.image"
                  :src="form.image"
                  alt="Preview"
                  class="qala-preview-image"
                />

                <div v-else class="qala-preview-empty">
                  <i class="bi bi-image"></i>
                </div>

                <span class="qala-preview-category">
                  {{ form.category || 'Категория' }}
                </span>
              </div>

              <div class="qala-preview-type-line">
                <span>
                  <i :class="activeEventType.icon"></i>
                  {{ activeEventType.label }}
                </span>

                <small>{{ form.category || 'Категория не выбрана' }}</small>
              </div>

              <div class="qala-preview-body">
                <div class="qala-preview-date">
                  <span>{{ previewDay }}</span>
                  <small>{{ previewMonth }}</small>
                </div>

                <div class="qala-preview-content">
                  <h3>{{ form.title || activeTypeConfig.previewTitle }}</h3>

                  <p>
                    <i class="bi bi-geo-alt"></i>
                    {{ form.location || activeTypeConfig.previewLocation }}
                  </p>

                  <div class="qala-preview-meta">
                    <span>
                      <i class="bi bi-clock"></i>
                      {{ form.time || '00:00' }}
                    </span>

                    <span v-if="activeTypeConfig.showVisitType">
                      <i class="bi bi-ticket-perforated"></i>
                      {{ previewPrice }}
                    </span>

                    <span v-if="form.limit">
                      <i class="bi bi-people"></i>
                      до {{ form.limit }} чел.
                    </span>

                    <span v-if="form.ageLimit">
                      <i class="bi bi-shield-check"></i>
                      {{ form.ageLimit }}
                    </span>

                    <span>
                      <i class="bi bi-translate"></i>
                      {{ previewLanguage }}
                    </span>
                  </div>

                  <a
                    v-if="form.locationUrl"
                    :href="form.locationUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="qala-preview-map-link"
                  >
                    <i class="bi bi-map"></i>
                    <span>Открыть на карте</span>
                  </a>
                </div>
              </div>

              <div
                v-if="activeTypeConfig.showProgram && form.hasProgram && previewProgram.length"
                class="qala-preview-program"
              >
                <h4>Программа</h4>

                <div
                  v-for="item in previewProgram"
                  :key="item.id"
                  class="qala-preview-program-item"
                >
                  <div class="qala-preview-program-time">
                    {{ item.time || '00:00' }}
                  </div>

                  <div class="qala-preview-program-content">
                    <strong>{{ item.title || 'Название пункта' }}</strong>
                    <p v-if="item.description">{{ item.description }}</p>
                  </div>
                </div>
              </div>

              <div v-if="activeTypeConfig.showPolls && form.hasPoll && previewPolls.length" class="qala-preview-program">
                <h4>Опрос</h4>

                <div v-for="poll in previewPolls" :key="poll.id" class="qala-preview-poll">
                  <strong>{{ poll.question || 'Вопрос опроса' }}</strong>

                  <div class="qala-preview-poll-options">
                    <span v-for="option in poll.options" :key="option.id">
                      {{ option.text || 'Вариант' }}
                    </span>
                  </div>
                </div>
              </div>
            </article>

            <div class="qala-preview-actions">
              <button
                v-if="!isEditMode"
                type="button"
                class="qala-test-btn"
                @click="fillTestData"
              >
                <i class="bi bi-magic"></i>
                <span>Заполнить тестом</span>
              </button>

              <button
                v-if="!isEditMode"
                type="button"
                class="qala-secondary-btn"
                @click="backToTypeGate"
              >
                <i class="bi bi-grid"></i>
                <span>Выбрать другой тип</span>
              </button>

              <button type="button" class="qala-secondary-btn" @click="resetForm">
                <i class="bi bi-arrow-counterclockwise"></i>
                <span>Очистить</span>
              </button>

              <button type="submit" class="qala-primary-btn" :disabled="isSubmitting">
                <i :class="submitButtonIcon"></i>
                <span>{{ submitButtonText }}</span>
              </button>

              <button
                v-if="isEditMode"
                type="button"
                class="qala-danger-btn"
                @click="openDeleteModal"
              >
                <i class="bi bi-trash3"></i>
                <span>Удалить событие</span>
              </button>
            </div>

            <small v-if="errors.submit" class="qala-field-hint error">
              {{ errors.submit }}
            </small>
          </section>
        </aside>
      </form>

      <div v-if="isSubmitted" class="qala-success-alert">
        <i class="bi bi-check-circle-fill"></i>
        <span>{{ successMessage }}</span>
      </div>
    </div>

    <CategoryPickerModal
      v-model="isCategoryModalOpen"
      lang="kk"
      :selected-category-id="form.categoryId"
      :selected-subcategory-id="form.subcategoryId"
      @select="handleCategorySelect"
    />

    <LocationPickerModal
      v-model="isLocationModalOpen"
      :initial-query="locationSearchQuery"
      :initial-lat="form.lat"
      :initial-lng="form.lng"
      @select="handleLocationSelect"
    />

    <DeleteEventModal
      v-if="isEditMode && !isEventNotFound"
      v-model="isDeleteModalOpen"
      :api-url="API_URL"
      :event-id="eventId"
      :event-title="form.title"
      @deleted="handleEventDeleted"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CategoryPickerModal from '@/components/events/CategoryPickerModal.vue'
import LocationPickerModal from '@/components/events/LocationPickerModal.vue'
import DeleteEventModal from '@/components/events/DeleteEventModal.vue'

const route = useRoute()
const router = useRouter()

const API_URL = import.meta.env.VITE_API_URL || '/api'

const eventTypes = [
  {
    value: 'event',
    label: 'Мероприятие',
    icon: 'bi bi-calendar-event',
    description: 'Полноценное событие с программой, записью и участниками',
  },
  {
    value: 'meeting',
    label: 'Встреча',
    icon: 'bi bi-people',
    description: 'Небольшая встреча людей в конкретном месте',
  },
  {
    value: 'announcement',
    label: 'Анонс',
    icon: 'bi bi-megaphone',
    description: 'Новость, открытие, запуск, объявление или важное сообщение',
  },
  {
    value: 'activity',
    label: 'Активность',
    icon: 'bi bi-lightning-charge',
    description: 'Совместное действие: спорт, прогулка, волонтёрство, поездка',
  },
  {
    value: 'plan',
    label: 'План',
    icon: 'bi bi-chat-square-text',
    description: 'Идея, чтобы сначала собрать интерес и выбрать формат',
  },
]

const eventTypeConfigs = {
  event: {
    helper: 'Полный формат: дата, место, программа, запись, участники, вопросы и контакты.',
    titleLabel: 'Название мероприятия',
    titlePlaceholder: 'Например: Frontend Meetup Karaganda',
    dateLabel: 'Дата',
    timeLabel: 'Время',
    locationLabel: 'Локация события',
    locationHint: 'Обязательное поле — выбери точное место на карте',
    descriptionLabel: 'Описание мероприятия',
    descriptionPlaceholder: 'Расскажи, что будет на событии, кому оно подходит и почему стоит прийти',
    limitLabel: 'Лимит участников',
    limitPlaceholder: '100',
    previewTitle: 'Название мероприятия',
    previewLocation: 'Место проведения',
    detailsHint: 'Для мероприятия полезны длительность, возраст, язык и правила записи.',
    participationHint: 'Можно сделать бесплатное или платное участие, лимит и подтверждение заявок.',
    contactsHint: 'Контакты помогут участникам уточнить детали.',
    showCover: true,
    showProgram: true,
    showVisitType: true,
    showPrice: true,
    showLimit: true,
    showDuration: true,
    showAgeLimit: true,
    showRegistration: true,
    showRegistrationQuestions: true,
    showPolls: false,
    showContacts: true,
  },

  meeting: {
    helper: 'Простой формат для встречи: где, когда, кто идёт и сколько мест.',
    titleLabel: 'Название встречи',
    titlePlaceholder: 'Например: Кофе и знакомство в центре',
    dateLabel: 'Дата встречи',
    timeLabel: 'Время встречи',
    locationLabel: 'Место встречи',
    locationHint: 'Обязательное поле — выбери место встречи на карте',
    descriptionLabel: 'Описание встречи',
    descriptionPlaceholder: 'Напиши, кого зовёшь, что планируется и как всё будет проходить',
    limitLabel: 'Сколько людей можно собрать',
    limitPlaceholder: 'Например: 10',
    previewTitle: 'Название встречи',
    previewLocation: 'Место встречи',
    detailsHint: 'Для встречи лучше оставить минимум полей, чтобы быстро создать публикацию.',
    participationHint: 'Можно указать лимит и включить запись с подтверждением.',
    contactsHint: 'Контакты можно оставить, если участникам нужно связаться с организатором.',
    showCover: true,
    showProgram: false,
    showVisitType: true,
    showPrice: true,
    showLimit: true,
    showDuration: true,
    showAgeLimit: false,
    showRegistration: true,
    showRegistrationQuestions: false,
    showPolls: false,
    showContacts: true,
  },

  announcement: {
    helper: 'Формат объявления: важная информация, новость, запуск или открытие.',
    titleLabel: 'Заголовок анонса',
    titlePlaceholder: 'Например: Открытие нового пространства в Караганде',
    dateLabel: 'Дата анонса',
    timeLabel: 'Время анонса',
    locationLabel: 'Место анонса',
    locationHint: 'Обязательное поле — выбери место на карте',
    descriptionLabel: 'Текст анонса',
    descriptionPlaceholder: 'Кратко и понятно расскажи, что произошло или что скоро будет',
    limitLabel: 'Лимит',
    limitPlaceholder: 'Необязательно',
    previewTitle: 'Заголовок анонса',
    previewLocation: 'Место анонса',
    detailsHint: 'Для анонса важнее текст, место, дата и внешняя ссылка.',
    participationHint: '',
    contactsHint: 'Для анонса особенно полезна внешняя ссылка: сайт, Instagram, форма или источник.',
    showCover: true,
    showProgram: false,
    showVisitType: false,
    showPrice: false,
    showLimit: false,
    showDuration: false,
    showAgeLimit: false,
    showRegistration: false,
    showRegistrationQuestions: false,
    showPolls: false,
    showContacts: true,
  },

  activity: {
    helper: 'Формат для совместного действия: спорт, прогулка, уборка, поездка, волонтёрство.',
    titleLabel: 'Название активности',
    titlePlaceholder: 'Например: Утренняя пробежка в парке',
    dateLabel: 'Дата активности',
    timeLabel: 'Время активности',
    locationLabel: 'Место сбора',
    locationHint: 'Обязательное поле — выбери место сбора на карте',
    descriptionLabel: 'Описание активности',
    descriptionPlaceholder: 'Опиши, что будете делать, что взять с собой и кому подходит активность',
    limitLabel: 'Лимит участников',
    limitPlaceholder: 'Например: 20',
    previewTitle: 'Название активности',
    previewLocation: 'Место сбора',
    detailsHint: 'Для активности полезны длительность, возраст и лимит участников.',
    participationHint: 'Можно собрать участников, включить лист ожидания и подтверждение.',
    contactsHint: 'Контакты нужны, если участникам важно уточнить подготовку или маршрут.',
    showCover: true,
    showProgram: false,
    showVisitType: true,
    showPrice: true,
    showLimit: true,
    showDuration: true,
    showAgeLimit: true,
    showRegistration: true,
    showRegistrationQuestions: true,
    showPolls: false,
    showContacts: true,
  },

  plan: {
    helper: 'Формат идеи: сначала проверить интерес, собрать людей и выбрать детали через опрос.',
    titleLabel: 'Название плана',
    titlePlaceholder: 'Например: Кто хочет сходить на футбол?',
    dateLabel: 'Ориентировочная дата',
    timeLabel: 'Ориентировочное время',
    locationLabel: 'Ориентировочное место',
    locationHint: 'Обязательное поле — выбери примерное место на карте',
    descriptionLabel: 'Описание идеи',
    descriptionPlaceholder: 'Напиши идею, кого хочешь собрать и что нужно обсудить',
    limitLabel: 'Желаемое количество людей',
    limitPlaceholder: 'Например: 5',
    previewTitle: 'Название плана',
    previewLocation: 'Ориентировочное место',
    detailsHint: 'Для плана лучше оставить идею простой, но добавить опрос.',
    participationHint: 'Можно ограничить количество заинтересованных людей.',
    contactsHint: 'Контакты обычно не нужны, но можно оставить ссылку на обсуждение.',
    showCover: false,
    showProgram: false,
    showVisitType: false,
    showPrice: false,
    showLimit: true,
    showDuration: false,
    showAgeLimit: false,
    showRegistration: true,
    showRegistrationQuestions: false,
    showPolls: true,
    showContacts: true,
  },
}

const visitTypes = [
  { value: 'free', label: 'Бесплатно', icon: 'bi bi-gift' },
  { value: 'paid', label: 'Платно', icon: 'bi bi-cash-coin' },
]

const languages = [
  { value: 'ru', label: 'Русский' },
  { value: 'kk', label: 'Қазақша' },
  { value: 'en', label: 'English' },
  { value: 'mixed', label: 'Смешанный' },
]

const ageLimits = ['0+', '6+', '12+', '16+', '18+']

const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']

const isSubmitted = ref(false)
const isSubmitting = ref(false)
const isLoadingEvent = ref(false)
const isEventNotFound = ref(false)
const isCategoryModalOpen = ref(false)
const isLocationModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const hasPickedEventType = ref(false)

const errors = reactive({
  category: '',
  location: '',
  submit: '',
})

let programId = 1
let pollId = 1
let optionId = 1
let questionId = 1

const createEmptyProgramItem = () => ({
  id: programId++,
  time: '',
  title: '',
  description: '',
})

const createPollOption = (text = '') => ({
  id: optionId++,
  text,
})

const createEmptyPoll = () => ({
  id: pollId++,
  question: '',
  pollType: 'single',
  options: [createPollOption(), createPollOption()],
})

const createRegistrationOption = (text = '') => ({
  id: optionId++,
  text,
})

const createEmptyRegistrationQuestion = () => ({
  id: questionId++,
  question: '',
  inputType: 'text',
  isRequired: false,
  options: [createRegistrationOption()],
})

const form = reactive({
  eventType: 'event',
  title: '',

  category: '',
  categoryId: null,
  categorySlug: '',
  categoryIcon: '',

  subcategory: '',
  subcategoryId: null,
  subcategorySlug: '',
  subcategoryIcon: '',

  date: '',
  time: '',

  durationMinutes: '',
  ageLimit: '',
  language: 'ru',

  location: '',
  address: '',
  locationUrl: '',
  lat: null,
  lng: null,

  description: '',

  hasProgram: false,
  program: [createEmptyProgramItem()],

  visitType: 'free',
  price: '',
  limit: '',

  registrationRequired: true,
  registrationDeadline: '',
  accessType: 'open',
  allowWaitlist: false,

  hasPoll: false,
  polls: [createEmptyPoll()],

  hasRegistrationQuestions: false,
  registrationQuestions: [createEmptyRegistrationQuestion()],

  contactPhone: '',
  contactWhatsapp: '',
  contactTelegram: '',
  externalUrl: '',

  visibility: 'public',
  allowComments: true,
  allowShare: true,

  image: '',
})

const eventId = computed(() => route.params.id || null)
const isEditMode = computed(() => Boolean(eventId.value))
const showTypeGate = computed(() => !isEditMode.value && !hasPickedEventType.value)

const activeEventType = computed(() => {
  return eventTypes.find((type) => type.value === form.eventType) || eventTypes[0]
})

const activeTypeConfig = computed(() => {
  return eventTypeConfigs[form.eventType] || eventTypeConfigs.event
})

const pageTitle = computed(() => {
  if (isEventNotFound.value) return 'Событие не найдено'
  if (showTypeGate.value) return 'Создать публикацию'
  return isEditMode.value ? 'Редактировать событие' : `Создать: ${activeEventType.value.label}`
})

const pageSubtitle = computed(() => {
  if (isEventNotFound.value) return 'Проверь ссылку или создай новое событие'
  if (showTypeGate.value) return 'Сначала выбери формат: мероприятие, встреча, анонс, активность или план'

  return isEditMode.value
    ? 'Обнови данные городской публикации в Qala'
    : activeTypeConfig.value.helper
})

const submitButtonText = computed(() => {
  if (isSubmitting.value) return isEditMode.value ? 'Сохраняем...' : 'Публикуем...'
  return isEditMode.value ? 'Сохранить изменения' : 'Опубликовать'
})

const submitButtonIcon = computed(() => {
  if (isSubmitting.value) return 'bi bi-arrow-repeat'
  return isEditMode.value ? 'bi bi-check-circle' : 'bi bi-plus-circle'
})

const successMessage = computed(() => {
  return isEditMode.value ? 'Изменения сохранены' : 'Публикация подготовлена к размещению'
})

const locationSearchQuery = computed(() => {
  return form.location || form.address || ''
})

const hasSelectedLocation = computed(() => {
  return (
    Boolean(String(form.location || '').trim()) &&
    Boolean(String(form.address || '').trim()) &&
    Boolean(String(form.locationUrl || '').trim()) &&
    form.lat !== null &&
    form.lat !== '' &&
    form.lng !== null &&
    form.lng !== '' &&
    Number.isFinite(Number(form.lat)) &&
    Number.isFinite(Number(form.lng))
  )
})

const previewDay = computed(() => {
  if (!form.date) return '--'
  return String(new Date(form.date).getDate()).padStart(2, '0')
})

const previewMonth = computed(() => {
  if (!form.date) return 'ДАТА'
  return months[new Date(form.date).getMonth()]
})

const previewProgram = computed(() => {
  if (!form.hasProgram || !activeTypeConfig.value.showProgram) return []
  return form.program.filter((item) => item.time || item.title || item.description)
})

const previewPolls = computed(() => {
  if (!form.hasPoll || !activeTypeConfig.value.showPolls) return []

  return form.polls
    .map((poll) => ({
      ...poll,
      options: poll.options.filter((option) => option.text),
    }))
    .filter((poll) => poll.question || poll.options.length)
})

const previewPrice = computed(() => {
  if (form.visitType === 'free') return 'Бесплатно'
  if (!form.price || Number(form.price) < 1) return 'Цена не указана'
  return `${Number(form.price).toLocaleString('ru-RU')} ₸`
})

const previewLanguage = computed(() => {
  return languages.find((item) => item.value === form.language)?.label || 'Русский'
})

const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const normalizeDate = (value) => {
  return value ? String(value).slice(0, 10) : ''
}

const normalizeTime = (value) => {
  return value ? String(value).slice(0, 5) : ''
}

const normalizeDateTimeLocal = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (number) => String(number).padStart(2, '0')

  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('')
}

const clearTypeSpecificFields = () => {
  const config = activeTypeConfig.value

  if (!config.showCover && form.image?.startsWith('blob:')) {
    URL.revokeObjectURL(form.image)
  }

  if (!config.showCover) form.image = ''
  if (!config.showProgram) form.hasProgram = false
  if (!config.showVisitType) form.visitType = 'free'
  if (!config.showPrice) form.price = ''
  if (!config.showLimit) form.limit = ''
  if (!config.showDuration) form.durationMinutes = ''
  if (!config.showAgeLimit) form.ageLimit = ''
  if (!config.showPolls) form.hasPoll = false
  if (!config.showRegistrationQuestions) form.hasRegistrationQuestions = false

  if (!config.showRegistration) {
    form.registrationRequired = false
    form.registrationDeadline = ''
    form.accessType = 'open'
    form.allowWaitlist = false
  }
}

const setEventType = (type) => {
  if (!eventTypeConfigs[type]) return

  form.eventType = type
  errors.location = ''
  errors.submit = ''

  clearTypeSpecificFields()
}

const chooseEventType = (type) => {
  setEventType(type)
  hasPickedEventType.value = true
}

const backToTypeGate = () => {
  hasPickedEventType.value = false
  isSubmitted.value = false
  errors.submit = ''
}

const goBack = () => {
  if (!isEditMode.value && hasPickedEventType.value) {
    backToTypeGate()
    return
  }

  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/')
}

const openCategoryModal = () => {
  errors.category = ''
  errors.submit = ''
  isCategoryModalOpen.value = true
}

const handleCategorySelect = ({ category, subcategory }) => {
  form.category = category?.name || ''
  form.categoryId = category?.id || null
  form.categorySlug = category?.slug || ''
  form.categoryIcon = category?.icon || ''

  form.subcategory = subcategory?.name || ''
  form.subcategoryId = subcategory?.id || null
  form.subcategorySlug = subcategory?.slug || ''
  form.subcategoryIcon = subcategory?.icon || ''

  errors.category = ''
  errors.submit = ''
  isCategoryModalOpen.value = false
}

const openLocationModal = () => {
  errors.location = ''
  errors.submit = ''
  isLocationModalOpen.value = true
}

const handleLocationSelect = (place) => {
  form.location = place.name || ''
  form.address = place.address || ''
  form.locationUrl = place.url || ''
  form.lat = toNullableNumber(place.lat)
  form.lng = toNullableNumber(place.lng)

  errors.location = ''
  errors.submit = ''
}

const validateCategory = () => {
  if (!form.categoryId || !form.categorySlug || !form.category) {
    errors.category = 'Выберите категорию'
    return false
  }

  errors.category = ''
  return true
}

const validateLocation = () => {
  if (!hasSelectedLocation.value) {
    errors.location = 'Выберите место на карте'
    return false
  }

  errors.location = ''
  return true
}

const validateProgram = () => {
  if (!activeTypeConfig.value.showProgram || !form.hasProgram) return true

  const items = form.program.filter((item) => item.time || item.title || item.description)

  if (!items.length) {
    errors.submit = 'Добавьте хотя бы один пункт программы'
    return false
  }

  if (items.some((item) => !String(item.title || '').trim())) {
    errors.submit = 'У каждого пункта программы должно быть название'
    return false
  }

  return true
}

const validatePolls = () => {
  if (!activeTypeConfig.value.showPolls || !form.hasPoll) return true

  const polls = form.polls.filter((poll) => poll.question || poll.options.some((option) => option.text))

  if (!polls.length) {
    errors.submit = 'Добавьте хотя бы один опрос'
    return false
  }

  for (const poll of polls) {
    if (!String(poll.question || '').trim()) {
      errors.submit = 'У опроса должен быть вопрос'
      return false
    }

    if (poll.options.filter((option) => String(option.text || '').trim()).length < 2) {
      errors.submit = 'В опросе должно быть минимум 2 варианта'
      return false
    }
  }

  return true
}

const validateRegistrationQuestions = () => {
  if (!activeTypeConfig.value.showRegistrationQuestions || !form.hasRegistrationQuestions) {
    return true
  }

  const questions = form.registrationQuestions.filter((item) => item.question)

  for (const question of questions) {
    if (!String(question.question || '').trim()) {
      errors.submit = 'У вопроса при записи должен быть текст'
      return false
    }

    if (
      ['select', 'checkbox'].includes(question.inputType) &&
      question.options.filter((option) => String(option.text || '').trim()).length < 1
    ) {
      errors.submit = 'Для выбора или чекбокса добавьте варианты ответа'
      return false
    }
  }

  return true
}

const validateTypeFields = () => {
  if (!form.date) {
    errors.submit = 'Укажите дату'
    return false
  }

  if (!form.time) {
    errors.submit = 'Укажите время'
    return false
  }

  if (!validateLocation()) return false

  if (
    activeTypeConfig.value.showPrice &&
    form.visitType === 'paid' &&
    Number(form.price) < 1
  ) {
    errors.submit = 'Укажите корректную цену'
    return false
  }

  if (!validateProgram()) return false
  if (!validatePolls()) return false
  if (!validateRegistrationQuestions()) return false

  errors.submit = ''
  return true
}

const toggleProgram = () => {
  if (!activeTypeConfig.value.showProgram) return

  form.hasProgram = !form.hasProgram

  if (form.hasProgram && !form.program.length) {
    form.program = [createEmptyProgramItem()]
  }
}

const setVisitType = (type) => {
  if (!activeTypeConfig.value.showVisitType) return

  form.visitType = type

  if (type === 'free') {
    form.price = ''
  }
}

const togglePoll = () => {
  if (!activeTypeConfig.value.showPolls) return

  form.hasPoll = !form.hasPoll

  if (form.hasPoll && !form.polls.length) {
    form.polls = [createEmptyPoll()]
  }
}

const toggleRegistrationQuestions = () => {
  if (!activeTypeConfig.value.showRegistrationQuestions) return

  form.hasRegistrationQuestions = !form.hasRegistrationQuestions

  if (form.hasRegistrationQuestions && !form.registrationQuestions.length) {
    form.registrationQuestions = [createEmptyRegistrationQuestion()]
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files?.[0]

  if (!file) return

  if (form.image && form.image.startsWith('blob:')) {
    URL.revokeObjectURL(form.image)
  }

  form.image = URL.createObjectURL(file)
}

const addProgramItem = () => {
  form.program.push(createEmptyProgramItem())
}

const removeProgramItem = (index) => {
  if (form.program.length === 1) {
    form.program[0] = createEmptyProgramItem()
    return
  }

  form.program.splice(index, 1)
}

const moveProgramItem = (index, direction) => {
  const targetIndex = index + direction

  if (targetIndex < 0 || targetIndex >= form.program.length) return

  const [item] = form.program.splice(index, 1)
  form.program.splice(targetIndex, 0, item)
}

const addPoll = () => {
  form.polls.push(createEmptyPoll())
}

const removePoll = (index) => {
  if (form.polls.length === 1) {
    form.polls[0] = createEmptyPoll()
    return
  }

  form.polls.splice(index, 1)
}

const addPollOption = (pollIndex) => {
  form.polls[pollIndex]?.options.push(createPollOption())
}

const removePollOption = (pollIndex, optionIndex) => {
  const options = form.polls[pollIndex]?.options

  if (!options || options.length <= 2) return

  options.splice(optionIndex, 1)
}

const addRegistrationQuestion = () => {
  form.registrationQuestions.push(createEmptyRegistrationQuestion())
}

const removeRegistrationQuestion = (index) => {
  if (form.registrationQuestions.length === 1) {
    form.registrationQuestions[0] = createEmptyRegistrationQuestion()
    return
  }

  form.registrationQuestions.splice(index, 1)
}

const addRegistrationOption = (questionIndex) => {
  form.registrationQuestions[questionIndex]?.options.push(createRegistrationOption())
}

const removeRegistrationOption = (questionIndex, optionIndex) => {
  const options = form.registrationQuestions[questionIndex]?.options

  if (!options || options.length <= 1) return

  options.splice(optionIndex, 1)
}

const resetCategoryFields = () => {
  form.category = ''
  form.categoryId = null
  form.categorySlug = ''
  form.categoryIcon = ''

  form.subcategory = ''
  form.subcategoryId = null
  form.subcategorySlug = ''
  form.subcategoryIcon = ''
}

const resetLocationFields = () => {
  form.location = ''
  form.address = ''
  form.locationUrl = ''
  form.lat = null
  form.lng = null
}

const resetForm = () => {
  if (form.image && form.image.startsWith('blob:')) {
    URL.revokeObjectURL(form.image)
  }

  const currentType = form.eventType

  form.eventType = currentType
  form.title = ''

  resetCategoryFields()

  form.date = ''
  form.time = ''
  form.durationMinutes = ''
  form.ageLimit = ''
  form.language = 'ru'

  resetLocationFields()

  form.description = ''
  form.hasProgram = false
  form.program = [createEmptyProgramItem()]

  form.visitType = 'free'
  form.price = ''
  form.limit = ''

  form.registrationRequired = activeTypeConfig.value.showRegistration
  form.registrationDeadline = ''
  form.accessType = 'open'
  form.allowWaitlist = false

  form.hasPoll = false
  form.polls = [createEmptyPoll()]

  form.hasRegistrationQuestions = false
  form.registrationQuestions = [createEmptyRegistrationQuestion()]

  form.contactPhone = ''
  form.contactWhatsapp = ''
  form.contactTelegram = ''
  form.externalUrl = ''

  form.visibility = 'public'
  form.allowComments = true
  form.allowShare = true

  form.image = ''

  clearTypeSpecificFields()

  errors.category = ''
  errors.location = ''
  errors.submit = ''
  isSubmitted.value = false
  isEventNotFound.value = false
}

const fillTestData = () => {
  if (form.image && form.image.startsWith('blob:')) {
    URL.revokeObjectURL(form.image)
  }

  const testByType = {
    event: {
      title: 'Frontend Meetup Karaganda',
      description:
        'Встреча frontend-разработчиков, дизайнеров и продуктовых специалистов. Обсудим Vue, UX, производительность интерфейсов и реальные кейсы разработки городских сервисов.',
      limit: 120,
      durationMinutes: 150,
      ageLimit: '16+',
      hasProgram: true,
      hasRegistrationQuestions: true,
      hasPoll: false,
    },
    meeting: {
      title: 'Кофе и знакомство в центре',
      description: 'Небольшая встреча для знакомства, общения и обсуждения городских проектов.',
      limit: 12,
      durationMinutes: 90,
      ageLimit: '',
      hasProgram: false,
      hasRegistrationQuestions: false,
      hasPoll: false,
    },
    announcement: {
      title: 'Открытие нового пространства',
      description:
        'В городе открывается новое общественное пространство для встреч, обучения и небольших событий.',
      limit: '',
      durationMinutes: '',
      ageLimit: '',
      hasProgram: false,
      hasRegistrationQuestions: false,
      hasPoll: false,
    },
    activity: {
      title: 'Утренняя прогулка в парке',
      description: 'Собираемся на лёгкую прогулку, общение и заряд бодрости. Возьмите удобную обувь и воду.',
      limit: 20,
      durationMinutes: 60,
      ageLimit: '12+',
      hasProgram: false,
      hasRegistrationQuestions: true,
      hasPoll: false,
    },
    plan: {
      title: 'Кто хочет сходить на футбол?',
      description: 'Проверяем интерес. Если соберётся достаточно людей, выберем дату, место и формат.',
      limit: 10,
      durationMinutes: '',
      ageLimit: '',
      hasProgram: false,
      hasRegistrationQuestions: false,
      hasPoll: true,
    },
  }

  const data = testByType[form.eventType] || testByType.event

  form.title = data.title
  form.description = data.description
  form.limit = data.limit
  form.durationMinutes = data.durationMinutes
  form.ageLimit = data.ageLimit
  form.language = 'ru'

  resetCategoryFields()

  form.date = '2026-05-28'
  form.time = '18:30'

  form.location = 'IT Hub Karaganda'
  form.address = 'Караганда, проспект Бухар-Жырау 32'
  form.locationUrl = 'https://www.openstreetmap.org/?mlat=49.8047&mlon=73.1094#map=17/49.8047/73.1094'
  form.lat = 49.8047
  form.lng = 73.1094

  form.hasProgram = activeTypeConfig.value.showProgram && data.hasProgram
  form.hasPoll = activeTypeConfig.value.showPolls && data.hasPoll
  form.hasRegistrationQuestions =
    activeTypeConfig.value.showRegistrationQuestions && data.hasRegistrationQuestions

  form.visitType = activeTypeConfig.value.showVisitType ? 'paid' : 'free'
  form.price = form.visitType === 'paid' ? 3000 : ''

  form.registrationRequired = activeTypeConfig.value.showRegistration
  form.registrationDeadline = ''
  form.accessType = 'open'
  form.allowWaitlist = true

  form.contactPhone = '+77000000000'
  form.contactWhatsapp = '+77000000000'
  form.contactTelegram = '@qala'
  form.externalUrl = 'https://example.com'

  form.visibility = 'public'
  form.allowComments = true
  form.allowShare = true

  form.image = activeTypeConfig.value.showCover
    ? 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1400&auto=format&fit=crop'
    : ''

  form.program = form.hasProgram
    ? [
        {
          id: programId++,
          time: '18:30',
          title: 'Сбор гостей',
          description: 'Регистрация участников, знакомство и свободное общение.',
        },
        {
          id: programId++,
          time: '19:00',
          title: 'Выступление спикеров',
          description: 'Практические доклады про Vue, UX и разработку городских сервисов.',
        },
        {
          id: programId++,
          time: '20:30',
          title: 'Нетворкинг',
          description: 'Обсуждение проектов, обмен контактами и ответы на вопросы.',
        },
      ]
    : [createEmptyProgramItem()]

  form.polls = form.hasPoll
    ? [
        {
          id: pollId++,
          question: 'Какой формат вам удобнее?',
          pollType: 'single',
          options: [
            createPollOption('Сходить вместе'),
            createPollOption('Сначала обсудить детали'),
            createPollOption('Выбрать другую дату'),
          ],
        },
      ]
    : [createEmptyPoll()]

  form.registrationQuestions = form.hasRegistrationQuestions
    ? [
        {
          id: questionId++,
          question: 'Сколько человек будет с вами?',
          inputType: 'number',
          isRequired: true,
          options: [createRegistrationOption()],
        },
        {
          id: questionId++,
          question: 'Есть ли пожелания?',
          inputType: 'textarea',
          isRequired: false,
          options: [createRegistrationOption()],
        },
      ]
    : [createEmptyRegistrationQuestion()]

  errors.category = ''
  errors.location = ''
  errors.submit = ''
  isSubmitted.value = false
  isEventNotFound.value = false
}

const buildProgramPayload = () => {
  if (!activeTypeConfig.value.showProgram || !form.hasProgram) return []

  return form.program
    .filter((item) => item.time || item.title || item.description)
    .map(({ time, title, description }) => ({
      time,
      title,
      description,
    }))
}

const buildPollsPayload = () => {
  if (!activeTypeConfig.value.showPolls || !form.hasPoll) return []

  return form.polls
    .map((poll) => ({
      question: poll.question.trim(),
      pollType: poll.pollType,
      options: poll.options.map((option) => option.text.trim()).filter(Boolean),
    }))
    .filter((poll) => poll.question || poll.options.length)
}

const buildRegistrationQuestionsPayload = () => {
  if (!activeTypeConfig.value.showRegistrationQuestions || !form.hasRegistrationQuestions) {
    return []
  }

  return form.registrationQuestions
    .map((question) => ({
      question: question.question.trim(),
      inputType: question.inputType,
      isRequired: question.isRequired,
      options: question.options.map((option) => option.text.trim()).filter(Boolean),
    }))
    .filter((question) => question.question)
}

const buildEventPayload = () => {
  const config = activeTypeConfig.value

  return {
    eventType: form.eventType,

    title: form.title.trim(),
    description: form.description.trim(),

    category: form.category,
    categoryId: form.categoryId,
    categorySlug: form.categorySlug,

    subcategory: form.subcategory,
    subcategoryId: form.subcategoryId,
    subcategorySlug: form.subcategorySlug,

    date: form.date || null,
    time: form.time || null,

    durationMinutes: config.showDuration && form.durationMinutes ? Number(form.durationMinutes) : null,
    ageLimit: config.showAgeLimit ? form.ageLimit || null : null,
    language: form.language,

    location: form.location.trim(),
    address: form.address.trim(),
    locationUrl: form.locationUrl.trim(),
    lat: toNullableNumber(form.lat),
    lng: toNullableNumber(form.lng),

    visitType: config.showVisitType ? form.visitType : 'free',
    price: config.showPrice && form.visitType === 'paid' ? Number(form.price) : null,
    limit: config.showLimit && form.limit ? Number(form.limit) : null,

    registrationRequired: config.showRegistration ? form.registrationRequired : false,
    registrationDeadline:
      config.showRegistration && form.registrationDeadline
        ? form.registrationDeadline
        : null,

    accessType: config.showRegistration ? form.accessType : 'open',
    allowWaitlist: config.showRegistration ? form.allowWaitlist : false,

    contactPhone: config.showContacts ? form.contactPhone.trim() || null : null,
    contactWhatsapp: config.showContacts ? form.contactWhatsapp.trim() || null : null,
    contactTelegram: config.showContacts ? form.contactTelegram.trim() || null : null,
    externalUrl: config.showContacts ? form.externalUrl.trim() || null : null,

    visibility: form.visibility,
    allowComments: form.allowComments,
    allowShare: form.allowShare,

    image: config.showCover ? form.image : '',

    hasProgram: config.showProgram && form.hasProgram,
    program: buildProgramPayload(),

    polls: buildPollsPayload(),
    registrationQuestions: buildRegistrationQuestionsPayload(),
  }
}

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || data?.status === false) {
    const err = new Error(data?.message || 'Ошибка запроса')
    err.response = data
    err.status = response.status
    throw err
  }

  return data
}

const loadEventRequest = async () => {
  return requestJson(`${API_URL}/event/${eventId.value}`, {
    method: 'GET',
  })
}

const saveEventRequest = async (payload) => {
  const url = isEditMode.value
    ? `${API_URL}/event/update/${eventId.value}`
    : `${API_URL}/event/create`

  return requestJson(url, {
    method: isEditMode.value ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  })
}

const fillFormFromEvent = (eventData) => {
  const event = eventData?.event || eventData
  const program = eventData?.program || eventData?.event_program_items || event?.program || []
  const polls = eventData?.polls || []
  const registrationQuestions = eventData?.registration_questions || eventData?.registrationQuestions || []

  if (!event) {
    throw new Error('Событие не найдено')
  }

  if (form.image && form.image.startsWith('blob:')) {
    URL.revokeObjectURL(form.image)
  }

  form.eventType = event.event_type || event.eventType || 'event'
  hasPickedEventType.value = true

  form.title = event.title || ''
  form.description = event.description || ''

  form.category = event.category_name || event.category || ''
  form.categoryId = event.category_id || event.categoryId || null
  form.categorySlug = event.category_slug || event.categorySlug || ''
  form.categoryIcon = event.category_icon || event.categoryIcon || ''

  form.subcategory = event.subcategory_name || event.subcategory || ''
  form.subcategoryId = event.subcategory_id || event.subcategoryId || null
  form.subcategorySlug = event.subcategory_slug || event.subcategorySlug || ''
  form.subcategoryIcon = event.subcategory_icon || event.subcategoryIcon || ''

  form.date = normalizeDate(event.event_date || event.date)
  form.time = normalizeTime(event.event_time || event.time)

  form.durationMinutes = event.duration_minutes || event.durationMinutes || ''
  form.ageLimit = event.age_limit || event.ageLimit || ''
  form.language = event.language || 'ru'

  form.location = event.location_title || event.location || ''
  form.address = event.address || ''
  form.locationUrl = event.location_url || event.locationUrl || ''
  form.lat = toNullableNumber(event.lat)
  form.lng = toNullableNumber(event.lng)

  form.visitType = event.visit_type || event.visitType || 'free'
  form.price = form.visitType === 'paid' ? Number(event.price || 0) : ''
  form.limit = event.participants_limit || event.limit || ''

  form.registrationRequired = Boolean(event.registration_required ?? event.registrationRequired)
  form.registrationDeadline = normalizeDateTimeLocal(
    event.registration_deadline || event.registrationDeadline
  )
  form.accessType = event.access_type || event.accessType || 'open'
  form.allowWaitlist = Boolean(event.allow_waitlist ?? event.allowWaitlist)

  form.contactPhone = event.contact_phone || event.contactPhone || ''
  form.contactWhatsapp = event.contact_whatsapp || event.contactWhatsapp || ''
  form.contactTelegram = event.contact_telegram || event.contactTelegram || ''
  form.externalUrl = event.external_url || event.externalUrl || ''

  form.visibility = event.visibility || 'public'
  form.allowComments = Boolean(event.allow_comments ?? event.allowComments ?? true)
  form.allowShare = Boolean(event.allow_share ?? event.allowShare ?? true)

  form.image = event.image_url || event.image || ''

  form.hasProgram = Boolean(event.has_program ?? event.hasProgram)
  form.program = Array.isArray(program) && program.length
    ? program.map((item) => ({
        id: programId++,
        time: normalizeTime(item.program_time || item.time),
        title: item.title || '',
        description: item.description || '',
      }))
    : [createEmptyProgramItem()]

  form.hasPoll = Array.isArray(polls) && polls.length > 0
  form.polls = form.hasPoll
    ? polls.map((poll) => ({
        id: pollId++,
        question: poll.question || '',
        pollType: poll.poll_type || poll.pollType || 'single',
        options: Array.isArray(poll.options) && poll.options.length
          ? poll.options.map((option) =>
              createPollOption(option.option_text || option.text || '')
            )
          : [createPollOption(), createPollOption()],
      }))
    : [createEmptyPoll()]

  form.hasRegistrationQuestions =
    Array.isArray(registrationQuestions) && registrationQuestions.length > 0

  form.registrationQuestions = form.hasRegistrationQuestions
    ? registrationQuestions.map((item) => ({
        id: questionId++,
        question: item.question || '',
        inputType: item.input_type || item.inputType || 'text',
        isRequired: Boolean(item.is_required ?? item.isRequired),
        options: Array.isArray(item.options) && item.options.length
          ? item.options.map((option) => createRegistrationOption(option))
          : [createRegistrationOption()],
      }))
    : [createEmptyRegistrationQuestion()]

  clearTypeSpecificFields()

  errors.category = ''
  errors.location = ''
  errors.submit = ''
  isSubmitted.value = false
  isEventNotFound.value = false
}

const loadEventForEdit = async () => {
  isEventNotFound.value = false

  if (!isEditMode.value) {
    resetForm()
    hasPickedEventType.value = false
    return
  }

  try {
    isLoadingEvent.value = true
    errors.submit = ''

    const data = await loadEventRequest()

    if (!data?.data) {
      isEventNotFound.value = true
      return
    }

    fillFormFromEvent(data.data)
  } catch (err) {
    console.error('Load event error:', err)

    if (err?.status === 404) {
      isEventNotFound.value = true
      errors.submit = ''
      return
    }

    errors.submit =
      err?.response?.message ||
      err?.message ||
      'Не удалось загрузить событие'
  } finally {
    isLoadingEvent.value = false
  }
}

const openDeleteModal = () => {
  if (!isEditMode.value || !eventId.value || isEventNotFound.value) return

  errors.submit = ''
  isDeleteModalOpen.value = true
}

const handleEventDeleted = () => {
  isSubmitted.value = false
  router.push('/')
}

const submitEvent = async () => {
  if (isSubmitting.value || isEventNotFound.value) return

  errors.submit = ''

  if (!validateCategory() || !validateTypeFields()) return

  const payload = buildEventPayload()

  try {
    isSubmitting.value = true

    await saveEventRequest(payload)

    isSubmitted.value = true
  } catch (err) {
    console.error('Save event request error:', err)

    errors.submit =
      err?.response?.message ||
      err?.message ||
      (isEditMode.value
        ? 'Не удалось сохранить изменения'
        : 'Не удалось создать публикацию')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadEventForEdit()
})

onBeforeUnmount(() => {
  if (form.image && form.image.startsWith('blob:')) {
    URL.revokeObjectURL(form.image)
  }
})

watch(
  () => route.params.id,
  () => {
    loadEventForEdit()
  }
)
</script>

<style scoped>
.qala-create-page {
  --c: #111;
  --muted: #737373;
  --soft: #8a8a8a;
  --line: #eee;
  --bg: #fff;
  --bg2: #fafafa;
  --bg3: #f7f7f7;
  --danger: #ef4444;
  --pill: 999px;
  --tr: 0.16s ease;
  width: 100%;
  min-height: 100vh;
  background: var(--bg);
}

.qala-create-shell {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 28px 32px 56px;
}

.qala-create-header,
.qala-program-item-top,
.qala-program-actions {
  display: flex;
  align-items: center;
}

.qala-create-header {
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.qala-create-header h1,
.qala-create-header p,
.qala-preview-section h2,
.qala-preview-content h3,
.qala-preview-program h4,
.qala-preview-program-content p,
.qala-type-gate-head h2,
.qala-type-gate-head p,
.qala-section-title h3,
.qala-section-title p {
  margin: 0;
}

.qala-create-header h1 {
  color: #050505;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.qala-create-header p {
  margin-top: 7px;
  color: var(--muted);
  font-size: 15px;
  font-weight: 500;
}

.qala-type-gate {
  max-width: 980px;
  margin: 0 auto;
  padding: 34px 0 60px;
}

.qala-type-gate-head {
  margin-bottom: 18px;
  text-align: center;
}

.qala-type-gate-head span {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  margin-bottom: 12px;
  border-radius: var(--pill);
  background: var(--bg3);
  color: var(--c);
  font-size: 12px;
  font-weight: 900;
}

.qala-type-gate-head h2 {
  color: var(--c);
  font-size: 34px;
  font-weight: 950;
  letter-spacing: -0.055em;
}

.qala-type-gate-head p {
  margin-top: 8px;
  color: var(--muted);
  font-size: 15px;
  font-weight: 600;
}

.qala-event-type-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.qala-event-type-card {
  min-height: 112px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--bg);
  color: var(--c);
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) 26px;
  align-items: center;
  gap: 14px;
  text-align: left;
  transition: background var(--tr), border-color var(--tr), transform var(--tr);
}

.qala-event-type-card:hover {
  background: var(--bg2);
  border-color: #dcdcdc;
  transform: translateY(-1px);
}

.qala-event-type-icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: var(--bg3);
  display: grid;
  place-items: center;
  font-size: 24px;
}

.qala-event-type-card strong,
.qala-event-type-card small {
  display: block;
}

.qala-event-type-card strong {
  color: var(--c);
  font-size: 16px;
  font-weight: 950;
  letter-spacing: -0.025em;
}

.qala-event-type-card small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}

.qala-event-type-card > i {
  color: var(--soft);
  font-size: 24px;
}

.qala-create-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 32px;
  align-items: start;
}

.qala-create-left,
.qala-form-section,
.qala-program-list,
.qala-program-item,
.qala-form-group,
.qala-preview-body,
.qala-preview-actions,
.qala-inner-section {
  display: grid;
}

.qala-create-left {
  gap: 24px;
}

.qala-form-section,
.qala-inner-section {
  gap: 17px;
}

.qala-inner-section {
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: var(--bg);
}

.qala-section-title h3 {
  color: var(--c);
  font-size: 17px;
  font-weight: 950;
  letter-spacing: -0.035em;
}

.qala-section-title p {
  margin-top: 5px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.qala-form-group {
  display: grid;
  gap: 8px;
}

.qala-form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.qala-create-left,
.qala-create-right,
.qala-upload-section,
.qala-form-section,
.qala-preview-section,
.qala-preview-content,
.qala-preview-program-content {
  min-width: 0;
}

.qala-create-right {
  position: sticky;
  top: 24px;
  align-self: start;
}

.qala-create-close,
.qala-upload-icon,
.qala-program-action-btn,
.qala-program-remove,
.qala-preview-empty,
.qala-preview-date,
.qala-preview-program-time,
.qala-mini-danger {
  display: grid;
  place-items: center;
}

.qala-create-close,
.qala-program-action-btn,
.qala-program-remove,
.qala-mini-danger {
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: var(--pill);
  background: var(--bg);
}

.qala-create-close {
  width: 42px;
  height: 42px;
  color: var(--c);
  text-decoration: none;
}

.qala-create-close:hover,
.qala-cover-upload:hover,
.qala-visit-type-btn:hover,
.qala-current-type-btn:hover,
.qala-program-add:hover,
.qala-preview-map-link:hover,
.qala-secondary-btn:hover,
.qala-test-btn:hover,
.qala-location-btn:hover {
  background: var(--bg3);
  color: var(--c);
}

.qala-cover-upload {
  position: relative;
  width: 100%;
  height: 280px;
  border: 1px dashed #dcdcdc;
  border-radius: 28px;
  background: var(--bg2);
  display: grid;
  place-items: center;
  overflow: hidden;
  cursor: pointer;
}

.qala-cover-preview,
.qala-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qala-cover-placeholder {
  display: grid;
  place-items: center;
  text-align: center;
  padding: 24px;
}

.qala-upload-icon {
  width: 58px;
  height: 58px;
  margin-bottom: 14px;
  border-radius: var(--pill);
  background: var(--bg);
  color: var(--c);
  font-size: 26px;
  box-shadow: 0 8px 24px #0000000f;
}

.qala-cover-placeholder strong {
  color: var(--c);
  font-size: 17px;
  font-weight: 900;
}

.qala-cover-placeholder span {
  margin-top: 4px;
  color: var(--soft);
  font-size: 13px;
  font-weight: 600;
}

.qala-form-group label {
  color: var(--c);
  font-size: 13px;
  font-weight: 850;
}

.qala-required,
.qala-field-hint.error,
.qala-program-remove,
.qala-mini-danger {
  color: var(--danger);
}

.qala-optional {
  margin-left: 6px;
  color: var(--soft);
  font-size: 11px;
  font-weight: 700;
}

.qala-field-hint {
  color: var(--soft);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.qala-input,
.qala-textarea {
  width: 100%;
  border: 1px solid var(--line);
  outline: 0;
  border-radius: 15px;
  background: var(--bg);
  color: var(--c);
  font-size: 14px;
  font-weight: 600;
  transition: border-color var(--tr), box-shadow var(--tr);
}

.qala-input {
  height: 46px;
  padding: 0 15px;
}

.qala-textarea {
  resize: vertical;
  min-height: 132px;
  padding: 14px 15px;
  line-height: 1.55;
}

.qala-input:focus,
.qala-textarea:focus {
  border-color: var(--c);
  box-shadow: 0 0 0 4px #0000000a;
}

.qala-input::placeholder,
.qala-textarea::placeholder {
  color: #9a9a9a;
}

.qala-current-type,
.qala-visit-type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.qala-current-type-btn,
.qala-visit-type-btn,
.qala-preview-category,
.qala-preview-map-link,
.qala-primary-btn,
.qala-secondary-btn,
.qala-test-btn,
.qala-danger-btn,
.qala-program-add,
.qala-success-alert {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.qala-current-type-btn,
.qala-visit-type-btn,
.qala-preview-map-link,
.qala-primary-btn,
.qala-secondary-btn,
.qala-test-btn,
.qala-danger-btn,
.qala-success-alert {
  border-radius: var(--pill);
}

.qala-current-type-btn,
.qala-visit-type-btn {
  height: 42px;
  padding: 0 16px;
  gap: 8px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--c);
  font-size: 13px;
  font-weight: 850;
}

.qala-current-type-btn.active,
.qala-visit-type-btn.active {
  border-color: var(--c);
  background: var(--c);
  color: #fff;
}

.qala-location-btn {
  width: 100%;
  min-height: 64px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--bg2);
  color: var(--c);
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.qala-location-btn.error {
  border-color: var(--danger);
  background: #fff1f2;
}

.qala-location-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--pill);
  background: var(--bg);
  display: grid;
  place-items: center;
  color: var(--c);
  font-size: 20px;
  box-shadow: 0 8px 24px #0000000f;
}

.qala-location-content {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.qala-location-content strong,
.qala-location-content small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qala-location-content strong {
  color: var(--c);
  font-size: 14px;
  font-weight: 900;
}

.qala-location-content small {
  color: var(--soft);
  font-size: 12px;
  font-weight: 600;
}

.qala-location-arrow {
  color: var(--soft);
  font-size: 16px;
}

.qala-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--bg2);
}

.qala-toggle-row small {
  display: block;
  margin-top: 4px;
  color: var(--soft);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
}

.qala-toggle {
  width: 48px;
  height: 28px;
  padding: 3px;
  border: 0;
  border-radius: var(--pill);
  background: #ddd;
  flex-shrink: 0;
  transition: background var(--tr);
}

.qala-toggle span {
  width: 22px;
  height: 22px;
  border-radius: var(--pill);
  background: #fff;
  display: block;
  transition: transform var(--tr);
  box-shadow: 0 2px 8px #00000024;
}

.qala-toggle.active {
  background: var(--c);
}

.qala-toggle.active span {
  transform: translateX(20px);
}

.qala-program-list {
  gap: 12px;
}

.qala-program-item {
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--bg2);
}

.qala-program-item-top {
  justify-content: space-between;
  gap: 12px;
}

.qala-program-item-top strong,
.qala-preview-program-content strong,
.qala-preview-poll strong {
  color: var(--c);
  font-size: 13px;
  font-weight: 900;
}

.qala-program-actions {
  gap: 6px;
  flex-shrink: 0;
}

.qala-program-action-btn,
.qala-program-remove,
.qala-mini-danger {
  width: 34px;
  height: 34px;
  transition: background var(--tr), border-color var(--tr), color var(--tr), opacity var(--tr);
}

.qala-program-action-btn {
  color: var(--c);
}

.qala-program-action-btn:hover:not(:disabled) {
  background: #f2f2f2;
  border-color: #dcdcdc;
}

.qala-program-action-btn:disabled,
.qala-mini-danger:disabled {
  color: #c5c5c5;
  background: #f8f8f8;
  cursor: not-allowed;
  opacity: 0.7;
}

.qala-program-remove:hover,
.qala-mini-danger:hover:not(:disabled) {
  background: #fff1f2;
  border-color: #fecdd3;
}

.qala-program-textarea {
  min-height: 86px;
}

.qala-program-add {
  width: 100%;
  height: 42px;
  margin-top: 4px;
  border: 1px dashed #d9d9d9;
  border-radius: 16px;
  background: var(--bg);
  color: var(--c);
  gap: 8px;
  font-size: 13px;
  font-weight: 850;
}

.qala-program-add:hover {
  border-color: #cfcfcf;
}

.qala-inline-option {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 38px;
  gap: 8px;
  align-items: center;
}

.qala-switch-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.qala-switch-card {
  min-height: 64px;
  padding: 13px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--bg2);
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.qala-switch-card.compact {
  min-height: 46px;
  align-items: center;
}

.qala-switch-card input {
  margin-top: 3px;
  accent-color: var(--c);
}

.qala-switch-card strong,
.qala-switch-card small {
  display: block;
}

.qala-switch-card strong {
  color: var(--c);
  font-size: 13px;
  font-weight: 900;
}

.qala-switch-card small {
  margin-top: 3px;
  color: var(--soft);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
}

.qala-preview-section {
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--bg);
  padding: 16px;
}

.qala-preview-section h2 {
  margin-bottom: 14px;
  color: var(--c);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.qala-preview-card {
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
  background: var(--bg);
}

.qala-preview-image-wrap {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #f3f4f6;
  overflow: hidden;
}

.qala-preview-empty {
  width: 100%;
  height: 100%;
  color: #b0b0b0;
  font-size: 34px;
}

.qala-preview-category {
  position: absolute;
  left: 12px;
  bottom: 12px;
  height: 28px;
  padding: 0 11px;
  background: #ffffffeb;
  color: var(--c);
  font-size: 12px;
  font-weight: 850;
  backdrop-filter: blur(10px);
}

.qala-preview-type-line {
  padding: 12px 14px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.qala-preview-type-line span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  padding: 0 11px;
  border-radius: var(--pill);
  background: var(--bg3);
  color: var(--c);
  font-size: 12px;
  font-weight: 900;
}

.qala-preview-type-line small {
  min-width: 0;
  color: var(--soft);
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qala-preview-body {
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 12px;
  padding: 14px;
}

.qala-preview-date {
  width: 52px;
  height: 56px;
  border-radius: 16px;
  background: var(--bg3);
  align-content: center;
}

.qala-preview-date span {
  color: var(--c);
  font-size: 20px;
  font-weight: 950;
  line-height: 1;
  letter-spacing: -0.04em;
}

.qala-preview-date small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
}

.qala-preview-content h3 {
  margin-bottom: 8px;
  color: var(--c);
  font-size: 15px;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.qala-preview-content p {
  margin: 0 0 10px;
  color: #707070;
  font-size: 13px;
  font-weight: 600;
}

.qala-preview-content p,
.qala-preview-meta,
.qala-preview-meta span,
.qala-preview-map-link {
  display: flex;
  align-items: center;
}

.qala-preview-content p,
.qala-preview-meta span {
  gap: 5px;
}

.qala-preview-meta {
  flex-wrap: wrap;
  gap: 9px;
  color: #555;
  font-size: 12px;
  font-weight: 750;
}

.qala-preview-map-link {
  width: fit-content;
  min-height: 32px;
  margin-top: 12px;
  padding: 0 12px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--c);
  gap: 7px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 850;
}

.qala-preview-program {
  margin: 0 14px 14px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.qala-preview-program h4 {
  margin-bottom: 12px;
  color: var(--c);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.025em;
}

.qala-preview-program-item {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 10px;
}

.qala-preview-program-item + .qala-preview-program-item,
.qala-preview-poll + .qala-preview-poll {
  margin-top: 12px;
}

.qala-preview-program-time {
  height: 34px;
  border-radius: var(--pill);
  background: #f3f4f6;
  color: var(--c);
  font-size: 12px;
  font-weight: 900;
}

.qala-preview-program-content strong {
  display: block;
  line-height: 1.25;
}

.qala-preview-program-content p {
  margin-top: 4px;
  color: #666;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.qala-preview-poll-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.qala-preview-poll-options span {
  min-height: 28px;
  padding: 6px 10px;
  border-radius: var(--pill);
  background: var(--bg3);
  color: #555;
  font-size: 12px;
  font-weight: 750;
}

.qala-preview-actions {
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 12px;
}

.qala-primary-btn,
.qala-secondary-btn,
.qala-test-btn,
.qala-danger-btn {
  width: 100%;
  min-height: 44px;
  padding: 0 17px;
  gap: 8px;
  font-size: 14px;
  font-weight: 850;
}

.qala-primary-btn {
  border: 0;
  background: var(--c);
  color: #fff;
}

.qala-primary-btn:hover {
  background: #222;
}

.qala-primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.qala-secondary-btn,
.qala-test-btn {
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--c);
}

.qala-test-btn {
  border-color: #dcdcdc;
  background: var(--bg2);
}

.qala-danger-btn {
  border: 1px solid #fecdd3;
  background: #fff1f2;
  color: #dc2626;
}

.qala-danger-btn:hover {
  background: #ffe4e6;
  color: #b91c1c;
}

.qala-success-alert {
  position: fixed;
  left: 50%;
  bottom: 28px;
  z-index: 300;
  transform: translateX(-50%);
  min-height: 46px;
  padding: 0 17px;
  background: var(--c);
  color: #fff;
  gap: 9px;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 16px 40px #0000002e;
}

.qala-success-alert i {
  color: #22c55e;
}

.qala-not-found {
  min-height: 520px;
  display: grid;
  place-items: center;
  padding: 40px 0;
}

.qala-not-found-card {
  width: 100%;
  max-width: 460px;
  padding: 34px 24px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: var(--bg);
  text-align: center;
}

.qala-not-found-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 18px;
  border-radius: var(--pill);
  background: var(--bg3);
  color: var(--c);
  display: grid;
  place-items: center;
  font-size: 34px;
}

.qala-not-found-card h2 {
  margin: 0;
  color: var(--c);
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.qala-not-found-card p {
  margin: 10px auto 22px;
  max-width: 360px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.qala-not-found-actions {
  display: grid;
  gap: 10px;
}

@media (min-width: 1600px) {
  .qala-create-shell {
    max-width: 1640px;
  }

  .qala-create-card {
    grid-template-columns: minmax(0, 1fr) 440px;
  }

  .qala-cover-upload {
    height: 300px;
  }
}

@media (min-width: 1900px) {
  .qala-create-shell {
    max-width: 1760px;
  }

  .qala-create-card {
    grid-template-columns: minmax(0, 1fr) 460px;
  }

  .qala-cover-upload {
    height: 320px;
  }
}

@media (max-width: 1199px) {
  .qala-create-shell {
    padding: 24px 24px 56px;
  }

  .qala-create-card {
    grid-template-columns: 1fr;
  }

  .qala-create-right {
    position: static;
  }
}

@media (max-width: 860px) {
  .qala-create-page {
    overflow-x: hidden;
  }

  .qala-create-shell {
    max-width: none;
    margin: 0;
    padding: 18px 14px 82px;
  }

  .qala-create-header {
    margin-bottom: 18px;
  }

  .qala-create-header h1 {
    font-size: 25px;
  }

  .qala-create-header p {
    font-size: 14px;
  }

  .qala-type-gate {
    padding-top: 20px;
  }

  .qala-type-gate-head h2 {
    font-size: 28px;
  }

  .qala-event-type-grid,
  .qala-create-card,
  .qala-form-row,
  .qala-switch-grid {
    grid-template-columns: 1fr;
  }

  .qala-event-type-card {
    min-height: 96px;
    border-radius: 22px;
  }

  .qala-create-card {
    gap: 20px;
  }

  .qala-create-left,
  .qala-create-right,
  .qala-upload-section,
  .qala-form-section,
  .qala-preview-section {
    width: 100%;
  }

  .qala-cover-upload {
    height: auto;
    aspect-ratio: 4 / 3;
    border-radius: 22px;
  }

  .qala-current-type,
  .qala-visit-type-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .qala-current-type-btn,
  .qala-visit-type-btn,
  .qala-success-alert {
    justify-content: center;
  }

  .qala-success-alert {
    left: 12px;
    right: 12px;
    bottom: 70px;
    transform: none;
  }
}

@media (max-width: 520px) {
  .qala-current-type {
    grid-template-columns: 1fr;
  }

  .qala-program-item-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .qala-program-actions {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .qala-program-action-btn,
  .qala-program-remove {
    width: 100%;
    height: 38px;
    border-radius: 14px;
  }

  .qala-inline-option {
    grid-template-columns: 1fr;
  }

  .qala-mini-danger {
    width: 100%;
    height: 38px;
    border-radius: 14px;
  }
}

@media (max-width: 420px) {
  .qala-create-shell {
    max-width: none;
    padding-inline: 12px;
  }

  .qala-preview-body {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .qala-preview-date {
    width: 48px;
  }
}
</style>