// src/middlewares/auth.middleware.js

import jwt from 'jsonwebtoken'

import db from '../db/knex.js'
import { error } from '../utils/response.js'

const ACCESS_COOKIE_NAME = 'qala_access_token'

function getBearerToken(req) {
  const header = req.headers.authorization || ''

  if (!header.startsWith('Bearer ')) {
    return null
  }

  return header.slice(7)
}

function getCookieToken(req) {
  return req.cookies?.[ACCESS_COOKIE_NAME] || null
}

function getAccessToken(req) {
  return getCookieToken(req) || getBearerToken(req)
}

function requireJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  return process.env.JWT_SECRET
}

async function findActiveUserById(userId) {
  return db('users')
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

export async function authMiddleware(req, res, next) {
  try {
    const token = getAccessToken(req)

    if (!token) {
      return error(res, 'Token is required', 401)
    }

    let payload

    try {
      payload = jwt.verify(token, requireJwtSecret())
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return error(res, 'Token expired', 401)
      }

      return error(res, 'Invalid token', 401)
    }

    const userId = Number(payload.id || payload.sub)

    if (!Number.isInteger(userId) || userId <= 0) {
      return error(res, 'Invalid token', 401)
    }

    const user = await findActiveUserById(userId)

    if (!user) {
      return error(res, 'User not found', 401)
    }

    if (!user.is_active) {
      return error(res, 'User is blocked', 403)
    }

    req.user = user

    return next()
  } catch (err) {
    return next(err)
  }
}