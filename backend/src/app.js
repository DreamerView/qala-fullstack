import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import pinoHttp from 'pino-http'

import routes from './routes/index.js'
import { error } from './utils/response.js'

const app = express()

const isProduction = process.env.NODE_ENV === 'production'

const CLIENT_URLS = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean)
  : ['http://localhost:5173']

app.set('trust proxy', 1)

app.use(pinoHttp({
  enabled: isProduction,
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },
}))

app.use(helmet({
  crossOriginResourcePolicy: {
    policy: 'cross-origin',
  },
}))

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true)
    }

    if (!isProduction) {
      return callback(null, true)
    }

    if (CLIENT_URLS.includes(origin)) {
      return callback(null, true)
    }

    return callback(null, false)
  },
  credentials: true,
}))

app.use(express.json({
  limit: '1mb',
}))

app.use(express.urlencoded({
  extended: false,
  limit: '1mb',
}))

app.use(cookieParser())

app.use('/api', routes)

app.use((req, res) => {
  return error(res, 'Route not found', 404)
})

app.use((err, req, res, next) => {
  req.log?.error?.(err)

  if (!isProduction) {
    console.error(err)
  }

  return error(res, 'Internal server error', 500)
})

export default app