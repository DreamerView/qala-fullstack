import { computed, reactive, ref } from 'vue'

import {
  AUTH_COPY,
  AUTH_MODES,
  SIGN_UP_STEPS,
} from '@/constants/auth'

export function useAuthForm() {
  const mode = ref(AUTH_MODES.SIGN_IN)
  const step = ref(SIGN_UP_STEPS.PHONE)

  const signInForm = reactive({
    login: '',
    password: '',
  })

  const signUpForm = reactive({
    phone: '',
    nickname: '',
    password: '',
    password_confirm: '',
  })

  const isSignIn = computed(() => mode.value === AUTH_MODES.SIGN_IN)
  const isSignUp = computed(() => mode.value === AUTH_MODES.SIGN_UP)

  const pageTitle = computed(() => {
    if (isSignIn.value) return AUTH_COPY.signin.title

    return AUTH_COPY.signup[step.value].title
  })

  const pageDescription = computed(() => {
    if (isSignIn.value) return AUTH_COPY.signin.description

    return AUTH_COPY.signup[step.value].description
  })

  const switchLabel = computed(() => {
    return isSignIn.value ? 'Нет аккаунта?' : 'Уже есть аккаунт?'
  })

  const switchButtonText = computed(() => {
    return isSignIn.value ? 'Зарегистрироваться' : 'Войти'
  })

  const normalizedPhone = computed(() => {
    return signUpForm.phone.replace(/[^\d+]/g, '')
  })

  const normalizedNickname = computed(() => {
    return signUpForm.nickname
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9._]/g, '')
  })

  const canSignIn = computed(() => {
    return signInForm.login.trim().length >= 3 && signInForm.password.length >= 6
  })

  const canGoToNickname = computed(() => {
    return normalizedPhone.value.length >= 10
  })

  const canGoToPassword = computed(() => {
    return normalizedNickname.value.length >= 3
  })

  const passwordError = computed(() => {
    const { password, password_confirm } = signUpForm

    if (!password && !password_confirm) return ''

    if (password.length > 0 && password.length < 6) {
      return 'Пароль должен быть минимум 6 символов.'
    }

    if (password_confirm.length > 0 && password !== password_confirm) {
      return 'Пароли не совпадают.'
    }

    return ''
  })

  const canSubmitSignUp = computed(() => {
    const { password, password_confirm } = signUpForm

    return (
      password.length >= 6 &&
      password_confirm.length >= 6 &&
      password === password_confirm
    )
  })

  const resetStep = () => {
    step.value = SIGN_UP_STEPS.PHONE
  }

  const toggleMode = () => {
    mode.value = isSignIn.value ? AUTH_MODES.SIGN_UP : AUTH_MODES.SIGN_IN
    resetStep()
  }

  const nextStep = () => {
    if (step.value === SIGN_UP_STEPS.PHONE && !canGoToNickname.value) return
    if (step.value === SIGN_UP_STEPS.NICKNAME && !canGoToPassword.value) return

    if (step.value < SIGN_UP_STEPS.PASSWORD) {
      step.value += 1
    }
  }

  const prevStep = () => {
    if (step.value > SIGN_UP_STEPS.PHONE) {
      step.value -= 1
    }
  }

  const getSignInPayload = () => {
    return {
      login: signInForm.login.trim(),
      password: signInForm.password,
    }
  }

  const getSignUpPayload = () => {
    return {
      phone: normalizedPhone.value,
      nickname: normalizedNickname.value,
      password: signUpForm.password,
      password_confirm: signUpForm.password_confirm,
    }
  }

  return {
    mode,
    step,

    signInForm,
    signUpForm,

    isSignIn,
    isSignUp,

    pageTitle,
    pageDescription,
    switchLabel,
    switchButtonText,

    normalizedPhone,
    normalizedNickname,

    canSignIn,
    canGoToNickname,
    canGoToPassword,
    passwordError,
    canSubmitSignUp,

    toggleMode,
    nextStep,
    prevStep,

    getSignInPayload,
    getSignUpPayload,
  }
}