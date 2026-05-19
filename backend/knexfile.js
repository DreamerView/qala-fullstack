import 'dotenv/config'

const config = {
  client: 'mysql2',

  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'qala_db',
    charset: 'utf8mb4',
  },

  pool: {
    min: 0,
    max: 10,
  },

  migrations: {
    directory: './src/db/migrations',
    extension: 'js',
    tableName: 'knex_migrations',
  },
}

export default {
  development: config,
  production: config,
}