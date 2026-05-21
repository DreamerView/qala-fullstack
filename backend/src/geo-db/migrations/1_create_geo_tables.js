// src/geo/migrations/20260520_create_geo_tables.js

export async function up(knex) {
  await knex.schema.createTable('countries', (table) => {
    table.increments('id').primary()

    table.string('code', 2).notNullable().unique()

    table.float('lat').nullable()
    table.float('lon').nullable()

    table.boolean('is_active').notNullable().defaultTo(true)

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

    table.index(['code'])
    table.index(['is_active'])
    table.index(['lat', 'lon'])
  })

  await knex.schema.createTable('country_translations', (table) => {
    table.increments('id').primary()

    table
      .integer('country_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('countries')
      .onDelete('CASCADE')

    table.string('locale', 8).notNullable()

    table.string('name', 160).notNullable()
    table.string('search_name', 160).notNullable()

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

    table.unique(['country_id', 'locale'])

    table.index(['country_id'])
    table.index(['locale'])
    table.index(['search_name'])
    table.index(['locale', 'search_name'])
  })

  await knex.schema.createTable('regions', (table) => {
    table.increments('id').primary()

    table
      .integer('country_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('countries')
      .onDelete('CASCADE')

    table.string('slug', 180).notNullable()

    table.float('lat').nullable()
    table.float('lon').nullable()

    table.boolean('is_active').notNullable().defaultTo(true)

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

    table.unique(['country_id', 'slug'])

    table.index(['country_id'])
    table.index(['slug'])
    table.index(['is_active'])
    table.index(['country_id', 'is_active'])
    table.index(['lat', 'lon'])
  })

  await knex.schema.createTable('region_translations', (table) => {
    table.increments('id').primary()

    table
      .integer('region_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('regions')
      .onDelete('CASCADE')

    table.string('locale', 8).notNullable()

    table.string('name', 180).notNullable()
    table.string('search_name', 180).notNullable()

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

    table.unique(['region_id', 'locale'])

    table.index(['region_id'])
    table.index(['locale'])
    table.index(['search_name'])
    table.index(['locale', 'search_name'])
  })

  await knex.schema.createTable('cities', (table) => {
    table.increments('id').primary()

    table
      .integer('country_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('countries')
      .onDelete('CASCADE')

    table
      .integer('region_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('regions')
      .onDelete('SET NULL')

    table.string('slug', 180).notNullable()

    table.float('lat').nullable()
    table.float('lon').nullable()

    table.boolean('is_active').notNullable().defaultTo(true)

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

    table.unique(['country_id', 'region_id', 'slug'])

    table.index(['country_id'])
    table.index(['region_id'])
    table.index(['slug'])
    table.index(['is_active'])

    table.index(['country_id', 'is_active'])
    table.index(['country_id', 'region_id'])
    table.index(['country_id', 'slug'])
    table.index(['lat', 'lon'])
  })

  await knex.schema.createTable('city_polygons', (table) => {
    table.increments('id').primary()

    table
      .integer('city_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('cities')
      .onDelete('CASCADE')

    table.string('type', 32).notNullable()

    table.float('bbox_min_lat').nullable()
    table.float('bbox_min_lon').nullable()
    table.float('bbox_max_lat').nullable()
    table.float('bbox_max_lon').nullable()

    table.text('geojson', 'longtext').notNullable()

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

    table.unique(['city_id'])

    table.index(['city_id'])
    table.index(['type'])
    table.index(['bbox_min_lat', 'bbox_min_lon'])
    table.index(['bbox_max_lat', 'bbox_max_lon'])
  })

  await knex.schema.createTable('city_translations', (table) => {
    table.increments('id').primary()

    table
      .integer('city_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('cities')
      .onDelete('CASCADE')

    table.string('locale', 8).notNullable()

    table.string('name', 180).notNullable()
    table.string('search_name', 180).notNullable()

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

    table.unique(['city_id', 'locale'])

    table.index(['city_id'])
    table.index(['locale'])
    table.index(['search_name'])
    table.index(['locale', 'search_name'])
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('city_translations')
  await knex.schema.dropTableIfExists('city_polygons')
  await knex.schema.dropTableIfExists('cities')

  await knex.schema.dropTableIfExists('region_translations')
  await knex.schema.dropTableIfExists('regions')

  await knex.schema.dropTableIfExists('country_translations')
  await knex.schema.dropTableIfExists('countries')
}