// backend/src/db/migrations/20260520_create_event_participant_logs_table.js

export async function up(knex) {
  await knex.schema.createTable('event_participant_logs', (table) => {
    table.bigIncrements('id').primary()

    table.bigInteger('event_id').unsigned().notNullable()
    table.integer('user_id').unsigned().notNullable()

    table
      .enu(
        'action',
        [
          'joined',
          'pending',
          'approved',
          'rejected',
          'cancelled',
          'waitlist',
          'removed',
        ],
        {
          useNative: false,
        }
      )
      .notNullable()

    table.text('comment').nullable()

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

    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

    table.index(['event_id'])
    table.index(['user_id'])
    table.index(['action'])
    table.index(['event_id', 'action'])
    table.index(['event_id', 'created_at'])
    table.index(['user_id', 'created_at'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('event_participant_logs')
}