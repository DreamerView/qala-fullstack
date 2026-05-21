// migrations/20260519_create_user_sessions_table.js

export async function up(knex) {
  await knex.schema.createTable('user_sessions', (table) => {
    table.increments('id').primary()

    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')

    table.string('refresh_token_hash', 255).notNullable().unique()

    table.string('user_agent', 500).nullable()
    table.string('ip_address', 64).nullable()

    table.timestamp('expires_at').notNullable()
    table.timestamp('revoked_at').nullable()

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    table.index(['user_id'])
    table.index(['expires_at'])
    table.index(['revoked_at'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('user_sessions')
}