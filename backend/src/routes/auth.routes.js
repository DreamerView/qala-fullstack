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

import {
  authGlobalLimiter,
  checkFieldLimiter,
  loginLimiter,
  refreshLimiter,
  registerLimiter,
} from '../middlewares/rateLimit.middleware.js'

const router = express.Router()

router.use(authGlobalLimiter)

router.post('/register', registerLimiter, register)
router.post('/login', loginLimiter, login)
router.post('/refresh', refreshLimiter, refresh)

router.post('/logout', logout)
router.post('/logout-all', authMiddleware, logoutAll)

router.get('/check', checkFieldLimiter, checkAuthField)

export default router