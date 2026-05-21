// src/controllers/auth.controller.js

import crypto from 'node:crypto'

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createCache } from 'cache-manager'
import { z } from 'zod'

import db from '../db/knex.js'
import { success, error } from '../utils/response.js'

const ACCESS_COOKIE_NAME = 'qala_access_token'
const REFRESH_COOKIE_NAME = 'qala_refresh_token'

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
const ACCESS_COOKIE_MAX_AGE_MS = Number(
  process.env.JWT_ACCESS_COOKIE_MS || 15 * 60 * 1000
)

const REFRESH_TOKEN_DAYS = Number(process.env.JWT_REFRESH_DAYS || 30)
const REFRESH_COOKIE_MAX_AGE_MS =
  REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000

const CHECK_FIELD_CACHE_TTL_MS = Number(
  process.env.CHECK_FIELD_CACHE_TTL_MS || 15 * 1000
)

const authCache = createCache({
  ttl: CHECK_FIELD_CACHE_TTL_MS,
})

const refreshLocks = new Map()

const registerSchema = z.object({
  phone: z.string().trim().min(3).max(32),
  email: z
    .string()
    .trim()
    .email()
    .max(120)
    .optional()
    .nullable()
    .or(z.literal('')),
  nickname: z.string().trim().min(3).max(40),
  password: z.string().min(6).max(128),
})

const loginSchema = z.object({
  login: z.string().trim().min(3).max(120),
  password: z.string().min(1).max(128),
})

const checkFieldSchema = z.object({
  field: z.enum(['phone', 'email', 'nickname']),
  value: z.string().trim().min(3).max(120),
})

function requireJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  return process.env.JWT_SECRET
}

function isProduction() {
  return process.env.NODE_ENV === 'production'
}

function getCookieSecure() {
  if (process.env.COOKIE_SECURE === 'true') return true
  if (process.env.COOKIE_SECURE === 'false') return false

  return isProduction()
}

function getCookieSameSite() {
  return process.env.COOKIE_SAME_SITE || 'lax'
}

function getCookieDomain() {
  return process.env.COOKIE_DOMAIN || undefined
}

function getCookieBaseOptions() {
  const domain = getCookieDomain()

  return {
    httpOnly: true,
    secure: getCookieSecure(),
    sameSite: getCookieSameSite(),
    ...(domain ? { domain } : {}),
  }
}

function getAccessCookieOptions() {
  return {
    ...getCookieBaseOptions(),
    maxAge: ACCESS_COOKIE_MAX_AGE_MS,
    path: '/',
  }
}

function getRefreshCookieOptions() {
  return {
    ...getCookieBaseOptions(),
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: '/api',
  }
}

function getAccessCookieClearOptions() {
  const { maxAge, ...options } = getAccessCookieOptions()
  return options
}

function getRefreshCookieClearOptions() {
  const { maxAge, ...options } = getRefreshCookieOptions()
  return options
}

function setAccessCookie(res, accessToken) {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, getAccessCookieOptions())
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions())
}

function setAuthCookies(res, accessToken, refreshToken) {
  setAccessCookie(res, accessToken)
  setRefreshCookie(res, refreshToken)
}

function clearAccessCookie(res) {
  res.clearCookie(ACCESS_COOKIE_NAME, getAccessCookieClearOptions())
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieClearOptions())
}

function clearAuthCookies(res) {
  clearAccessCookie(res)
  clearRefreshCookie(res)
}

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      id: user.id,
      phone: user.phone,
    },
    requireJwtSecret(),
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  )
}

function createRefreshToken() {
  return crypto.randomBytes(64).toString('hex')
}

function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
}

function getRefreshTokenExpiresAt() {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS)

  return expiresAt
}

function getRefreshTokenFromRequest(req) {
  return req.cookies?.[REFRESH_COOKIE_NAME] || null
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for']

  if (forwardedFor) {
    return String(forwardedFor).split(',')[0].trim()
  }

  return req.ip || req.socket?.remoteAddress || null
}

function isRefreshExpired(session) {
  return new Date(session.expires_at).getTime() <= Date.now()
}

function normalizeEmail(email) {
  if (!email) return null

  const normalized = String(email).trim().toLowerCase()

  return normalized || null
}

