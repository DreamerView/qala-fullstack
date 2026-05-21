// backend/src/controllers/event.controller.js

import db from '../db/knex.js'

const EVENT_TYPES = ['event', 'meeting', 'announcement', 'activity', 'plan']
const VISIT_TYPES = ['free', 'paid']
const AGE_LIMITS = ['0+', '6+', '12+', '16+', '18+']
const LANGUAGES = ['kk', 'ru', 'en', 'mixed']
const VISIBILITY_TYPES = ['public', 'private', 'unlisted']
const ACCESS_TYPES = ['open', 'link_only', 'approval_required', 'invite_only']
const POLL_TYPES = ['single', 'multiple']
const MEDIA_TYPES = ['image', 'video']
const QUESTION_TYPES = ['text', 'number', 'select', 'checkbox', 'textarea']

const TYPES_WITH_VISIT = ['event', 'meeting', 'activity']
const TYPES_WITH_PROGRAM = ['event']
const TYPES_WITH_IMAGE = ['event', 'meeting', 'announcement', 'activity']

const DEFAULT_STATUS = 'published'
const DEFAULT_MODERATION_STATUS = 'approved'
const DEFAULT_CURRENCY = 'KZT'

const MAX = {
  title: 180,
  categorySlug: 120,
  categoryName: 160,
  subcategorySlug: 120,
  subcategoryName: 160,
  locationTitle: 180,
  address: 255,
  locationUrl: 600,
  imageUrl: 800,
  externalUrl: 800,
  contact: 80,
  phone: 40,
  programTitle: 180,
  mediaAlt: 180,
  pollQuestion: 255,
  pollOption: 255,
  registrationQuestion: 255,
  programDescription: 1000,
}

const isObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const toCleanString = (value) => {
  return typeof value === 'string' ? value.trim() : ''
}

const toNullableString = (value) => {
  const result = toCleanString(value)
  return result || null
}

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const toPositiveInt = (value) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

const toUnsignedInt = (value) => {
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 ? number : null
}

const toBool = (value, defaultValue = false) => {
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1' || value === 'true') return true
  if (value === 0 || value === '0' || value === 'false') return false
  return defaultValue
}

const pickEnum = (value, list, fallback) => {
  const clean = toCleanString(value)
  return list.includes(clean) ? clean : fallback
}

const isValidDate = (value) => {
  if (typeof value !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime())
}

const isValidTime = (value) => {
  return typeof value === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
}

