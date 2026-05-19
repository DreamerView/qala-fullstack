// backend/src/routes/eventCategoryRoutes.js

import { Router } from 'express'
import { getEventCategories } from '../controllers/eventCategoryController.js'
import { createEvent,getEventById,updateEvent,deleteEvent } from '../controllers/event.controller.js'

const router = Router()

router.get('/categories', getEventCategories)
router.get('/:id', getEventById)
router.post('/create', createEvent)
router.put('/update/:id', updateEvent)
router.delete('/delete/:id', deleteEvent)

export default router