function normalizeRegisterPayload(body) {
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return {
      status: false,
      message: 'Invalid registration data',
    }
  }

  return {
    status: true,
    data: {
      phone: parsed.data.phone.trim(),
      email: normalizeEmail(parsed.data.email),
      nickname: parsed.data.nickname.trim(),
      password: parsed.data.password,
    },
  }
}

function normalizeLoginPayload(body) {
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return {
      status: false,
      message: 'Invalid login data',
    }
  }

  return {
    status: true,
    data: {
      login: parsed.data.login.trim(),
      password: parsed.data.password,
    },
  }
}

function normalizeCheckFieldPayload(query) {
  const parsed = checkFieldSchema.safeParse(query)

  if (!parsed.success) {
    return {
      status: false,
      message: 'Invalid field or value',
    }
  }

  const field = parsed.data.field
  const value = field === 'email'
    ? parsed.data.value.trim().toLowerCase()
    : parsed.data.value.trim()

  return {
    status: true,
    data: {
      field,
      value,
    },
  }
}

async function withRefreshLock(refreshToken, callback) {
  const activePromise = refreshLocks.get(refreshToken)

  if (activePromise) {
    return activePromise
  }

  const promise = Promise.resolve()
    .then(callback)
    .finally(() => {
      refreshLocks.delete(refreshToken)
    })

  refreshLocks.set(refreshToken, promise)

  return promise
}

async function createUserSession(req, userId, trx = db) {
  const refreshToken = createRefreshToken()
  const refreshTokenHash = hashToken(refreshToken)

  await trx('user_sessions').insert({
    user_id: userId,
    refresh_token_hash: refreshTokenHash,
    user_agent: req.headers['user-agent'] || null,
    ip_address: getClientIp(req),
    expires_at: getRefreshTokenExpiresAt(),
  })

  return refreshToken
}

async function revokeSessionById(sessionId, trx = db) {
  await trx('user_sessions')
    .where('id', sessionId)
    .whereNull('revoked_at')
    .update({
      revoked_at: trx.fn.now(),
      updated_at: trx.fn.now(),
    })
}

async function revokeAllUserSessions(userId, trx = db) {
  await trx('user_sessions')
    .where('user_id', userId)
    .whereNull('revoked_at')
    .update({
      revoked_at: trx.fn.now(),
      updated_at: trx.fn.now(),
    })
}

async function findSafeUserById(userId, trx = db) {
  return trx('users')
    .select(
      'id',
      'phone',
      'email',
      'nickname',
      'is_active',
      'created_at',
      'updated_at',
      'last_login_at'
    )
    .where('id', userId)
    .first()
}

export async function register(req, res, next) {
  try {
    const normalized = normalizeRegisterPayload(req.body)

    if (!normalized.status) {
      return error(res, normalized.message, 422)
    }

    const {
      phone,
      email,
      nickname,
      password,
    } = normalized.data

    const existingUser = await db('users')
      .where('phone', phone)
      .orWhere('nickname', nickname)
      .modify((query) => {
        if (email) {
          query.orWhere('email', email)
        }
      })
      .first()

    if (existingUser) {
      return error(res, 'User already exists', 409)
    }

    const result = await db.transaction(async (trx) => {
      const passwordHash = await bcrypt.hash(password, 12)

      const [userId] = await trx('users').insert({
        phone,
        email,
        nickname,
        password_hash: passwordHash,
      })

      const user = await findSafeUserById(userId, trx)

      if (!user) {
        throw new Error('Failed to create user')
      }

      const accessToken = createAccessToken(user)
      const refreshToken = await createUserSession(req, user.id, trx)

      return {
        user,
        accessToken,
        refreshToken,
      }
    })

    await authCache.del(`auth_field:phone:${phone}`)
    await authCache.del(`auth_field:nickname:${nickname}`)

    if (email) {
      await authCache.del(`auth_field:email:${email}`)
    }

    setAuthCookies(res, result.accessToken, result.refreshToken)

    return success(
      res,
      'User registered successfully',
      {
        user: result.user,
      },
      201
    )
  } catch (err) {
    return next(err)
  }
}

