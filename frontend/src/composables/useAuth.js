// src/composables/useAuth.js

import { computed, readonly, ref } from 'vue'

const API_ERROR_MESSAGES = {
  'Invalid login or password': 'Неверный логин или пароль.',
  'User already exists': 'Пользователь уже существует.',
  'User is blocked': 'Пользователь заблокирован.',
  Unauthorized: 'Необходимо войти в аккаунт.',
  'Token is required': 'Сессия отсутствует. Войдите снова.',
  'Token expired': 'Сессия истекла. Войдите снова.',
  'Invalid token': 'Недействительная сессия. Войдите снова.',
  'User not found': 'Пользователь не найден.',

  'Refresh token is missing': 'Сессия отсутствует. Войдите снова.',
  'Invalid refresh token': 'Сессия недействительна. Войдите снова.',
  'Refresh token expired': 'Сессия истекла. Войдите снова.',

  'Phone, nickname and password are required': 'Заполните телефон, никнейм и пароль.',
  'Login and password are required': 'Введите логин и пароль.',
  'Password must be at least 6 characters': 'Пароль должен быть минимум 6 символов.',

  'Invalid field': 'Некорректное поле для проверки.',
  'Value is required': 'Значение обязательно для проверки.',
  'Route not found': 'Маршрут не найден.',
  'Internal server error': 'Внутренняя ошибка сервера.',
}

const user = ref(null)
const isLoading = ref(false)
const error = ref('')
const isInitialized = ref(false)

let refreshPromise = null

function translateApiError(message, fallback = 'Произошла ошибка.') {
  return API_ERROR_MESSAGES[message] || message || fallback
}

function setSession(data) {
  user.value = data?.user || null
}

function clearSession() {
  user.value = null
}

function isAuthError(message) {
  return [
    'Unauthorized',
    'Token is required',
    'Token expired',
    'Invalid token',
    'Refresh token is missing',
    'Invalid refresh token',
    'Refresh token expired',
  ].includes(message)
}

async function request(url, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({
    status: false,
    message: 'Некорректный ответ сервера.',
  }))

  if (!response.ok || data.status === false) {
    throw new Error(data.message || 'Ошибка запроса.')
  }

  return data
}

async function refreshSession() {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = request('/api/auth/refresh', {
    method: 'POST',
  })
    .then((response) => {
      setSession(response.data)
      return true
    })
    .catch(() => {
      clearSession()
      return false
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

async function requestWithRefresh(url, options = {}) {
  try {
    return await request(url, options)
  } catch (err) {
    if (!isAuthError(err.message)) {
      throw err
    }

    const refreshed = await refreshSession()

    if (!refreshed) {
      throw err
    }

    return request(url, options)
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => {
    return Boolean(user.value)
  })

  function clearError() {
    error.value = ''
  }

  async function signIn(payload) {
    isLoading.value = true
    clearError()

    try {
      const response = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          login: payload.login,
          password: payload.password,
        }),
      })

      setSession(response.data)
      isInitialized.value = true

      return true
    } catch (err) {
      clearSession()

      error.value = translateApiError(
        err.message,
        'Не удалось войти в систему.'
      )

      return false
    } finally {
      isLoading.value = false
    }
  }

  async function signUp(payload) {
    isLoading.value = true
    clearError()

    try {
      const response = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          phone: payload.phone,
          email: payload.email || null,
          nickname: payload.nickname,
          password: payload.password,
        }),
      })

      setSession(response.data)
      isInitialized.value = true

      return true
    } catch (err) {
      clearSession()

      error.value = translateApiError(
        err.message,
        'Не удалось создать аккаунт.'
      )

      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCurrentUser() {
    isLoading.value = true
    clearError()

    try {
      const response = await requestWithRefresh('/api/user/me', {
        method: 'GET',
      })

      setSession(response.data)
      isInitialized.value = true

      return true
    } catch (err) {
      clearSession()

      error.value = translateApiError(
        err.message,
        'Не удалось получить пользователя.'
      )

      isInitialized.value = true

      return false
    } finally {
      isLoading.value = false
    }
  }

  async function checkAuthField({ field, value }) {
    clearError()

    try {
      const params = new URLSearchParams({
        field,
        value,
      })

      const response = await request(`/api/auth/check?${params.toString()}`, {
        method: 'GET',
      })

      return response.data
    } catch (err) {
      error.value = translateApiError(
        err.message,
        'Не удалось проверить данные.'
      )

      return null
    }
  }

  async function logout() {
    isLoading.value = true
    clearError()

    try {
      await request('/api/auth/logout', {
        method: 'POST',
      })
    } catch {
      // Даже если backend временно недоступен, локальное состояние очищаем.
    } finally {
      clearSession()
      isInitialized.value = true
      isLoading.value = false
    }
  }

  async function initializeAuth() {
    if (isInitialized.value) {
      return isAuthenticated.value
    }

    return fetchCurrentUser()
  }

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isInitialized: readonly(isInitialized),

    isAuthenticated,

    signIn,
    signUp,
    fetchCurrentUser,
    checkAuthField,
    refreshSession,
    initializeAuth,
    logout,
    clearError,
  }
}