const isValidUrl = (value) => {
  if (typeof value !== 'string') return false

  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

const isValidLat = (value) => {
  return value === null || (value >= -90 && value <= 90)
}

const isValidLng = (value) => {
  return value === null || (value >= -180 && value <= 180)
}

const normalizeEventType = (value) => {
  return pickEnum(value, EVENT_TYPES, 'event')
}

const getEventRules = (eventType) => {
  return {
    allowsVisit: TYPES_WITH_VISIT.includes(eventType),
    allowsProgram: TYPES_WITH_PROGRAM.includes(eventType),
    allowsImage: TYPES_WITH_IMAGE.includes(eventType),
  }
}

const addMaxError = (errors, key, value, max, label) => {
  if (value && value.length > max) {
    errors[key] = `${label} не должен превышать ${max} символов`
  }
}

const validateUrlField = (errors, key, value, max, label) => {
  if (!value) return

  if (!isValidUrl(value)) {
    errors[key] = `${label} должен быть корректным URL`
    return
  }

  addMaxError(errors, key, value, max, label)
}

const normalizeProgram = (program, hasProgram, errors) => {
  if (!hasProgram) return []

  const items = Array.isArray(program) ? program : []

  const cleanItems = items
    .map((item) => ({
      time: toCleanString(item?.time || item?.program_time),
      title: toCleanString(item?.title),
      description: toCleanString(item?.description),
    }))
    .filter((item) => item.time || item.title || item.description)

  if (!cleanItems.length) {
    errors.program = 'Если программа включена, добавьте хотя бы один пункт'
    return []
  }

  cleanItems.forEach((item, index) => {
    if (item.time && !isValidTime(item.time)) {
      errors[`program.${index}.time`] = 'Время пункта программы должно быть в формате HH:mm'
    }

    if (!item.title) {
      errors[`program.${index}.title`] = 'Название пункта программы обязательно'
    }

    addMaxError(
      errors,
      `program.${index}.title`,
      item.title,
      MAX.programTitle,
      'Название пункта программы'
    )

    addMaxError(
      errors,
      `program.${index}.description`,
      item.description,
      MAX.programDescription,
      'Описание пункта программы'
    )
  })

  return cleanItems
}

const normalizeMedia = (media, image, allowsImage, errors) => {
  const items = Array.isArray(media) ? media : []
  const result = []

  if (allowsImage && image) {
    result.push({
      type: 'image',
      url: image,
      alt: null,
    })
  }

  items.forEach((item, index) => {
    const type = pickEnum(item?.type, MEDIA_TYPES, 'image')
    const url = toCleanString(item?.url)
    const alt = toNullableString(item?.alt)

    if (!url) {
      errors[`media.${index}.url`] = 'Ссылка на медиа обязательна'
      return
    }

    validateUrlField(errors, `media.${index}.url`, url, MAX.imageUrl, 'Ссылка на медиа')
    addMaxError(errors, `media.${index}.alt`, alt || '', MAX.mediaAlt, 'Alt медиа')

    result.push({
      type,
      url,
      alt,
    })
  })

  return result
}

const normalizePolls = (polls, errors) => {
  if (!Array.isArray(polls)) return []

  return polls
    .map((poll, pollIndex) => {
      const question = toCleanString(poll?.question)
      const pollType = pickEnum(poll?.pollType || poll?.poll_type, POLL_TYPES, 'single')
      const closesAt = toNullableString(poll?.closesAt || poll?.closes_at)
      const isActive = toBool(poll?.isActive ?? poll?.is_active, true)

      const options = Array.isArray(poll?.options)
        ? poll.options
            .map((option) => {
              if (typeof option === 'string') return toCleanString(option)
              return toCleanString(option?.text || option?.option_text)
            })
            .filter(Boolean)
        : []

      if (!question) {
        errors[`polls.${pollIndex}.question`] = 'Вопрос опроса обязателен'
      }

      addMaxError(
        errors,
        `polls.${pollIndex}.question`,
        question,
        MAX.pollQuestion,
        'Вопрос опроса'
      )

      if (options.length < 2) {
        errors[`polls.${pollIndex}.options`] = 'В опросе должно быть минимум 2 варианта'
      }

      options.forEach((option, optionIndex) => {
        addMaxError(
          errors,
          `polls.${pollIndex}.options.${optionIndex}`,
          option,
          MAX.pollOption,
          'Вариант ответа'
        )
      })

      return {
        question,
        pollType,
        closesAt,
        isActive,
        options,
      }
    })
    .filter((poll) => poll.question || poll.options.length)
}

const normalizeRegistrationQuestions = (questions, errors) => {
  if (!Array.isArray(questions)) return []

  return questions
    .map((question, index) => {
      const text = toCleanString(question?.question)
      const inputType = pickEnum(question?.inputType || question?.input_type, QUESTION_TYPES, 'text')
      const isRequired = toBool(question?.isRequired ?? question?.is_required, false)

      const options = Array.isArray(question?.options)
        ? question.options.map((item) => toCleanString(item)).filter(Boolean)
        : []

      if (!text) {
        errors[`registrationQuestions.${index}.question`] = 'Вопрос обязателен'
      }

      addMaxError(
        errors,
        `registrationQuestions.${index}.question`,
        text,
        MAX.registrationQuestion,
        'Вопрос регистрации'
      )

      if (['select', 'checkbox'].includes(inputType) && options.length < 1) {
        errors[`registrationQuestions.${index}.options`] =
          'Для select или checkbox нужен минимум один вариант'
      }

      return {
        question: text,
        inputType,
        options,
        isRequired,
      }
    })
    .filter((item) => item.question)
}

const validateEventPayload = (body = {}) => {
  const errors = {}

  const eventType = normalizeEventType(body.eventType || body.event_type)
  const rules = getEventRules(eventType)

  const title = toCleanString(body.title)
  const description = toCleanString(body.description)

  const category = toCleanString(body.category || body.categoryName || body.category_name)
  const categoryId = toPositiveInt(body.categoryId || body.category_id)
  const categorySlug = toCleanString(body.categorySlug || body.category_slug)

  const subcategory = toNullableString(
    body.subcategory || body.subcategoryName || body.subcategory_name
  )

  const subcategoryId =
    body.subcategoryId === null ||
    body.subcategoryId === undefined ||
    body.subcategoryId === ''
      ? null
      : toPositiveInt(body.subcategoryId || body.subcategory_id)

  const subcategorySlug = toNullableString(body.subcategorySlug || body.subcategory_slug)

  const date = toCleanString(body.date || body.event_date)
  const time = toCleanString(body.time || body.event_time)
  const durationMinutes = toUnsignedInt(body.durationMinutes || body.duration_minutes)

  const ageLimit = toNullableString(body.ageLimit || body.age_limit)
  const language = pickEnum(body.language, LANGUAGES, 'ru')

  const location = toNullableString(body.location || body.locationTitle || body.location_title)
  const address = toNullableString(body.address)
  const locationUrl = toNullableString(body.locationUrl || body.location_url)

  const lat = toNumber(body.lat)
  const lng = toNumber(body.lng)

  const rawVisitType = toCleanString(body.visitType || body.visit_type)
  const visitType =
    rules.allowsVisit && VISIT_TYPES.includes(rawVisitType) ? rawVisitType : 'free'

  const price = toNumber(body.price)
  const currency = toCleanString(body.currency) || DEFAULT_CURRENCY
  const limit = toPositiveInt(body.limit || body.participantsLimit || body.participants_limit)

  const registrationRequired = toBool(
    body.registrationRequired ?? body.registration_required,
    false
  )
  const registrationDeadline = toNullableString(
    body.registrationDeadline || body.registration_deadline
  )

  const contactPhone = toNullableString(body.contactPhone || body.contact_phone)
  const contactWhatsapp = toNullableString(body.contactWhatsapp || body.contact_whatsapp)
  const contactTelegram = toNullableString(body.contactTelegram || body.contact_telegram)
  const externalUrl = toNullableString(body.externalUrl || body.external_url)

  const image = rules.allowsImage
    ? toNullableString(body.image || body.imageUrl || body.image_url)
    : null

  const visibility = pickEnum(body.visibility, VISIBILITY_TYPES, 'public')
  const accessType = pickEnum(body.accessType || body.access_type, ACCESS_TYPES, 'open')

  const allowComments = toBool(body.allowComments ?? body.allow_comments, true)
  const allowShare = toBool(body.allowShare ?? body.allow_share, true)
  const allowWaitlist = toBool(body.allowWaitlist ?? body.allow_waitlist, false)

  const hasProgram = rules.allowsProgram
    ? toBool(body.hasProgram ?? body.has_program, false)
    : false

  if (!title) errors.title = 'Название обязательно'
  addMaxError(errors, 'title', title, MAX.title, 'Название')

  if (!description) errors.description = 'Описание обязательно'

  if (!categoryId) errors.categoryId = 'ID категории обязателен'
  if (!category) errors.category = 'Категория обязательна'
  if (!categorySlug) errors.categorySlug = 'Slug категории обязателен'

  addMaxError(errors, 'categorySlug', categorySlug, MAX.categorySlug, 'Slug категории')
  addMaxError(errors, 'category', category, MAX.categoryName, 'Название категории')

  if (
    body.subcategoryId !== null &&
    body.subcategoryId !== undefined &&
    body.subcategoryId !== '' &&
    !subcategoryId
  ) {
    errors.subcategoryId = 'ID подкатегории должен быть положительным числом'
  }

  addMaxError(errors, 'subcategorySlug', subcategorySlug || '', MAX.subcategorySlug, 'Slug подкатегории')
  addMaxError(errors, 'subcategory', subcategory || '', MAX.subcategoryName, 'Название подкатегории')

  if (!date || !isValidDate(date)) {
    errors.date = 'Дата обязательна и должна быть в формате YYYY-MM-DD'
  }

  if (!time || !isValidTime(time)) {
    errors.time = 'Время обязательно и должно быть в формате HH:mm'
  }

  if (durationMinutes !== null && durationMinutes < 1) {
    errors.durationMinutes = 'Длительность должна быть положительным числом'
  }

  if (ageLimit && !AGE_LIMITS.includes(ageLimit)) {
    errors.ageLimit = 'Возрастное ограничение должно быть 0+, 6+, 12+, 16+ или 18+'
  }

  if (!location) errors.location = 'Место проведения обязательно'
  if (!address) errors.address = 'Адрес обязателен'
  if (!locationUrl) errors.locationUrl = 'Ссылка на локацию обязательна'

  addMaxError(errors, 'location', location || '', MAX.locationTitle, 'Место проведения')
  addMaxError(errors, 'address', address || '', MAX.address, 'Адрес')

  validateUrlField(errors, 'locationUrl', locationUrl, MAX.locationUrl, 'Ссылка на локацию')

  if (!isValidLat(lat)) errors.lat = 'Широта должна быть от -90 до 90'
  if (!isValidLng(lng)) errors.lng = 'Долгота должна быть от -180 до 180'

  if (lat === null) errors.lat = 'Широта обязательна'
  if (lng === null) errors.lng = 'Долгота обязательна'

  if (rules.allowsVisit && visitType === 'paid') {
    if (!Number.isFinite(price) || price < 1) {
      errors.price = 'Для платной публикации цена должна быть не ниже 1'
    }
  }

  if (rules.allowsVisit && visitType === 'free' && price !== null && price < 0) {
    errors.price = 'Цена не может быть отрицательной'
  }

  if (!rules.allowsVisit && price !== null && price < 0) {
    errors.price = 'Цена не может быть отрицательной'
  }

  if (currency.length > 8) {
    errors.currency = 'Код валюты не должен превышать 8 символов'
  }

  if (
    (body.limit || body.participantsLimit || body.participants_limit) &&
    !limit
  ) {
    errors.limit = 'Лимит участников должен быть положительным числом'
  }

  if (registrationDeadline && Number.isNaN(new Date(registrationDeadline).getTime())) {
    errors.registrationDeadline = 'Дедлайн регистрации должен быть корректной датой'
  }

  addMaxError(errors, 'contactPhone', contactPhone || '', MAX.phone, 'Телефон')
  addMaxError(errors, 'contactWhatsapp', contactWhatsapp || '', MAX.contact, 'WhatsApp')
  addMaxError(errors, 'contactTelegram', contactTelegram || '', MAX.contact, 'Telegram')

  validateUrlField(errors, 'externalUrl', externalUrl, MAX.externalUrl, 'Внешняя ссылка')
  validateUrlField(errors, 'image', image, MAX.imageUrl, 'Ссылка на изображение')

  const program = normalizeProgram(body.program, hasProgram, errors)
  const media = normalizeMedia(body.media, image, rules.allowsImage, errors)
  const polls = normalizePolls(body.polls, errors)
  const registrationQuestions = normalizeRegistrationQuestions(
    body.registrationQuestions || body.registration_questions,
    errors
  )

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      eventType,
      title,
      description,

      categoryId,
      categorySlug,
      category,

      subcategoryId,
      subcategorySlug,
      subcategory,

      date,
      time,
      durationMinutes,

      ageLimit,
      language,

      location,
      address,
      locationUrl,
      lat,
      lng,

      visitType: rules.allowsVisit ? visitType : 'free',
      price: rules.allowsVisit && visitType === 'paid' ? price : null,
      currency,

      limit,

      registrationRequired,
      registrationDeadline,

      contactPhone,
      contactWhatsapp,
      contactTelegram,
      externalUrl,

      image,

      hasProgram,
      program,

      media,
      polls,
      registrationQuestions,

      visibility,
      accessType,
      allowComments,
      allowShare,
      allowWaitlist,
    },
  }
}

