// backend/src/db/migrations/20260520_create_event_participants_table.js

export async function up(knex) {
  await knex.schema.createTable('event_participants', (table) => {
    table.bigIncrements('id').primary()

    table.bigInteger('event_id').unsigned().notNullable()
    table.integer('user_id').unsigned().notNullable()

    table
      .enu('status', ['joined', 'pending', 'approved', 'rejected', 'cancelled', 'waitlist'], {
        useNative: false,
      })
      .notNullable()
      .defaultTo('joined')

    table.integer('guests_count').unsigned().notNullable().defaultTo(1)
    table.text('comment').nullable()

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
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.unique(['event_id', 'user_id'])

    table.index(['event_id'])
    table.index(['user_id'])
    table.index(['status'])
    table.index(['event_id', 'status'])
    table.index(['event_id', 'created_at'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('event_participants')
}