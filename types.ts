
export type LanguageCode = 'np' | 'es' | 'zh';

export interface LanguageTheme {
  headerBg: string;
  headerBorder: string;
  headerText: string;
  accentColor: string;
  gradient: string;
}

export interface MenuTranslations {
  alphabet: string;
  words: string;
  phrases: string;
  discovery: string; // Renamed from Travel
  home: string;
}

export interface TravelDiscovery {
  id: string;
  titleEn: string;
  titleNative: string;
  descriptionEn: string;
  descriptionNative: string;
  icon: string;
}

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  country: string;
  flag: string;
  greeting: string;
  theme: LanguageTheme;
  menu: MenuTranslations;
  facts: string[];
  gameItems: string[]; 
  travelDiscoveries: TravelDiscovery[];
}

export const LANGUAGES: LanguageConfig[] = [
  { 
    code: 'np', 
    name: 'Nepali', 
    country: 'Nepal', 
    flag: '🇳🇵', 
    greeting: 'Namaste',
    theme: {
      headerBg: 'bg-red-50',
      headerBorder: 'border-blue-200',
      headerText: 'text-red-700',
      accentColor: 'red',
      gradient: 'from-red-500 to-blue-600'
    },
    menu: {
      alphabet: 'वर्णमाला',
      words: 'शब्दहरू',
      phrases: 'वाक्यांशहरू',
      discovery: 'संस्कृति र खेल',
      home: 'घर'
    },
    facts: [
      "Nepal has the only non-rectangular flag in the whole world!",
      "The highest mountain on Earth, Mt. Everest, is in Nepal.",
      "Lumbini, Nepal is where Lord Buddha was born."
    ],
    gameItems: ['🇳🇵', '🏔️', '🐘', '🥟', '🪁'],
    travelDiscoveries: [
      { id: 'flag', titleEn: 'National Flag', titleNative: 'राष्ट्रिय झण्डा', icon: '🇳🇵', descriptionEn: 'The unique double-triangle flag.', descriptionNative: 'नेपालको अद्वितीय दोहोरो त्रिकोणात्मक झण्डा।' },
      { id: 'bird', titleEn: 'National Bird (Danphe)', titleNative: 'डाँफे', icon: '🦚', descriptionEn: 'The colorful Himalayan Monal bird.', descriptionNative: 'रंगीन हिमालयन डाँफे चरा।' },
      { id: 'food', titleEn: 'Dal Bhat', titleNative: 'दाल भात', icon: '🍛', descriptionEn: 'Lentils and rice, the most popular meal.', descriptionNative: 'दाल र भात, नेपालको मुख्य खाना।' },
      { id: 'game', titleEn: 'Dandi Biyo', titleNative: 'डण्डी बियो', icon: '🏏', descriptionEn: 'A fun traditional game played with sticks.', descriptionNative: 'लौरो र काठको टुक्राले खेलिने पुरानो खेल।' },
      { id: 'stadium', titleEn: 'Dasharath Stadium', titleNative: 'दशरथ रंगशाला', icon: '🏟️', descriptionEn: 'The home of sports in Kathmandu.', descriptionNative: 'नेपालको मुख्य खेल मैदान।' },
      { id: 'culture', titleEn: 'Dashain', titleNative: 'दशैं', icon: '🪁', descriptionEn: 'The biggest festival celebrate with family.', descriptionNative: 'नेपालको सबैभन्दा ठूलो र रमाइलो चाड।' }
    ]
  },
  { 
    code: 'es', 
    name: 'Spanish', 
    country: 'Spain', 
    flag: '🇪🇸', 
    greeting: 'Hola',
    theme: {
      headerBg: 'bg-yellow-50',
      headerBorder: 'border-red-200',
      headerText: 'text-red-700',
      accentColor: 'red',
      gradient: 'from-red-500 to-yellow-500'
    },
    menu: {
      alphabet: 'Alfabeto',
      words: 'Palabras',
      phrases: 'Frases',
      discovery: 'Cultura y Juego',
      home: 'Inicio'
    },
    facts: [
      "Spanish is the second most spoken native language in the world!",
      "The Sagrada Familia church has been building for 140 years!",
      "Spain is the only country in Europe that produces bananas!"
    ],
    gameItems: ['🇪🇸', '💃', '🎸', '🥘', '⚽'],
    travelDiscoveries: [
      { id: 'flag', titleEn: 'National Flag', titleNative: 'La Bandera', icon: '🇪🇸', descriptionEn: 'The red and yellow flag of Spain.', descriptionNative: 'La bandera roja y amarilla de España.' },
      { id: 'bird', titleEn: 'Spanish Imperial Eagle', titleNative: 'Águila Imperial', icon: '🦅', descriptionEn: 'A majestic bird of the Spanish forests.', descriptionNative: 'Una majestuosa ave de los bosques españoles.' },
      { id: 'food', titleEn: 'Paella', titleNative: 'Paella', icon: '🥘', descriptionEn: 'A world-famous rice dish from Valencia.', descriptionNative: 'Un famoso plato de arroz de Valencia.' },
      { id: 'game', titleEn: 'Football', titleNative: 'Fútbol', icon: '⚽', descriptionEn: 'The passion of millions in Spain.', descriptionNative: 'La pasión de millones en España.' },
      { id: 'stadium', titleEn: 'Santiago Bernabéu', titleNative: 'Bernabéu', icon: '🏟️', descriptionEn: 'One of the most iconic stadiums.', descriptionNative: 'Uno de los estadios más icónicos.' },
      { id: 'culture', titleEn: 'Flamenco', titleNative: 'Flamenco', icon: '💃', descriptionEn: 'A beautiful dance of soul and fire.', descriptionNative: 'Un hermoso baile de alma y fuego.' }
    ]
  },
  { 
    code: 'zh', 
    name: 'Chinese', 
    country: 'China', 
    flag: '🇨🇳', 
    greeting: 'Ni Hao',
    theme: {
      headerBg: 'bg-red-50',
      headerBorder: 'border-yellow-200',
      headerText: 'text-red-800',
      accentColor: 'red',
      gradient: 'from-red-600 to-yellow-500'
    },
    menu: {
      alphabet: '拼音',
      words: '词汇',
      phrases: '短语',
      discovery: '文化与发现',
      home: '首页'
    },
    facts: [
      "The Great Wall of China is long enough to circle the Earth!",
      "Pandas are like national treasures in China.",
      "Paper and ice cream were first made in China!"
    ],
    gameItems: ['🇨🇳', '🐼', '🐲', '🥟', '🏮'],
    travelDiscoveries: [
      { id: 'flag', titleEn: 'National Flag', titleNative: '五星红旗', icon: '🇨🇳', descriptionEn: 'The five-star red flag.', descriptionNative: '五星红旗。' },
      { id: 'bird', titleEn: 'Red-crowned Crane', titleNative: '丹顶鹤', icon: '🦢', descriptionEn: 'A symbol of luck and long life.', descriptionNative: '丹顶鹤象征好运。' },
      { id: 'food', titleEn: 'Dumplings', titleNative: '饺子', icon: '🥟', descriptionEn: 'A delicious traditional meal.', descriptionNative: '一种美味的传统食物。' },
      { id: 'game', titleEn: 'Table Tennis', titleNative: '乒乓球', icon: '🏓', descriptionEn: 'China is the master of Ping Pong.', descriptionNative: '乒乓球是中国最受欢迎的运动。' },
      { id: 'stadium', titleEn: "Bird's Nest", titleNative: '鸟巢', icon: '🏟️', descriptionEn: 'The Beijing National Stadium.', descriptionNative: '北京国家体育场。' },
      { id: 'culture', titleEn: 'Dragon Dance', titleNative: '舞龙', icon: '🐲', descriptionEn: 'A colorful dance for the New Year.', descriptionNative: '春节时的多彩舞蹈。' }
    ]
  }
];

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  voice: string;
  gender: 'male' | 'female';
  autoPlaySound: boolean;
  xp: number;
  completedWords: string[]; 
}

