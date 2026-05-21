// src/controllers/eventParticipant.controller.js

import db from '../db/knex.js'
import { success, error } from '../utils/response.js'

const PARTICIPANT_STATUS = {
  JOINED: 'joined',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  WAITLIST: 'waitlist',
}

const PARTICIPANT_ACTION = {
  JOINED: 'joined',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  WAITLIST: 'waitlist',
  REMOVED: 'removed',
}

const ACTIVE_STATUSES = [
  PARTICIPANT_STATUS.JOINED,
  PARTICIPANT_STATUS.APPROVED,
  PARTICIPANT_STATUS.PENDING,
  PARTICIPANT_STATUS.WAITLIST,
]

const COUNTABLE_STATUSES = [
  PARTICIPANT_STATUS.JOINED,
  PARTICIPANT_STATUS.APPROVED,
]

const toInt = (value) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

const toCleanString = (value) => {
  return typeof value === 'string' ? value.trim() : ''
}

const toNullableString = (value) => {
  const result = toCleanString(value)
  return result || null
}

const getEventParticipantsCount = async (trx, eventId) => {
  const row = await trx('event_participants')
    .where('event_id', eventId)
    .whereIn('status', COUNTABLE_STATUSES)
    .count({ total: 'id' })
    .first()

  return Number(row?.total || 0)
}

const getParticipantMessage = (status) => {
  if (status === PARTICIPANT_STATUS.PENDING) {
    return 'Заявка отправлена. Организатор должен подтвердить участие'
  }

  if (status === PARTICIPANT_STATUS.WAITLIST) {
    return 'Мест пока нет. Вы добавлены в лист ожидания'
  }

  return 'Отлично, вы записаны'
}

const resolveJoinStatus = async (trx, event, eventId) => {
  const accessType = event.access_type || 'open'
  const allowWaitlist = Boolean(event.allow_waitlist)
  const limit = event.participants_limit ? Number(event.participants_limit) : null

  if (accessType === 'approval_required') {
    return {
      status: PARTICIPANT_STATUS.PENDING,
      action: PARTICIPANT_ACTION.PENDING,
    }
  }

  if (accessType === 'invite_only') {
    return {
      status: null,
      action: null,
      error: 'Участие доступно только по приглашению',
      statusCode: 403,
    }
  }

  if (limit) {
    const count = await getEventParticipantsCount(trx, eventId)

    if (count >= limit) {
      if (allowWaitlist) {
        return {
          status: PARTICIPANT_STATUS.WAITLIST,
          action: PARTICIPANT_ACTION.WAITLIST,
        }
      }

      return {
        status: null,
        action: null,
        error: 'Лимит участников уже заполнен',
        statusCode: 409,
      }
    }
  }

  return {
    status: PARTICIPANT_STATUS.JOINED,
    action: PARTICIPANT_ACTION.JOINED,
  }
}

const writeParticipantLog = async (trx, { eventId, userId, action, comment = null }) => {
  await trx('event_participant_logs').insert({
    event_id: eventId,
    user_id: userId,
    action,
    comment,
  })
}

