import express from 'express'

import {
  checkAuthField,
  login,
  logout,
  logoutAll,
  refresh,
  register,
} from '../controllers/auth.controller.js'

import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.post('/logout-all', authMiddleware, logoutAll)

router.get('/check', checkAuthField)

export default router