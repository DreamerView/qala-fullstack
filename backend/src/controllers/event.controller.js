// backend/src/controllers/event.controller.js

import db from '../db/knex.js'

const EVENT_TYPES = ['event', 'meeting', 'announcement', 'activity', 'plan']
const VISIT_TYPES = ['free', 'paid']
const TYPES_WITH_REQUIRED_DATE_TIME = ['event', 'meeting', 'activity']
const TYPES_WITH_REQUIRED_LOCATION = ['event', 'meeting', 'activity']
const TYPES_WITH_VISIT = ['event', 'meeting', 'activity']
const TYPES_WITH_PROGRAM = ['event']
const TYPES_WITH_IMAGE = ['event', 'meeting', 'announcement', 'activity']

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

const toCleanString = (value) => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const toNullableString = (value) => {
  const result = toCleanString(value)
  return result || null
}

const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const toPositiveInt = (value) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

const normalizeEventType = (value) => {
  const type = toCleanString(value)
  return EVENT_TYPES.includes(type) ? type : 'event'
}

const getEventRules = (eventType) => {
  return {
    requiresDateTime: TYPES_WITH_REQUIRED_DATE_TIME.includes(eventType),
    requiresLocation: TYPES_WITH_REQUIRED_LOCATION.includes(eventType),
    allowsVisit: TYPES_WITH_VISIT.includes(eventType),
    allowsProgram: TYPES_WITH_PROGRAM.includes(eventType),
    allowsImage: TYPES_WITH_IMAGE.includes(eventType),
  }
}

const getEventParticipationMeta = async (eventId, userId, trx = db) => {
  const participantsRow = await trx('event_participants')
    .where('event_id', eventId)
    .count({ total: 'id' })
    .first()

  const participantsCount = Number(participantsRow?.total || 0)

  if (!userId) {
    return {
      participants_count: participantsCount,
      is_participant: false,
    }
  }

  const participant = await trx('event_participants')
    .select('id')
    .where({
      event_id: eventId,
      user_id: userId,
    })
    .first()

  return {
    participants_count: participantsCount,
    is_participant: Boolean(participant),
  }
}

