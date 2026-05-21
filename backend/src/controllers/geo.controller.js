// src/controllers/geo.controller.js

import { success, error } from '../utils/response.js'

import {
  getCountries,
  getRegionsByCountry,
  getCitiesByCountry,
  getCitiesByRegion,
  searchCities,
  getCityBySlug,
} from '../geo-db/services/geo.service.js'

export async function countries(req, res) {
  try {
    const items = await getCountries()

    return success(res, 'Countries', {
      items,
    })
  } catch (e) {
    return error(res, 'Failed to load countries', 500)
  }
}

export async function regions(req, res) {
  try {
    const country = String(req.query.country || 'KZ').toUpperCase()
    const items = await getRegionsByCountry(country)

    return success(res, 'Regions', {
      items,
    })
  } catch (e) {
    return error(res, 'Failed to load regions', 500)
  }
}

export async function cities(req, res) {
  try {
    const country = String(req.query.country || 'KZ').toUpperCase()
    const region = req.query.region ? String(req.query.region) : null

    const items = region
      ? await getCitiesByRegion(country, region)
      : await getCitiesByCountry(country)

    return success(res, 'Cities', {
      items,
    })
  } catch (e) {
    return error(res, 'Failed to load cities', 500)
  }
}

export async function citySearch(req, res) {
  try {
    const country = String(req.query.country || 'KZ').toUpperCase()
    const q = String(req.query.q || '').trim()

    const items = await searchCities(q, country)

    return success(res, 'City search', {
      items,
    })
  } catch (e) {
    return error(res, 'Failed to search cities', 500)
  }
}

export async function cityBySlug(req, res) {
  try {
    const country = String(req.query.country || 'KZ').toUpperCase()
    const slug = String(req.params.slug || '').trim()

    const city = await getCityBySlug(country, slug)

    if (!city) {
      return error(res, 'City not found', 404)
    }

    return success(res, 'City', {
      city,
    })
  } catch (e) {
    return error(res, 'Failed to load city', 500)
  }
}