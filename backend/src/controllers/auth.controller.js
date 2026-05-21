// src/controllers/auth.controller.js

import crypto from 'node:crypto'

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import db from '../db/knex.js'
import { success, error } from '../utils/response.js'

const ACCESS_COOKIE_NAME = 'qala_access_token'
const REFRESH_COOKIE_NAME = 'qala_refresh_token'

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
const REFRESH_TOKEN_DAYS = Number(process.env.JWT_REFRESH_DAYS || 30)

function requireJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  return process.env.JWT_SECRET
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

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for']

  if (forwardedFor) {
    return String(forwardedFor).split(',')[0].trim()
  }

  return req.ip || req.socket?.remoteAddress || null
}

function getCookieBaseOptions() {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  }
}

function getAccessCookieOptions() {
  return {
    ...getCookieBaseOptions(),
    maxAge: 15 * 60 * 1000,
    path: '/api',
  }
}

function getRefreshCookieOptions() {
  return {
    ...getCookieBaseOptions(),
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  }
}

function setAccessCookie(res, accessToken) {
  res.cookie(
    ACCESS_COOKIE_NAME,
    accessToken,
    getAccessCookieOptions()
  )
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    getRefreshCookieOptions()
  )
}

function clearAccessCookie(res) {
  res.clearCookie(ACCESS_COOKIE_NAME, {
    ...getAccessCookieOptions(),
    maxAge: undefined,
  })
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...getRefreshCookieOptions(),
    maxAge: undefined,
  })
}

function setAuthCookies(res, accessToken, refreshToken) {
  setAccessCookie(res, accessToken)
  setRefreshCookie(res, refreshToken)
}

function clearAuthCookies(res) {
  clearAccessCookie(res)
  clearRefreshCookie(res)
}

function getRefreshTokenFromRequest(req) {
  return req.cookies?.[REFRESH_COOKIE_NAME] || null
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

function normalizeRegisterPayload(body) {
  return {
    phone: String(body.phone || '').trim(),
    email: body.email ? String(body.email).trim().toLowerCase() : null,
    nickname: String(body.nickname || '').trim(),
    password: String(body.password || ''),
  }
}

function normalizeLoginPayload(body) {
  return {
    login: String(body.login || '').trim(),
    password: String(body.password || ''),
  }
}

export async function register(req, res, next) {
  try {
    const {
      phone,
      email,
      nickname,
      password,
    } = normalizeRegisterPayload(req.body)

    if (!phone || !nickname || !password) {
      return error(res, 'Phone, nickname and password are required', 422)
    }

    if (password.length < 6) {
      return error(res, 'Password must be at least 6 characters', 422)
    }

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

      const accessToken = createAccessToken(user)
      const refreshToken = await createUserSession(req, user.id, trx)

      return {
        user,
        accessToken,
        refreshToken,
      }
    })

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
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const {
      login,
      password,
    } = normalizeLoginPayload(req.body)

    if (!login || !password) {
      return error(res, 'Login and password are required', 422)
    }

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
        })

      const safeUser = await findSafeUserById(user.id, trx)

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
    next(err)
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = getRefreshTokenFromRequest(req)

    if (!refreshToken) {
      clearAuthCookies(res)
      return error(res, 'Refresh token is missing', 401)
    }

    const refreshTokenHash = hashToken(refreshToken)

    const session = await db('user_sessions')
      .where('refresh_token_hash', refreshTokenHash)
      .first()

    if (!session) {
      clearAuthCookies(res)
      return error(res, 'Invalid refresh token', 401)
    }

    if (session.revoked_at) {
      clearAuthCookies(res)
      return error(res, 'Invalid refresh token', 401)
    }

    const isExpired = new Date(session.expires_at).getTime() <= Date.now()

    if (isExpired) {
      await revokeSessionById(session.id)

      clearAuthCookies(res)

      return error(res, 'Refresh token expired', 401)
    }

    const user = await findSafeUserById(session.user_id)

    if (!user) {
      clearAuthCookies(res)
      return error(res, 'User not found', 401)
    }

    if (!user.is_active) {
      await revokeSessionById(session.id)

      clearAuthCookies(res)

      return error(res, 'User is blocked', 403)
    }

    const result = await db.transaction(async (trx) => {
      await revokeSessionById(session.id, trx)

      const newRefreshToken = await createUserSession(req, user.id, trx)
      const newAccessToken = createAccessToken(user)

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }
    })

    setAuthCookies(res, result.accessToken, result.refreshToken)

    return success(res, 'Token refreshed successfully', {
      user,
    })
  } catch (err) {
    next(err)
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
    next(err)
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
    next(err)
  }
}

export async function checkAuthField(req, res, next) {
  try {
    const { field, value } = req.query

    const allowedFields = ['phone', 'email', 'nickname']

    if (!allowedFields.includes(field)) {
      return error(res, 'Invalid field', 422)
    }

    if (!value || String(value).trim().length < 3) {
      return error(res, 'Value is required', 422)
    }

    const normalizedValue = field === 'email'
      ? String(value).trim().toLowerCase()
      : String(value).trim()

    const existingUser = await db('users')
      .select('id')
      .where(field, normalizedValue)
      .first()

    return success(res, 'Field checked', {
      field,
      value: normalizedValue,
      exists: Boolean(existingUser),
      available: !existingUser,
    })
  } catch (err) {
    next(err)
  }
}