export const toggleEventParticipation = async (req, res) => {
  const eventId = toInt(req.params.eventId || req.body.event_id)
  const userId = req.user?.id
  const comment = toNullableString(req.body?.comment)

  if (!eventId) {
    return error(res, 'Некорректный ID события', 400)
  }

  if (!userId) {
    return error(res, 'Необходимо авторизоваться', 401)
  }

  try {
    const result = await db.transaction(async (trx) => {
      const event = await trx('events')
        .select(
          'id',
          'status',
          'is_active',
          'access_type',
          'allow_waitlist',
          'participants_limit',
          'registration_required',
          'registration_deadline',
          'cancelled_at'
        )
        .where('id', eventId)
        .first()

      if (!event || !event.is_active) {
        return {
          statusCode: 404,
          payload: {
            status: false,
            message: 'Событие не найдено',
          },
        }
      }

      if (event.status !== 'published') {
        return {
          statusCode: 403,
          payload: {
            status: false,
            message: 'Запись доступна только для опубликованных событий',
          },
        }
      }

      if (event.cancelled_at) {
        return {
          statusCode: 409,
          payload: {
            status: false,
            message: 'Событие отменено',
          },
        }
      }

      if (event.registration_deadline) {
        const deadline = new Date(event.registration_deadline)

        if (!Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now()) {
          return {
            statusCode: 409,
            payload: {
              status: false,
              message: 'Регистрация на событие уже закрыта',
            },
          }
        }
      }

      const participant = await trx('event_participants')
        .select('id', 'status')
        .where({
          event_id: eventId,
          user_id: userId,
        })
        .first()

      if (participant && ACTIVE_STATUSES.includes(participant.status)) {
        await trx('event_participants')
          .where({
            event_id: eventId,
            user_id: userId,
          })
          .update({
            status: PARTICIPANT_STATUS.CANCELLED,
            comment,
          })

        await writeParticipantLog(trx, {
          eventId,
          userId,
          action: PARTICIPANT_ACTION.CANCELLED,
          comment,
        })

        const participantsCount = await getEventParticipantsCount(trx, eventId)

        return {
          statusCode: 200,
          payload: {
            status: true,
            message: 'Запись отменена',
            action: PARTICIPANT_ACTION.CANCELLED,
            participant_status: PARTICIPANT_STATUS.CANCELLED,
            is_participant: false,
            participants_count: participantsCount,
          },
        }
      }

      const join = await resolveJoinStatus(trx, event, eventId)

      if (!join.status) {
        return {
          statusCode: join.statusCode || 400,
          payload: {
            status: false,
            message: join.error || 'Не удалось записаться на событие',
          },
        }
      }

      if (participant) {
        await trx('event_participants')
          .where({
            event_id: eventId,
            user_id: userId,
          })
          .update({
            status: join.status,
            guests_count: 1,
            comment,
          })
      } else {
        await trx('event_participants').insert({
          event_id: eventId,
          user_id: userId,
          status: join.status,
          guests_count: 1,
          comment,
        })
      }

      await writeParticipantLog(trx, {
        eventId,
        userId,
        action: join.action,
        comment,
      })

      const participantsCount = await getEventParticipantsCount(trx, eventId)

      return {
        statusCode: 200,
        payload: {
          status: true,
          message: getParticipantMessage(join.status),
          action: join.action,
          participant_status: join.status,
          is_participant: true,
          participants_count: participantsCount,
        },
      }
    })

    return res.status(result.statusCode).json(result.payload)
  } catch (err) {
    console.error('toggleEventParticipation error:', err)

    return error(res, 'Не удалось изменить участие в событии', 500)
  }
}

export const approveEventParticipant = async (req, res) => {
  const eventId = toInt(req.params.eventId || req.body.event_id)
  const userId = toInt(req.params.userId || req.body.user_id)
  const comment = toNullableString(req.body?.comment)

  if (!eventId) {
    return error(res, 'Некорректный ID события', 400)
  }

  if (!userId) {
    return error(res, 'Некорректный ID пользователя', 400)
  }

  try {
    const result = await db.transaction(async (trx) => {
      const participant = await trx('event_participants')
        .where({
          event_id: eventId,
          user_id: userId,
        })
        .first()

      if (!participant) {
        return {
          statusCode: 404,
          payload: {
            status: false,
            message: 'Участник не найден',
          },
        }
      }

      await trx('event_participants')
        .where({
          event_id: eventId,
          user_id: userId,
        })
        .update({
          status: PARTICIPANT_STATUS.APPROVED,
          comment,
        })

      await writeParticipantLog(trx, {
        eventId,
        userId,
        action: PARTICIPANT_ACTION.APPROVED,
        comment,
      })

      const participantsCount = await getEventParticipantsCount(trx, eventId)

      return {
        statusCode: 200,
        payload: {
          status: true,
          message: 'Участник подтверждён',
          participant_status: PARTICIPANT_STATUS.APPROVED,
          participants_count: participantsCount,
        },
      }
    })

    return res.status(result.statusCode).json(result.payload)
  } catch (err) {
    console.error('approveEventParticipant error:', err)

    return error(res, 'Не удалось подтвердить участника', 500)
  }
}

