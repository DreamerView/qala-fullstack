// src/middlewares/auth.middleware.js

import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

import db from '../db/knex.js'
import { error } from '../utils/response.js'

const ACCESS_COOKIE_NAME = 'qala_access_token'
const REFRESH_COOKIE_NAME = 'qala_refresh_token'

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
const ACCESS_COOKIE_MAX_AGE_MS = Number(
  process.env.JWT_ACCESS_COOKIE_MS || 15 * 60 * 1000
)

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

function getAccessCookieClearOptions() {
  const { maxAge, ...options } = getAccessCookieOptions()
  return options
}

function setAccessCookie(res, accessToken) {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, getAccessCookieOptions())
}

function clearAccessCookie(res) {
  res.clearCookie(ACCESS_COOKIE_NAME, getAccessCookieClearOptions())
}

function getBearerToken(req) {
  const header = req.headers.authorization || ''

  if (!header.startsWith('Bearer ')) {
    return null
  }

  return header.slice(7)
}

function getAccessToken(req) {
  return req.cookies?.[ACCESS_COOKIE_NAME] || getBearerToken(req)
}

function getRefreshToken(req) {
  return req.cookies?.[REFRESH_COOKIE_NAME] || null
}

function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
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

function isRefreshExpired(session) {
  return new Date(session.expires_at).getTime() <= Date.now()
}

async function findActiveUserById(userId, trx = db) {
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

async function findSessionByRefreshToken(refreshToken) {
  const refreshTokenHash = hashToken(refreshToken)

  return db('user_sessions')
    .where('refresh_token_hash', refreshTokenHash)
    .first()
}

async function revokeSession(sessionId, trx = db) {
  await trx('user_sessions')
    .where('id', sessionId)
    .whereNull('revoked_at')
    .update({
      revoked_at: trx.fn.now(),
      updated_at: trx.fn.now(),
    })
}

async function verifyAccessToken(token) {
  const payload = jwt.verify(token, requireJwtSecret())
  const userId = Number(payload.id || payload.sub)

  if (!Number.isInteger(userId) || userId <= 0) {
    return null
  }

  return findActiveUserById(userId)
}

async function refreshAccessFromSession(req, res) {
  const refreshToken = getRefreshToken(req)

  if (!refreshToken) {
    return null
  }

  const session = await findSessionByRefreshToken(refreshToken)

  if (!session || session.revoked_at) {
    return null
  }

  if (isRefreshExpired(session)) {
    await revokeSession(session.id)
    return null
  }

  const user = await findActiveUserById(session.user_id)

  if (!user) {
    await revokeSession(session.id)
    return null
  }

  if (!user.is_active) {
    await revokeSession(session.id)
    return {
      blocked: true,
    }
  }

  const newAccessToken = createAccessToken(user)
  setAccessCookie(res, newAccessToken)

  return {
    user,
  }
}

export async function authMiddleware(req, res, next) {
  try {
    const accessToken = getAccessToken(req)

    if (accessToken) {
      try {
        const user = await verifyAccessToken(accessToken)

        if (!user) {
          clearAccessCookie(res)
          return error(res, 'Invalid token', 401)
        }

        if (!user.is_active) {
          clearAccessCookie(res)
          return error(res, 'User is blocked', 403)
        }

        req.user = user
        return next()
      } catch (err) {
        if (err.name !== 'TokenExpiredError') {
          clearAccessCookie(res)
          return error(res, 'Invalid token', 401)
        }
      }
    }

    const refreshed = await refreshAccessFromSession(req, res)

    if (!refreshed) {
      clearAccessCookie(res)
      return error(res, 'Unauthorized', 401)
    }

    if (refreshed.blocked) {
      clearAccessCookie(res)
      return error(res, 'User is blocked', 403)
    }

    req.user = refreshed.user

    return next()
  } catch (err) {
    return next(err)
  }
}