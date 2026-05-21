// backend/src/routes/eventCategoryRoutes.js

import { Router } from 'express'
import { getEventCategories } from '../controllers/eventCategoryController.js'
import { createEvent,getEventById,updateEvent,deleteEvent } from '../controllers/event.controller.js'
import { toggleEventParticipation } from '../controllers/eventParticipant.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/categories', getEventCategories)
router.get('/:id',authMiddleware, getEventById)
router.post('/create',authMiddleware, createEvent)
router.put('/update/:id',authMiddleware, updateEvent)
router.delete('/delete/:id',authMiddleware, deleteEvent)
router.post('/join/:eventId', authMiddleware, toggleEventParticipation)

export default router