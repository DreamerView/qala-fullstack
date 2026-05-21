// src/geo/build-geo-db.js

import knex from 'knex'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const GEO_DB_PATH = path.resolve(__dirname, 'geo.sqlite')

const COUNTRY = {
  code: 'KZ',
  apiName: 'Kazakhstan',
  names: {
    kk: 'Қазақстан',
    ru: 'Казахстан',
    en: 'Kazakhstan',
  },
}

const LOCALES = ['kk', 'ru', 'en']
const REQUEST_DELAY_MS = 1200

// true = город без polygon не сохраняем
// false = город сохраняем, polygon просто пропускаем
const REQUIRE_CITY_POLYGON = true

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: GEO_DB_PATH,
  },
  useNullAsDefault: true,
  pool: {
    min: 1,
    max: 1,
  },
})

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeSearchName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9а-яёғқңөұүһіә\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseNumber(value) {
  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

function getFirstText(...values) {
  for (const value of values) {
    const text = String(value || '').trim()

    if (text) {
      return text
    }
  }

  return ''
}

function isValidCityPolygon(geojson) {
  if (!geojson || typeof geojson !== 'object') {
    return false
  }

  return geojson.type === 'Polygon' || geojson.type === 'MultiPolygon'
}

function parseBoundingBox(boundingbox) {
  if (!Array.isArray(boundingbox) || boundingbox.length < 4) {
    return {
      bbox_min_lat: null,
      bbox_max_lat: null,
      bbox_min_lon: null,
      bbox_max_lon: null,
    }
  }

  const minLat = parseNumber(boundingbox[0])
  const maxLat = parseNumber(boundingbox[1])
  const minLon = parseNumber(boundingbox[2])
  const maxLon = parseNumber(boundingbox[3])

  return {
    bbox_min_lat: minLat,
    bbox_max_lat: maxLat,
    bbox_min_lon: minLon,
    bbox_max_lon: maxLon,
  }
}

async function fetchJson(url, options = {}, attempt = 1) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'QalaGeoBuilder/1.0 (temirkhan.onyx@gmail.com)',
        ...(options.headers || {}),
      },
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Request failed ${response.status}: ${text.slice(0, 300)}`)
    }

    return response.json()
  } catch (error) {
    if (attempt >= 3) {
      throw error
    }

    console.log(`Retry ${attempt}/3: ${url}`)
    await sleep(1500 * attempt)

    return fetchJson(url, options, attempt + 1)
  }
}

async function getNominatimPlace(query, locale = 'en', options = {}) {
  const {
    withPolygon = false,
  } = options

  const url = new URL('https://nominatim.openstreetmap.org/search')

  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '1')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('accept-language', locale)

  if (withPolygon) {
    url.searchParams.set('polygon_geojson', '1')
  }

  const data = await fetchJson(url.toString())
  const item = Array.isArray(data) ? data[0] : null

  if (!item) {
    return null
  }

  const lat = parseNumber(item.lat)
  const lon = parseNumber(item.lon)

  if (lat === null || lon === null) {
    return null
  }

  return {
    lat,
    lon,
    address: item.address || {},
    displayName: item.display_name || '',
    geojson: item.geojson || null,
    boundingbox: item.boundingbox || null,
  }
}

function getLocalizedCountryName(place, fallback) {
  const address = place?.address || {}

  return getFirstText(address.country, fallback)
}

function getLocalizedRegionName(place, fallback) {
  const address = place?.address || {}

  return getFirstText(
    address.state,
    address.region,
    address.province,
    address.county,
    address.municipality,
    fallback
  )
}

function getLocalizedCityName(place, fallback) {
  const address = place?.address || {}

  return getFirstText(
    address.city,
    address.town,
    address.village,
    address.hamlet,
    address.municipality,
    fallback
  )
}

async function getLocalizedNames(query, fallback, type) {
  const result = {}

  for (const locale of LOCALES) {
    try {
      const place = await getNominatimPlace(query, locale)

      if (type === 'country') {
        result[locale] = getLocalizedCountryName(place, fallback)
      }

      if (type === 'region') {
        result[locale] = getLocalizedRegionName(place, fallback)
      }

      if (type === 'city') {
        result[locale] = getLocalizedCityName(place, fallback)
      }
    } catch (error) {
      console.error(`Locale failed [${locale}] ${fallback}: ${error.message}`)
      result[locale] = fallback
    }

    await sleep(REQUEST_DELAY_MS)
  }

  return result
}

async function getRegionsFromCountriesNow(countryName) {
  const url = `https://countriesnow.space/api/v0.1/countries/states/q?country=${encodeURIComponent(countryName)}`

  const data = await fetchJson(url)
  const states = data?.data?.states || []

  return states
    .map((state) => {
      if (typeof state === 'string') {
        return state.trim()
      }

      return String(state?.name || '').trim()
    })
    .filter(Boolean)
}