const validateCreateEventPayload = (body) => {
  const errors = {}

  const eventType = normalizeEventType(body.eventType || body.event_type)
  const rules = getEventRules(eventType)

  const title = toCleanString(body.title)
  const description = toCleanString(body.description)

  const category = toCleanString(body.category)
  const categoryId = Number(body.categoryId)
  const categorySlug = toCleanString(body.categorySlug)

  const subcategory = toCleanString(body.subcategory)
  const subcategoryId = body.subcategoryId === null || body.subcategoryId === undefined || body.subcategoryId === ''
    ? null
    : Number(body.subcategoryId)
  const subcategorySlug = toCleanString(body.subcategorySlug)

  const date = toCleanString(body.date)
  const time = toCleanString(body.time)

  const location = toCleanString(body.location)
  const address = toCleanString(body.address)
  const locationUrl = toCleanString(body.locationUrl)

  const lat = toNumber(body.lat)
  const lng = toNumber(body.lng)

  const rawVisitType = toCleanString(body.visitType)
  const visitType = rules.allowsVisit && VISIT_TYPES.includes(rawVisitType)
    ? rawVisitType
    : 'free'

  const price = body.price === null || body.price === undefined || body.price === ''
    ? null
    : Number(body.price)

  const limit = body.limit === null || body.limit === undefined || body.limit === ''
    ? null
    : Number(body.limit)

  const image = rules.allowsImage ? toNullableString(body.image) : null

  const hasProgram = rules.allowsProgram ? Boolean(body.hasProgram) : false
  const program = Array.isArray(body.program) ? body.program : []

  if (!title) errors.title = 'Название обязательно'
  if (title.length > 180) errors.title = 'Название не должно превышать 180 символов'

  if (!description) errors.description = 'Описание обязательно'

  if (!category) errors.category = 'Категория обязательна'
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    errors.categoryId = 'ID категории обязателен'
  }

  if (!categorySlug) errors.categorySlug = 'Slug категории обязателен'
  if (categorySlug.length > 120) {
    errors.categorySlug = 'Slug категории не должен превышать 120 символов'
  }

  if (subcategoryId !== null && (!Number.isInteger(subcategoryId) || subcategoryId <= 0)) {
    errors.subcategoryId = 'ID подкатегории должен быть положительным числом'
  }

  if (subcategory && subcategory.length > 160) {
    errors.subcategory = 'Название подкатегории не должно превышать 160 символов'
  }

  if (subcategorySlug && subcategorySlug.length > 120) {
    errors.subcategorySlug = 'Slug подкатегории не должен превышать 120 символов'
  }

  if (rules.requiresDateTime) {
    if (!isValidDate(date)) errors.date = 'Дата должна быть в формате YYYY-MM-DD'
    if (!isValidTime(time)) errors.time = 'Время должно быть в формате HH:mm'
  } else {
    if (date && !isValidDate(date)) errors.date = 'Дата должна быть в формате YYYY-MM-DD'
    if (time && !isValidTime(time)) errors.time = 'Время должно быть в формате HH:mm'
  }

  if (rules.requiresLocation) {
    if (!location) errors.location = 'Место проведения обязательно'
    if (!address) errors.address = 'Адрес обязателен'
    if (!locationUrl) errors.locationUrl = 'Ссылка на локацию обязательна'

    if (lat === null || lat < -90 || lat > 90) {
      errors.lat = 'Широта должна быть от -90 до 90'
    }

    if (lng === null || lng < -180 || lng > 180) {
      errors.lng = 'Долгота должна быть от -180 до 180'
    }
  }

  if (location && location.length > 180) {
    errors.location = 'Место проведения не должно превышать 180 символов'
  }

  if (address && address.length > 255) {
    errors.address = 'Адрес не должен превышать 255 символов'
  }

  if (locationUrl) {
    if (!isValidUrl(locationUrl)) {
      errors.locationUrl = 'Ссылка на локацию должна быть корректным URL'
    } else if (locationUrl.length > 600) {
      errors.locationUrl = 'Ссылка на локацию не должна превышать 600 символов'
    }
  }

  if (lat !== null && (lat < -90 || lat > 90)) {
    errors.lat = 'Широта должна быть от -90 до 90'
  }

  if (lng !== null && (lng < -180 || lng > 180)) {
    errors.lng = 'Долгота должна быть от -180 до 180'
  }

  if (rules.allowsVisit && !VISIT_TYPES.includes(visitType)) {
    errors.visitType = 'Тип посещения должен быть free или paid'
  }

  if (rules.allowsVisit && visitType === 'paid') {
    if (!Number.isFinite(price) || price < 1) {
      errors.price = 'Для платной публикации цена должна быть не ниже 1'
    }
  }

  if (rules.allowsVisit && visitType === 'free' && price !== null && price < 0) {
    errors.price = 'Цена не может быть отрицательной'
  }

  if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
    errors.limit = 'Лимит участников должен быть положительным числом'
  }

  if (image && !isValidUrl(image)) {
    errors.image = 'Ссылка на изображение должна быть корректным URL'
  }

  if (image && image.length > 800) {
    errors.image = 'Ссылка на изображение не должна превышать 800 символов'
  }

  if (hasProgram) {
    if (!program.length) {
      errors.program = 'Если программа включена, добавьте хотя бы один пункт'
    }

    program.forEach((item, index) => {
      const itemTime = toCleanString(item?.time)
      const itemTitle = toCleanString(item?.title)
      const itemDescription = toCleanString(item?.description)

      if (itemTime && !isValidTime(itemTime)) {
        errors[`program.${index}.time`] = 'Время пункта программы должно быть в формате HH:mm'
      }

      if (!itemTitle) {
        errors[`program.${index}.title`] = 'Название пункта программы обязательно'
      }

      if (itemTitle.length > 180) {
        errors[`program.${index}.title`] = 'Название пункта программы не должно превышать 180 символов'
      }

      if (itemDescription.length > 1000) {
        errors[`program.${index}.description`] = 'Описание пункта программы слишком длинное'
      }
    })
  }

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
      subcategorySlug: subcategorySlug || null,
      subcategory: subcategory || null,

      date: date || null,
      time: time || null,

      location: location || null,
      address: address || null,
      locationUrl: locationUrl || null,
      lat,
      lng,

      visitType: rules.allowsVisit ? visitType : 'free',
      price: rules.allowsVisit && visitType === 'paid' ? price : null,

      limit,
      image,

      hasProgram,
      program: hasProgram ? program : [],
    },
  }
}

