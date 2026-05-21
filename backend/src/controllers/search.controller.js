// src/geo/controllers/search.controller.js

import geoDb from '../db/geo-knex.js'
import { success, error } from '../utils/response.js'

const DEFAULT_LANG = 'ru'
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

function normalizeText(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
}

function escapeLike(value = '') {
  return value.replace(/[\\%_]/g, '\\$&')
}

function toLimit(value) {
  const limit = Number(value || DEFAULT_LIMIT)

  if (!Number.isFinite(limit) || limit <= 0) {
    return DEFAULT_LIMIT
  }

  return Math.min(limit, MAX_LIMIT)
}

function toLang(value) {
  const lang = String(value || DEFAULT_LANG).trim().toLowerCase()

  if (!lang || lang.length > 8) {
    return DEFAULT_LANG
  }

  return lang
}

function uniqueMatches(rows, limit) {
  const map = new Map()

  for (const row of rows) {
    if (!map.has(row.city_id)) {
      map.set(row.city_id, row)
    }

    if (map.size >= limit) {
      break
    }
  }

  return [...map.values()]
}

export async function searchGeo(req, res) {
  try {
    const q = normalizeText(req.query.q)
    const lang = toLang(req.query.lang)
    const limit = toLimit(req.query.limit)

    if (!q || q.length < 2) {
      return success(res, 'Geo search result', {
        items: [],
      })
    }

    const safeQ = escapeLike(q)

    const matchedRows = await geoDb('city_translations as s')
      .innerJoin('cities as c', 'c.id', 's.city_id')
      .innerJoin('countries as co', 'co.id', 'c.country_id')
      .where('c.is_active', true)
      .where('co.is_active', true)
      .where(function () {
        this.where('s.search_name', 'like', `${safeQ}%`)
          .orWhere('s.search_name', 'like', `%${safeQ}%`)
          .orWhere('s.name', 'like', `${safeQ}%`)
          .orWhere('s.name', 'like', `%${safeQ}%`)
      })
      .select([
        's.city_id as city_id',
        's.locale as matched_locale',
        's.name as matched_name',
        's.search_name as matched_search_name',
      ])
      .orderByRaw(
        `
        CASE
          WHEN s.search_name = ? THEN 1
          WHEN s.search_name LIKE ? ESCAPE '\\' THEN 2
          WHEN s.name LIKE ? ESCAPE '\\' THEN 3
          WHEN s.search_name LIKE ? ESCAPE '\\' THEN 4
          WHEN s.name LIKE ? ESCAPE '\\' THEN 5
          ELSE 6
        END
        `,
        [safeQ, `${safeQ}%`, `${safeQ}%`, `%${safeQ}%`, `%${safeQ}%`],
      )
      .limit(limit * 4)

    const matches = uniqueMatches(matchedRows, limit)
    const cityIds = matches.map((item) => item.city_id)

    if (!cityIds.length) {
      return success(res, 'Geo search result', {
        items: [],
      })
    }

    const rows = await geoDb('cities as c')
      .leftJoin('city_translations as ct', function () {
        this.on('ct.city_id', '=', 'c.id').andOn('ct.locale', '=', geoDb.raw('?', [lang]))
      })
      .leftJoin('city_translations as ct_fallback', function () {
        this.on('ct_fallback.city_id', '=', 'c.id').andOn('ct_fallback.locale', '=', geoDb.raw('?', [DEFAULT_LANG]))
      })

      .leftJoin('regions as r', 'r.id', 'c.region_id')
      .leftJoin('region_translations as rt', function () {
        this.on('rt.region_id', '=', 'r.id').andOn('rt.locale', '=', geoDb.raw('?', [lang]))
      })
      .leftJoin('region_translations as rt_fallback', function () {
        this.on('rt_fallback.region_id', '=', 'r.id').andOn('rt_fallback.locale', '=', geoDb.raw('?', [DEFAULT_LANG]))
      })

      .leftJoin('countries as co', 'co.id', 'c.country_id')
      .leftJoin('country_translations as cot', function () {
        this.on('cot.country_id', '=', 'co.id').andOn('cot.locale', '=', geoDb.raw('?', [lang]))
      })
      .leftJoin('country_translations as cot_fallback', function () {
        this.on('cot_fallback.country_id', '=', 'co.id').andOn('cot_fallback.locale', '=', geoDb.raw('?', [DEFAULT_LANG]))
      })

      .leftJoin('city_polygons as cp', 'cp.city_id', 'c.id')

      .whereIn('c.id', cityIds)
      .where('c.is_active', true)
      .where('co.is_active', true)

      .select([
        'c.id as id',
        'c.slug as slug',
        'c.lat as lat',
        'c.lon as lon',

        'r.id as region_id',
        'r.slug as region_slug',

        'co.id as country_id',
        'co.code as country_code',

        'cp.id as polygon_id',
        'cp.type as polygon_type',
        'cp.bbox_min_lat as bbox_min_lat',
        'cp.bbox_min_lon as bbox_min_lon',
        'cp.bbox_max_lat as bbox_max_lat',
        'cp.bbox_max_lon as bbox_max_lon',

        geoDb.raw('COALESCE(ct.name, ct_fallback.name) as display_name'),
        geoDb.raw('COALESCE(ct.search_name, ct_fallback.search_name) as display_search_name'),

        geoDb.raw('COALESCE(rt.name, rt_fallback.name) as region_name'),
        geoDb.raw('COALESCE(cot.name, cot_fallback.name) as country_name'),
      ])

    const rowMap = new Map(rows.map((row) => [row.id, row]))

    const items = matches
      .map((match) => {
        const row = rowMap.get(match.city_id)

        if (!row || !row.display_name || row.lat === null || row.lon === null) {
          return null
        }

        const name = match.matched_name || row.display_name

        return {
          id: row.id,
          type: 'city',

          name,
          display_name: row.display_name,

          matched_locale: match.matched_locale,

          slug: row.slug,

          lat: Number(row.lat),
          lon: Number(row.lon),

          region: row.region_id
            ? {
                id: row.region_id,
                name: row.region_name,
                slug: row.region_slug,
              }
            : null,

          country: {
            id: row.country_id,
            code: row.country_code,
            name: row.country_name,
          },

          polygon: row.polygon_id
            ? {
                id: row.polygon_id,
                type: row.polygon_type,
                bbox: {
                  min_lat: row.bbox_min_lat !== null ? Number(row.bbox_min_lat) : null,
                  min_lon: row.bbox_min_lon !== null ? Number(row.bbox_min_lon) : null,
                  max_lat: row.bbox_max_lat !== null ? Number(row.bbox_max_lat) : null,
                  max_lon: row.bbox_max_lon !== null ? Number(row.bbox_max_lon) : null,
                },
              }
            : null,
        }
      })
      .filter(Boolean)

    return success(res, 'Geo search result', {
      items,
    })
  } catch (err) {
    console.error('searchGeo error:', err)

    return error(res, 'Failed to search geo data', 500)
  }
}

