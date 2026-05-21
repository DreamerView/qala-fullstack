import rateLimit from 'express-rate-limit'

function createLimiter({
  windowMs,
  max,
  message,
}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: false,
      message,
    },
  })
}

export const authGlobalLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 180,
  message: 'Слишком много запросов авторизации. Попробуйте позже.',
})

export const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Слишком много попыток регистрации. Попробуйте позже.',
})

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Слишком много попыток входа. Попробуйте позже.',
})

export const refreshLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Слишком много запросов обновления сессии. Попробуйте позже.',
})

export const checkFieldLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 90,
  message: 'Слишком много проверок. Попробуйте позже.',
})