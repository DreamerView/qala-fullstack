import jwt from 'jsonwebtoken'

import db from '../db/knex.js'
import { error } from '../utils/response.js'

function getBearerToken(req) {
  const header = req.headers.authorization || ''

  if (!header.startsWith('Bearer ')) {
    return null
  }

  return header.slice(7)
}

export async function authMiddleware(req, res, next) {
  try {
    const token = getBearerToken(req)

    if (!token) {
      return error(res, 'Token is required', 401)
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }

    let payload

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return error(res, 'Token expired', 401)
      }

      return error(res, 'Invalid token', 401)
    }

    const userId = payload.id || payload.sub

    const user = await db('users')
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

    if (!user) {
      return error(res, 'User not found', 401)
    }

    if (!user.is_active) {
      return error(res, 'User is blocked', 403)
    }

    req.user = user

    return next()
  } catch (err) {
    next(err)
  }
}