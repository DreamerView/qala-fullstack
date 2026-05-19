export const events = [
  {
    id: 1,
    title: 'Музыкальный вечер Qala Live',
    category: 'Концерты',
    location: 'Караганда, Центральный парк',
    place: 'Центральный парк',
    day: '25',
    month: 'МАЙ',
    fullDate: '25 мая 2026',
    time: '19:00',
    people: '1.2K',
    price: 'от 3 000 ₸',
    date: '25 мая',
    image:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1400&auto=format&fit=crop',
    description:
      'Большой музыкальный вечер под открытым небом с живым звуком, атмосферной сценой, фуд-кортом и уютной зоной отдыха. Отличный вариант провести вечер с друзьями и открыть для себя новых исполнителей города.',
    organizer: {
      name: 'Qala Events',
      description: 'Городская команда, которая собирает лучшие события Караганды.',
      avatar:
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop',
    },
    program: [
      {
        time: '18:30',
        title: 'Сбор гостей',
        text: 'Открытие площадки, музыка и welcome-зона.',
      },
      {
        time: '19:00',
        title: 'Начало концерта',
        text: 'Выступления локальных артистов и приглашённых гостей.',
      },
      {
        time: '21:30',
        title: 'After party',
        text: 'DJ-сет, общение и вечерняя атмосфера парка.',
      },
    ],
  },
  {
    id: 2,
    title: 'Frontend Meetup Karaganda',
    category: 'Образование',
    location: 'IT Hub Karaganda',
    place: 'IT Hub',
    day: '28',
    month: 'МАЙ',
    fullDate: '28 мая 2026',
    time: '18:30',
    people: '430',
    price: 'Бесплатно',
    date: '28 мая',
    image:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1400&auto=format&fit=crop',
    description:
      'Встреча frontend-разработчиков, дизайнеров и продуктовых специалистов. Обсудим Vue, UX, производительность интерфейсов и реальные кейсы разработки городских сервисов.',
    organizer: {
      name: 'Karaganda IT Community',
      description: 'Сообщество разработчиков, дизайнеров и IT-энтузиастов.',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    },
    program: [
      {
        time: '18:30',
        title: 'Нетворкинг',
        text: 'Знакомство участников и короткое вступление.',
      },
      {
        time: '19:00',
        title: 'Доклады',
        text: 'Практические выступления про frontend и продуктовую разработку.',
      },
      {
        time: '20:30',
        title: 'Q&A',
        text: 'Вопросы спикерам и свободное общение.',
      },
    ],
  },
  {
    id: 3,
    title: 'Городской забег',
    category: 'Спорт',
    location: 'Набережная',
    place: 'Набережная',
    day: '01',
    month: 'ИЮН',
    fullDate: '1 июня 2026',
    time: '08:00',
    people: '860',
    price: 'от 1 500 ₸',
    date: '1 июня',
    image:
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1400&auto=format&fit=crop',
    description:
      'Утренний городской забег для всех желающих. Можно участвовать одному, с друзьями или семьёй. Будут разные дистанции, зона разминки и медали для участников.',
    organizer: {
      name: 'Qala Sport',
      description: 'Команда городских спортивных мероприятий.',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
    },
    program: [
      {
        time: '07:30',
        title: 'Регистрация',
        text: 'Выдача номеров и подготовка участников.',
      },
      {
        time: '08:00',
        title: 'Разминка',
        text: 'Общая разминка перед стартом.',
      },
      {
        time: '08:30',
        title: 'Старт',
        text: 'Начало забега по выбранным дистанциям.',
      },
    ],
  },
]