async function getCitiesFromCountriesNow(countryName, regionName) {
  const url =
    `https://countriesnow.space/api/v0.1/countries/state/cities/q` +
    `?country=${encodeURIComponent(countryName)}` +
    `&state=${encodeURIComponent(regionName)}`

  const data = await fetchJson(url)
  const cities = data?.data || []

  return cities
    .map((city) => String(city || '').trim())
    .filter(Boolean)
}

async function getCountryByCode(code) {
  return db('countries').where({ code }).first()
}

async function getRegionBySlug(countryId, slug) {
  return db('regions')
    .where({
      country_id: countryId,
      slug,
    })
    .first()
}

async function getCityBySlug(countryId, regionId, slug) {
  return db('cities')
    .where({
      country_id: countryId,
      region_id: regionId,
      slug,
    })
    .first()
}

async function upsertCountry() {
  console.log(`Getting country coords: ${COUNTRY.apiName}`)

  const place = await getNominatimPlace(COUNTRY.apiName, 'en')

  if (!place) {
    console.log(`Country skipped. Coords not found: ${COUNTRY.apiName}`)
    return null
  }

  const countryPayload = {
    code: COUNTRY.code,
    lat: place.lat,
    lon: place.lon,
    is_active: true,
    updated_at: db.fn.now(),
  }

  await db('countries')
    .insert(countryPayload)
    .onConflict(['code'])
    .merge(countryPayload)

  const country = await getCountryByCode(COUNTRY.code)

  if (!country) {
    throw new Error(`Country was not saved: ${COUNTRY.code}`)
  }

  const names = await getLocalizedNames(COUNTRY.apiName, COUNTRY.apiName, 'country')

  for (const locale of LOCALES) {
    const name = COUNTRY.names[locale] || names[locale] || COUNTRY.apiName

    const translationPayload = {
      country_id: country.id,
      locale,
      name,
      search_name: normalizeSearchName(name),
      updated_at: db.fn.now(),
    }

    await db('country_translations')
      .insert(translationPayload)
      .onConflict(['country_id', 'locale'])
      .merge(translationPayload)

    console.log(`Country saved [${locale}]: ${name}`)
  }

  return country
}

async function upsertRegion(country, regionName) {
  const query = `${regionName}, ${COUNTRY.apiName}`

  console.log(`Getting region coords: ${query}`)

  const place = await getNominatimPlace(query, 'en')

  if (!place) {
    console.log(`Region skipped. Coords not found: ${regionName}`)
    return null
  }

  const slug = slugify(regionName)

  if (!slug) {
    console.log(`Region skipped. Empty slug: ${regionName}`)
    return null
  }

  const regionPayload = {
    country_id: country.id,
    slug,
    lat: place.lat,
    lon: place.lon,
    is_active: true,
    updated_at: db.fn.now(),
  }

  await db('regions')
    .insert(regionPayload)
    .onConflict(['country_id', 'slug'])
    .merge(regionPayload)

  const region = await getRegionBySlug(country.id, slug)

  if (!region) {
    throw new Error(`Region was not saved: ${regionName}`)
  }

  const names = await getLocalizedNames(query, regionName, 'region')

  for (const locale of LOCALES) {
    const name = names[locale] || regionName

    const translationPayload = {
      region_id: region.id,
      locale,
      name,
      search_name: normalizeSearchName(name),
      updated_at: db.fn.now(),
    }

    await db('region_translations')
      .insert(translationPayload)
      .onConflict(['region_id', 'locale'])
      .merge(translationPayload)

    console.log(`Region saved [${locale}]: ${name}`)
  }

  return region
}

async function upsertCityPolygon(cityId, place) {
  if (!isValidCityPolygon(place.geojson)) {
    console.log(`City polygon skipped. Invalid polygon type.`)
    return false
  }

  const bbox = parseBoundingBox(place.boundingbox)

  const polygonPayload = {
    city_id: cityId,
    type: place.geojson.type,
    bbox_min_lat: bbox.bbox_min_lat,
    bbox_min_lon: bbox.bbox_min_lon,
    bbox_max_lat: bbox.bbox_max_lat,
    bbox_max_lon: bbox.bbox_max_lon,
    geojson: JSON.stringify(place.geojson),
    updated_at: db.fn.now(),
  }

  await db('city_polygons')
    .insert(polygonPayload)
    .onConflict(['city_id'])
    .merge(polygonPayload)

  return true
}