export const createEvent = async (req, res) => {
  const { isValid, errors, data } = validateCreateEventPayload(req.body)

  if (!isValid) {
    return res.status(422).json({
      status: false,
      message: 'Проверьте правильность заполнения формы',
      errors,
    })
  }

  try {
    const result = await db.transaction(async (trx) => {
      const eventPayload = {
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

        location_title: data.location,
        address: data.address,
        location_url: data.locationUrl,

        lat: data.lat,
        lng: data.lng,

        visit_type: data.visitType,
        price: data.price,
        currency: 'KZT',

        participants_limit: data.limit,

        image_url: data.image,

        has_program: data.hasProgram,

        status: 'published',
        is_active: true,
        published_at: trx.fn.now(),
      }

      const [eventId] = await trx('events').insert(eventPayload)

      if (data.hasProgram && data.program.length) {
        const programPayload = data.program.map((item, index) => ({
          event_id: eventId,
          program_time: toNullableString(item.time),
          title: toCleanString(item.title),
          description: toNullableString(item.description),
          sort_order: index + 1,
        }))

        await trx('event_program_items').insert(programPayload)
      }

      const event = await trx('events')
        .where('id', eventId)
        .first()

      const program = await trx('event_program_items')
        .where('event_id', eventId)
        .orderBy('sort_order', 'asc')

      return {
        event,
        program,
      }
    })

    return res.status(201).json({
      status: true,
      message: 'Публикация успешно создана',
      data: {
        event: result.event,
        program: result.program,
      },
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

    const participationMeta = await getEventParticipationMeta(eventId, userId)

    const program = await db('event_program_items')
      .where('event_id', eventId)
      .orderBy('sort_order', 'asc')
      .select(
        'id',
        'event_id',
        'program_time',
        'title',
        'description',
        'sort_order'
      )

    return res.json({
      status: true,
      message: 'Событие получено',
      data: {
        event: {
          ...event,
          participants_count: participationMeta.participants_count,
          is_participant: participationMeta.is_participant,
        },
        program,
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
  const eventId = Number(req.params.id)

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(400).json({
      status: false,
      message: 'Некорректный ID события',
    })
  }

  const { isValid, errors, data } = validateCreateEventPayload(req.body)

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

      if (!existingEvent) {
        return null
      }

      const eventPayload = {
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

        location_title: data.location,
        address: data.address,
        location_url: data.locationUrl,

        lat: data.lat,
        lng: data.lng,

        visit_type: data.visitType,
        price: data.price,
        currency: 'KZT',

        participants_limit: data.limit,

        image_url: data.image,

        has_program: data.hasProgram,
      }

      await trx('events')
        .where('id', eventId)
        .update(eventPayload)

      await trx('event_program_items')
        .where('event_id', eventId)
        .del()

      if (data.hasProgram && data.program.length) {
        const programPayload = data.program.map((item, index) => ({
          event_id: eventId,
          program_time: toNullableString(item.time),
          title: toCleanString(item.title),
          description: toNullableString(item.description),
          sort_order: index + 1,
        }))

        await trx('event_program_items').insert(programPayload)
      }

      const event = await trx('events')
        .where('id', eventId)
        .first()

      const program = await trx('event_program_items')
        .where('event_id', eventId)
        .orderBy('sort_order', 'asc')

      return {
        event,
        program,
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
      data: {
        event: result.event,
        program: result.program,
      },
    })
  } catch (err) {
    console.error('Update event error:', err)

    return res.status(500).json({
      status: false,
      message: 'Не удалось обновить публикацию',
    })
  }
}

export const deleteEvent = async (req, res) => {
  const eventId = Number(req.params.id)

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(400).json({
      status: false,
      message: 'Некорректный ID события',
    })
  }

  try {
    const result = await db.transaction(async (trx) => {
      const existingEvent = await trx('events')
        .where('id', eventId)
        .first()

      if (!existingEvent) {
        return null
      }

      await trx('event_program_items')
        .where('event_id', eventId)
        .del()

      await trx('events')
        .where('id', eventId)
        .del()

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