export const rejectEventParticipant = async (req, res) => {
  const eventId = toInt(req.params.eventId || req.body.event_id)
  const userId = toInt(req.params.userId || req.body.user_id)
  const comment = toNullableString(req.body?.comment)

  if (!eventId) {
    return error(res, 'Некорректный ID события', 400)
  }

  if (!userId) {
    return error(res, 'Некорректный ID пользователя', 400)
  }

  try {
    const result = await db.transaction(async (trx) => {
      const participant = await trx('event_participants')
        .where({
          event_id: eventId,
          user_id: userId,
        })
        .first()

      if (!participant) {
        return {
          statusCode: 404,
          payload: {
            status: false,
            message: 'Участник не найден',
          },
        }
      }

      await trx('event_participants')
        .where({
          event_id: eventId,
          user_id: userId,
        })
        .update({
          status: PARTICIPANT_STATUS.REJECTED,
          comment,
        })

      await writeParticipantLog(trx, {
        eventId,
        userId,
        action: PARTICIPANT_ACTION.REJECTED,
        comment,
      })

      const participantsCount = await getEventParticipantsCount(trx, eventId)

      return {
        statusCode: 200,
        payload: {
          status: true,
          message: 'Заявка отклонена',
          participant_status: PARTICIPANT_STATUS.REJECTED,
          participants_count: participantsCount,
        },
      }
    })

    return res.status(result.statusCode).json(result.payload)
  } catch (err) {
    console.error('rejectEventParticipant error:', err)

    return error(res, 'Не удалось отклонить участника', 500)
  }
}

export const removeEventParticipant = async (req, res) => {
  const eventId = toInt(req.params.eventId || req.body.event_id)
  const userId = toInt(req.params.userId || req.body.user_id)
  const comment = toNullableString(req.body?.comment)

  if (!eventId) {
    return error(res, 'Некорректный ID события', 400)
  }

  if (!userId) {
    return error(res, 'Некорректный ID пользователя', 400)
  }

  try {
    const result = await db.transaction(async (trx) => {
      const participant = await trx('event_participants')
        .where({
          event_id: eventId,
          user_id: userId,
        })
        .first()

      if (!participant) {
        return {
          statusCode: 404,
          payload: {
            status: false,
            message: 'Участник не найден',
          },
        }
      }

      await trx('event_participants')
        .where({
          event_id: eventId,
          user_id: userId,
        })
        .update({
          status: PARTICIPANT_STATUS.CANCELLED,
          comment,
        })

      await writeParticipantLog(trx, {
        eventId,
        userId,
        action: PARTICIPANT_ACTION.REMOVED,
        comment,
      })

      const participantsCount = await getEventParticipantsCount(trx, eventId)

      return {
        statusCode: 200,
        payload: {
          status: true,
          message: 'Участник удалён из события',
          participant_status: PARTICIPANT_STATUS.CANCELLED,
          participants_count: participantsCount,
        },
      }
    })

    return res.status(result.statusCode).json(result.payload)
  } catch (err) {
    console.error('removeEventParticipant error:', err)

    return error(res, 'Не удалось удалить участника', 500)
  }
}

export const getEventParticipants = async (req, res) => {
  const eventId = toInt(req.params.eventId || req.query.event_id)

  if (!eventId) {
    return error(res, 'Некорректный ID события', 400)
  }

  try {
    const participants = await db('event_participants as ep')
      .leftJoin('users as u', 'u.id', 'ep.user_id')
      .where('ep.event_id', eventId)
      .whereNot('ep.status', PARTICIPANT_STATUS.CANCELLED)
      .select(
        'ep.id',
        'ep.event_id',
        'ep.user_id',
        'ep.status',
        'ep.guests_count',
        'ep.comment',
        'ep.created_at',
        'ep.updated_at',
        'u.name',
        'u.email'
      )
      .orderBy('ep.created_at', 'desc')

    return success(res, {
      message: 'Участники получены',
      data: {
        participants,
      },
    })
  } catch (err) {
    console.error('getEventParticipants error:', err)

    return error(res, 'Не удалось получить участников', 500)
  }
}

export const getMyEventParticipation = async (req, res) => {
  const eventId = toInt(req.params.eventId || req.query.event_id)
  const userId = req.user?.id

  if (!eventId) {
    return error(res, 'Некорректный ID события', 400)
  }

  if (!userId) {
    return error(res, 'Необходимо авторизоваться', 401)
  }

  try {
    const participant = await db('event_participants')
      .where({
        event_id: eventId,
        user_id: userId,
      })
      .first()

    const participantsCount = await getEventParticipantsCount(db, eventId)

    return success(res, {
      message: 'Статус участия получен',
      data: {
        is_participant: Boolean(
          participant && ![
            PARTICIPANT_STATUS.CANCELLED,
            PARTICIPANT_STATUS.REJECTED,
          ].includes(participant.status)
        ),
        participant_status: participant?.status || null,
        participants_count: participantsCount,
      },
    })
  } catch (err) {
    console.error('getMyEventParticipation error:', err)

    return error(res, 'Не удалось получить статус участия', 500)
  }
}