const buildEventPayload = (data, req, trx) => ({
  user_id: req.user?.id || null,

  event_type: data.eventType,

  title: data.title,
  description: data.description,

  category_id: data.categoryId,
  category_slug: data.categorySlug,
  category_name: data.category,

  subcategory_id: data.subcategoryId,
  subcategory_slug: data.subcategorySlug,
  subcategory_name: data.subcategory,

  event_date: data.date,
  event_time: data.time,
  duration_minutes: data.durationMinutes,

  age_limit: data.ageLimit,
  language: data.language,

  location_title: data.location,
  address: data.address,
  location_url: data.locationUrl,
  lat: data.lat,
  lng: data.lng,

  visit_type: data.visitType,
  price: data.price,
  currency: data.currency,

  participants_limit: data.limit,

  registration_required: data.registrationRequired,
  registration_deadline: data.registrationDeadline,

  contact_phone: data.contactPhone,
  contact_whatsapp: data.contactWhatsapp,
  contact_telegram: data.contactTelegram,
  external_url: data.externalUrl,

  image_url: data.image,

  has_program: data.hasProgram,

  visibility: data.visibility,
  access_type: data.accessType,
  allow_comments: data.allowComments,
  allow_share: data.allowShare,
  allow_waitlist: data.allowWaitlist,

  status: DEFAULT_STATUS,
  moderation_status: DEFAULT_MODERATION_STATUS,
  is_active: true,
  published_at: trx.fn.now(),
})