export interface AccountData {
  email: string;
  googleId?: string;
  name?: string;
  picture?: string;
  profiles: UserProfile[];
}

export const AVATARS = ['👦', '👧', '🦁', '🐼', '🤖', '👽', '🦄', '👩‍🚀'];

export interface VoiceOption {
    id: string;
    label: string;
    gender: 'male' | 'female';
    icon: string;
}

export const VOICES: VoiceOption[] = [
  { id: 'Puck', label: 'Playful Boy', gender: 'male', icon: '👦' },
  { id: 'Fenrir', label: 'Deep Voice', gender: 'male', icon: '👨' },
  { id: 'Kore', label: 'Kind Girl', gender: 'female', icon: '👧' },
  { id: 'Zephyr', label: 'Soft Voice', gender: 'female', icon: '👩' }
];

export interface VowelCombo {
    char: string;
    sound: string;
}

export interface LetterData {
  char: string;
  type: 'Vowel' | 'Consonant' | 'Character'; 
  transliteration: string;
  exampleWord: string;
  exampleWordTransliteration: string;
  exampleWordEnglish: string;
  combos?: VowelCombo[]; 
}

export interface WordChallenge {
  word: string;
  english: string;
  scrambled: string[];
}

export interface PhraseData {
  native: string;
  transliteration: string;
  english: string;
  category: 'Greeting' | 'Food' | 'Daily';
}

export interface WordOfTheDayData {
    word: string;
    transliteration: string;
    english: string;
    sentence: string;
    date: string;
}

export interface SongData {
    title: string;
    titleNative: string;
    category: string;
    description: string;
    descriptionNative: string;
    lyricsOriginal?: string;
    youtubeId?: string;
}

export enum AppState {
  LOGIN,
  PROFILE_SELECT,
  PROFILE_CREATE,
  PROFILE_MANAGE,
  LANGUAGE_SELECT,
  HOME,
  ALPHABET,
  WORDS,
  PHRASES,
  DISCOVERY // Replaces Geo, Songs, Puzzle
}
