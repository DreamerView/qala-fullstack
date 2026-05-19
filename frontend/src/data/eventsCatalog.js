export const ALL_CATEGORY = 'Все'
export const DEFAULT_SORT = 'popular'
export const DEFAULT_SAVED_EVENT_IDS = [2, 5]

export const EVENT_CATEGORIES = [
  ALL_CATEGORY,
  'Концерты',
  'Образование',
  'Спорт',
  'Бизнес',
  'Выставки',
  'Бесплатно',
]

export const EVENT_SORT_OPTIONS = [
  {
    label: 'Популярные',
    value: 'popular',
  },
  {
    label: 'Сначала новые',
    value: 'newest',
  },
  {
    label: 'Ближайшие',
    value: 'nearest',
  },
]

export const EVENTS = [
  {
    id: 1,
    title: 'Музыкальный вечер Qala Live',
    category: 'Концерты',
    location: 'Караганда, Центральный парк',
    day: '25',
    month: 'МАЙ',
    time: '19:00',
    people: '1.2K',
    popularity: 1200,
    order: 3,
    image:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Frontend Meetup Karaganda',
    category: 'Образование',
    location: 'IT Hub Karaganda',
    day: '28',
    month: 'МАЙ',
    time: '18:30',
    people: '430',
    popularity: 430,
    order: 4,
    image:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Городской забег',
    category: 'Спорт',
    location: 'Набережная',
    day: '01',
    month: 'ИЮН',
    time: '08:00',
    people: '860',
    popularity: 860,
    order: 5,
    image:
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Startup Talks',
    category: 'Бизнес',
    location: 'Qala Business Center',
    day: '04',
    month: 'ИЮН',
    time: '17:00',
    people: '250',
    popularity: 250,
    order: 6,
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 5,
    title: 'Арт-выставка молодых художников',
    category: 'Выставки',
    location: 'Галерея современного искусства',
    day: '07',
    month: 'ИЮН',
    time: '12:00',
    people: '640',
    popularity: 640,
    order: 7,
    image:
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 6,
    title: 'Бесплатный мастер-класс по дизайну',
    category: 'Бесплатно',
    location: 'Creative Space',
    day: '10',
    month: 'ИЮН',
    time: '15:00',
    people: '310',
    popularity: 310,
    order: 8,
    image:
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop',
  },
]