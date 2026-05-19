// backend/src/controllers/eventCategoryController.js

import knex from '../db/knex.js'

const DEFAULT_LANG = 'ru'
const ALLOWED_LANGS = ['ru', 'kk', 'en']

function getLang(req) {
  const lang = String(req.query.lang || DEFAULT_LANG).toLowerCase().trim()

  if (!ALLOWED_LANGS.includes(lang)) {
    return DEFAULT_LANG
  }

  return lang
}

export async function getEventCategories(req, res) {
  try {
    const lang = getLang(req)

    const categories = await knex('event_categories as c')
      .leftJoin('event_category_translations as ct', function () {
        this.on('ct.category_id', '=', 'c.id').andOn('ct.locale', '=', knex.raw('?', [lang]))
      })
      .leftJoin('event_subcategories as s', 's.category_id', 'c.id')
      .leftJoin('event_subcategory_translations as st', function () {
        this.on('st.subcategory_id', '=', 's.id').andOn('st.locale', '=', knex.raw('?', [lang]))
      })
      .select(
        'c.id as category_id',
        'c.slug as category_slug',
        'c.icon as category_icon',
        'c.sort_order as category_sort_order',
        'ct.name as category_name',

        's.id as subcategory_id',
        's.slug as subcategory_slug',
        's.icon as subcategory_icon',
        's.sort_order as subcategory_sort_order',
        'st.name as subcategory_name'
      )
      .where('c.is_active', true)
      .andWhere(function () {
        this.where('s.is_active', true).orWhereNull('s.id')
      })
      .orderBy('c.sort_order', 'asc')
      .orderBy('s.sort_order', 'asc')

    const result = []

    for (const row of categories) {
      let category = result.find((item) => item.id === row.category_id)

      if (!category) {
        category = {
          id: row.category_id,
          slug: row.category_slug,
          name: row.category_name || row.category_slug,
          icon: row.category_icon,
          sort_order: row.category_sort_order,
          subcategories: [],
        }

        result.push(category)
      }

      if (row.subcategory_id) {
        category.subcategories.push({
          id: row.subcategory_id,
          slug: row.subcategory_slug,
          name: row.subcategory_name || row.subcategory_slug,
          icon: row.subcategory_icon,
          sort_order: row.subcategory_sort_order,
        })
      }
    }

    return res.json({
      status: true,
      lang,
      data: result,
    })
  } catch (error) {
    console.error('getEventCategories error:', error)

    return res.status(500).json({
      status: false,
      message: 'Не удалось получить категории событий',
    })
  }
}