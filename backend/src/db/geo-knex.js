// src/db/geo-knex.js

import knex from 'knex'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const geoDbPath = process.env.GEO_DB_PATH || path.resolve(__dirname, '../geo-db/geo.sqlite')

const geoDb = knex({
  client: 'sqlite3',

  connection: {
    filename: geoDbPath,
  },

  useNullAsDefault: true,

  pool: {
    min: 1,
    max: 1,
  },

  migrations: {
    directory: path.resolve(__dirname, '../geo-db/migrations'),
    extension: 'js',
    tableName: 'geo_knex_migrations',
  },
})

export default geoDb