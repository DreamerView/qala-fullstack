export const AUTH_MODES = Object.freeze({
  SIGN_IN: 'signin',
  SIGN_UP: 'signup',
})

export const SIGN_UP_STEPS = Object.freeze({
  PHONE: 1,
  NICKNAME: 2,
  PASSWORD: 3,
})

export const AUTH_COPY = Object.freeze({
  signin: {
    title: 'Вход в систему',
    description: 'Введите логин и пароль для доступа к системе.',
  },

  signup: {
    [SIGN_UP_STEPS.PHONE]: {
      title: 'Регистрация',
      description: 'Введите номер телефона для создания аккаунта.',
    },

    [SIGN_UP_STEPS.NICKNAME]: {
      title: 'Создайте никнейм',
      description: 'Никнейм будет отображаться в вашем профиле.',
    },

    [SIGN_UP_STEPS.PASSWORD]: {
      title: 'Создайте пароль',
      description: 'Введите пароль и подтвердите его.',
    },
  },
})