// src/geo-db/services/geo.service.js

import geoDb from '../../db/geo-knex.js'

export async function getCountries() {
  return geoDb('countries')
    .select(
      'code',
      'name_en',
      'name_ru',
      'name_kk',
      'latitude',
      'longitude'
    )
    .where('is_active', true)
    .orderBy('name_en', 'asc')
}

export async function getRegionsByCountry(countryCode = 'KZ') {
  return geoDb('regions')
    .select(
      'id',
      'country_code',
      'name_en',
      'name_ru',
      'name_kk',
      'slug',
      'latitude',
      'longitude'
    )
    .where({
      country_code: countryCode,
      is_active: true,
    })
    .orderBy('name_en', 'asc')
}

export async function getCitiesByCountry(countryCode = 'KZ') {
  return geoDb('cities')
    .select(
      'id',
      'country_code',
      'region_en',
      'region_ru',
      'region_kk',
      'name_en',
      'name_ru',
      'name_kk',
      'slug',
      'latitude',
      'longitude',
      'timezone'
    )
    .where({
      country_code: countryCode,
      is_active: true,
    })
    .orderBy('name_en', 'asc')
}

export async function getCitiesByRegion(countryCode = 'KZ', regionSlug) {
  return geoDb('cities as c')
    .leftJoin('regions as r', 'r.id', 'c.region_id')
    .select(
      'c.id',
      'c.country_code',
      'c.region_en',
      'c.region_ru',
      'c.region_kk',
      'c.name_en',
      'c.name_ru',
      'c.name_kk',
      'c.slug',
      'c.latitude',
      'c.longitude',
      'c.timezone'
    )
    .where('c.country_code', countryCode)
    .where('c.is_active', true)
    .modify((query) => {
      if (regionSlug) {
        query.where('r.slug', regionSlug)
      }
    })
    .orderBy('c.name_en', 'asc')
}

export async function searchCities(query, countryCode = 'KZ') {
  const q = String(query || '').trim()

  if (!q) {
    return []
  }

  return geoDb('cities as c')
    .leftJoin('city_aliases as a', 'a.city_id', 'c.id')
    .select(
      'c.id',
      'c.country_code',
      'c.region_en',
      'c.region_ru',
      'c.region_kk',
      'c.name_en',
      'c.name_ru',
      'c.name_kk',
      'c.slug',
      'c.latitude',
      'c.longitude'
    )
    .where('c.country_code', countryCode)
    .where('c.is_active', true)
    .andWhere((builder) => {
      builder
        .whereLike('c.name_en', `%${q}%`)
        .orWhereLike('c.name_ru', `%${q}%`)
        .orWhereLike('c.name_kk', `%${q}%`)
        .orWhereLike('a.name', `%${q}%`)
    })
    .groupBy('c.id')
    .orderBy('c.name_en', 'asc')
    .limit(20)
}

export async function getCityBySlug(countryCode = 'KZ', slug) {
  return geoDb('cities')
    .select(
      'id',
      'country_code',
      'region_en',
      'region_ru',
      'region_kk',
      'name_en',
      'name_ru',
      'name_kk',
      'slug',
      'latitude',
      'longitude',
      'timezone'
    )
    .where({
      country_code: countryCode,
      slug,
      is_active: true,
    })
    .first()
}