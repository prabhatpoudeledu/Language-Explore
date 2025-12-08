
export type LanguageCode = 'np' | 'hi' | 'es' | 'zh';

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  country: string; // For geography context
  flag: string;
  greeting: string;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'np', name: 'Nepali', country: 'Nepal', flag: '🇳🇵', greeting: 'Namaste' },
  { code: 'hi', name: 'Hindi', country: 'India', flag: '🇮🇳', greeting: 'Namaste' },
  { code: 'es', name: 'Spanish', country: 'Spain', flag: '🇪🇸', greeting: 'Hola' },
  { code: 'zh', name: 'Chinese', country: 'China', flag: '🇨🇳', greeting: 'Ni Hao' }
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
