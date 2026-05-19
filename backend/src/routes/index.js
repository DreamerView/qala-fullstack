import { Router } from 'express'

import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'

const router = Router()

router.get('/health', (req, res) => {
  res.json({
    status: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  })
})

router.use('/auth', authRoutes)
router.use('/user', userRoutes)

export default router