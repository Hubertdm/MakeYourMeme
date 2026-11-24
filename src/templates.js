const TOPICS = [
  'Lundi matin',
  'Travail / réunion Zoom',
  'Les repas ratés',
  'Internet et réseaux sociaux',
  'La vie de parent',
  'Les transports en commun',
  'Le sport et la motivation',
  'Les vacances ratées',
  'La technologie qui lâche',
  'Les amis toujours en retard',
  'Les courses au supermarché',
  'Les jeux vidéo',
  'La météo imprévisible',
  'Les hoquets de la vie quotidienne',
  'Les débats de famille'
];

const TEMPLATES = [
  {
    id: 'panic-phone',
    name: 'Panic Phone',
    emoji: '😱',
    gradient: ['#f7b733', '#fc4a1a'],
    topText: 'MOI QUAND',
    hint: 'Quelqu\u2019un qui regarde son t\u00e9l\u00e9phone avec un air paniqu\u00e9 (ex : \u00ab Vu \u00e0 14h32 \u00bb)'
  },
  {
    id: 'success-kid',
    name: 'Success Kid',
    emoji: '💪',
    gradient: ['#43cea2', '#185a9d'],
    topText: 'QUAND TU REUSSIS',
    hint: 'Une petite victoire inattendue de la vie quotidienne'
  },
  {
    id: 'distracted',
    name: 'Distracted',
    emoji: '👀',
    gradient: ['#ee0979', '#ff6a00'],
    topText: 'LUI / ELLE',
    hint: 'Quelqu\u2019un distrait par autre chose malgr\u00e9 la personne \u00e0 ses c\u00f4t\u00e9s'
  },
  {
    id: 'drake',
    name: 'Drake Choice',
    emoji: '🙅',
    gradient: ['#232526', '#414345'],
    topText: 'NON MAIS',
    hint: 'Rejeter une option logique pour en choisir une absurde'
  },
  {
    id: 'brain',
    name: 'Expanding Brain',
    emoji: '🧠',
    gradient: ['#4776e6', '#8e54e9'],
    topText: 'NIVEAU 1 :',
    hint: 'Une id\u00e9e de plus en plus bancale pr\u00e9sent\u00e9e comme g\u00e9niale'
  },
  {
    id: 'this-is-fine',
    name: 'This Is Fine',
    emoji: '🔥',
    gradient: ['#f12711', '#f5af19'],
    topText: 'TOUT VA BIEN',
    hint: 'Rester calme pendant que tout part en vrille'
  },
  {
    id: 'cat-judging',
    name: 'Judging Cat',
    emoji: '😼',
    gradient: ['#1d976c', '#93f9b9'],
    topText: 'LE CHAT QUI JUGE',
    hint: 'Un jugement silencieux mais sans appel'
  },
  {
    id: 'waiting',
    name: 'Awkward Wait',
    emoji: '🕐',
    gradient: ['#3a6186', '#89253e'],
    topText: 'POURTUIN',
    hint: 'Une attente inconfortable sans explication'
  },
  {
    id: 'galaxy',
    name: 'Galaxy Brain',
    emoji: '🌌',
    gradient: ['#0f2027', '#2c5364'],
    topText: 'GALAXIE 3000 :',
    hint: 'La solution la plus absurde est la plus intelligente'
  },
  {
    id: 'surprised',
    name: 'Shocked Face',
    emoji: '😳',
    gradient: ['#ff5f6d', '#ffc371'],
    topText: 'PERSONNE :',
    hint: 'Une r\u00e9action exag\u00e9r\u00e9e \u00e0 quelque chose de banal'
  },
  {
    id: 'tuxedo',
    name: 'Fancy Win',
    emoji: '🎩',
    gradient: ['#141e30', '#243b55'],
    topText: 'Monsieur / Madame',
    hint: 'Quelque chose de simple d\u00e9crit avec beaucoup de classe'
  },
  {
    id: 'running',
    name: 'Running Away',
    emoji: '🏃',
    gradient: ['#5614b0', '#dbd65c'],
    topText: 'MOI FUYANT',
    hint: 'Fuir une responsabilit\u00e9 culbute apr\u00e8s culbute'
  }
];

module.exports = { TEMPLATES, TOPICS };