const insertProgramItems = async (trx, eventId, program) => {
  if (!program.length) return

  await trx('event_program_items').insert(
    program.map((item, index) => ({
      event_id: eventId,
      program_time: toNullableString(item.time),
      title: item.title,
      description: toNullableString(item.description),
      sort_order: index + 1,
    }))
  )
}

const insertMediaItems = async (trx, eventId, media) => {
  if (!media.length) return

  const unique = new Map()

  media.forEach((item) => {
    const key = `${item.type}:${item.url}`
    if (!unique.has(key)) unique.set(key, item)
  })

  await trx('event_media').insert(
    [...unique.values()].map((item, index) => ({
      event_id: eventId,
      type: item.type,
      url: item.url,
      alt: item.alt,
      sort_order: index + 1,
    }))
  )
}

const insertPolls = async (trx, eventId, polls) => {
  for (const poll of polls) {
    const [pollId] = await trx('event_polls').insert({
      event_id: eventId,
      question: poll.question,
      poll_type: poll.pollType,
      is_active: poll.isActive,
      closes_at: poll.closesAt,
    })

    await trx('event_poll_options').insert(
      poll.options.map((option, index) => ({
        poll_id: pollId,
        option_text: option,
        sort_order: index + 1,
      }))
    )
  }
}

const insertRegistrationQuestions = async (trx, eventId, questions) => {
  if (!questions.length) return

  await trx('event_registration_questions').insert(
    questions.map((item, index) => ({
      event_id: eventId,
      question: item.question,
      input_type: item.inputType,
      options_json: ['select', 'checkbox'].includes(item.inputType)
        ? JSON.stringify(item.options)
        : null,
      is_required: item.isRequired,
      sort_order: index + 1,
    }))
  )
}

