// backend/src/db/migrations/20260520_create_events_tables.js

export async function up(knex) {
  await knex.schema.createTable('events', (table) => {
    table.bigIncrements('id').primary()

    // Автор / организатор
    table.integer('user_id').unsigned().nullable()

    // Тип публикации
    table
      .enu('event_type', ['event', 'meeting', 'announcement', 'activity', 'plan'], {
        useNative: false,
      })
      .notNullable()
      .defaultTo('event')

    // Основная информация
    table.string('title', 180).notNullable()
    table.text('description').notNullable()

    // Категория
    table.integer('category_id').unsigned().notNullable()
    table.string('category_slug', 120).notNullable()
    table.string('category_name', 160).notNullable()

    // Подкатегория
    table.integer('subcategory_id').unsigned().nullable()
    table.string('subcategory_slug', 120).nullable()
    table.string('subcategory_name', 160).nullable()

    // Дата / время / длительность
    table.date('event_date').nullable()
    table.time('event_time').nullable()
    table.integer('duration_minutes').unsigned().nullable()

    // Возраст / язык
    table
      .enu('age_limit', ['0+', '6+', '12+', '16+', '18+'], {
        useNative: false,
      })
      .nullable()

    table
      .enu('language', ['kk', 'ru', 'en', 'mixed'], {
        useNative: false,
      })
      .notNullable()
      .defaultTo('ru')

    // Место
    table.string('location_title', 180).nullable()
    table.string('address', 255).nullable()
    table.string('location_url', 600).nullable()
    table.decimal('lat', 10, 7).nullable()
    table.decimal('lng', 10, 7).nullable()

    // Оплата
    table
      .enu('visit_type', ['free', 'paid'], {
        useNative: false,
      })
      .notNullable()
      .defaultTo('free')

    table.decimal('price', 12, 2).nullable()
    table.string('currency', 8).notNullable().defaultTo('KZT')

    // Участники / регистрация
    table.integer('participants_limit').unsigned().nullable()
    table.boolean('registration_required').notNullable().defaultTo(false)
    table.timestamp('registration_deadline').nullable()

    // Контакты / внешние ссылки
    table.string('contact_phone', 40).nullable()
    table.string('contact_whatsapp', 80).nullable()
    table.string('contact_telegram', 80).nullable()
    table.string('external_url', 800).nullable()

    // Медиа
    table.string('image_url', 800).nullable()

    // Программа
    table.boolean('has_program').notNullable().defaultTo(false)

    // Доступ / приватность
    table
      .enu('visibility', ['public', 'private', 'unlisted'], {
        useNative: false,
      })
      .notNullable()
      .defaultTo('public')

    table
      .enu('access_type', ['open', 'link_only', 'approval_required', 'invite_only'], {
        useNative: false,
      })
      .notNullable()
      .defaultTo('open')

    table.boolean('allow_comments').notNullable().defaultTo(true)
    table.boolean('allow_share').notNullable().defaultTo(true)
    table.boolean('allow_waitlist').notNullable().defaultTo(false)

    // Статус публикации
    table
      .enu('status', ['draft', 'published', 'archived', 'blocked'], {
        useNative: false,
      })
      .notNullable()
      .defaultTo('draft')

    // Модерация
    table
      .enu('moderation_status', ['pending', 'approved', 'rejected'], {
        useNative: false,
      })
      .notNullable()
      .defaultTo('pending')

    table.text('rejection_reason').nullable()

    // Управление
    table.boolean('is_active').notNullable().defaultTo(true)
    table.boolean('is_featured').notNullable().defaultTo(false)

    // Отмена события
    table.timestamp('cancelled_at').nullable()
    table.text('cancel_reason').nullable()

    // Даты
    table.timestamp('published_at').nullable()

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())

    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    // Индексы
    table.index(['user_id'])
    table.index(['event_type'])

    table.index(['category_id'])
    table.index(['subcategory_id'])
    table.index(['category_slug'])
    table.index(['subcategory_slug'])

    table.index(['event_date'])
    table.index(['event_date', 'event_time'])
    table.index(['event_type', 'event_date'])

    table.index(['duration_minutes'])
    table.index(['age_limit'])
    table.index(['language'])

    table.index(['visit_type'])
    table.index(['price'])
    table.index(['currency'])

    table.index(['participants_limit'])
    table.index(['registration_required'])
    table.index(['registration_deadline'])

    table.index(['visibility'])
    table.index(['access_type'])
    table.index(['status'])
    table.index(['moderation_status'])
    table.index(['is_active'])
    table.index(['is_featured'])

    table.index(['lat', 'lng'])

    table.index(['status', 'is_active'])
    table.index(['moderation_status', 'status'])
    table.index(['visibility', 'status', 'is_active'])
    table.index(['event_type', 'status', 'is_active'])
    table.index(['event_type', 'visibility', 'status', 'is_active'])
  })

  await knex.schema.createTable('event_program_items', (table) => {
    table.bigIncrements('id').primary()

    table.bigInteger('event_id').unsigned().notNullable()

    table.time('program_time').nullable()
    table.string('title', 180).notNullable()
    table.text('description').nullable()
    table.integer('sort_order').unsigned().notNullable().defaultTo(0)

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())

    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    table
      .foreign('event_id')
      .references('id')
      .inTable('events')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.index(['event_id'])
    table.index(['event_id', 'sort_order'])
    table.index(['program_time'])
  })

  await knex.schema.createTable('event_media', (table) => {
    table.bigIncrements('id').primary()

    table.bigInteger('event_id').unsigned().notNullable()

    table
      .enu('type', ['image', 'video'], {
        useNative: false,
      })
      .notNullable()
      .defaultTo('image')

    table.string('url', 800).notNullable()
    table.string('alt', 180).nullable()
    table.integer('sort_order').unsigned().notNullable().defaultTo(0)

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())

    table
      .foreign('event_id')
      .references('id')
      .inTable('events')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.index(['event_id'])
    table.index(['type'])
    table.index(['event_id', 'sort_order'])
  })

  await knex.schema.createTable('event_polls', (table) => {
    table.bigIncrements('id').primary()

    table.bigInteger('event_id').unsigned().notNullable()

    table.string('question', 255).notNullable()

    table
      .enu('poll_type', ['single', 'multiple'], {
        useNative: false,
      })
      .notNullable()
      .defaultTo('single')

    table.boolean('is_active').notNullable().defaultTo(true)
    table.timestamp('closes_at').nullable()

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())

    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    table
      .foreign('event_id')
      .references('id')
      .inTable('events')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.index(['event_id'])
    table.index(['poll_type'])
    table.index(['is_active'])
    table.index(['closes_at'])
    table.index(['event_id', 'is_active'])
  })

  await knex.schema.createTable('event_poll_options', (table) => {
    table.bigIncrements('id').primary()

    table.bigInteger('poll_id').unsigned().notNullable()

    table.string('option_text', 255).notNullable()
    table.integer('sort_order').unsigned().notNullable().defaultTo(0)

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())

    table
      .foreign('poll_id')
      .references('id')
      .inTable('event_polls')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.index(['poll_id'])
    table.index(['poll_id', 'sort_order'])
  })

  await knex.schema.createTable('event_poll_votes', (table) => {
    table.bigIncrements('id').primary()

    table.bigInteger('poll_id').unsigned().notNullable()
    table.bigInteger('option_id').unsigned().notNullable()
    table.integer('user_id').unsigned().notNullable()

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())

    table
      .foreign('poll_id')
      .references('id')
      .inTable('event_polls')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table
      .foreign('option_id')
      .references('id')
      .inTable('event_poll_options')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.index(['poll_id'])
    table.index(['option_id'])
    table.index(['user_id'])
    table.index(['poll_id', 'user_id'])
    table.index(['poll_id', 'option_id'])

    table.unique(['poll_id', 'option_id', 'user_id'])
  })

  await knex.schema.createTable('event_registration_questions', (table) => {
    table.bigIncrements('id').primary()

    table.bigInteger('event_id').unsigned().notNullable()

    table.string('question', 255).notNullable()

    table
      .enu('input_type', ['text', 'number', 'select', 'checkbox', 'textarea'], {
        useNative: false,
      })
      .notNullable()
      .defaultTo('text')

    table.text('options_json').nullable()

    table.boolean('is_required').notNullable().defaultTo(false)
    table.integer('sort_order').unsigned().notNullable().defaultTo(0)

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())

    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    table
      .foreign('event_id')
      .references('id')
      .inTable('events')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.index(['event_id'])
    table.index(['input_type'])
    table.index(['is_required'])
    table.index(['event_id', 'sort_order'])
  })

  await knex.schema.createTable('event_registration_answers', (table) => {
    table.bigIncrements('id').primary()

    table.bigInteger('event_id').unsigned().notNullable()
    table.integer('user_id').unsigned().notNullable()
    table.bigInteger('question_id').unsigned().notNullable()

    table.text('answer').nullable()

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())

    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    table
      .foreign('event_id')
      .references('id')
      .inTable('events')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table
      .foreign('question_id')
      .references('id')
      .inTable('event_registration_questions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.index(['event_id'])
    table.index(['user_id'])
    table.index(['question_id'])
    table.index(['event_id', 'user_id'])
    table.index(['event_id', 'question_id'])

    table.unique(['event_id', 'user_id', 'question_id'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('event_registration_answers')
  await knex.schema.dropTableIfExists('event_registration_questions')

  await knex.schema.dropTableIfExists('event_poll_votes')
  await knex.schema.dropTableIfExists('event_poll_options')
  await knex.schema.dropTableIfExists('event_polls')

  await knex.schema.dropTableIfExists('event_media')
  await knex.schema.dropTableIfExists('event_program_items')

  await knex.schema.dropTableIfExists('events')
}