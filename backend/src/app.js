import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import { error } from './utils/response.js'

const app = express()

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

app.set('trust proxy', 1)

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}))

app.use(express.json({
  limit: '1mb',
}))

app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)

app.use((req, res) => {
  return error(res, 'Route not found', 404)
})

app.use((err, req, res, next) => {
  console.error(err)

  return error(res, 'Internal server error', 500)
})

export default app