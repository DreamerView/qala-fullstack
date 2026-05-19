// knexfile.js
import 'dotenv/config'

const isProduction = process.env.NODE_ENV === 'production'

function requiredEnv(name, fallback = null) {
  const value = process.env[name] ?? fallback

  if (isProduction && (value === null || value === undefined || value === '')) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function numberEnv(name, fallback) {
  const value = process.env[name]

  if (!value) return fallback

  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number in environment variable: ${name}`)
  }

  return parsed
}

const baseConfig = {
  client: 'mysql2',

  connection: {
    host: requiredEnv('DB_HOST', '127.0.0.1'),
    port: numberEnv('DB_PORT', 3306),
    user: requiredEnv('DB_USER', 'root'),
    password: requiredEnv('DB_PASSWORD', ''),
    database: requiredEnv('DB_NAME', 'qala_db'),

    charset: 'utf8mb4',
    timezone: 'Z',

    supportBigNumbers: true,
    bigNumberStrings: true,

    connectTimeout: numberEnv('DB_CONNECT_TIMEOUT', 10_000),
  },

  pool: {
    min: numberEnv('DB_POOL_MIN', isProduction ? 2 : 0),
    max: numberEnv('DB_POOL_MAX', isProduction ? 20 : 10),

    acquireTimeoutMillis: numberEnv('DB_ACQUIRE_TIMEOUT', 10_000),
    createTimeoutMillis: numberEnv('DB_CREATE_TIMEOUT', 10_000),
    destroyTimeoutMillis: numberEnv('DB_DESTROY_TIMEOUT', 5_000),
    idleTimeoutMillis: numberEnv('DB_IDLE_TIMEOUT', 30_000),

    reapIntervalMillis: 1_000,
    createRetryIntervalMillis: 200,

    afterCreate(connection, done) {
      connection.query("SET time_zone = '+00:00'", (error) => {
        done(error, connection)
      })
    },
  },

  migrations: {
    directory: './src/db/migrations',
    extension: 'js',
    tableName: 'knex_migrations',
    loadExtensions: ['.js'],
  },

  seeds: {
    directory: './src/db/seeds',
    extension: 'js',
    loadExtensions: ['.js'],
  },

  asyncStackTraces: !isProduction,
  debug: false,
}

export default {
  development: {
    ...baseConfig,
    pool: {
      ...baseConfig.pool,
      min: 0,
      max: numberEnv('DB_POOL_MAX', 10),
    },
  },

  production: {
    ...baseConfig,
    pool: {
      ...baseConfig.pool,
      min: numberEnv('DB_POOL_MIN', 2),
      max: numberEnv('DB_POOL_MAX', 20),
    },
  },
}