async function upsertCity(country, region, cityName, regionName) {
  const query = `${cityName}, ${regionName}, ${COUNTRY.apiName}`

  console.log(`Getting city coords + polygon: ${query}`)

  const place = await getNominatimPlace(query, 'en', {
    withPolygon: true,
  })

  if (!place) {
    console.log(`City skipped. Coords not found: ${cityName}`)
    return null
  }

  const hasPolygon = isValidCityPolygon(place.geojson)

  if (REQUIRE_CITY_POLYGON && !hasPolygon) {
    console.log(`City skipped. Polygon not found: ${cityName}`)
    return null
  }

  const slug = slugify(cityName)

  if (!slug) {
    console.log(`City skipped. Empty slug: ${cityName}`)
    return null
  }

  const cityPayload = {
    country_id: country.id,
    region_id: region.id,
    slug,
    lat: place.lat,
    lon: place.lon,
    is_active: true,
    updated_at: db.fn.now(),
  }

  await db('cities')
    .insert(cityPayload)
    .onConflict(['country_id', 'region_id', 'slug'])
    .merge(cityPayload)

  const city = await getCityBySlug(country.id, region.id, slug)

  if (!city) {
    throw new Error(`City was not saved: ${cityName}`)
  }

  if (hasPolygon) {
    await upsertCityPolygon(city.id, place)
    console.log(`City polygon saved: ${cityName}`)
  }

  const names = await getLocalizedNames(query, cityName, 'city')

  for (const locale of LOCALES) {
    const name = names[locale] || cityName

    const translationPayload = {
      city_id: city.id,
      locale,
      name,
      search_name: normalizeSearchName(name),
      updated_at: db.fn.now(),
    }

    await db('city_translations')
      .insert(translationPayload)
      .onConflict(['city_id', 'locale'])
      .merge(translationPayload)

    console.log(`City saved [${locale}]: ${name}`)
  }

  return city
}

async function collectRegionsAndCities(country) {
  const regions = await getRegionsFromCountriesNow(COUNTRY.apiName)

  console.log(`Regions found: ${regions.length}`)

  for (const regionName of regions) {
    let region = null

    try {
      region = await upsertRegion(country, regionName)
    } catch (error) {
      console.error(`Region failed: ${regionName}: ${error.message}`)
    }

    await sleep(REQUEST_DELAY_MS)

    if (!region) {
      continue
    }

    try {
      const cities = await getCitiesFromCountriesNow(COUNTRY.apiName, regionName)

      console.log(`Cities in ${regionName}: ${cities.length}`)

      for (const cityName of cities) {
        try {
          await upsertCity(country, region, cityName, regionName)
        } catch (error) {
          console.error(`City failed: ${cityName}: ${error.message}`)
        }

        await sleep(REQUEST_DELAY_MS)
      }
    } catch (error) {
      console.error(`Failed to collect cities for ${regionName}: ${error.message}`)
    }

    await sleep(REQUEST_DELAY_MS)
  }
}

async function showStats() {
  const countriesCount = await db('countries').count({ count: '*' }).first()
  const countryTranslationsCount = await db('country_translations').count({ count: '*' }).first()

  const regionsCount = await db('regions').count({ count: '*' }).first()
  const regionTranslationsCount = await db('region_translations').count({ count: '*' }).first()

  const citiesCount = await db('cities').count({ count: '*' }).first()
  const cityTranslationsCount = await db('city_translations').count({ count: '*' }).first()
  const cityPolygonsCount = await db('city_polygons').count({ count: '*' }).first()

  console.log('')
  console.log('Done')
  console.log(`SQLite file: ${GEO_DB_PATH}`)
  console.log(`Countries: ${countriesCount.count}`)
  console.log(`Country translations: ${countryTranslationsCount.count}`)
  console.log(`Regions: ${regionsCount.count}`)
  console.log(`Region translations: ${regionTranslationsCount.count}`)
  console.log(`Cities: ${citiesCount.count}`)
  console.log(`City translations: ${cityTranslationsCount.count}`)
  console.log(`City polygons: ${cityPolygonsCount.count}`)
}

async function main() {
  try {
    console.log('Saving country...')
    const country = await upsertCountry()

    if (!country) {
      console.log('Stopped. Country was not saved.')
      return
    }

    console.log('Collecting regions and cities...')
    await collectRegionsAndCities(country)

    await showStats()
  } catch (error) {
    console.error('Geo build failed:', error)
    process.exitCode = 1
  } finally {
    await db.destroy()
  }
}

main()