export async function getCityPolygon(req, res) {
  try {
    const cityId = Number(req.params.cityId)

    if (!Number.isInteger(cityId) || cityId <= 0) {
      return error(res, 'Invalid city id', 400)
    }

    const polygon = await geoDb('city_polygons')
      .where('city_id', cityId)
      .first([
        'id',
        'city_id',
        'type',
        'bbox_min_lat',
        'bbox_min_lon',
        'bbox_max_lat',
        'bbox_max_lon',
        'geojson',
      ])

    if (!polygon) {
      return error(res, 'City polygon not found', 404)
    }

    return success(res, 'City polygon', {
      polygon: {
        id: polygon.id,
        city_id: polygon.city_id,
        type: polygon.type,
        bbox: {
          min_lat: polygon.bbox_min_lat !== null ? Number(polygon.bbox_min_lat) : null,
          min_lon: polygon.bbox_min_lon !== null ? Number(polygon.bbox_min_lon) : null,
          max_lat: polygon.bbox_max_lat !== null ? Number(polygon.bbox_max_lat) : null,
          max_lon: polygon.bbox_max_lon !== null ? Number(polygon.bbox_max_lon) : null,
        },
        geojson: JSON.parse(polygon.geojson),
      },
    })
  } catch (err) {
    console.error('getCityPolygon error:', err)

    return error(res, 'Failed to get city polygon', 500)
  }
}