// backend/src/db/migrations/20260520_create_event_categories.js

export async function up(knex) {
  await knex.schema.createTable('event_categories', (table) => {
    table.increments('id').primary()

    table.string('slug', 100).notNullable().unique()
    table.string('icon', 80).nullable()

    table.integer('sort_order').unsigned().notNullable().defaultTo(0)
    table.boolean('is_active').notNullable().defaultTo(true)

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    table.index(['is_active'])
    table.index(['sort_order'])
  })

  await knex.schema.createTable('event_category_translations', (table) => {
    table.increments('id').primary()

    table
      .integer('category_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('event_categories')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.string('locale', 8).notNullable()
    table.string('name', 100).notNullable()

    table.unique(['category_id', 'locale'])
    table.index(['locale'])
  })

  await knex.schema.createTable('event_subcategories', (table) => {
    table.increments('id').primary()

    table
      .integer('category_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('event_categories')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.string('slug', 100).notNullable()
    table.string('icon', 80).nullable()

    table.integer('sort_order').unsigned().notNullable().defaultTo(0)
    table.boolean('is_active').notNullable().defaultTo(true)

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    table.unique(['category_id', 'slug'])

    table.index(['category_id'])
    table.index(['is_active'])
    table.index(['sort_order'])
  })

  await knex.schema.createTable('event_subcategory_translations', (table) => {
    table.increments('id').primary()

    table
      .integer('subcategory_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('event_subcategories')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.string('locale', 8).notNullable()
    table.string('name', 100).notNullable()

    table.unique(['subcategory_id', 'locale'])
    table.index(['locale'])
  })

  await knex('event_categories').insert([
    {
      id: 1,
      slug: 'concerts-shows',
      icon: 'bi-music-note-beamed',
      sort_order: 10,
    },
    {
      id: 2,
      slug: 'education',
      icon: 'bi-mortarboard',
      sort_order: 20,
    },
    {
      id: 3,
      slug: 'business',
      icon: 'bi-briefcase',
      sort_order: 30,
    },
    {
      id: 4,
      slug: 'sport',
      icon: 'bi-trophy',
      sort_order: 40,
    },
    {
      id: 5,
      slug: 'kids',
      icon: 'bi-balloon-heart',
      sort_order: 50,
    },
    {
      id: 6,
      slug: 'food-leisure',
      icon: 'bi-cup-hot',
      sort_order: 60,
    },
    {
      id: 7,
      slug: 'culture',
      icon: 'bi-palette',
      sort_order: 70,
    },
    {
      id: 8,
      slug: 'other',
      icon: 'bi-grid',
      sort_order: 999,
    },
  ])

  await knex('event_category_translations').insert([
    {
      category_id: 1,
      locale: 'ru',
      name: 'Концерты и шоу',
    },
    {
      category_id: 1,
      locale: 'kk',
      name: 'Концерттер мен шоулар',
    },
    {
      category_id: 1,
      locale: 'en',
      name: 'Concerts & Shows',
    },

    {
      category_id: 2,
      locale: 'ru',
      name: 'Образование',
    },
    {
      category_id: 2,
      locale: 'kk',
      name: 'Білім',
    },
    {
      category_id: 2,
      locale: 'en',
      name: 'Education',
    },

    {
      category_id: 3,
      locale: 'ru',
      name: 'Бизнес',
    },
    {
      category_id: 3,
      locale: 'kk',
      name: 'Бизнес',
    },
    {
      category_id: 3,
      locale: 'en',
      name: 'Business',
    },

    {
      category_id: 4,
      locale: 'ru',
      name: 'Спорт',
    },
    {
      category_id: 4,
      locale: 'kk',
      name: 'Спорт',
    },
    {
      category_id: 4,
      locale: 'en',
      name: 'Sport',
    },

    {
      category_id: 5,
      locale: 'ru',
      name: 'Для детей',
    },
    {
      category_id: 5,
      locale: 'kk',
      name: 'Балаларға',
    },
    {
      category_id: 5,
      locale: 'en',
      name: 'For Kids',
    },

    {
      category_id: 6,
      locale: 'ru',
      name: 'Еда и отдых',
    },
    {
      category_id: 6,
      locale: 'kk',
      name: 'Тамақ және демалыс',
    },
    {
      category_id: 6,
      locale: 'en',
      name: 'Food & Leisure',
    },

    {
      category_id: 7,
      locale: 'ru',
      name: 'Культура',
    },
    {
      category_id: 7,
      locale: 'kk',
      name: 'Мәдениет',
    },
    {
      category_id: 7,
      locale: 'en',
      name: 'Culture',
    },

    {
      category_id: 8,
      locale: 'ru',
      name: 'Другое',
    },
    {
      category_id: 8,
      locale: 'kk',
      name: 'Басқа',
    },
    {
      category_id: 8,
      locale: 'en',
      name: 'Other',
    },
  ])

  await knex('event_subcategories').insert([
    // Концерты и шоу
    {
      id: 1,
      category_id: 1,
      slug: 'concert',
      icon: 'bi-music-note',
      sort_order: 10,
    },
    {
      id: 2,
      category_id: 1,
      slug: 'standup',
      icon: 'bi-mic',
      sort_order: 20,
    },
    {
      id: 3,
      category_id: 1,
      slug: 'theatre',
      icon: 'bi-mask',
      sort_order: 30,
    },
    {
      id: 4,
      category_id: 1,
      slug: 'party',
      icon: 'bi-stars',
      sort_order: 40,
    },
    {
      id: 5,
      category_id: 1,
      slug: 'festival',
      icon: 'bi-calendar-heart',
      sort_order: 50,
    },
    {
      id: 6,
      category_id: 1,
      slug: 'show-program',
      icon: 'bi-lightning-charge',
      sort_order: 60,
    },

    // Образование
    {
      id: 7,
      category_id: 2,
      slug: 'courses',
      icon: 'bi-journal-bookmark',
      sort_order: 10,
    },
    {
      id: 8,
      category_id: 2,
      slug: 'master-class',
      icon: 'bi-person-workspace',
      sort_order: 20,
    },
    {
      id: 9,
      category_id: 2,
      slug: 'lecture',
      icon: 'bi-easel',
      sort_order: 30,
    },
    {
      id: 10,
      category_id: 2,
      slug: 'workshop',
      icon: 'bi-tools',
      sort_order: 40,
    },
    {
      id: 11,
      category_id: 2,
      slug: 'intensive',
      icon: 'bi-lightbulb',
      sort_order: 50,
    },
    {
      id: 12,
      category_id: 2,
      slug: 'training',
      icon: 'bi-people',
      sort_order: 60,
    },

    // Бизнес
    {
      id: 13,
      category_id: 3,
      slug: 'networking',
      icon: 'bi-diagram-3',
      sort_order: 10,
    },
    {
      id: 14,
      category_id: 3,
      slug: 'forum',
      icon: 'bi-building',
      sort_order: 20,
    },
    {
      id: 15,
      category_id: 3,
      slug: 'presentation',
      icon: 'bi-display',
      sort_order: 30,
    },
    {
      id: 16,
      category_id: 3,
      slug: 'seminar',
      icon: 'bi-chat-square-text',
      sort_order: 40,
    },
    {
      id: 17,
      category_id: 3,
      slug: 'entrepreneurs-meetup',
      icon: 'bi-person-lines-fill',
      sort_order: 50,
    },

    // Спорт
    {
      id: 18,
      category_id: 4,
      slug: 'tournament',
      icon: 'bi-trophy',
      sort_order: 10,
    },
    {
      id: 19,
      category_id: 4,
      slug: 'training-session',
      icon: 'bi-activity',
      sort_order: 20,
    },
    {
      id: 20,
      category_id: 4,
      slug: 'run',
      icon: 'bi-person-walking',
      sort_order: 30,
    },
    {
      id: 21,
      category_id: 4,
      slug: 'fitness',
      icon: 'bi-heart-pulse',
      sort_order: 40,
    },
    {
      id: 22,
      category_id: 4,
      slug: 'yoga',
      icon: 'bi-flower1',
      sort_order: 50,
    },
    {
      id: 23,
      category_id: 4,
      slug: 'match',
      icon: 'bi-dribbble',
      sort_order: 60,
    },

    // Для детей
    {
      id: 24,
      category_id: 5,
      slug: 'entertainment',
      icon: 'bi-emoji-smile',
      sort_order: 10,
    },
    {
      id: 25,
      category_id: 5,
      slug: 'kids-master-class',
      icon: 'bi-brush',
      sort_order: 20,
    },
    {
      id: 26,
      category_id: 5,
      slug: 'kids-education',
      icon: 'bi-book',
      sort_order: 30,
    },
    {
      id: 27,
      category_id: 5,
      slug: 'kids-performance',
      icon: 'bi-mask',
      sort_order: 40,
    },
    {
      id: 28,
      category_id: 5,
      slug: 'kids-holiday',
      icon: 'bi-gift',
      sort_order: 50,
    },

    // Еда и отдых
    {
      id: 29,
      category_id: 6,
      slug: 'tasting',
      icon: 'bi-cup-straw',
      sort_order: 10,
    },
    {
      id: 30,
      category_id: 6,
      slug: 'venue-evening',
      icon: 'bi-shop',
      sort_order: 20,
    },
    {
      id: 31,
      category_id: 6,
      slug: 'gastro-festival',
      icon: 'bi-egg-fried',
      sort_order: 30,
    },
    {
      id: 32,
      category_id: 6,
      slug: 'quiz',
      icon: 'bi-question-circle',
      sort_order: 40,
    },
    {
      id: 33,
      category_id: 6,
      slug: 'meetup',
      icon: 'bi-cup-hot',
      sort_order: 50,
    },

    // Культура
    {
      id: 34,
      category_id: 7,
      slug: 'exhibition',
      icon: 'bi-image',
      sort_order: 10,
    },
    {
      id: 35,
      category_id: 7,
      slug: 'cinema',
      icon: 'bi-film',
      sort_order: 20,
    },
    {
      id: 36,
      category_id: 7,
      slug: 'poetry',
      icon: 'bi-pen',
      sort_order: 30,
    },
    {
      id: 37,
      category_id: 7,
      slug: 'books',
      icon: 'bi-book-half',
      sort_order: 40,
    },
    {
      id: 38,
      category_id: 7,
      slug: 'art',
      icon: 'bi-palette',
      sort_order: 50,
    },

    // Другое
    {
      id: 39,
      category_id: 8,
      slug: 'other',
      icon: 'bi-three-dots',
      sort_order: 999,
    },
  ])

  await knex('event_subcategory_translations').insert([
    // Concerts & Shows
    {
      subcategory_id: 1,
      locale: 'ru',
      name: 'Концерт',
    },
    {
      subcategory_id: 1,
      locale: 'kk',
      name: 'Концерт',
    },
    {
      subcategory_id: 1,
      locale: 'en',
      name: 'Concert',
    },

    {
      subcategory_id: 2,
      locale: 'ru',
      name: 'Стендап',
    },
    {
      subcategory_id: 2,
      locale: 'kk',
      name: 'Стендап',
    },
    {
      subcategory_id: 2,
      locale: 'en',
      name: 'Stand-up',
    },

    {
      subcategory_id: 3,
      locale: 'ru',
      name: 'Театр',
    },
    {
      subcategory_id: 3,
      locale: 'kk',
      name: 'Театр',
    },
    {
      subcategory_id: 3,
      locale: 'en',
      name: 'Theatre',
    },

    {
      subcategory_id: 4,
      locale: 'ru',
      name: 'Вечеринка',
    },
    {
      subcategory_id: 4,
      locale: 'kk',
      name: 'Кеш',
    },
    {
      subcategory_id: 4,
      locale: 'en',
      name: 'Party',
    },

    {
      subcategory_id: 5,
      locale: 'ru',
      name: 'Фестиваль',
    },
    {
      subcategory_id: 5,
      locale: 'kk',
      name: 'Фестиваль',
    },
    {
      subcategory_id: 5,
      locale: 'en',
      name: 'Festival',
    },

    {
      subcategory_id: 6,
      locale: 'ru',
      name: 'Шоу-программа',
    },
    {
      subcategory_id: 6,
      locale: 'kk',
      name: 'Шоу-бағдарлама',
    },
    {
      subcategory_id: 6,
      locale: 'en',
      name: 'Show Program',
    },

    // Education
    {
      subcategory_id: 7,
      locale: 'ru',
      name: 'Курсы',
    },
    {
      subcategory_id: 7,
      locale: 'kk',
      name: 'Курстар',
    },
    {
      subcategory_id: 7,
      locale: 'en',
      name: 'Courses',
    },

    {
      subcategory_id: 8,
      locale: 'ru',
      name: 'Мастер-класс',
    },
    {
      subcategory_id: 8,
      locale: 'kk',
      name: 'Шеберлік сабағы',
    },
    {
      subcategory_id: 8,
      locale: 'en',
      name: 'Master Class',
    },

    {
      subcategory_id: 9,
      locale: 'ru',
      name: 'Лекция',
    },
    {
      subcategory_id: 9,
      locale: 'kk',
      name: 'Дәріс',
    },
    {
      subcategory_id: 9,
      locale: 'en',
      name: 'Lecture',
    },

    {
      subcategory_id: 10,
      locale: 'ru',
      name: 'Воркшоп',
    },
    {
      subcategory_id: 10,
      locale: 'kk',
      name: 'Воркшоп',
    },
    {
      subcategory_id: 10,
      locale: 'en',
      name: 'Workshop',
    },

    {
      subcategory_id: 11,
      locale: 'ru',
      name: 'Интенсив',
    },
    {
      subcategory_id: 11,
      locale: 'kk',
      name: 'Интенсив',
    },
    {
      subcategory_id: 11,
      locale: 'en',
      name: 'Intensive',
    },

    {
      subcategory_id: 12,
      locale: 'ru',
      name: 'Тренинг',
    },
    {
      subcategory_id: 12,
      locale: 'kk',
      name: 'Тренинг',
    },
    {
      subcategory_id: 12,
      locale: 'en',
      name: 'Training',
    },

    // Business
    {
      subcategory_id: 13,
      locale: 'ru',
      name: 'Нетворкинг',
    },
    {
      subcategory_id: 13,
      locale: 'kk',
      name: 'Нетворкинг',
    },
    {
      subcategory_id: 13,
      locale: 'en',
      name: 'Networking',
    },

    {
      subcategory_id: 14,
      locale: 'ru',
      name: 'Форум',
    },
    {
      subcategory_id: 14,
      locale: 'kk',
      name: 'Форум',
    },
    {
      subcategory_id: 14,
      locale: 'en',
      name: 'Forum',
    },

    {
      subcategory_id: 15,
      locale: 'ru',
      name: 'Презентация',
    },
    {
      subcategory_id: 15,
      locale: 'kk',
      name: 'Таныстырылым',
    },
    {
      subcategory_id: 15,
      locale: 'en',
      name: 'Presentation',
    },

    {
      subcategory_id: 16,
      locale: 'ru',
      name: 'Семинар',
    },
    {
      subcategory_id: 16,
      locale: 'kk',
      name: 'Семинар',
    },
    {
      subcategory_id: 16,
      locale: 'en',
      name: 'Seminar',
    },

    {
      subcategory_id: 17,
      locale: 'ru',
      name: 'Встреча предпринимателей',
    },
    {
      subcategory_id: 17,
      locale: 'kk',
      name: 'Кәсіпкерлер кездесуі',
    },
    {
      subcategory_id: 17,
      locale: 'en',
      name: 'Entrepreneurs Meetup',
    },

    // Sport
    {
      subcategory_id: 18,
      locale: 'ru',
      name: 'Турнир',
    },
    {
      subcategory_id: 18,
      locale: 'kk',
      name: 'Турнир',
    },
    {
      subcategory_id: 18,
      locale: 'en',
      name: 'Tournament',
    },

    {
      subcategory_id: 19,
      locale: 'ru',
      name: 'Тренировка',
    },
    {
      subcategory_id: 19,
      locale: 'kk',
      name: 'Жаттығу',
    },
    {
      subcategory_id: 19,
      locale: 'en',
      name: 'Training Session',
    },

    {
      subcategory_id: 20,
      locale: 'ru',
      name: 'Забег',
    },
    {
      subcategory_id: 20,
      locale: 'kk',
      name: 'Жүгіру',
    },
    {
      subcategory_id: 20,
      locale: 'en',
      name: 'Run',
    },

    {
      subcategory_id: 21,
      locale: 'ru',
      name: 'Фитнес',
    },
    {
      subcategory_id: 21,
      locale: 'kk',
      name: 'Фитнес',
    },
    {
      subcategory_id: 21,
      locale: 'en',
      name: 'Fitness',
    },

    {
      subcategory_id: 22,
      locale: 'ru',
      name: 'Йога',
    },
    {
      subcategory_id: 22,
      locale: 'kk',
      name: 'Йога',
    },
    {
      subcategory_id: 22,
      locale: 'en',
      name: 'Yoga',
    },

    {
      subcategory_id: 23,
      locale: 'ru',
      name: 'Матч',
    },
    {
      subcategory_id: 23,
      locale: 'kk',
      name: 'Матч',
    },
    {
      subcategory_id: 23,
      locale: 'en',
      name: 'Match',
    },

    // Kids
    {
      subcategory_id: 24,
      locale: 'ru',
      name: 'Развлечение',
    },
    {
      subcategory_id: 24,
      locale: 'kk',
      name: 'Ойын-сауық',
    },
    {
      subcategory_id: 24,
      locale: 'en',
      name: 'Entertainment',
    },

    {
      subcategory_id: 25,
      locale: 'ru',
      name: 'Мастер-класс',
    },
    {
      subcategory_id: 25,
      locale: 'kk',
      name: 'Шеберлік сабағы',
    },
    {
      subcategory_id: 25,
      locale: 'en',
      name: 'Master Class',
    },

    {
      subcategory_id: 26,
      locale: 'ru',
      name: 'Обучение',
    },
    {
      subcategory_id: 26,
      locale: 'kk',
      name: 'Оқыту',
    },
    {
      subcategory_id: 26,
      locale: 'en',
      name: 'Education',
    },

    {
      subcategory_id: 27,
      locale: 'ru',
      name: 'Спектакль',
    },
    {
      subcategory_id: 27,
      locale: 'kk',
      name: 'Қойылым',
    },
    {
      subcategory_id: 27,
      locale: 'en',
      name: 'Performance',
    },

    {
      subcategory_id: 28,
      locale: 'ru',
      name: 'Праздник',
    },
    {
      subcategory_id: 28,
      locale: 'kk',
      name: 'Мереке',
    },
    {
      subcategory_id: 28,
      locale: 'en',
      name: 'Holiday',
    },

    // Food & Leisure
    {
      subcategory_id: 29,
      locale: 'ru',
      name: 'Дегустация',
    },
    {
      subcategory_id: 29,
      locale: 'kk',
      name: 'Дәм тату',
    },
    {
      subcategory_id: 29,
      locale: 'en',
      name: 'Tasting',
    },

    {
      subcategory_id: 30,
      locale: 'ru',
      name: 'Вечер в заведении',
    },
    {
      subcategory_id: 30,
      locale: 'kk',
      name: 'Мекемедегі кеш',
    },
    {
      subcategory_id: 30,
      locale: 'en',
      name: 'Venue Evening',
    },

    {
      subcategory_id: 31,
      locale: 'ru',
      name: 'Гастро-фестиваль',
    },
    {
      subcategory_id: 31,
      locale: 'kk',
      name: 'Гастро-фестиваль',
    },
    {
      subcategory_id: 31,
      locale: 'en',
      name: 'Gastro Festival',
    },

    {
      subcategory_id: 32,
      locale: 'ru',
      name: 'Квиз',
    },
    {
      subcategory_id: 32,
      locale: 'kk',
      name: 'Квиз',
    },
    {
      subcategory_id: 32,
      locale: 'en',
      name: 'Quiz',
    },

    {
      subcategory_id: 33,
      locale: 'ru',
      name: 'Встреча',
    },
    {
      subcategory_id: 33,
      locale: 'kk',
      name: 'Кездесу',
    },
    {
      subcategory_id: 33,
      locale: 'en',
      name: 'Meetup',
    },

    // Culture
    {
      subcategory_id: 34,
      locale: 'ru',
      name: 'Выставка',
    },
    {
      subcategory_id: 34,
      locale: 'kk',
      name: 'Көрме',
    },
    {
      subcategory_id: 34,
      locale: 'en',
      name: 'Exhibition',
    },

    {
      subcategory_id: 35,
      locale: 'ru',
      name: 'Кино',
    },
    {
      subcategory_id: 35,
      locale: 'kk',
      name: 'Кино',
    },
    {
      subcategory_id: 35,
      locale: 'en',
      name: 'Cinema',
    },

    {
      subcategory_id: 36,
      locale: 'ru',
      name: 'Поэзия',
    },
    {
      subcategory_id: 36,
      locale: 'kk',
      name: 'Поэзия',
    },
    {
      subcategory_id: 36,
      locale: 'en',
      name: 'Poetry',
    },

    {
      subcategory_id: 37,
      locale: 'ru',
      name: 'Книги',
    },
    {
      subcategory_id: 37,
      locale: 'kk',
      name: 'Кітаптар',
    },
    {
      subcategory_id: 37,
      locale: 'en',
      name: 'Books',
    },

    {
      subcategory_id: 38,
      locale: 'ru',
      name: 'Искусство',
    },
    {
      subcategory_id: 38,
      locale: 'kk',
      name: 'Өнер',
    },
    {
      subcategory_id: 38,
      locale: 'en',
      name: 'Art',
    },

    // Other
    {
      subcategory_id: 39,
      locale: 'ru',
      name: 'Другое',
    },
    {
      subcategory_id: 39,
      locale: 'kk',
      name: 'Басқа',
    },
    {
      subcategory_id: 39,
      locale: 'en',
      name: 'Other',
    },
  ])
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('event_subcategory_translations')
  await knex.schema.dropTableIfExists('event_subcategories')
  await knex.schema.dropTableIfExists('event_category_translations')
  await knex.schema.dropTableIfExists('event_categories')
}