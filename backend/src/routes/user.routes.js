import express from 'express'

import { getCurrentUser } from '../controllers/user.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { logout } from '../controllers/auth.controller.js'

const router = express.Router()

router.get('/me', authMiddleware, getCurrentUser)
router.get('/logout', logout)

export default router