const replaceEventRelations = async (trx, eventId, data) => {
  await trx('event_registration_answers').where('event_id', eventId).del()
  await trx('event_registration_questions').where('event_id', eventId).del()

  const polls = await trx('event_polls').select('id').where('event_id', eventId)
  const pollIds = polls.map((item) => item.id)

  if (pollIds.length) {
    await trx('event_poll_votes').whereIn('poll_id', pollIds).del()
    await trx('event_poll_options').whereIn('poll_id', pollIds).del()
    await trx('event_polls').whereIn('id', pollIds).del()
  }

  await trx('event_media').where('event_id', eventId).del()
  await trx('event_program_items').where('event_id', eventId).del()

  await insertProgramItems(trx, eventId, data.program)
  await insertMediaItems(trx, eventId, data.media)
  await insertPolls(trx, eventId, data.polls)
  await insertRegistrationQuestions(trx, eventId, data.registrationQuestions)
}

const getEventRelations = async (trx, eventId) => {
  const [program, media, polls, registrationQuestions] = await Promise.all([
    trx('event_program_items')
      .where('event_id', eventId)
      .orderBy('sort_order', 'asc'),

    trx('event_media')
      .where('event_id', eventId)
      .orderBy('sort_order', 'asc'),

    trx('event_polls')
      .where('event_id', eventId)
      .orderBy('id', 'asc'),

    trx('event_registration_questions')
      .where('event_id', eventId)
      .orderBy('sort_order', 'asc'),
  ])

  const pollIds = polls.map((poll) => poll.id)

  const pollOptions = pollIds.length
    ? await trx('event_poll_options')
        .whereIn('poll_id', pollIds)
        .orderBy('sort_order', 'asc')
    : []

  const optionsByPollId = pollOptions.reduce((acc, option) => {
    if (!acc[option.poll_id]) acc[option.poll_id] = []
    acc[option.poll_id].push(option)
    return acc
  }, {})

  return {
    program,
    media,
    polls: polls.map((poll) => ({
      ...poll,
      options: optionsByPollId[poll.id] || [],
    })),
    registration_questions: registrationQuestions.map((item) => ({
      ...item,
      options: item.options_json ? JSON.parse(item.options_json) : [],
    })),
  }
}

