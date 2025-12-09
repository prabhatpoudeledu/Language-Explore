
export type LanguageCode = 'np' | 'hi' | 'es' | 'zh';

export interface LanguageTheme {
  headerBg: string;
  headerBorder: string;
  headerText: string;
  accentColor: string;
  gradient: string;
}

export interface NativeIcons {
  alphabet: string;
  words: string;
  phrases: string;
}

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  country: string; // For geography context
  flag: string;
  greeting: string;
  theme: LanguageTheme;
  icons: NativeIcons;
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
    icons: {
      alphabet: 'अ',
      words: 'शब्द',
      phrases: 'नमस्ते'
    }
  },
  { 
    code: 'hi', 
    name: 'Hindi', 
    country: 'India', 
    flag: '🇮🇳', 
    greeting: 'Namaste',
    theme: {
      headerBg: 'bg-orange-50',
      headerBorder: 'border-green-200',
      headerText: 'text-orange-700',
      accentColor: 'orange',
      gradient: 'from-orange-500 to-green-600'
    },
    icons: {
      alphabet: 'अ',
      words: 'शब्द',
      phrases: 'नमस्ते'
    }
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
    icons: {
      alphabet: 'Ñ',
      words: 'Hola',
      phrases: 'Si'
    }
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
    icons: {
      alphabet: '文',
      words: '词',
      phrases: '你好'
    }
  }
];

export interface UserProfile {
  id: string; // Unique ID for keying
  name: string;
  avatar: string;
  voice: string;
  autoPlaySound: boolean;
  xp: number; // Experience points persistence
}

export interface AccountData {
  email: string;
  password?: string; // Simple auth check
  profiles: UserProfile[];
}

export const AVATARS = ['👦', '👧', '🦁', '🐼', '🤖', '👽', '🦄', '👩‍🚀'];
export const VOICES = [
  { id: 'Puck', label: 'Puck (Playful)' },
  { id: 'Kore', label: 'Kore (Calm)' },
  { id: 'Fenrir', label: 'Fenrir (Deep)' },
  { id: 'Zephyr', label: 'Zephyr (Soft)' }
];

export interface LetterData {
  char: string;
  type: 'Vowel' | 'Consonant' | 'Character'; 
  transliteration: string;
  exampleWord: string;
  exampleWordTransliteration: string;
  exampleWordEnglish: string;
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

export interface GeoItem {
  id: string;
  titleEn: string;
  titleNative: string;
  descriptionEn: string;
  descriptionNative: string; 
  searchTerm: string; 
  imageBase64?: string;
  mapLink?: string;
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
    date: string; // ISO date string YYYY-MM-DD
}

export enum AppState {
  LOGIN,
  PROFILE_SELECT, // Netflix-style profile picker
  PROFILE_CREATE, // Creating a new profile
  PROFILE_MANAGE, // Editing a profile
  HOME,
  ALPHABET,
  WORDS,
  SONGS,
  GEO,
  PHRASES
}
