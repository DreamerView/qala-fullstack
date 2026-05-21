// src/geo/routes/search.routes.js

import { Router } from 'express'
import { searchGeo, getCityPolygon } from '../controllers/search.controller.js'

const router = Router()

router.get('/search', searchGeo)
router.get('/cities/:cityId/polygon', getCityPolygon)

export default router