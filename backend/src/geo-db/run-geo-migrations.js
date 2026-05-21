// src/geo-db/run-geo-migrations.js

import geoDb from '../db/geo-knex.js'

async function run() {
  try {
    await geoDb.migrate.latest()
    console.log('Geo SQLite migrations completed')
  } catch (e) {
    console.error('Geo SQLite migration failed:', e)
    process.exitCode = 1
  } finally {
    await geoDb.destroy()
  }
}

run()