const getEventParticipationMeta = async (eventId, userId, trx = db) => {
  const participantsRow = await trx('event_participants')
    .where('event_id', eventId)
    .whereIn('status', ['joined', 'approved'])
    .count({ total: 'id' })
    .first()

  const participantsCount = Number(participantsRow?.total || 0)

  if (!userId) {
    return {
      participants_count: participantsCount,
      is_participant: false,
      participant_status: null,
    }
  }

  const participant = await trx('event_participants')
    .select('id', 'status')
    .where({
      event_id: eventId,
      user_id: userId,
    })
    .first()

  return {
    participants_count: participantsCount,
    is_participant: Boolean(participant && !['cancelled', 'rejected'].includes(participant.status)),
    participant_status: participant?.status || null,
  }
}

export const createEvent = async (req, res) => {
  const { isValid, errors, data } = validateEventPayload(req.body)

  if (!isValid) {
    return res.status(422).json({
      status: false,
      message: 'Проверьте правильность заполнения формы',
      errors,
    })
  }

  try {
    const result = await db.transaction(async (trx) => {
      const [eventId] = await trx('events').insert(buildEventPayload(data, req, trx))

      await insertProgramItems(trx, eventId, data.program)
      await insertMediaItems(trx, eventId, data.media)
      await insertPolls(trx, eventId, data.polls)
      await insertRegistrationQuestions(trx, eventId, data.registrationQuestions)

      const event = await trx('events').where('id', eventId).first()
      const relations = await getEventRelations(trx, eventId)

      return {
        event,
        ...relations,
      }
    })

    return res.status(201).json({
      status: true,
      message: 'Публикация успешно создана',
      data: result,
    })
  } catch (err) {
    console.error('Create event error:', err)

    return res.status(500).json({
      status: false,
      message: 'Не удалось создать публикацию',
    })
  }
}

export const getEventById = async (req, res) => {
  const eventId = toPositiveInt(req.params.id)
  const userId = req.user?.id || null

  if (!eventId) {
    return res.status(400).json({
      status: false,
      message: 'Некорректный ID события',
    })
  }

  try {
    const event = await db('events')
      .where('id', eventId)
      .where('is_active', true)
      .first()

    if (!event) {
      return res.status(404).json({
        status: false,
        message: 'Событие не найдено',
      })
    }

    const [participationMeta, relations] = await Promise.all([
      getEventParticipationMeta(eventId, userId),
      getEventRelations(db, eventId),
    ])

    return res.json({
      status: true,
      message: 'Событие получено',
      data: {
        event: {
          ...event,
          ...participationMeta,
        },
        ...relations,
      },
    })
  } catch (err) {
    console.error('Get event by id error:', err)

    return res.status(500).json({
      status: false,
      message: 'Не удалось получить событие',
    })
  }
}

