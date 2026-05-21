// src/controllers/eventParticipant.controller.js

import db from '../db/knex.js'
import { success, error } from '../utils/response.js'

const ACTION_JOINED = 'joined'
const ACTION_CANCELLED = 'cancelled'

const toInt = (value) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

export const toggleEventParticipation = async (req, res) => {
  const eventId = toInt(req.params.eventId || req.body.event_id)
  const userId = req.user?.id

  if (!eventId) {
    return error(res, 'Некорректный ID события', 400)
  }

  if (!userId) {
    return error(res, 'Необходимо авторизоваться', 401)
  }

  try {
    const result = await db.transaction(async (trx) => {
      const event = await trx('events')
        .select('id')
        .where({ id: eventId })
        .first()

      if (!event) {
        return {
          statusCode: 404,
          payload: {
            status: false,
            message: 'Событие не найдено',
          },
        }
      }

      const participant = await trx('event_participants')
        .select('id')
        .where({
          event_id: eventId,
          user_id: userId,
        })
        .first()

      if (participant) {
        await trx('event_participants')
          .where({
            event_id: eventId,
            user_id: userId,
          })
          .del()

        await trx('event_participant_logs').insert({
          event_id: eventId,
          user_id: userId,
          action: ACTION_CANCELLED,
        })

        return {
          statusCode: 200,
          payload: {
            status: true,
            message: 'Участие отменено',
            action: ACTION_CANCELLED,
            is_participant: false,
          },
        }
      }

      await trx('event_participants').insert({
        event_id: eventId,
        user_id: userId,
      })

      await trx('event_participant_logs').insert({
        event_id: eventId,
        user_id: userId,
        action: ACTION_JOINED,
      })

      return {
        statusCode: 200,
        payload: {
          status: true,
          message: 'Вы участвуете в событии',
          action: ACTION_JOINED,
          is_participant: true,
        },
      }
    })

    return res.status(result.statusCode).json(result.payload)
  } catch (err) {
    console.error('toggleEventParticipation error:', err)

    return error(res, 'Не удалось изменить участие в событии', 500)
  }
}