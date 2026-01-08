
// Expanded LanguageCode to support multi-language data
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
  alphabetEn: string;
  words: string;
  wordsEn: string;
  phrases: string;
  phrasesEn: string;
  discovery: string;
  discoveryEn: string;
  home: string;
  homeEn: string;
  practice: string;
  practiceEn: string;
}

export interface TravelDiscovery {
  id: string;
  titleEn: string;
  titleNative: string;
  descriptionEn: string;
  descriptionNative: string;
  detailsEn: string;
  detailsNative: string;
  icon: string;
  coords: { x: number, y: number }; 
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
      headerBg: 'bg-white',
      headerBorder: 'border-red-100',
      headerText: 'text-gray-800',
      accentColor: 'red',
      gradient: 'from-red-500 to-blue-600'
    },
    menu: {
      alphabet: 'वर्णमाला',
      alphabetEn: 'Letter Land',
      words: 'शब्दहरू',
      wordsEn: 'Word Factory',
      phrases: 'वाक्यांशहरू',
      phrasesEn: 'Chatty Club',
      discovery: 'नेपाल भ्रमण',
      discoveryEn: 'Land Discovery',
      home: 'घर',
      homeEn: 'Home',
      practice: 'बोल्ने अभ्यास',
      practiceEn: 'Voice Lab'
    },
    facts: [
      "Nepal has the only non-rectangular flag in the whole world!",
      "The highest mountain on Earth, Mt. Everest, is in Nepal.",
      "Lumbini, Nepal is where Lord Buddha was born."
    ],
    gameItems: ['🇳🇵', '🏔️', '🐘', '🥟', '🪁'],
    travelDiscoveries: [
      { 
        id: 'everest', 
        titleEn: 'Mt. Everest', 
        titleNative: 'सगरमाथा', 
        icon: '🏔️', 
        descriptionEn: 'The highest peak in the world!', 
        descriptionNative: 'संसारको सर्वोच्च शिखर!',
        detailsEn: 'Standing at 8,848 meters, it is the roof of the world. It is home to brave Sherpas and incredible glaciers.',
        detailsNative: '८,८४८ मिटर अग्लो यो शिखर संसारको छानो हो। यहाँ साहसी शेर्पाहरू र विशाल हिमनदीहरू रहेका छन्।',
        coords: { x: 75, y: 35 } 
      },
      { 
        id: 'kathmandu', 
        titleEn: 'Kathmandu', 
        titleNative: 'काठमाडौं', 
        icon: '🏛️', 
        descriptionEn: 'The city of a thousand temples.', 
        descriptionNative: 'मन्दिरै मन्दिरको शहर।',
        detailsEn: 'The capital city where ancient history meets modern life. Visit the famous Swayambhunath and Durbar Squares.',
        detailsNative: 'नेपालको राजधानी जहाँ प्राचीन इतिहास र आधुनिक जीवन भेटिन्छ। यहाँ स्वयम्भूनाथ र प्रख्यात दरबार क्षेत्रहरू छन्।',
        coords: { x: 55, y: 55 } 
      },
      { 
        id: 'pokhara', 
        titleEn: 'Pokhara', 
        titleNative: 'पोखरा', 
        icon: '🛶', 
        descriptionEn: 'The jewel of the mountains.', 
        descriptionNative: 'ताल र पहाडको सुन्दर शहर।',
        detailsEn: 'Pokhara is famous for the beautiful Phewa Lake and the reflection of the Fishtail mountain in its waters.',
        detailsNative: 'पोखरा फेवा ताल र यसको पानीमा देखिने माछापुच्छ्रे हिमालको सुन्दर प्रतिबिम्बका लागि प्रसिद्ध छ।',
        coords: { x: 40, y: 50 } 
      },
      { 
        id: 'lumbini', 
        titleEn: 'Lumbini', 
        titleNative: 'लुम्बिनी', 
        icon: '☸️', 
        descriptionEn: 'A place of eternal peace.', 
        descriptionNative: 'भगवान बुद्धको जन्मस्थल।',
        detailsEn: 'The sacred birthplace of Lord Buddha. It is a peaceful park with many beautiful monasteries from around the world.',
        detailsNative: 'भगवान बुद्धको पवित्र जन्मस्थल। यहाँ विश्वभरका धेरै सुन्दर गुम्बाहरू र शान्त बगैंचाहरू छन्।',
        coords: { x: 30, y: 70 } 
      },
      { 
        id: 'chitwan', 
        titleEn: 'Chitwan', 
        titleNative: 'चितवन', 
        icon: '🦏', 
        descriptionEn: 'Deep in the jungle.', 
        descriptionNative: 'एकसिंगे गैंडाको घर।',
        detailsEn: 'Explore the tropical jungles where you can see one-horned rhinos, Bengal tigers, and colorful birds.',
        detailsNative: 'चितवनको जंगलमा तपाईं एकसिंगे गैंडा, पाटे बाघ र रंगीचंगी चराहरू देख्न सक्नुहुन्छ।',
        coords: { x: 45, y: 75 } 
      },
      { 
        id: 'janakpur', 
        titleEn: 'Janakpur', 
        titleNative: 'जनकपुर', 
        icon: '🕍', 
        descriptionEn: 'The historic city of Janaki.', 
        descriptionNative: 'पोखरी र मन्दिरहरूको शहर।',
        detailsEn: 'Home to the magnificent Janaki Temple, a masterpiece of bright architecture and ancient Mithila culture.',
        detailsNative: 'यहाँ भव्य जानकी मन्दिर छ, जुन मिथिला कला र प्राचीन वास्तुकलाको एउटा नमूना हो।',
        coords: { x: 70, y: 80 } 
      }
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

export interface ExampleWord {
  word: string;
  transliteration: string;
  english: string;
  imageUrl?: string;
}

export interface LetterData {
  char: string;
  type: 'Vowel' | 'Consonant' | 'Character'; 
  transliteration: string;
  examples: ExampleWord[];
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