export const updateEvent = async (req, res) => {
  const eventId = toPositiveInt(req.params.id)

  if (!eventId) {
    return res.status(400).json({
      status: false,
      message: 'Некорректный ID события',
    })
  }

  const { isValid, errors, data } = validateEventPayload(req.body)

  if (!isValid) {
    return res.status(422).json({
      status: false,
      message: 'Проверьте правильность заполнения формы',
      errors,
    })
  }

  try {
    const result = await db.transaction(async (trx) => {
      const existingEvent = await trx('events')
        .where('id', eventId)
        .where('is_active', true)
        .first()

      if (!existingEvent) return null

      await trx('events')
        .where('id', eventId)
        .update({
          event_type: data.eventType,

          title: data.title,
          description: data.description,

          category_id: data.categoryId,
          category_slug: data.categorySlug,
          category_name: data.category,

          subcategory_id: data.subcategoryId,
          subcategory_slug: data.subcategorySlug,
          subcategory_name: data.subcategory,

          event_date: data.date,
          event_time: data.time,
          duration_minutes: data.durationMinutes,

          age_limit: data.ageLimit,
          language: data.language,

          location_title: data.location,
          address: data.address,
          location_url: data.locationUrl,
          lat: data.lat,
          lng: data.lng,

          visit_type: data.visitType,
          price: data.price,
          currency: data.currency,

          participants_limit: data.limit,

          registration_required: data.registrationRequired,
          registration_deadline: data.registrationDeadline,

          contact_phone: data.contactPhone,
          contact_whatsapp: data.contactWhatsapp,
          contact_telegram: data.contactTelegram,
          external_url: data.externalUrl,

          image_url: data.image,

          has_program: data.hasProgram,

          visibility: data.visibility,
          access_type: data.accessType,
          allow_comments: data.allowComments,
          allow_share: data.allowShare,
          allow_waitlist: data.allowWaitlist,
        })

      await replaceEventRelations(trx, eventId, data)

      const event = await trx('events').where('id', eventId).first()
      const relations = await getEventRelations(trx, eventId)

      return {
        event,
        ...relations,
      }
    })

    if (!result) {
      return res.status(404).json({
        status: false,
        message: 'Событие не найдено',
      })
    }

    return res.json({
      status: true,
      message: 'Публикация успешно обновлена',
      data: result,
    })
  } catch (err) {
    console.error('Update event error:', err)

    return res.status(500).json({
      status: false,
      message: 'Не удалось обновить публикацию',
    })
  }
}

export const cancelEvent = async (req, res) => {
  const eventId = toPositiveInt(req.params.id)
  const reason = toNullableString(req.body?.reason || req.body?.cancel_reason)

  if (!eventId) {
    return res.status(400).json({
      status: false,
      message: 'Некорректный ID события',
    })
  }

  try {
    const updated = await db('events')
      .where('id', eventId)
      .where('is_active', true)
      .update({
        status: 'archived',
        cancelled_at: db.fn.now(),
        cancel_reason: reason,
      })

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: 'Событие не найдено',
      })
    }

    return res.json({
      status: true,
      message: 'Событие отменено',
      data: {
        id: eventId,
      },
    })
  } catch (err) {
    console.error('Cancel event error:', err)

    return res.status(500).json({
      status: false,
      message: 'Не удалось отменить событие',
    })
  }
}

export const deleteEvent = async (req, res) => {
  const eventId = toPositiveInt(req.params.id)

  if (!eventId) {
    return res.status(400).json({
      status: false,
      message: 'Некорректный ID события',
    })
  }

  try {
    const result = await db.transaction(async (trx) => {
      const existingEvent = await trx('events').where('id', eventId).first()

      if (!existingEvent) return null

      await trx('events').where('id', eventId).del()

      return {
        id: eventId,
      }
    })

    if (!result) {
      return res.status(404).json({
        status: false,
        message: 'Событие не найдено',
      })
    }

    return res.json({
      status: true,
      message: 'Событие удалено навсегда',
      data: result,
    })
  } catch (err) {
    console.error('Force delete event error:', err)

    return res.status(500).json({
      status: false,
      message: 'Не удалось удалить событие',
    })
  }
}