export async function login(req, res, next) {
  try {
    const normalized = normalizeLoginPayload(req.body)

    if (!normalized.status) {
      return error(res, normalized.message, 422)
    }

    const {
      login,
      password,
    } = normalized.data

    const user = await db('users')
      .where('phone', login)
      .orWhere('email', login.toLowerCase())
      .orWhere('nickname', login)
      .first()

    if (!user) {
      return error(res, 'Invalid login or password', 401)
    }

    if (!user.is_active) {
      return error(res, 'User is blocked', 403)
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return error(res, 'Invalid login or password', 401)
    }

    const result = await db.transaction(async (trx) => {
      await trx('users')
        .where('id', user.id)
        .update({
          last_login_at: trx.fn.now(),
          updated_at: trx.fn.now(),
        })

      const safeUser = await findSafeUserById(user.id, trx)

      if (!safeUser) {
        throw new Error('User not found after login')
      }

      const accessToken = createAccessToken(safeUser)
      const refreshToken = await createUserSession(req, safeUser.id, trx)

      return {
        user: safeUser,
        accessToken,
        refreshToken,
      }
    })

    setAuthCookies(res, result.accessToken, result.refreshToken)

    return success(res, 'Logged in successfully', {
      user: result.user,
    })
  } catch (err) {
    return next(err)
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = getRefreshTokenFromRequest(req)

    if (!refreshToken) {
      clearAuthCookies(res)

      return error(res, 'Refresh token is missing', 401)
    }

    const result = await withRefreshLock(refreshToken, async () => {
      const refreshTokenHash = hashToken(refreshToken)

      return db.transaction(async (trx) => {
        const session = await trx('user_sessions')
          .where('refresh_token_hash', refreshTokenHash)
          .first()

        if (!session) {
          return {
            status: false,
            code: 401,
            message: 'Invalid refresh token',
            clearCookies: true,
          }
        }

        if (session.revoked_at) {
          return {
            status: false,
            code: 401,
            message: 'Invalid refresh token',
            clearCookies: true,
          }
        }

        if (isRefreshExpired(session)) {
          await revokeSessionById(session.id, trx)

          return {
            status: false,
            code: 401,
            message: 'Refresh token expired',
            clearCookies: true,
          }
        }

        const user = await findSafeUserById(session.user_id, trx)

        if (!user) {
          await revokeSessionById(session.id, trx)

          return {
            status: false,
            code: 401,
            message: 'User not found',
            clearCookies: true,
          }
        }

        if (!user.is_active) {
          await revokeSessionById(session.id, trx)

          return {
            status: false,
            code: 403,
            message: 'User is blocked',
            clearCookies: true,
          }
        }

        await revokeSessionById(session.id, trx)

        const newRefreshToken = await createUserSession(req, user.id, trx)
        const newAccessToken = createAccessToken(user)

        return {
          status: true,
          user,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        }
      })
    })

    if (!result.status) {
      if (result.clearCookies) {
        clearAuthCookies(res)
      }

      return error(res, result.message, result.code)
    }

    setAuthCookies(res, result.accessToken, result.refreshToken)

    return success(res, 'Token refreshed successfully', {
      user: result.user,
    })
  } catch (err) {
    return next(err)
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = getRefreshTokenFromRequest(req)

    if (refreshToken) {
      const refreshTokenHash = hashToken(refreshToken)

      await db('user_sessions')
        .where('refresh_token_hash', refreshTokenHash)
        .whereNull('revoked_at')
        .update({
          revoked_at: db.fn.now(),
          updated_at: db.fn.now(),
        })
    }

    clearAuthCookies(res)

    return success(res, 'Logged out successfully')
  } catch (err) {
    return next(err)
  }
}

export async function logoutAll(req, res, next) {
  try {
    if (!req.user?.id) {
      return error(res, 'Unauthorized', 401)
    }

    await revokeAllUserSessions(req.user.id)

    clearAuthCookies(res)

    return success(res, 'Logged out from all devices successfully')
  } catch (err) {
    return next(err)
  }
}

export async function checkAuthField(req, res, next) {
  try {
    const normalized = normalizeCheckFieldPayload(req.query)

    if (!normalized.status) {
      return error(res, normalized.message, 422)
    }

    const {
      field,
      value,
    } = normalized.data

    const cacheKey = `auth_field:${field}:${value}`
    const cached = await authCache.get(cacheKey)

    if (cached) {
      return success(res, 'Field checked', cached)
    }

    const existingUser = await db('users')
      .select('id')
      .where(field, value)
      .first()

    const payload = {
      field,
      value,
      exists: Boolean(existingUser),
      available: !existingUser,
    }

    await authCache.set(cacheKey, payload, CHECK_FIELD_CACHE_TTL_MS)

    return success(res, 'Field checked', payload)
  } catch (err) {
    return next(err)
  }
}