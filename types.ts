
// Fix: Expanded LanguageCode to include 'es' and 'zh' to support multi-language data in constants.ts
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
  discovery: string;
  home: string;
  practice: string;
}

export interface TravelDiscovery {
  id: string;
  titleEn: string;
  titleNative: string;
  descriptionEn: string;
  descriptionNative: string;
  icon: string;
  coords: { x: number, y: number }; // Percentage coords for interactive map
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
      discovery: 'नेपाल भ्रमण',
      home: 'घर',
      practice: 'बोल्ने अभ्यास'
    },
    facts: [
      "Nepal has the only non-rectangular flag in the whole world!",
      "The highest mountain on Earth, Mt. Everest, is in Nepal.",
      "Lumbini, Nepal is where Lord Buddha was born."
    ],
    gameItems: ['🇳🇵', '🏔️', '🐘', '🥟', '🪁'],
    travelDiscoveries: [
      { id: 'everest', titleEn: 'Mt. Everest', titleNative: 'सगरमाथा', icon: '🏔️', descriptionEn: 'The highest peak in the world!', descriptionNative: 'संसारको सर्वोच्च शिखर!', coords: { x: 75, y: 35 } },
      { id: 'kathmandu', titleEn: 'Kathmandu', titleNative: 'काठमाडौं', icon: '🏛️', descriptionEn: 'The capital city of temples.', descriptionNative: 'मन्दिरै मन्दिरको शहर।', coords: { x: 55, y: 55 } },
      { id: 'pokhara', titleEn: 'Pokhara', titleNative: 'पोखरा', icon: '🛶', descriptionEn: 'Beautiful city of lakes and mountains.', descriptionNative: 'ताल र पहाडको सुन्दर शहर।', coords: { x: 40, y: 50 } },
      { id: 'lumbini', titleEn: 'Lumbini', titleNative: 'लुम्बिनी', icon: '☸️', descriptionEn: 'Birthplace of Lord Buddha.', descriptionNative: 'भगवान बुद्धको जन्मस्थल।', coords: { x: 30, y: 70 } },
      { id: 'chitwan', titleEn: 'Chitwan', titleNative: 'चितवन', icon: '🦏', descriptionEn: 'Home of the one-horned rhino.', descriptionNative: 'एकसिंगे गैंडाको घर।', coords: { x: 45, y: 75 } },
      { id: 'janakpur', titleEn: 'Janakpur', titleNative: 'जनकपुर', icon: '🕍', descriptionEn: 'The city of ponds and temples.', descriptionNative: 'पोखरी र मन्दिरहरूको शहर।', coords: { x: 70, y: 80 } }
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
  password?: string;
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
  DISCOVERY,
  PRACTICE
}
