// backend/src/db/migrations/20260520_create_events_tables.js

export async function up(knex) {
  await knex.schema.createTable('events', (table) => {
    table.bigIncrements('id').primary()

    // Автор / организатор события
    table.integer('user_id').unsigned().nullable()

    // Тип публикации:
    // event - мероприятие
    // meeting - встреча
    // announcement - анонс
    // activity - активность
    // plan - план / идея
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

    // Дата и время
    // Для meeting/activity/event обычно обязательные на уровне backend-валидации.
    // Для announcement/plan могут быть пустыми.
    table.date('event_date').nullable()
    table.time('event_time').nullable()

    // Место
    // Для meeting/activity/event обычно обязательное на уровне backend-валидации.
    // Для announcement/plan может быть пустым.
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

    // Лимит участников
    table.integer('participants_limit').unsigned().nullable()

    // Медиа
    table.string('image_url', 800).nullable()

    // Программа
    table.boolean('has_program').notNullable().defaultTo(false)

    // Модерация / публикация
    table
      .enu('status', ['draft', 'published', 'archived', 'blocked'], {
        useNative: false,
      })
      .notNullable()
      .defaultTo('draft')

    table.boolean('is_active').notNullable().defaultTo(true)

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
    table.index(['visit_type'])
    table.index(['status'])
    table.index(['is_active'])
    table.index(['lat', 'lng'])
    table.index(['status', 'is_active'])
    table.index(['event_type', 'status', 'is_active'])
  })

  await knex.schema.createTable('event_program_items', (table) => {
    table.bigIncrements('id').primary()

    table.bigInteger('event_id').unsigned().notNullable()

    // Лучше nullable: иногда пункт программы может быть без точного времени
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
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('event_program_items')
  await knex.schema.dropTableIfExists('events')
}