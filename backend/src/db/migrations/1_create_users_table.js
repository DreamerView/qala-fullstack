export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary()

    table.string('phone', 32).notNullable().unique()
    table.string('email', 160).nullable().unique()
    table.string('nickname', 64).notNullable().unique()

    table.string('password_hash', 255).notNullable()

    table.timestamp('phone_verified_at').nullable()
    table.timestamp('email_verified_at').nullable()

    table.boolean('is_active').notNullable().defaultTo(true)

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    table.timestamp('last_login_at').nullable()

    table.index(['phone'])
    table.index(['email'])
    table.index(['nickname'])
    table.index(['is_active'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('users')
}